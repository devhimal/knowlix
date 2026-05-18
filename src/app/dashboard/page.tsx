"use client";
import { useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Remove useRouter if only used for auth
// import { useAuth } from '@/context/AuthContext'; // Remove useAuth
// import { usePayment } from '@/context/PaymentContext'; // Remove usePayment if it was Supabase-dependent
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Upload, Users, FileText, Star, Download, Search, TrendingUp, DollarSign, ShoppingBag, Zap, Calendar, CreditCard } from 'lucide-react';

export default function StudentDashboard() {
  // const { user, isAuthenticated } = useAuth(); // Remove useAuth destructuring
  // const { getUserEarnings, purchasedResources, getUserTransactions } = usePayment(); // Remove usePayment destructuring
  // const router = useRouter(); // Remove useRouter if only used for auth

  // Mock user data
  const user = {
    id: 'mock-user-id',
    name: 'Student User',
    email: 'student@example.com',
    role: 'student',
    course: 'Computer Science',
    semester: '5th Semester',
    subscription: {
      isSubscribed: true,
      plan: 'semester',
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(), // 3 months from now
    },
  };
  const isAuthenticated = true; // Always true for UI display

  // Mock payment functions and data
  const getUserEarnings = (_userId: string) => 1500; // Mock earnings
  const purchasedResources = []; // Mock purchased resources
  const getUserTransactions = (_userId: string) => ([ // Mock transactions
    { id: 'tx1', resourceName: 'Calculus Notes', buyerEmail: 'student@example.com', sellerEmail: 'mentor@example.com', amount: 150, paymentMethod: 'esewa', status: 'completed', createdAt: '2024-04-01T10:00:00Z', type: 'resource' },
    { id: 'tx2', resourceName: 'Linear Algebra Guide', buyerEmail: 'student@example.com', sellerEmail: 'mentor@example.com', amount: 200, paymentMethod: 'khalti', status: 'completed', createdAt: '2024-04-02T11:00:00Z', type: 'resource' },
    { id: 'tx3', subscriptionPlan: 'semester', buyerEmail: 'student@example.com', sellerEmail: 'platform', amount: 999, paymentMethod: 'bank', status: 'completed', createdAt: '2024-04-03T12:00:00Z', type: 'subscription' },
  ]);

  const transactions = user ? getUserTransactions(user.id) : [];
  const isSubscribed = user?.subscription?.isSubscribed || false;

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Monthly Pro';
      case 'semester': return 'Semester Pass';
      case 'annual': return 'Annual Elite';
      default: return 'Free Plan';
    }
  };

  useEffect(() => {
    // Remove authentication check if only UI is needed
    // if (!isAuthenticated) {
    //   router.push('/login');
    // }
    console.log("Dashboard loaded - (Authentication check removed)");
  }, []); // Remove isAuthenticated, router from dependency array

  const earnings = user ? getUserEarnings(user.id) : 0;

  const recentFiles = [
    { id: 1, title: 'Data Structures Notes.pdf', description: 'Comprehensive notes on data structures including arrays, linked lists, and trees.', subject: 'Computer Science', semester: '5th', downloads: 234, rating: 4.8 },
    { id: 2, title: 'Algorithm Analysis.pdf', description: 'Detailed analysis of common algorithms and their complexities.', subject: 'Computer Science', semester: '5th', downloads: 189, rating: 4.6 },
    { id: 3, title: 'Database Management.pptx', description: 'Presentation slides covering database design, SQL, and normalization.', subject: 'Computer Science', semester: '5th', downloads: 156, rating: 4.7 },
    { id: 4, title: 'Operating Systems.pdf', description: 'Notes on operating system concepts, processes, memory management, and file systems.', subject: 'Computer Science', semester: '5th', downloads: 298, rating: 4.9 },
  ];

  const recommendedResources = [
    { id: 5, title: 'Web Development Guide.pdf', description: 'A complete guide to modern web development technologies and practices.', subject: 'Computer Science', semester: '6th', downloads: 412, rating: 4.9 },
    { id: 6, title: 'Machine Learning Basics.pdf', description: 'Introduction to machine learning, covering supervised and unsupervised learning algorithms.', subject: 'Computer Science', semester: '6th', downloads: 345, rating: 4.8 },
    { id: 7, title: 'Software Engineering.docx', description: 'Foundations of software engineering, including design patterns and agile methodologies.', subject: 'Computer Science', semester: '6th', downloads: 278, rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
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
            <Button /*onClick={() => router.push('/resources')}*/ className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border-none">
              <Zap className="h-4 w-4 mr-2 fill-amber-950" />
              Try Premium
            </Button>
          )}
        </div>

        {/* Quick Search */}
        <Card className="p-6 mb-8 border-none shadow-sm bg-white">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for notes, assignments, papers..."
                className="pl-10 h-12 text-lg"
                // onFocus={() => router.push('/resources')}
              />
            </div>
            <Button size="lg" /*onClick={() => router.push('/resources')}*/ className="px-8">Search</Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionCard
                icon={<BookOpen className="h-6 w-6 text-primary" />}
                title="Browse"
                // onClick={() => router.push('/resources')}
              />
              <ActionCard
                icon={<Upload className="h-6 w-6 text-green-500" />}
                title="Upload"
                // onClick={() => router.push('/upload')}
              />
              <ActionCard
                icon={<Users className="h-6 w-6 text-purple-500" />}
                title="Mentors"
                // onClick={() => router.push('/mentors')}
              />
              <ActionCard
                icon={<DollarSign className="h-6 w-6 text-amber-500" />}
                title="Earnings"
                // onClick={() => router.push('/earnings')}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<FileText className="h-4 w-4" />} value="12" label="Uploads" />
              <StatCard icon={<Download className="h-4 w-4" />} value="45" label="Downloads" />
              <StatCard icon={<Star className="h-4 w-4" />} value="4.8" label="Rating" />
              <StatCard icon={<TrendingUp className="h-4 w-4" />} value="234" label="Points" />
            </div>

            {/* Recently Uploaded */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recently Uploaded
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recentFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Subscription Card */}
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

            {/* Recent Transactions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                History
              </h2>
              <Card className="divide-y border-none shadow-sm overflow-hidden bg-white">
                {transactions.length > 0 ? (
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
                {transactions.length > 0 && (
                  <Button variant="ghost" className="w-full text-xs text-primary font-bold py-3">
                    View All Activity
                  </Button>
                )}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, description, onClick }: any) => (
  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" /*onClick={onClick}*/>
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

const FileCard = ({ file }: any) => {
  // const router = useRouter(); // Remove useRouter

  const handleViewDetails = () => {
    // router.push(`/resources/${file.id}`); // Remove redirection
    alert(`Navigating to /resources/${file.id}`);
  };

  const handleDownload = () => {
    alert(`Downloading ${file.title}...`);
    // In a real app, this would trigger the actual download logic
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <FileText className="h-10 w-10 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">{file.title}</h3>
            <p className="text-sm text-muted-foreground">
              {file.subject} - {file.semester}
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{file.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {file.downloads}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {file.rating}
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