"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PaymentDialog } from "@/components/PaymentDialog";
import { usePayment } from "@/context/PaymentContext";
import { categories, semesters } from "@/lib/constants"; // Import categories and semesters

import { useResources, Resource } from "@/context/ResourceContext";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Filter,
  Download,
  Star,
  FileText,
  Flag,
  ShoppingCart,
  Lock,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getDownloadUrl } from "@/lib/supabase"; // Import the helper function

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  const { hasPurchased, isSubscribed } = usePayment();
  const { user } = useAuth();
  const { resources, loading, fetchResources } = useResources();
  console.log("Raw resources from context:", resources); // Debug log

  const router = useRouter();

  // Filter to show only approved resources
  const approvedResources = resources.filter((r) => r.status === "approved");
  console.log("Approved resources (after status filter):", approvedResources); // Debug log

  const filteredResources = approvedResources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || resource.category.id === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === "all" ||
        resource.subCategory.id === selectedSubCategory;
      const matchesSemester =
        selectedSemester === "all" || resource.semester === selectedSemester;
      const matchesFileType =
        selectedFileType === "all" || resource.fileType === selectedFileType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesSemester &&
        matchesFileType
      );
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.downloads - a.downloads;
      if (sortBy === "rating") return (b.average_rating || 0) - (a.average_rating || 0);
      if (sortBy === "recent")
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      return 0;
    });

  const handleResourceAction = async (resource: Resource) => {
    // Made async
    if (!user) {
      toast.error("Please log in to access resources.");
      return;
    }

    if (!resource.file_path) {
      toast.error("File path not available for download.");
      return;
    }

    // Generate signed download URL
    const downloadUrl = await getDownloadUrl(
      resource.file_path,
      resource.title + "." + resource.fileType.split("/").pop(),
    );

    if (!downloadUrl) {
      toast.error("Failed to prepare download. Please try again.");
      return;
    }

    // If resource is free, allow direct download
    if (resource.isFree) {
      toast.success(`Downloading ${resource.title}...`);
      window.open(downloadUrl, "_blank");
      return;
    }

    // If subscribed, purchased, or it's the user's own resource, allow download
    if (
      (user && isSubscribed(user.id)) ||
      hasPurchased(resource.id) ||
      user.id === resource.uploaderId
    ) {
      toast.success(`Downloading ${resource.title}...`);
      window.open(downloadUrl, "_blank");
      return;
    }

    // Otherwise, show payment dialog
    setSelectedResource(resource);
    setPaymentDialogOpen(true);
    toast.info("This is a premium resource. Please subscribe or purchase.");
  };

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    setSelectedSubCategory("all");
  }, [selectedCategory]);

  const availableSubCategories =
    selectedCategory !== "all"
      ? categories.find((c) => c.id === selectedCategory)?.subCategories || []
      : [];
  console.log("check", filteredResources);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Resource Library
        </h1>

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
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={selectedSubCategory}
                  onValueChange={setSelectedSubCategory}
                  disabled={selectedCategory === "all"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub-categories</SelectItem>
                    {availableSubCategories.map((subCat) => (
                      <SelectItem key={subCat.id} value={subCat.id}>
                        {subCat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>
                        {sem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={selectedFileType}
                  onValueChange={setSelectedFileType}
                >
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
              isSubscribed={user ? isSubscribed(user.id) : false}
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
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        mode="subscription"
      />
    </div>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onAction: (resource: Resource) => void;
  isPurchased: boolean;
  isOwnResource: boolean;
  isSubscribed: boolean;
}

const ResourceCard = ({
  resource,
  onAction,
  isPurchased,
  isOwnResource,
  isSubscribed,
}: ResourceCardProps) => {
  const router = useRouter();
  const handleViewDetails = () => {
    router.push(`/resources/${resource.id}`);
  };

  const getActionButton = () => {
    if (resource.isFree) {
      return (
        <Button size="sm" onClick={() => onAction(resource)}>
          <Download className="h-4 w-4 mr-2" />
          Download Free
        </Button>
      );
    }

    if (isSubscribed || isPurchased || isOwnResource) {
      return (
        <Button size="sm" onClick={() => onAction(resource)} variant="default">
          <Check className="h-4 w-4 mr-2" />
          Download
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => onAction(resource)} variant="default">
        <Zap className="h-4 w-4 mr-2" />
        Get Premium
      </Button>
    );
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-blue-100 p-3 rounded-lg relative">
            <FileText className="h-8 w-8 text-blue-600" />
            {!resource.isFree &&
              !isSubscribed &&
              !isPurchased &&
              !isOwnResource && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">
                {resource.title}
              </h3>
              {resource.status === "approved" && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Verified
                </Badge>
              )}
              {!resource.isFree &&
                !isSubscribed &&
                !isPurchased &&
                !isOwnResource && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700"
                  >
                    Premium
                  </Badge>
                )}
              {resource.isFree && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  Free
                </Badge>
              )}
              {(isSubscribed || isPurchased) && !resource.isFree && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {isSubscribed ? "Premium Access" : "Purchased"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {resource.description}
            </p>

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
                {resource.average_rating ? resource.average_rating.toFixed(1) : "0.0"} rating
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {getActionButton()}
          <Button size="sm" variant="outline" onClick={handleViewDetails}>
            View Details
          </Button>
          <Button size="sm" variant="outline">
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
