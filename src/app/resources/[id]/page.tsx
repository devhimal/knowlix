"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResources, Resource } from '@/context/ResourceContext';
import { Button } from "@/components/ui/button";
import { Download, Star, Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { getDownloadUrl } from "@/lib/supabase"; // Import the helper function
import { StarRating } from '@/components/StarRating'; // Import StarRating
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Label } from '@/components/ui/label'; // Import Label
import { ResourceReviewList } from '@/components/ResourceReviewList'; // Import Review List
import Link from "next/link";
import { Brain, ShieldCheck, CheckCircle, XCircle, FileText, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getResourceById, loading, fetchResources, resources, incrementDownload } =
    useResources();

  const { user, isAuthenticated, session } = useAuth(); // Destructure isAuthenticated and session
  const { hasPurchased, isSubscribed } = usePayment();

  const [resource, setResource] = useState<Resource | undefined>();
  const [userRating, setUserRating] = useState(0); // State for user's selected rating
  const [userComment, setUserComment] = useState(""); // State for user's comment
  const [refreshReviews, setRefreshReviews] = useState(0); // Trigger to refresh review list

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
            The resource may have been removed or doesn&apos;t exist.
          </p>

          <Link
            href="/"
            className="inline-flex px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const resourceId = params.id as string;




  useEffect(() => {
    fetchResources?.();
  }, [fetchResources]);

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
      res.file_name, // Use res.file_name directly
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
      toast.success(`Downloading ${res.file_name}`);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = res.file_name; // Set the download attribute
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      incrementDownload(res.id); // Increment download count
      return;
    }

    toast.info("Premium resource. Please subscribe or purchase.");
  };

  const handleRatingSubmit = async () => {
    if (!isAuthenticated || !user || !session?.access_token) {
      toast.error("You must be logged in to submit a rating.");
      return;
    }

    // Logic: Only premium users can review premium resources
    if (resource && !resource.isFree && !isSubscribed(user.id)) {
      toast.error("Upgrade to Premium to leave a review for this resource.");
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
          userName: user.user_metadata?.name || user.email,
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
      setRefreshReviews(prev => prev + 1); // Trigger review list refresh
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

  const canReview = isAuthenticated && (resource.isFree || (user && isSubscribed(user.id)));

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
                  {resource.average_rating?.toFixed(1) || "0.0"} ({resource.total_ratings || 0} ratings)
                </span>
              </div>
            </div>

            {}
            <div className="flex gap-2">
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
              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="rounded-xl px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    const reason = prompt("Please provide a reason for flagging this resource:");
                    if (reason) {
                      try {
                        const response = await fetch(`/api/resources/${resource.id}/report`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reason })
                        });
                        if (response.ok) {
                          toast.success("Resource reported.");
                        } else {
                          const data = await response.json();
                          toast.error(data.error || "Failed to report resource.");
                        }
                      } catch (err) {
                        toast.error("Failed to report resource.");
                      }
                    }
                  }}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Flag
                </Button>
              )}
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

          {/* AI & PLAGIARISM RESULTS */}
          {(resource.aiAnalysis || resource.plagiarismResult) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Analysis Card */}
              {resource.aiAnalysis && (
                <Card className="p-6 border-blue-100 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-4 text-blue-700">
                    <Brain className="h-5 w-5" />
                    <h3 className="font-bold">AI Quality Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <ScoreBar label="Relevance" score={resource.aiAnalysis.relevanceScore} color="blue" />
                    <ScoreBar label="Quality" score={resource.aiAnalysis.qualityScore} color="blue" />
                    <ScoreBar label="Completeness" score={resource.aiAnalysis.completenessScore} color="blue" />
                  </div>
                  {resource.aiAnalysis.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3" /> AI Suggestions
                      </p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {resource.aiAnalysis.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-400">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Plagiarism Card */}
              {resource.plagiarismResult && (
                <Card className="p-6 border-purple-100 bg-purple-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-purple-700">
                      <ShieldCheck className="h-5 w-5" />
                      <h3 className="font-bold">Plagiarism Check</h3>
                    </div>
                    {resource.plagiarismResult.passed ? (
                      <Badge className="bg-green-100 text-green-700 border-none">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Flagged
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-purple-700">Similarity Score</span>
                      <span className={`text-lg font-bold ${resource.plagiarismResult.similarity < 15 ? 'text-green-600' : 'text-red-600'}`}>
                        {resource.plagiarismResult.similarity}%
                      </span>
                    </div>
                    <Progress value={resource.plagiarismResult.similarity} className="h-2 bg-purple-100" />
                    <p className="text-[10px] text-purple-500 italic mt-2">
                      Checked on {new Date(resource.plagiarismResult.checkedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* BADGE */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
            
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Review Form */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
                  {isAuthenticated ? (
                    canReview ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-gray-600 mb-2 block">Your Rating</Label>
                          <StarRating initialRating={userRating} onRatingChange={setUserRating} />
                        </div>
                        <div>
                          <Label htmlFor="comment" className="text-sm text-gray-600 mb-2 block">Your Feedback</Label>
                          <Textarea
                            id="comment"
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="How was this resource?"
                            rows={4}
                            className="bg-white border-gray-200"
                          />
                        </div>
                        <Button onClick={handleRatingSubmit} className="w-full">
                          Submit Review
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4 fill-amber-800" />
                          Premium Review Only
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Upgrade to Premium to leave a review for this resource.
                        </p>
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 italic">Please log in to share your feedback.</p>
                  )}
                </div>
              </div>

              {/* Review List */}
              <div className="lg:col-span-2">
                <ResourceReviewList resourceId={resourceId} refreshTrigger={refreshReviews} />
              </div>
            </div>
          </div>
        </div>

        {/* RELATED RESOURCES */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Related Resources</h2>
            <Button variant="link" onClick={() => router.push('/resources')}>
              Browse all
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter(r => r.id !== resourceId && r.category.id === resource.category.id && r.status === 'approved')
              .slice(0, 3)
              .map((relatedResource) => (
                <Card key={relatedResource.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/resources/${relatedResource.id}`)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{relatedResource.title}</h3>
                      <p className="text-xs text-gray-500">{relatedResource.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-amber-500" />
                      {relatedResource.average_rating?.toFixed(1) || "0.0"}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {relatedResource.isFree ? 'Free' : `NPR ${relatedResource.price}`}
                    </Badge>
                  </div>
                </Card>
              ))}
          </div>
        </section>
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

function ScoreBar({ label, score, color }: { label: string; score: number, color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <Progress value={score} className={`h-1.5 bg-${color}-100`} />
    </div>
  );
}
