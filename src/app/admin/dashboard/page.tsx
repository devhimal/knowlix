"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileCheck } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  student_id: string;
  amount: number;
  method: string;
  status: string;
  request_date: string;
  approved_date?: string;
  
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, session } = useAuth();
  const router = useRouter();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push("/dashboard"); 
      toast.error("You do not have administrative access.");
      return;
    }

    fetchWithdrawalRequests();
  }, [isAuthenticated, user, router]);

  const fetchWithdrawalRequests = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const response = await fetch("/api/admin/withdrawals", { headers });
      const data = await response.json();
      if (response.ok) {
        setWithdrawalRequests(data);
      } else {
        toast.error(`Failed to fetch withdrawal requests: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Withdrawal request ${status} successfully!`);
        fetchWithdrawalRequests(); 
      } else {
        toast.error(`Failed to ${status} request: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return null; 
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
            Admin Panel
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/review')}>
            <FileCheck className="h-4 w-4 mr-2" />
            Review Queue
          </Button>
        </div>
      </div>

      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalRequests.length === 0 ? (
            <p className="text-center text-gray-500">No withdrawal requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.student_id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NPR {req.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.method}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateWithdrawalStatus(req.id, 'approved')}
                              disabled={processingId === req.id}
                              className="text-green-600 hover:text-green-900 border-green-600"
                            >
                              {processingId === req.id ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateWithdrawalStatus(req.id, 'rejected')}
                              disabled={processingId === req.id}
                              className="text-red-600 hover:text-red-900 border-red-600"
                            >
                              {processingId === req.id ? "Rejecting..." : "Reject"}
                            </Button>
                          </div>
                        )}
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
