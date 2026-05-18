"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext'; // Keep usePayment for now
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, FileText, Flag, CheckCircle, XCircle, Trash2, DollarSign, Calendar, CreditCard, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const { user, role, loading } = useAuth();
  // const { getAllTransactions } = usePayment(); // Keep usePayment for now
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'admin') {
        router.push('/dashboard'); // Redirect if not an admin
      }
    }
  }, [loading, user, role, router]);

  // Mock transactions data, assuming usePayment will also be mocked or removed later
  const transactions = [
    { id: 't1', resourceName: 'Calculus Notes', buyerEmail: 'student1@example.com', sellerEmail: 'mentor1@example.com', amount: 150, paymentMethod: 'esewa', status: 'completed', createdAt: '2024-04-01T10:00:00Z' },
    { id: 't2', resourceName: 'Linear Algebra Guide', buyerEmail: 'student2@example.com', sellerEmail: 'mentor2@example.com', amount: 200, paymentMethod: 'khalti', status: 'completed', createdAt: '2024-04-02T11:00:00Z' },
    { id: 't3', resourceName: 'Subscription - Monthly', buyerEmail: 'student3@example.com', sellerEmail: 'platform', amount: 299, paymentMethod: 'bank', status: 'completed', createdAt: '2024-04-03T12:00:00Z' },
    { id: 't4', resourceName: 'Physics Exam Prep', buyerEmail: 'student4@example.com', sellerEmail: 'mentor1@example.com', amount: 100, paymentMethod: 'esewa', status: 'failed', createdAt: '2024-04-04T13:00:00Z' },
  ];
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', uploads: 12 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'mentor', status: 'active', uploads: 8 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'student', status: 'active', uploads: 15 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'student', status: 'suspended', uploads: 5 },
  ]);

  const [resources, setResources] = useState([
    { id: 1, name: 'Data Structures Notes.pdf', uploader: 'John Doe', status: 'verified', reports: 0 },
    { id: 2, name: 'Algorithm Guide.pdf', uploader: 'Jane Smith', status: 'pending', reports: 0 },
    { id: 3, name: 'Database Manual.docx', uploader: 'Mike Johnson', status: 'verified', reports: 2 },
    { id: 4, name: 'Web Dev Tutorial.pdf', uploader: 'Sarah Williams', status: 'flagged', reports: 5 },
  ]);

  const handleVerifyResource = (id: number) => {
    setResources(resources.map(r => r.id === id ? { ...r, status: 'verified' } : r));
  };

  const handleDeleteResource = (id: number) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const handleSuspendUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' } : u));
  };

  const handleActivateUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
  };

  const stats = {
    totalUsers: users.length,
    totalResources: resources.length,
    pendingVerification: resources.filter(r => r.status === 'pending').length,
    flaggedContent: resources.filter(r => r.status === 'flagged').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-700">Loading authentication...</span>
      </div>
    );
  }

  // If user is not admin, the useEffect will redirect them.
  // We can render null or a basic message here as the redirection handles it.
  if (!user || role !== 'admin') {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users />} value={stats.totalUsers} label="Total Users" color="blue" />
          <StatCard icon={<FileText />} value={stats.totalResources} label="Total Resources" color="green" />
          <StatCard icon={<CheckCircle />} value={stats.pendingVerification} label="Pending Verification" color="yellow" />
          <StatCard icon={<Flag />} value={stats.flaggedContent} label="Flagged Content" color="red" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="resources">Resource Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reported Content</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Users</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.uploads}</TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            Activate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Resources</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>{resource.uploader}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            resource.status === 'verified'
                              ? 'secondary'
                              : resource.status === 'flagged'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{resource.reports}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {resource.status !== 'verified' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyResource(resource.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <div className="bg-green-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Total Revenue: </span>
                  <span className="text-lg font-bold text-green-600">NPR {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.resourceName}</TableCell>
                        <TableCell className="text-sm">{transaction.buyerEmail}</TableCell>
                        <TableCell className="text-sm">{transaction.sellerEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline">NPR {transaction.amount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {transaction.paymentMethod === 'esewa' && 'eSewa'}
                            {transaction.paymentMethod === 'khalti' && 'Khalti'}
                            {transaction.paymentMethod === 'bank' && 'Bank'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === 'completed' 
                                ? 'secondary' 
                                : transaction.status === 'failed'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No transactions yet
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reported Content</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Name</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.filter(r => r.reports > 0).map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{resource.reports} reports</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.status === 'flagged' ? 'destructive' : 'outline'}>
                          {resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyResource(resource.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {resources.filter(r => r.reports > 0).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reported content at the moment
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }: any) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-2">
      <div className={`text-${color}-600`}>{icon}</div>
      <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </Card>
);