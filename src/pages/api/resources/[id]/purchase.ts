import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); // Get server-side Supabase client
  if (req.method === 'POST') {
    const { id: resourceId } = req.query; // Resource ID
    const { buyerId } = req.body; // Buyer ID from the request body

    if (!resourceId || !buyerId) {
      return res.status(400).json({ error: 'Missing resourceId or buyerId' });
    }

    // --- 1. Verify Authentication & Authorization (simplified for now) ---
    // In a real application, you'd verify the JWT and ensure buyerId matches authenticated user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || user.id !== buyerId) {
      return res.status(401).json({ error: 'Unauthorized: Buyer ID does not match authenticated user.' });
    }

    // --- 2. Fetch Resource Details ---
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('id, title, price, is_free, uploader_id, uploader_email')
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource) {
      console.error('Error fetching resource:', resourceError);
      return res.status(404).json({ error: 'Resource not found or database error.' });
    }

    if (resource.is_free) {
      return res.status(400).json({ error: 'This resource is free and does not require purchase.' });
    }

    if (resource.uploader_id === buyerId) {
      return res.status(400).json({ error: 'You cannot purchase your own resource.' });
    }

    const purchaseAmount = resource.price;

    // --- 3. Fetch Buyer's Profile ---
    const { data: buyerProfile, error: buyerProfileError } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', buyerId)
      .single();

    if (buyerProfileError || !buyerProfile) {
      console.error('Error fetching buyer profile:', buyerProfileError);
      return res.status(500).json({ error: 'Buyer profile not found or database error.' });
    }

    if (buyerProfile.balance < purchaseAmount) {
      return res.status(402).json({ error: 'Insufficient balance.' });
    }

    // --- 4. Fetch Seller's Profile ---
    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', resource.uploader_id)
      .single();

    if (sellerProfileError || !sellerProfile) {
      console.error('Error fetching seller profile:', sellerProfileError);
      return res.status(500).json({ error: 'Seller profile not found or database error.' });
    }

    // --- 5. Perform Balances Update (Ideally within a database transaction) ---
    // For now, doing sequentially. In a production app, use Supabase functions/transactions.

    // Deduct from buyer
    const newBuyerBalance = buyerProfile.balance - purchaseAmount;
    const { error: updateBuyerError } = await supabase
      .from('profiles')
      .update({ balance: newBuyerBalance })
      .eq('id', buyerId);

    if (updateBuyerError) {
      console.error('Error updating buyer balance:', updateBuyerError);
      return res.status(500).json({ error: 'Failed to update buyer balance.' });
    }

    // Add to seller
    const newSellerBalance = sellerProfile.balance + purchaseAmount;
    const { error: updateSellerError } = await supabase
      .from('profiles')
      .update({ balance: newSellerBalance })
      .eq('id', resource.uploader_id);

    if (updateSellerError) {
      console.error('Error updating seller balance:', updateSellerError);
      // IMPORTANT: In a real transaction, you would roll back the buyer's deduction here.
      return res.status(500).json({ error: 'Failed to update seller balance.' });
    }

    // --- 6. Record Transaction ---
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          type: 'resource_purchase',
          resource_id: resourceId as string,
          resource_name: resource.title, // Assuming resource has a title
          buyer_id: buyerId,
          buyer_email: user.email, // Use authenticated user's email
          seller_id: resource.uploader_id,
          seller_email: resource.uploader_email,
          amount: purchaseAmount,
          payment_method: 'balance', // Assuming internal balance transfer
          status: 'completed',
          transaction_id: `purchase_${Date.now()}_${resourceId}_${buyerId}`, // Simple unique ID
        },
      ]);

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // IMPORTANT: In a real transaction, you would roll back balance updates here.
      return res.status(500).json({ error: 'Failed to record transaction.' });
    }

    // --- 7. Record Resource Purchase ---
    const { error: resourcePurchaseError } = await supabase
      .from('resource_purchases')
      .insert([
        {
          student_id: buyerId,
          resource_id: resourceId as string,
          purchase_date: new Date().toISOString(),
          amount: purchaseAmount,
        },
      ]);

    if (resourcePurchaseError) {
      console.error('Error recording resource purchase:', resourcePurchaseError);
      // IMPORTANT: In a real transaction, you would roll back all previous operations.
      return res.status(500).json({ error: 'Failed to record resource purchase.' });
    }

    return res.status(200).json({ message: 'Resource purchased successfully!' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
