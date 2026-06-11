import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';

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
  initiatePayment: (
    resourceId: string,
    resourceName: string,
    sellerId: string,
    sellerEmail: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ) => Promise<{ success: boolean; transactionId?: string }>;
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
  getUserTransactions: (userId: string) => Transaction[];
  getAllTransactions: () => Transaction[];
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
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const initiatePayment = async (
    resourceId: string,
    resourceName: string,
    sellerId: string,
    sellerEmail: string,
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ): Promise<{ success: boolean; transactionId?: string }> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random success/failure (90% success rate for demo)
    const success = Math.random() > 0.1;

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
      status: success ? 'completed' : 'failed',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select();

      if (error) {
        throw error;
      }

      // Re-fetch transactions to update the state
      fetchTransactions();
      
      return { success, transactionId: data[0]?.transactionId };
    } catch (error) {
      console.error('Error initiating payment:', error);
      return { success: false };
    }
  };

  const initiateSubscription = async (
    plan: 'monthly' | 'semester' | 'annual',
    amount: number,
    paymentMethod: 'esewa' | 'khalti' | 'bank',
    buyerId: string,
    buyerEmail: string
  ): Promise<{ success: boolean; transactionId?: string }> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random success/failure (90% success rate for demo)
    const success = Math.random() > 0.1;

    const newTransaction: Partial<Transaction> = {
      type: 'subscription',
      subscriptionPlan: plan,
      buyerId,
      buyerEmail,
      amount,
      paymentMethod,
      status: success ? 'completed' : 'failed',
      transactionId: `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select();

      if (error) {
        throw error;
      }

      // Re-fetch transactions to update the state
      fetchTransactions();
      
      return { success, transactionId: data[0]?.transactionId };
    } catch (error) {
      console.error('Error initiating subscription:', error);
      return { success: false };
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

  const isSubscribed = (userId: string): boolean => {
    return transactions.some(t => t.buyerId === userId && t.type === 'subscription' && t.status === 'completed');
  };

  const getAllTransactions = (): Transaction[] => {
    return transactions;
  };

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        purchasedResources,
        initiatePayment,
        initiateSubscription,
        hasPurchased,
        isSubscribed,
        getUserEarnings,
        getUserTransactions,
        getAllTransactions,
        loading,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
