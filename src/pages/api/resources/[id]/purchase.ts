import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'POST') {
    const { id: resourceId } = req.query; 
    const { buyerId } = req.body; 

    if (!resourceId || !buyerId) {
      return res.status(400).json({ error: 'Missing resourceId or buyerId' });
    }

    
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || user.id !== buyerId) {
      return res.status(401).json({ error: 'Unauthorized: Buyer ID does not match authenticated user.' });
    }

    
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

    
    const { data: sellerProfile, error: sellerProfileError } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', resource.uploader_id)
      .single();

    if (sellerProfileError || !sellerProfile) {
      console.error('Error fetching seller profile:', sellerProfileError);
      return res.status(500).json({ error: 'Seller profile not found or database error.' });
    }

    
    

    
    const newBuyerBalance = buyerProfile.balance - purchaseAmount;
    const { error: updateBuyerError } = await supabase
      .from('profiles')
      .update({ balance: newBuyerBalance })
      .eq('id', buyerId);

    if (updateBuyerError) {
      console.error('Error updating buyer balance:', updateBuyerError);
      return res.status(500).json({ error: 'Failed to update buyer balance.' });
    }

    
    const newSellerBalance = sellerProfile.balance + purchaseAmount;
    const { error: updateSellerError } = await supabase
      .from('profiles')
      .update({ balance: newSellerBalance })
      .eq('id', resource.uploader_id);

    if (updateSellerError) {
      console.error('Error updating seller balance:', updateSellerError);
      
      return res.status(500).json({ error: 'Failed to update seller balance.' });
    }

    
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          type: 'resource_purchase',
          resource_id: resourceId as string,
          resource_name: resource.title, 
          buyer_id: buyerId,
          buyer_email: user.email, 
          seller_id: resource.uploader_id,
          seller_email: resource.uploader_email,
          amount: purchaseAmount,
          payment_method: 'balance', 
          status: 'completed',
          transaction_id: `purchase_${Date.now()}_${resourceId}_${buyerId}`, 
        },
      ]);

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      
      return res.status(500).json({ error: 'Failed to record transaction.' });
    }

    
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
      
      return res.status(500).json({ error: 'Failed to record resource purchase.' });
    }

    return res.status(200).json({ message: 'Resource purchased successfully!' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
