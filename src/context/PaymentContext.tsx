import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from "@/context/AuthContext"; // Added this import

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'resource_purchase' | 'subscription';
  resourceId?: string;
  resourceName?: string;
  subscriptionPlan?: 'monthly' | 'semester' | 'annual';
  buyerId: string;
  buyerEmail: string;
  sellerId?: string;
  sellerEmail?: string;
  amount: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
}

export interface PurchasedResource {
  resourceId: string;
  purchaseDate: string;
  amount: number;
  transactionId: string;
}

interface PaymentContextType {
  transactions: Transaction[];
  purchasedResources: PurchasedResource[];
  subscriptions: Subscription[]; // Added
  purchaseResource: (
    resourceId: string,
    resourceName: string,
    sellerId: string,
    sellerEmail: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ) => Promise<{ success: boolean; transactionId?: string; error: string | null }>;
  initiateSubscription: (
    plan: 'monthly' | 'semester' | 'annual',
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ) => Promise<{ success: boolean; transactionId?: string }>;
  hasPurchased: (resourceId: string) => boolean;
  isSubscribed: (userId: string) => boolean;
  getUserEarnings: (userId: string) => number;
  getEarningsBalance: (userId: string) => Promise<number | null>; // Add getEarningsBalance
  getUserTransactions: (userId: string) => Transaction[];
  getAllTransactions: () => Transaction[];
  submitWithdrawalRequest: (
    userId: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    accountDetails: any
  ) => Promise<{ success: boolean; error: string | null }>;
  loading: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchasedResources, setPurchasedResources] = useState<PurchasedResource[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]); // Added
  const [loading, setLoading] = useState(true);

  const { user } = useAuth(); // Get user from AuthContext

  const fetchTransactions = useCallback(async () => {
    setLoading(true); // Keep loading true while fetching both
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const fetchedTransactions: Transaction[] = data.map((dbTransaction: any) => ({
        id: dbTransaction.id,
        type: dbTransaction.type,
        resourceId: dbTransaction.resource_id,
        resourceName: dbTransaction.resource_name,
        subscriptionPlan: dbTransaction.subscription_plan,
        buyerId: dbTransaction.buyer_id,
        buyerEmail: dbTransaction.buyer_email,
        sellerId: dbTransaction.seller_id,
        sellerEmail: dbTransaction.seller_email,
        amount: dbTransaction.amount,
        paymentMethod: dbTransaction.payment_method,
        status: dbTransaction.status,
        transactionId: dbTransaction.transaction_id,
        createdAt: dbTransaction.created_at,
      }));
      setTransactions(fetchedTransactions);

      // For purchased resources, filter resource_purchase transactions that are completed
      const fetchedPurchasedResources: PurchasedResource[] = data
        .filter((tx: any) => tx.type === 'resource_purchase' && tx.status === 'completed')
        .map((tx: any) => ({
          resourceId: tx.resource_id,
          purchaseDate: tx.created_at,
          amount: tx.amount,
          transactionId: tx.transaction_id,
        }));
      setPurchasedResources(fetchedPurchasedResources);

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      // setLoading(false); // Will be set after both fetches are done
    }
  }, []);

  const fetchSubscriptions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('end_date', { ascending: false }); // Get most recent first

      if (error) {
        throw error;
      }
      setSubscriptions(data as Subscription[]);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  }, []);


  useEffect(() => {
    // Combine fetching logic
    const loadAllData = async () => {
      setLoading(true);
      await fetchTransactions(); // This no longer sets loading to false
      if (user?.id) {
        await fetchSubscriptions(user.id);
      } else {
        setSubscriptions([]);
      }
      setLoading(false);
    };

    loadAllData();
  }, [fetchTransactions, fetchSubscriptions, user?.id]);

  const purchaseResource = async (
    resourceId: string,
    resourceName: string,
    sellerId: string,
    sellerEmail: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ): Promise<{ success: boolean; transactionId?: string; error: string | null }> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random success/failure (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newTransaction: Partial<Transaction> = {
      type: 'resource_purchase',
      resourceId,
      resourceName,
      buyerId,
      buyerEmail,
      sellerId,
      sellerEmail,
      amount,
      paymentMethod,
      status: paymentSuccess ? 'completed' : 'failed',
      transactionId,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!paymentSuccess) {
        // Record failed transaction but don't proceed with balance update or resource_purchases
        await supabase.from('transactions').insert([newTransaction]);
        fetchTransactions();
        return { success: false, error: 'Payment failed.', transactionId };
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([newTransaction]);

      if (transactionError) {
        throw transactionError;
      }

      // Record resource purchase
      const { error: purchaseError } = await supabase
        .from('resource_purchases')
        .insert({
          buyer_id: buyerId,
          resource_id: resourceId,
          amount,
        });

      if (purchaseError) {
        throw purchaseError;
      }

      // Update seller's balance in profiles table
      const { error: balanceError } = await supabase.rpc('increment_user_balance', {
        user_id: sellerId,
        amount_to_add: amount,
      });

      if (balanceError) {
        throw balanceError;
      }

      // Re-fetch transactions to update the state
      fetchTransactions();
      
      return { success: true, error: null, transactionId };
    } catch (error: any) {
      console.error('Error purchasing resource:', error);
      // Ensure we still re-fetch even on error to capture any partial updates if applicable
      fetchTransactions();
      return { success: false, error: error.message, transactionId };
    }
  };

  const initiateSubscription = async (
    plan_id: 'monthly' | 'semester' | 'annual',
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> => { // Added error to return type
    // Determine end_date based on plan_id
    const endDate = new Date();
    let durationInMonths = 0;
    if (plan_id === 'monthly') durationInMonths = 1;
    else if (plan_id === 'semester') durationInMonths = 6;
    else if (plan_id === 'annual') durationInMonths = 12;
    endDate.setMonth(endDate.getMonth() + durationInMonths);

    // Make API call to our backend /api/subscriptions
    try {
      const apiResponse = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: buyerId,
          plan_id: plan_id,
          end_date: endDate.toISOString(),
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Failed to create subscription via API.");
      }

      const apiResult = await apiResponse.json();
      console.log("Subscription API success:", apiResult);

      // Record a transaction for the payment, now that subscription creation is successful
      const transactionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: Partial<Transaction> = {
        type: 'subscription',
        subscriptionPlan: plan_id,
        buyerId,
        buyerEmail,
        amount,
        paymentMethod,
        status: 'completed', // Mark as completed since API call was successful
        transactionId: transactionId,
        createdAt: new Date().toISOString(),
      };

      const { data, error: transactionError } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select();

      if (transactionError) {
        throw transactionError;
      }

      // Re-fetch transactions and subscriptions to update the state
      fetchTransactions();
      if (user?.id) { // Ensure user is available for fetching subscriptions
        fetchSubscriptions(user.id);
      }
      
      return { success: true, transactionId: transactionId }; // Return transactionId directly
    } catch (error: any) {
      console.error('Error initiating subscription:', error);
      return { success: false, error: error.message };
    }
  };

  const hasPurchased = (resourceId: string): boolean => {
    return purchasedResources.some(purchase => purchase.resourceId === resourceId);
  };

  const getUserEarnings = (userId: string): number => {
    return transactions
      .filter(t => t.sellerId === userId && t.status === 'completed')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getUserTransactions = (userId: string): Transaction[] => {
    return transactions.filter(t => t.sellerId === userId || t.buyerId === userId);
  };

  const getEarningsBalance = useCallback(async (userId: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }
      return data?.balance || 0;
    } catch (error) {
      console.error('Error fetching earnings balance:', error);
      return null;
    }
  }, []);

  const isSubscribed = (userId: string): boolean => {
    const activeSubscription = subscriptions.find(
      (sub) =>
        sub.user_id === userId &&
        sub.status === 'active' &&
        new Date(sub.end_date) > new Date()
    );
    return !!activeSubscription;
  };

  const getAllTransactions = (): Transaction[] => {
    return transactions;
  };

  const submitWithdrawalRequest = useCallback(async (
    userId: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    accountDetails: any
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          account_details_snapshot: accountDetails,
          status: 'pending' // Default status
        });

      if (error) {
        throw error;
      }
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error submitting withdrawal request:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        purchasedResources,
        subscriptions, // Added
        purchaseResource,
        initiateSubscription,
        hasPurchased,
        isSubscribed,
        getUserEarnings,
        getUserTransactions,
        getAllTransactions,
        getEarningsBalance,
        submitWithdrawalRequest,
        loading,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
