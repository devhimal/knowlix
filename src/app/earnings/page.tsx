"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { toast } from "sonner"; 

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  resource_name?: string; 
  created_at: string;
}

export default function EarningsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);


  const fetchData = async () => {
    if (!user) return; 

    setDataLoading(true);
    try {
      
      const profileRes = await fetch(`/api/users/${user.id}/profile`);
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setBalance(profileData.balance);
      } else {
        toast.error(`Failed to fetch balance: ${profileData.error}`);
      }

      
      const transactionsRes = await fetch(`/api/transactions?seller_id=${user.id}`);
      const transactionsData = await transactionsRes.json();
      if (transactionsRes.ok) {
        setTransactions(transactionsData);
      } else {
        toast.error(`Failed to fetch transactions: ${transactionsData.error}`);
      }

    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">My Earnings</h1>

      <div className="flex justify-center mb-10">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">NPR {balance.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <CardTitle>Your Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <p className="text-center text-gray-500">Loading sales data...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500">No sales yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+ NPR {tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.description || (tx.type === 'resource_purchase' ? `Sale of ${tx.resource_name || 'a resource'}` : '-')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
