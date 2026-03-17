"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PaymentDialog } from '@/components/PaymentDialog';
import { usePayment } from '@/context/PaymentContext';
import { useAuth } from '@/context/AuthContext';
import { useResources, Resource } from '@/context/ResourceContext';
import { Search, Filter, Download, Star, FileText, Flag, ShoppingCart, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const { hasPurchased } = usePayment();
  const { user } = useAuth();
  const { resources } = useResources();

  // Filter to show only approved resources
  const approvedResources = resources.filter(r => r.status === 'approved');

  const filteredResources = approvedResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    const matchesSemester = selectedSemester === 'all' || resource.semester === selectedSemester;
    const matchesFileType = selectedFileType === 'all' || resource.fileType === selectedFileType;
    
    return matchesSearch && matchesSubject && matchesSemester && matchesFileType;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.downloads - a.downloads;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'recent') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    return 0;
  });

  const handleResourceAction = (resource: Resource) => {
    if (!user) {
      toast.error('Please log in to access resources.');
      return;
    }

    // If resource is free, allow direct download
    if (resource.isFree) {
      toast.success(`Downloaded ${resource.name}`);
      return;
    }

    // If user already purchased, allow download
    if (hasPurchased(resource.id)) {
      toast.success(`Downloaded ${resource.name}`);
      return;
    }

    // If it's the user's own resource
    if (user.id === resource.uploaderId) {
      toast.success(`Downloaded ${resource.name}`);
      return;
    }

    // Otherwise, show payment dialog
    setSelectedResource(resource);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resource Library</h1>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="3rd">3rd Semester</SelectItem>
                    <SelectItem value="4th">4th Semester</SelectItem>
                    <SelectItem value="5th">5th Semester</SelectItem>
                    <SelectItem value="6th">6th Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                  <SelectTrigger>
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="PPT">PPT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredResources.length} resources
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              onAction={handleResourceAction}
              isPurchased={hasPurchased(resource.id)}
              isOwnResource={user?.id === resource.uploaderId}
            />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No resources found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      {selectedResource && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          resourceId={selectedResource.id}
          resourceName={selectedResource.name}
          amount={selectedResource.price || 0}
          sellerId={selectedResource.uploaderId}
          sellerEmail={selectedResource.uploaderEmail}
        />
      )}
    </div>
  );
};

interface ResourceCardProps {
  resource: Resource;
  onAction: (resource: Resource) => void;
  isPurchased: boolean;
  isOwnResource: boolean;
}

const ResourceCard = ({ resource, onAction, isPurchased, isOwnResource }: ResourceCardProps) => {
  const getActionButton = () => {
    if (resource.isFree) {
      return (
        <Button size="sm" onClick={() => onAction(resource)}>
          <Download className="h-4 w-4 mr-2" />
          Download Free
        </Button>
      );
    }

    if (isPurchased || isOwnResource) {
      return (
        <Button size="sm" onClick={() => onAction(resource)} variant="default">
          <Check className="h-4 w-4 mr-2" />
          Download
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => onAction(resource)} variant="default">
        <ShoppingCart className="h-4 w-4 mr-2" />
        Buy NPR {resource.price}
      </Button>
    );
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-blue-100 p-3 rounded-lg relative">
            <FileText className="h-8 w-8 text-blue-600" />
            {!resource.isFree && !isPurchased && !isOwnResource && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                <Lock className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{resource.name}</h3>
              {resource.status === 'approved' && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Verified
                </Badge>
              )}
              {!resource.isFree && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  NPR {resource.price}
                </Badge>
              )}
              {resource.isFree && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Free
                </Badge>
              )}
              {isPurchased && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Purchased
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span>{resource.subject}</span>
              <span>•</span>
              <span>{resource.semester}</span>
              <span>•</span>
              <span>{resource.fileType}</span>
              <span>•</span>
              <span>By {resource.uploader}</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Download className="h-4 w-4" />
                {resource.downloads.toLocaleString()} downloads
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {resource.rating} rating
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {getActionButton()}
          <Button size="sm" variant="outline">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};