"use client";
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/context/PaymentContext';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, TrendingUp, Download, Calendar, CreditCard, Wallet, Building2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Earnings() {
  const { getUserEarnings, getUserTransactions, loading: paymentLoading } = usePayment();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || paymentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const totalEarnings = getUserEarnings(user.id);
  const transactions = getUserTransactions(user.id);
  const salesTransactions = transactions.filter(t => t.sellerId === user.id && t.status === 'completed');
  const purchaseTransactions = transactions.filter(t => t.buyerId === user.id);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'esewa':
        return <Wallet className="h-4 w-4 text-green-600" />;
      case 'khalti':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'bank':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'esewa':
        return 'eSewa';
      case 'khalti':
        return 'Khalti';
      case 'bank':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings & Transactions</h1>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">NPR {totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{salesTransactions.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resources Purchased</p>
                <p className="text-3xl font-bold text-gray-900">{purchaseTransactions.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Download className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Transactions */}
        {salesTransactions.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Sales</h2>
            <div className="space-y-4">
              {salesTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-green-100 p-2 rounded">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{transaction.resourceName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>Buyer: {transaction.buyerEmail}</span>
                        <span>•</span>
                        <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
                      </div>
                      {transaction.transactionId && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          TXN: {transaction.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">+NPR {transaction.amount}</div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 mt-1">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Purchase Transactions */}
        {purchaseTransactions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Purchases</h2>
            <div className="space-y-4">
              {purchaseTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 p-2 rounded">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{transaction.resourceName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>Seller: {transaction.sellerEmail}</span>
                        <span>•</span>
                        <span>{getPaymentMethodName(transaction.paymentMethod)}</span>
                      </div>
                      {transaction.transactionId && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          TXN: {transaction.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">NPR {transaction.amount}</div>
                    <Badge
                      variant="secondary"
                      className={
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {salesTransactions.length === 0 && purchaseTransactions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-600">
              Start uploading paid resources to earn money, or purchase resources from other students.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};