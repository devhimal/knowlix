"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources, ResourceStatus } from '@/context/ResourceContext';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';
import { usePayment } from '@/context/PaymentContext'; 
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, FileText, Flag, CheckCircle, XCircle, Trash2, Loader2, FileCheck, Eye, Zap } from 'lucide-react';

export default function AdminPanel() {
  const { user, role, session, loading: authLoading } = useAuth();
  const { resources, fetchAllResources, updateResourceStatus, deleteResource } = useResources();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const fetchOptions: RequestInit = {};
      if (session?.access_token) {
        fetchOptions.headers = {
          'Authorization': `Bearer ${session.access_token}`
        };
      }
      
      const response = await fetch('/api/admin/users', fetchOptions);
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        const msg = data.error || data.message || 'Unknown error fetching users';
        console.error('Fetch Users Error:', msg);
        toast.error(msg);
        setErrorState(msg);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to connect to users API');
    }
  }, [session]);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    }
  }, []);

  useEffect(() => {
    // Only attempt to load data if authentication is resolved
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!['admin', 'super_admin'].includes(role || '')) {
        router.push('/dashboard');
      } else {
        const loadAllData = async () => {
          setLoadingData(true);
          setErrorState(null);
          try {
            // Ensure auth state is fully synchronized before calling private APIs
            await Promise.allSettled([
              fetchAllResources(),
              fetchUsers(),
              fetchTransactions()
            ]);
          } catch (error) {
            console.error('Load All Data Error:', error);
          } finally {
            setLoadingData(false);
          }
        };
        loadAllData();
      }
    }
  }, [authLoading, user, role, router, fetchAllResources, fetchUsers, fetchTransactions]);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalResources: resources.length,
    pendingVerification: resources.filter(r => ['pending_review', 'pending_admin', 'pending_ai', 'pending_plagiarism'].includes(r.status)).length,
    flaggedContent: resources.filter(r => r.status === 'flagged').length,
  }), [users, resources]);

  const topResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 5);
  }, [resources]);

  const handleVerifyResource = async (id: string) => {
    try {
      await updateResourceStatus(id, 'approved');
      toast.success('Resource approved successfully');
    } catch (error) {
      toast.error('Failed to approve resource');
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteResource(id);
        toast.success('Resource deleted successfully');
      } catch (error) {
        toast.error('Failed to delete resource');
      }
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    // Prevent deleting own account
    if (userId === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch('/api/admin/users', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ userId })
        });
        
        const data = await response.json();
        if (response.ok) {
          toast.success(`User deleted successfully`);
          fetchUsers();
        } else {
          toast.error('Failed to delete user: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Delete User Error:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    // Prevent updating own role
    if (userId === user?.id) {
      toast.error("You cannot change your own role.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (confirm(`Change user role to ${newRole}?`)) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ userId, role: newRole })
        });
        
        const data = await response.json();
        if (response.ok) {
          toast.success(`User role updated to ${newRole}`);
          fetchUsers();
        } else {
          toast.error('Failed to update role: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Update Role Error:', error);
        toast.error('Failed to update role');
      }
    }
  };

  if (authLoading || (loadingData && users.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">Synchronizing administrative data...</p>
      </div>
    );
  }

  if (!user || !['admin', 'super_admin'].includes(role || '')) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard')}>
              Withdrawals
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/review')}>
              <FileCheck className="h-4 w-4 mr-2" />
              Review Queue
            </Button>
          </div>
        </div>

        {errorState && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex justify-between items-center">
            <div>
              <span className="font-bold">Error:</span> {errorState}
            </div>
            <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCardLink icon={<Users />} value={stats.totalUsers} label="Total Users" color="blue" onClick={() => document.querySelector('[value="users"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} />
          <StatCardLink icon={<FileText />} value={stats.totalResources} label="Total Resources" color="green" onClick={() => document.querySelector('[value="resources"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} />
          <StatCardLink icon={<CheckCircle />} value={stats.pendingVerification} label="Pending Verification" color="yellow" onClick={() => document.querySelector('[value="review"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} />
          <StatCardLink icon={<Flag />} value={stats.flaggedContent} label="Flagged Content" color="red" onClick={() => document.querySelector('[value="reports"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Downloaded Resources</h2>
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topResources.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/resources/${r.id}`)}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell>{r.downloads}</TableCell>
                      <TableCell><Badge variant="outline">{r.status.replace('_', ' ')}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informative Videos & Guides</h2>
            <Card className="p-6">
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Button variant="link" className="p-0 h-auto text-primary" onClick={() => window.open('https://example.com/video1', '_blank')}>▶ Admin Panel Overview</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-primary" onClick={() => window.open('https://example.com/video2', '_blank')}>▶ Handling Resource Reviews</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-primary" onClick={() => window.open('https://example.com/video3', '_blank')}>▶ User Role Management</Button></li>
              </ul>
              <Button className="mt-4 w-full" variant="outline" onClick={() => window.open('/docs/admin-guide', '_blank')}>View Full Documentation</Button>
            </Card>
          </section>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="bg-white border p-1 h-auto flex-wrap sm:flex-nowrap">
            {role === 'super_admin' && (
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">User Management</TabsTrigger>
            )}
            <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-white">Resource Management</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-white">Transactions</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-white">Reported Content</TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-primary data-[state=active]:text-white">Review Queue</TabsTrigger>
          </TabsList>

          {role === 'super_admin' && (
            <TabsContent value="users">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Users</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{u.id}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' || u.role === 'super_admin' ? 'default' : 'outline'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>NPR {u.balance || 0}</TableCell>
                          <TableCell>
                            {u.is_premium ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">PRO</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Free</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserRole(u.id, u.role)}
                                disabled={u.role === 'super_admin'}
                              >
                                Toggle Role
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                disabled={u.role === 'super_admin'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && !loadingData && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No users found or error loading data.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="resources">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Resources</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource Name</TableHead>
                      <TableHead>Uploader</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell className="text-sm">
                          <div>{resource.uploader}</div>
                          <div className="text-xs text-gray-400">{resource.uploaderEmail}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              resource.status === 'approved'
                                ? 'secondary'
                                : resource.status === 'flagged' || resource.status === 'rejected'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {resource.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{resource.downloads}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/resources/${resource.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!['approved', 'rejected'].includes(resource.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleVerifyResource(resource.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteResource(resource.id, resource.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <div className="bg-green-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Total Revenue: </span>
                  <span className="text-lg font-bold text-green-600">NPR {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                {transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource/Plan</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.type === 'subscription' ? (
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span>{transaction.subscription_plan}</span>
                              </div>
                            ) : (
                              transaction.resource_name
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{transaction.buyer_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">NPR {transaction.amount}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.payment_method}
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
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
                    No transactions found in the system
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reported Content</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.filter(r => r.status === 'flagged').map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
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
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteResource(resource.id, resource.title)}
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
                {resources.filter(r => r.status === 'flagged').length === 0 && (
                  <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
                    No reported content at the moment
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="review">
            <Card className="p-12 text-center">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-primary opacity-20" />
              <h2 className="text-2xl font-bold mb-2">Review Queue</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Access the detailed review queue to perform AI analysis, plagiarism checks, and manual approvals for submitted resources.
              </p>
              <Button onClick={() => router.push('/review')} size="lg">
                Go to Review Queue
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const StatCardLink = ({ icon, value, label, color, onClick }: any) => (
  <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <div className="flex items-center justify-between mb-2">
      <div className={`text-${color}-600`}>{icon}</div>
      <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
    </div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
  </Card>
);
