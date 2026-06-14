"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button"; // Assuming this path
import { Input } from "@/components/ui/input"; // Assuming this path
import { Label } from "@/components/ui/label"; // Assuming this path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming this path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming this path
import { toast } from "sonner"; // Assuming this path

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  resource_name?: string; // Added for sales history display
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: string;
  status: string;
  request_date: string;
  approved_date?: string;
}

export default function EarningsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);


  const fetchData = async () => {
    if (!user) return; // Ensure user is available before fetching

    setDataLoading(true);
    try {
      // Fetch user profile (for balance)
      const profileRes = await fetch(`/api/users/${user.id}/profile`);
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setBalance(profileData.balance);
      } else {
        toast.error(`Failed to fetch balance: ${profileData.error}`);
      }

      // Fetch sales transactions (where user is seller)
      const transactionsRes = await fetch(`/api/transactions?seller_id=${user.id}`);
      const transactionsData = await transactionsRes.json();
      if (transactionsRes.ok) {
        setTransactions(transactionsData);
      } else {
        toast.error(`Failed to fetch transactions: ${transactionsData.error}`);
      }

      // Fetch withdrawal requests
      const withdrawalsRes = await fetch(`/api/users/${user.id}/withdrawals`);
      const withdrawalsData = await withdrawalsRes.json();
      if (withdrawalsRes.ok) {
        setWithdrawalRequests(withdrawalsData);
      } else {
        toast.error(`Failed to fetch withdrawal requests: ${withdrawalsData.error}`);
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

  const handleWithdrawalRequest = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to request a withdrawal.");
      router.push("/login");
      return;
    }

    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance for this withdrawal amount.");
      return;
    }
    if (!withdrawalMethod) {
        toast.error("Please select a withdrawal method.");
        return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, method: withdrawalMethod }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit withdrawal request.");
      }

      toast.success("Withdrawal request submitted successfully!");
      setWithdrawalAmount("");
      setWithdrawalMethod("");
      // Re-fetch data to update balance and withdrawal requests
      fetchData();

    } catch (err: any) {
      toast.error(`Withdrawal request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading && !user) { // Only show full page loading if user is not yet authenticated
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Please log in to view your earnings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">My Earnings</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">NPR {balance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawalAmount">Amount (NPR)</Label>
                <Input
                  id="withdrawalAmount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="e.g., 500"
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="withdrawalMethod">Withdrawal Method</Label>
                <Select
                  onValueChange={(value) => setWithdrawalMethod(value)}
                  value={withdrawalMethod}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="esewa">eSewa</SelectItem>
                    <SelectItem value="khalti">Khalti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleWithdrawalRequest} disabled={loading || !withdrawalAmount || !withdrawalMethod} className="w-full">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <p className="text-center text-gray-500">Loading withdrawal requests...</p>
          ) : withdrawalRequests.length === 0 ? (
            <p className="text-center text-gray-500">No withdrawal requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">- NPR {req.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.request_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.approved_date ? new Date(req.approved_date).toLocaleDateString() : 'N/A'}
                      </td>
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
