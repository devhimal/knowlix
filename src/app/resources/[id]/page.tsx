"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useResources, Resource } from '@/context/ResourceContext';
import { Button } from "@/components/ui/button";
import { Download, Star, Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { getDownloadUrl } from "@/lib/supabase"; 
import { StarRating } from '@/components/StarRating'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Label } from '@/components/ui/label'; 

export default function ResourceDetailsPage() {
  const params = useParams();

  if (!params || !params.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <Zap className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Resource Not Found
          </h1>
          <p className="text-gray-500 mt-2 mb-6">
            The resource may have been removed or doesn’t exist.
          </p>

          <a
            href="/"
            className="inline-flex px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const resourceId = params.id as string;

  const { getResourceById, loading, fetchResources, resources, incrementDownload } =
    useResources();

  const { user, isAuthenticated, session } = useAuth(); 
  const { hasPurchased, isSubscribed } = usePayment();

  const [resource, setResource] = useState<Resource | undefined>();
  const [userRating, setUserRating] = useState(0); 
  const [userComment, setUserComment] = useState(""); 

  useEffect(() => {
    fetchResources?.();
  }, []);

  useEffect(() => {
    if (resourceId && resources.length > 0) {
      const foundResource = getResourceById(resourceId);
      setResource(foundResource);
      
      
    }
  }, [resourceId, resources, getResourceById]);

  const handleDownload = async (res: Resource) => {
    
    if (!res.isFree && !user) {
      toast.error("Please log in first to download premium resources.");
      return;
    }

    if (!res.file_path) {
      toast.error("File path not available for download.");
      return;
    }

    
    const downloadUrl = await getDownloadUrl(
      res.file_path,
      res.title + "." + res.fileType.split("/").pop(),
    );

    if (!downloadUrl) {
      toast.error("Failed to prepare download. Please try again.");
      return;
    }

    if (
      res.isFree ||
      (user && isSubscribed(user.id)) ||
      hasPurchased(res.id) ||
      (user && user.id === res.uploaderId)
    ) {
      toast.success(`Downloading ${res.title}`);
      window.open(downloadUrl, "_blank");
      incrementDownload(res.id); 
      return;
    }

    toast.info("Premium resource. Please subscribe or purchase.");
  };

  const handleRatingSubmit = async () => {
    if (!isAuthenticated || !user || !session?.access_token) {
      toast.error("You must be logged in to submit a rating.");
      return;
    }
    if (userRating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, 
        },
        body: JSON.stringify({
          userId: user.id,
          rating: userRating,
          comment: userComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating.');
      }

      toast.success("Rating submitted successfully!");
      
      fetchResources();
      setUserRating(0);
      setUserComment("");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || "Failed to submit rating.");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading resource...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <Zap className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Resource Not Found
          </h1>
          <p className="text-gray-500 mt-2 mb-6">
            The resource may have been removed or doesn’t exist.
          </p>

          <a
            href="/"
            className="inline-flex px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const canAccess =
    resource.isFree ||
    (user && (user.role === 'admin' || user.role === 'super_admin')) || 
    (user && isSubscribed(user.id)) ||
    hasPurchased(resource.id) ||
    (user && user.id === resource.uploaderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-10 border border-gray-100">
          {}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {resource.title}
              </h1>

              <p className="text-gray-500 mt-2">
                Uploaded by{" "}
                <span className="font-medium">{resource.uploader}</span> •{" "}
                {new Date(resource.uploadDate).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600">
                  {resource.average_rating?.toFixed(1)} ({resource.total_ratings} ratings)
                </span>
              </div>
            </div>

            {}
            <div>
              <Button
                onClick={() => handleDownload(resource)}
                className="rounded-xl px-6"
              >
                {canAccess ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Premium Access
                  </>
                )}
              </Button>
            </div>
          </div>

          {}
          <p className="mt-6 text-gray-700 leading-relaxed">
            {resource.description}
          </p>

          {}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Meta label="Category" value={resource.category.name} />
            <Meta label="Sub Category" value={resource.subCategory.name} />
            <Meta label="Subject" value={resource.subjectName} />
            <Meta label="Semester" value={resource.semester} />
            <Meta label="File Type" value={resource.fileType} />
            <Meta label="File Size" value={resource.fileSize} />
            <Meta label="Downloads" value={resource.downloads} />
          </div>

          {}
          <div className="mt-8">
            {resource.isFree ? (
              <Badge className="bg-green-100 text-green-700">
                Free Resource
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700">
                Premium • NPR {resource.price}
              </Badge>
            )}
          </div>

          {}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate this Resource</h2>
            {isAuthenticated ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <Label htmlFor="rating">Your Rating:</Label>
                  <StarRating initialRating={userRating} onRatingChange={setUserRating} />
                </div>
                <div className="mb-4">
                  <Label htmlFor="comment">Your Comment (Optional):</Label>
                  <Textarea
                    id="comment"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Share your thoughts on this resource..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleRatingSubmit} className="w-full">Submit Rating</Button>
              </div>
            ) : (
              <p className="text-gray-600">Please log in to rate this resource.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function Meta({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
