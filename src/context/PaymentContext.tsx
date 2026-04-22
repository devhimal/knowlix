import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'resource_purchase' | 'subscription';
  resourceId?: number;
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
  resourceId: number;
  purchaseDate: string;
  amount: number;
  transactionId: string;
}

interface PaymentContextType {
  transactions: Transaction[];
  purchasedResources: PurchasedResource[];
  initiatePayment: (
    resourceId: number,
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
  hasPurchased: (resourceId: number) => boolean;
  getUserEarnings: (userId: string) => number;
  getUserTransactions: (userId: string) => Transaction[];
  getAllTransactions: () => Transaction[];
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    const storedPurchases = localStorage.getItem('purchasedResources');
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    if (storedPurchases) {
      setPurchasedResources(JSON.parse(storedPurchases));
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('purchasedResources', JSON.stringify(purchasedResources));
  }, [purchasedResources]);

  const initiatePayment = async (
    resourceId: number,
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

    if (success) {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'resource_purchase',
        resourceId,
        resourceName,
        buyerId,
        buyerEmail,
        sellerId,
        sellerEmail,
        amount,
        paymentMethod,
        status: 'completed',
        transactionId,
        createdAt: new Date().toISOString(),
      };

      const purchase: PurchasedResource = {
        resourceId,
        purchaseDate: new Date().toISOString(),
        amount,
        transactionId,
      };

      setTransactions(prev => [transaction, ...prev]);
      setPurchasedResources(prev => [purchase, ...prev]);

      return { success: true, transactionId };
    } else {
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'resource_purchase',
        resourceId,
        resourceName,
        buyerId,
        buyerEmail,
        sellerId,
        sellerEmail,
        amount,
        paymentMethod,
        status: 'failed',
        transactionId: '',
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [transaction, ...prev]);
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

    if (success) {
      const transactionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'subscription',
        subscriptionPlan: plan,
        buyerId,
        buyerEmail,
        amount,
        paymentMethod,
        status: 'completed',
        transactionId,
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [transaction, ...prev]);

      return { success: true, transactionId };
    } else {
      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'subscription',
        subscriptionPlan: plan,
        buyerId,
        buyerEmail,
        amount,
        paymentMethod,
        status: 'failed',
        transactionId: '',
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [transaction, ...prev]);
      return { success: false };
    }
  };

  const hasPurchased = (resourceId: number): boolean => {
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
        getUserEarnings,
        getUserTransactions,
        getAllTransactions,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
