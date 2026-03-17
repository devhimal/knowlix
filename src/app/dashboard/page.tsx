"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Upload, Users, FileText, Star, Download, Search, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { getUserEarnings, purchasedResources } = usePayment();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const earnings = user ? getUserEarnings(user.id) : 0;
  const purchaseCount = purchasedResources.length;

  const recentFiles = [
    { id: 1, name: 'Data Structures Notes.pdf', subject: 'Computer Science', semester: '5th', downloads: 234, rating: 4.8 },
    { id: 2, name: 'Algorithm Analysis.pdf', subject: 'Computer Science', semester: '5th', downloads: 189, rating: 4.6 },
    { id: 3, name: 'Database Management.pptx', subject: 'Computer Science', semester: '5th', downloads: 156, rating: 4.7 },
    { id: 4, name: 'Operating Systems.pdf', subject: 'Computer Science', semester: '5th', downloads: 298, rating: 4.9 },
  ];

  const recommendedResources = [
    { id: 5, name: 'Web Development Guide.pdf', subject: 'Computer Science', semester: '6th', downloads: 412, rating: 4.9 },
    { id: 6, name: 'Machine Learning Basics.pdf', subject: 'Computer Science', semester: '6th', downloads: 345, rating: 4.8 },
    { id: 7, name: 'Software Engineering.docx', subject: 'Computer Science', semester: '6th', downloads: 278, rating: 4.7 },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {user?.course} - {user?.semester}
          </p>
        </div>

        {/* Quick Search */}
        <Card className="p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for notes, assignments, papers..."
                className="pl-10"
                onFocus={() => router.push('/resources')}
              />
            </div>
            <Button onClick={() => router.push('/resources')}>Search</Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <ActionCard
            icon={<BookOpen className="h-8 w-8 text-primary" />}
            title="Browse Resources"
            description="Explore study materials"
            onClick={() => router.push('/resources')}
          />
          <ActionCard
            icon={<Upload className="h-8 w-8 text-green-500" />}
            title="Upload Materials"
            description="Share your notes"
            onClick={() => router.push('/upload')}
          />
          <ActionCard
            icon={<Users className="h-8 w-8 text-purple-500" />}
            title="Find Mentors"
            description="Connect with seniors"
            onClick={() => router.push('/mentors')}
          />
          <ActionCard
            icon={<DollarSign className="h-8 w-8 text-yellow-500" />}
            title="My Earnings"
            description={`NPR ${earnings.toLocaleString()}`}
            onClick={() => router.push('/earnings')}
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FileText />} value="12" label="Uploaded Files" />
          <StatCard icon={<Download />} value="45" label="Downloads" />
          <StatCard icon={<Star />} value="4.8" label="Avg Rating" />
          <StatCard icon={<TrendingUp />} value="234" label="Contribution Points" />
        </div>

        {/* Recently Uploaded */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recently Uploaded</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recentFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>

        {/* Recommended Resources */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recommended for You</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedResources.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, description, onClick }: any) => (
  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
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

const FileCard = ({ file }: any) => (
  <Card className="p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-start gap-3 flex-1">
        <FileText className="h-10 w-10 text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 truncate">{file.name}</h3>
          <p className="text-sm text-muted-foreground">
            {file.subject} - {file.semester}
          </p>
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
    <Button size="sm" className="w-full mt-2">Download</Button>
  </Card>
);