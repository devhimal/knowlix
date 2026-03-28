"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ResourceDetailsPage() {
  const params = useParams(); // Get all params
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined; // Safely extract id as string or undefined
  const [resource, setResource] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [processingPdf, setProcessingPdf] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      fetch(`/api/resources/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setResource(data);
          setLoading(false);

          // Automatically process PDFs if TOC is missing
          data.files.forEach((file: any) => {
            if (file.fileType === "PDF" && (!file.toc || file.toc.length === 0)) {
              handleProcessPdf(file.fileUrl, file.fileName, file._id);
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching resource:", error);
          setLoading(false);
        });

      fetch(`/api/resources/${id}/ratings`)
        .then((res) => res.json())
        .then((data) => {
          setRatings(data);
        })
        .catch((error) => {
          console.error("Error fetching ratings:", error);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleRatingSubmit = async () => {
    try {
      const res = await fetch(`/api/resources/${id}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          userId: "some-user-id", // Replace with actual user ID
        }),
      });
      const data = await res.json();
      setRatings([...ratings, data]);
      setNewRating(0);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleProcessPdf = async (fileUrl: string, fileName: string, fileId: string) => {
    setProcessingPdf((prev) => ({ ...prev, [fileId]: true }));
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName);

      const formData = new FormData();
      formData.append("resourceId", id as string);
      formData.append("file", file);
      formData.append("fileName", fileName);

      const res = await fetch("/api/resources/process-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log(data);
      // Refresh the resource to get the updated TOC
      fetch(`/api/resources/${id}`)
        .then((res) => res.json())
        .then((updatedResource) => {
          setResource(updatedResource);
        });
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setProcessingPdf((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Loading Resource Details...
            </h1>
            <p className="text-lg text-gray-700">
              Please wait while we fetch the resource information.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Resource Not Found
            </h1>
            <p className="text-lg text-gray-700">
              The resource with ID "{id}" could not be found.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {resource.title}
          </h1>
          <p className="text-lg text-gray-700 mb-4">{resource.description}</p>
          <div className="flex items-center gap-2 mb-6">
            <Rating rating={resource.quality.averageRating} readonly />
            <span className="text-gray-600">
              ({resource.quality.totalRatings} ratings)
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Files</h2>
            {resource.files.map((file: any) => (
              <div key={file.fileName} className="mb-4">
                <p className="text-lg">{file.fileName}</p>
                {file.fileType === "PDF" && (!file.toc || file.toc.length === 0) ? (
                  <Button
                    onClick={() => handleProcessPdf(file.fileUrl, file.fileName, file._id)}
                    className="mt-2"
                    disabled={processingPdf[file._id]}
                  >
                    {processingPdf[file._id] ? "Processing PDF..." : "Process PDF to get TOC"}
                  </Button>
                ) : (
                  file.toc && file.toc.length > 0 && (
                    <Collapsible className="mt-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="outline">View Table of Contents</Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="list-disc pl-6 mt-2">
                          {file.toc.map((item: any) => (
                            <li key={item.page}>
                              {item.title} (Page {item.page})
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                )}
                {file.fileType === "PDF" && file.toc && file.toc.length > 0 && (
                  <Button
                    onClick={() => handleProcessPdf(file.fileUrl, file.fileName, file._id)}
                    className="mt-2 ml-2"
                    variant="outline"
                    disabled={processingPdf[file._id]}
                  >
                    {processingPdf[file._id] ? "Reprocessing..." : "Reprocess PDF"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Rate this resource
          </h2>
          <div className="flex flex-col gap-4">
            <Rating rating={newRating} onRatingChange={setNewRating} />
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleRatingSubmit} className="self-start">
              Submit Rating
            </Button>
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What others are saying
          </h2>
          <div className="flex flex-col gap-6">
            {ratings.map((rating) => (
              <div key={rating._id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={rating.userId?.profilePicture} />
                  <AvatarFallback>
                    {rating.userId?.fullName?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{rating.userId?.fullName}</p>
                    <Rating rating={rating.rating} readonly />
                  </div>
                  <p className="text-gray-700 mt-1">{rating.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
