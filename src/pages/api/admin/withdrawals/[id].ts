import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'PUT') {
    const { id: withdrawalRequestId } = req.query; 
    const { status } = req.body; 

    
    if (!withdrawalRequestId || !status) {
      return res.status(400).json({ error: 'Missing withdrawalRequestId or status' });
    }
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
    }

    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user.' });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden: User does not have admin privileges.' });
    }

    
    const { data: withdrawalRequest, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('id, student_id, amount, status, method')
      .eq('id', withdrawalRequestId)
      .single();

    if (fetchError || !withdrawalRequest) {
      console.error('Error fetching withdrawal request:', fetchError);
      return res.status(404).json({ error: 'Withdrawal request not found or database error.' });
    }

    if (withdrawalRequest.status !== 'pending') {
      return res.status(400).json({ error: `Withdrawal request is already ${withdrawalRequest.status}.` });
    }

    
    if (status === 'approved') {
      
      const { data: studentProfile, error: studentProfileError } = await supabase
        .from('profiles')
        .select('id, balance')
        .eq('id', withdrawalRequest.student_id)
        .single();

      if (studentProfileError || !studentProfile) {
        console.error('Error fetching student profile for withdrawal:', studentProfileError);
        return res.status(500).json({ error: 'Student profile not found for withdrawal.' });
      }

      const newStudentBalance = studentProfile.balance - withdrawalRequest.amount;
      if (newStudentBalance < 0) {
          
          return res.status(400).json({ error: 'Student has insufficient balance for approval.' });
      }

      const { error: updateBalanceError } = await supabase
        .from('profiles')
        .update({ balance: newStudentBalance })
        .eq('id', studentProfile.id);

      if (updateBalanceError) {
        console.error('Error updating student balance for withdrawal:', updateBalanceError);
        return res.status(500).json({ error: 'Failed to update student balance.' });
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            type: 'withdrawal',
            buyer_id: studentProfile.id, 
            amount: -withdrawalRequest.amount, 
            payment_method: withdrawalRequest.method,
            status: 'completed',
            transaction_id: `withdrawal_${Date.now()}_${withdrawalRequestId}`,
            description: `Withdrawal of ${withdrawalRequest.amount} via ${withdrawalRequest.method}`,
          },
        ]);

      if (transactionError) {
        console.error('Error recording withdrawal transaction:', transactionError);
        
        return res.status(500).json({ error: 'Failed to record withdrawal transaction.' });
      }
    }

    
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({ status, approved_date: new Date().toISOString() })
      .eq('id', withdrawalRequestId)
      .select(); 

    if (error) {
      console.error('Error updating withdrawal request status:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Withdrawal request not found or no changes made' });
    }

    return res.status(200).json({ message: `Withdrawal request ${status} successfully`, data });
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
