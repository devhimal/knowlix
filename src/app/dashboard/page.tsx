"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import supabase, { getDownloadUrl } from "@/lib/supabase"; 
import { Resource } from "@/context/ResourceContext"; 
import { usePayment } from "@/context/PaymentContext";
import { useAuth } from "@/context/AuthContext";
import { useResources } from "@/context/ResourceContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Upload,
  Users,
  FileText,
  Star,
  Download,
  Search,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  CreditCard,
  Check,
  Eye,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";


const ActionCard = ({ icon, title, description, onClick }: any) => (
  <Card
    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </Card>
);

const StatCard = ({ icon, value, label }: any) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </Card>
);

const FileCard = ({ file }: { file: Resource }) => {
  const router = useRouter();
  const { incrementDownload } = useResources(); 

  const handleViewDetails = () => {
    router.push(`/resources/${file.id}`);
  };

  const handleDownload = async () => {
    if (!file.file_path) {
      toast.error("File path not available for download.");
      return;
    }

    try {
      
      const downloadUrl = await getDownloadUrl(file.file_path, file.title);
      
      if (downloadUrl) {
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.title; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        
        await incrementDownload(file.id);
        toast.success(`Downloading "${file.title}"!`);
      } else {
        toast.error("Failed to get download URL.");
      }
    } catch (error) {
      console.error("Error during download:", error);
      toast.error("An error occurred during download.");
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">{file.title}</h3>
            <p className="text-sm text-muted-foreground">
              {file.subjectName} - {file.semester}
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{file.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {file.downloads}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {file.average_rating?.toFixed(1)} ({file.total_ratings})
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button size="sm" className="flex-1" onClick={handleDownload}>Download</Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={handleViewDetails}>View Details</Button>
      </div>
    </Card>
  );
};

interface StudentDashboardContentProps {
  user: any; 
  isSubscribed: boolean;
  getPlanName: (plan: string) => string;
  recentFiles: Resource[];
  recommendedResources: Resource[];
  transactions: any[]; 
  loadingPayments: boolean;
  getUserEarnings: (userId: string) => number;
  myUploadedResources: Resource[]; 
}

const StudentDashboardContent = ({
  user,
  isSubscribed,
  getPlanName,
  recentFiles,
  recommendedResources,
  transactions,
  loadingPayments,
  getUserEarnings,
  myUploadedResources,
}: StudentDashboardContentProps) => {
  const earnings = user ? getUserEarnings(user.id) : 0;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-500">
              {user?.course} • {user?.semester}
            </p>
          </div>

          {isSubscribed ? (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-primary/10">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary fill-primary" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Active Plan</div>
                <div className="text-sm font-bold text-gray-900">{getPlanName(user?.subscription?.plan || '')}</div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
                Active
              </Badge>
            </div>
          ) : (
            <Button className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border-none" onClick={() => router.push('/resources')}>
              <Zap className="h-4 w-4 mr-2 fill-amber-950" />
              Try Premium
            </Button>
          )}
        </div>

        {}
        <Card className="p-6 mb-8 border-none shadow-sm bg-white">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for notes, assignments, papers..."
                className="pl-10 h-12 text-lg"
                onFocus={() => router.push('/resources')}
              />
            </div>
            <Button size="lg" onClick={() => router.push('/resources')}>Search</Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-8">
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionCard
                icon={<BookOpen className="h-6 w-6 text-primary" />}
                title="Browse"
                onClick={() => router.push('/resources')}
              />
              <ActionCard
                icon={<Upload className="h-6 w-6 text-green-500" />}
                title="Upload"
                onClick={() => router.push('/upload')}
              />
              <ActionCard
                icon={<Users className="h-6 w-6 text-purple-500" />}
                title="Mentors"
                onClick={() => router.push('/mentors')}
              />
              <ActionCard
                icon={<DollarSign className="h-6 w-6 text-amber-500" />}
                title="Earnings"
                onClick={() => router.push('/earnings')}
              />
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<FileText className="h-4 w-4" />} value="12" label="Uploads" />
              <StatCard icon={<Download className="h-4 w-4" />} value="45" label="Downloads" />
              <StatCard icon={<Star className="h-4 w-4" />} value="4.8" label="Rating" />
              <StatCard icon={<TrendingUp className="h-4 w-4" />} value="234" label="Points" />
            </div>

            {}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                My Uploaded Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {myUploadedResources.length > 0 ? (
                  myUploadedResources.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))
                ) : (
                  <p>You have not uploaded any resources yet.</p>
                )}
              </div>
            </section>

            {}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recently Uploaded
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recentFiles.length > 0 ? (
                  recentFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))
                ) : (
                  <p>No recent files found.</p>
                )}
              </div>
            </section>

            {}
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recommended for You
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendedResources.length > 0 ? (
                  recommendedResources.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))
                ) : (
                  <p>No recommendations found.</p>
                )}
              </div>
            </section>
          </div>

          {}
          <div className="space-y-8">
            {}
            {isSubscribed && (
              <Card className="p-6 bg-gradient-to-br from-primary to-teal-700 text-white border-none shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Zap className="h-6 w-6 fill-white" />
                  </div>
                  <Badge className="bg-white/20 border-none text-white">PRO</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">{getPlanName(user?.subscription?.plan || '')}</h3>
                <p className="text-white/80 text-sm mb-6">Unlimited access to all resources</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Expires on:</span>
                    <span className="font-medium">{new Date(user?.subscription?.expiryDate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-2/3" />
                  </div>
                </div>
                <Button className="w-full bg-white text-primary hover:bg-gray-100 font-bold">
                  Manage Subscription
                </Button>
              </Card>
            )}

            {}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                History
              </h2>
              <Card className="divide-y border-none shadow-sm overflow-hidden bg-white">
                {loadingPayments ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Loading transactions...
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                          {tx.type === 'subscription' ? getPlanName(tx.subscriptionPlan || '') : tx.resourceName}
                        </span>
                        <span className="text-sm font-bold text-gray-900">NPR {tx.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize">{tx.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No recent transactions
                  </div>
                )}
                {transactions.length > 0 && <Button variant="ghost" className="w-full text-xs text-primary font-bold py-3">
                  View All Activity
                </Button>}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const { user, isAuthenticated, role, loading } = useAuth();
  const paymentContext = usePayment(); 
  const { getUserEarnings, getUserTransactions, loading: loadingPayments } = paymentContext;
  const { resources, fetchResources, loading: loadingResourcesFromContext } = useResources();

  const transactions = user && !loadingPayments ? getUserTransactions(user.id) : [];
  const isSubscribed = user && !loadingPayments ? paymentContext.isSubscribed(user.id) : false;

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Monthly Pro';
      case 'semester': return 'Semester Pass';
      case 'annual': return 'Annual Elite';
      default: return 'Free Plan';
    }
  };

  const recentFiles = useMemo(() => {
    if (!loadingResourcesFromContext && resources.length > 0) {
      return [...resources].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).slice(0, 4);
    }
    return [];
  }, [resources, loadingResourcesFromContext]);

  const recommendedResources = useMemo(() => {
    if (!loadingResourcesFromContext && resources.length > 0) {
      return [...resources].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 3);
    }
    return [];
  }, [resources, loadingResourcesFromContext]);

  const myUploadedResources = useMemo(() => {
    if (user?.id && !loadingResourcesFromContext && resources.length > 0) {
      return resources.filter(resource => resource.uploaderId === user.id);
    }
    return [];
  }, [resources, loadingResourcesFromContext, user]);

  console.log("StudentDashboard: Rendering component. isAuthenticated:", isAuthenticated, "loading:", loading, "role:", role);

  if (!isAuthenticated && !loading) {
    console.log("StudentDashboard: Redirecting unauthenticated user.");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    );
  }

  if (loading || loadingPayments || loadingResourcesFromContext) {
    console.log("StudentDashboard: Displaying loading state.");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  console.log("StudentDashboard: Displaying content based on role.");

  if (role === 'admin') {
    return <AdminDashboardContent />;
  }

  return (
    <StudentDashboardContent
      user={user}
      isSubscribed={isSubscribed}
      getPlanName={getPlanName}
      recentFiles={recentFiles}
      recommendedResources={recommendedResources}
      transactions={transactions}
      loadingPayments={loadingPayments}
      getUserEarnings={getUserEarnings}
      myUploadedResources={myUploadedResources}
    />
  );
}



type ResourceStatus = 'pending_review' | 'approved' | 'rejected' | 'pending_admin';

const AdminDashboardContent = () => {
  const { resources, fetchAllResources, loading, updateResourceStatus, deleteResource } = useResources();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalBooks, setTotalBooks] = useState<number | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  useEffect(() => {
    const fetchStats = async () => {
      
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });
      if (usersError) {
        console.error('Error fetching total users:', usersError);
      } else {
        setTotalUsers(usersCount);
      }

      
      const { count: booksCount, error: booksError } = await supabase
        .from('books')
        .select('*', { count: 'exact' });
      if (booksError) {
        console.error('Error fetching total books:', booksError);
      } else {
        setTotalBooks(booksCount);
      }
    };
    fetchStats();
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.uploader.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  
  const approvedResources = resources.filter(r => r.status === 'approved').length;
  const pendingReviewResources = resources.filter(r => r.status === 'pending_review' || r.status === 'pending_admin').length;
  const rejectedResources = resources.filter(r => r.status === 'rejected').length;

  const handleUpdateStatus = async (id: string, newStatus: ResourceStatus) => {
    await updateResourceStatus(id, newStatus);
    toast.success(`Resource status updated to ${newStatus.replace('_', ' ')}!`);
    fetchAllResources(); 
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the resource: "${title}"?`)) {
      try {
        await deleteResource(id);
        toast.success(`Resource "${title}" deleted successfully!`);
        fetchAllResources(); 
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error(`Failed to delete resource "${title}".`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading resources for admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="h-4 w-4" />} value={totalUsers !== null ? totalUsers : '...'} label="Total Users" />
        <StatCard icon={<BookOpen className="h-4 w-4" />} value={totalBooks !== null ? totalBooks : '...'} label="Total Books" />
        <StatCard icon={<FileText className="h-4 w-4" />} value={resources.length} label="Total Resources" />
        <StatCard icon={<Download className="h-4 w-4" />} value={resources.reduce((sum, r) => sum + r.downloads, 0)} label="Total Downloads" />
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Check className="h-4 w-4 text-green-500" />} value={approvedResources} label="Approved Resources" />
        <StatCard icon={<Search className="h-4 w-4 text-orange-500" />} value={pendingReviewResources} label="Pending Review" />
        <StatCard icon={<Zap className="h-4 w-4 text-red-500" />} value={rejectedResources} label="Rejected Resources" />
      </div>

      {}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Resources</h2>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_admin">Pending Admin</option>
          </select>
        </div>

        <Card>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Title</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Uploader</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{resource.title}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{resource.uploader}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge
                          variant={
                            resource.status === 'approved' ? 'default' :
                            resource.status === 'pending_review' || resource.status === 'pending_admin' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {resource.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/resources/${resource.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(resource.status === 'pending_review' || resource.status === 'pending_admin') && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(resource.id, 'approved')}>
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(resource.id, 'rejected')}>
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteResource(resource.id, resource.title)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No resources found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};