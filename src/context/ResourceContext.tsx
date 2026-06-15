"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import supabase from "@/lib/supabase";
import { categories, semesters } from "@/lib/constants"; 
import { useNotifications } from '@/context/NotificationContext'; 

export type ResourceStatus =
  | "pending_ai" 
  | "pending_plagiarism" 
  | "pending_review" 
  | "pending_admin" 
  | "approved" 
  | "rejected" 
  | "flagged"; 

export interface ReviewFeedback {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: "admin" | "super_admin";
  rating?: number;
  comment: string;
  date: string;
}

export interface AIAnalysis {
  relevanceScore: number; 
  qualityScore: number; 
  completenessScore: number; 
  suggestions: string[];
  passed: boolean;
  analyzedAt: string;
}

export interface PlagiarismResult {
  similarity: number; 
  sources: string[];
  passed: boolean;
  checkedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectName: string;
  semester: string;
  course: string;
  category: {
    id: "plus-two" | "bachelors" | "ctevt";
    name: string;
  };
  subCategory: {
    id: string;
    name: string;
  };
  program: string;
  type?: "notes" | "book" | "assignment" | "guide";
  fileType: string;
  fileSize: string;
  uploader: string;
  uploaderId: string;
  uploaderEmail?: string;
  uploadDate: string;
  status: ResourceStatus;
  downloads: number;
  average_rating?: number; 
  total_ratings?: number; 
  aiAnalysis?: AIAnalysis;
  plagiarismResult?: PlagiarismResult;
  price?: number;
  isFree: boolean;
  file_path?: string;
  reviews?: ReviewFeedback[]; 
}

export interface DBResource {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  category_id: "plus-two" | "bachelors" | "ctevt";
  sub_category_id: string;
  subject: string;
  semester: string;
  course?: string;
  program?: string;
  is_free: boolean;
  price?: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size_mb: number;
  uploader_id: string;
  uploader_name?: string;
  uploader_email?: string;
  status: ResourceStatus;
  downloads_count: number;
  average_rating: number;
  total_ratings: number;
  ai_analysis?: AIAnalysis;
  plagiarism_result?: PlagiarismResult;
  reviews?: ReviewFeedback[];
}

interface ResourceContextType {
  resources: Resource[];
  fetchResources: () => Promise<void>;
  updateResourceStatus: (id: string, status: ResourceStatus) => Promise<void>;
  addReview: (
    resourceId: string,
    review: ReviewFeedback,
    status?: ResourceStatus,
  ) => Promise<void>;
  setAIAnalysis: (resourceId: string, analysis: AIAnalysis) => Promise<void>;
  setPlagiarismResult: (
    resourceId: string,
    result: PlagiarismResult,
  ) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  getResourcesByStatus: (status: ResourceStatus) => Resource[];
  getResourcesByUploader: (uploaderId: string) => Resource[];
  incrementDownload: (resourceId: string) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  fetchAllResources: () => Promise<void>; // New function for admin to fetch all resources
  loading: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined,
);

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error("useResources must be used within a ResourceProvider");
  }
  return context;
};

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications(); 

  const fetchResources = useCallback(async () => {
    if (loading && resources.length > 0) return; // Prevent double fetch if already loading
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false }); // Order by most recent

      if (error) {
        throw error;
      }

      // Map Supabase data to Resource interface
      const fetchedResources: Resource[] = (data as DBResource[]).map(
        (dbResource) => {
          const category = categories.find(
            (c) => c.id === dbResource.category_id,
          );
          const subCategory = category?.subCategories.find(
            (sc) => sc.id === dbResource.sub_category_id,
          );
          const subject = subCategory?.subjects.find(
            (s) => s.id === dbResource.subject,
          );

          const resource: Resource = {
            id: dbResource.id,
            title: dbResource.title,
            description: dbResource.description,
            subject: dbResource.subject, // This remains the ID
            subjectName: subject?.name || dbResource.subject, // Human-readable name
            semester: dbResource.semester,
            course: dbResource.course || "", // Assuming course can be null
            category: {
              id: dbResource.category_id,
              name: category?.name || dbResource.category_id,
            },
            subCategory: {
              id: dbResource.sub_category_id,
              name: subCategory?.name || dbResource.sub_category_id,
            },
            program: dbResource.program || "", // Assuming program can be null
            fileType: dbResource.file_type,
            fileSize: `${dbResource.file_size_mb} MB`, // Convert back to string for display
            file_path: dbResource.file_path, // Re-added file_path mapping
            uploader: dbResource.uploader_name || "Unknown",
            uploaderId: dbResource.uploader_id,
            uploaderEmail: dbResource.uploader_email,
            uploadDate: dbResource.created_at, // Use created_at as uploadDate
            status: dbResource.status,
            downloads: dbResource.downloads_count || 0,
            average_rating: dbResource.average_rating || 0.0,
            total_ratings: dbResource.total_ratings || 0,
            aiAnalysis: dbResource.ai_analysis || undefined,
            plagiarismResult: dbResource.plagiarism_result || undefined,
            price: dbResource.price,
            isFree: dbResource.is_free,
            reviews: dbResource.reviews || undefined, // Map reviews
          };
          return resource;
        },
      );

      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [setResources]);

  const fetchAllResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const fetchedResources: Resource[] = (data as DBResource[]).map(
        (dbResource) => {
          const category = categories.find(
            (c) => c.id === dbResource.category_id,
          );
          const subCategory = category?.subCategories.find(
            (sc) => sc.id === dbResource.sub_category_id,
          );
          const subject = subCategory?.subjects.find(
            (s) => s.id === dbResource.subject,
          );

          const resource: Resource = {
            id: dbResource.id,
            title: dbResource.title,
            description: dbResource.description,
            subject: dbResource.subject,
            subjectName: subject?.name || dbResource.subject,
            semester: dbResource.semester,
            course: dbResource.course || "",
            category: {
              id: dbResource.category_id,
              name: category?.name || dbResource.category_id,
            },
            subCategory: {
              id: dbResource.sub_category_id,
              name: subCategory?.name || dbResource.sub_category_id,
            },
            program: dbResource.program || "",
            fileType: dbResource.file_type,
            fileSize: `${dbResource.file_size_mb} MB`,
            file_path: dbResource.file_path,
            uploader: dbResource.uploader_name || "Unknown",
            uploaderId: dbResource.uploader_id,
            uploaderEmail: dbResource.uploader_email,
            uploadDate: dbResource.created_at,
            status: dbResource.status,
            downloads: dbResource.downloads_count || 0,
            average_rating: dbResource.average_rating || 0.0,
            total_ratings: dbResource.total_ratings || 0,
            aiAnalysis: dbResource.ai_analysis || undefined,
            plagiarismResult: dbResource.plagiarism_result || undefined,
            price: dbResource.price,
            isFree: dbResource.is_free,
            reviews: dbResource.reviews || undefined, // Map reviews
          };
          return resource;
        },
      );

      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching all resources:", error);
    } finally {
      setLoading(false);
    }
  }, [setResources]);

  

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
      fetchResources(); 
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw error;
      }
      fetchResources(); 
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const updateResourceStatus = async (id: string, status: ResourceStatus) => {
    try {
      
      const { data: resourceToUpdate, error: fetchError } = await supabase
        .from('resources')
        .select('title, uploader_id')
        .eq('id', id)
        .single();

      if (fetchError || !resourceToUpdate) {
        throw new Error(fetchError?.message || 'Resource not found for status update');
      }

      
      const { error } = await supabase
        .from("resources")
        .update({ status: status })
        .eq("id", id);

      if (error) {
        throw error;
      }

      
      if (status === 'approved') {
        addNotification({
          type: 'approval',
          title: 'Resource Approved!',
          message: `Your resource "${resourceToUpdate.title}" has been approved and is now live.`,
          resourceId: id,
          link: `/resources/${id}`,
        });
        
      }

      // Re-fetch resources to update the UI with the latest status
      await fetchAllResources();
    } catch (error) {
      console.error("Error updating resource status:", error);
    }
  };

  const addReview = async (
    resourceId: string,
    review: ReviewFeedback,
    status?: ResourceStatus,
  ) => {
    try {
      // 1. Fetch the existing resource first to determine target and update history
      const { data: existingResource, error: fetchError } = await supabase
        .from("resources")
        .select("reviews, status")
        .eq("id", resourceId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching resource for review:", fetchError.message);
        throw fetchError;
      }

      // 2. If there's a rating, insert/upsert it to the resource_ratings table
      const isUuid = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        );

      if (review.rating && isUuid(review.reviewerId)) {
        // If existingResource exists, it's a resource; otherwise we assume it's a book (generic rating target)
        const targetField = existingResource ? 'resource_id' : 'book_id';
        
        const { error: ratingError } = await supabase
          .from("resource_ratings")
          .upsert(
            {
              [targetField]: resourceId,
              user_id: review.reviewerId,
              rating: review.rating,
              comment: review.comment,
            },
            { onConflict: targetField + ",user_id" },
          );

        if (ratingError) {
          console.error("Error upserting rating:", ratingError.message);
          throw ratingError;
        }
      }

      // 3. Update the reviews JSON history and status if it's a Resource
      if (existingResource) {
        const currentReviews: ReviewFeedback[] = existingResource?.reviews || [];
        const updatedReviews = [...currentReviews, review];

        const updateData: Partial<DBResource> = {
          reviews: updatedReviews,
        };

        if (status) {
          updateData.status = status;
        }

        const { error: updateError } = await supabase
          .from("resources")
          .update(updateData)
          .eq("id", resourceId);

        if (updateError) {
          console.error("Error updating resource with review:", updateError.message);
          throw updateError;
        }
      }

      // Re-fetch resources to update the UI
      // Use fetchAllResources if we are in an admin-like context, or just refresh everything
      await fetchAllResources();
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      } else {
        errorMessage = String(error);
      }
      console.error("Error adding review:", errorMessage);
    }
  };

  const setAIAnalysis = async (resourceId: string, analysis: AIAnalysis) => {
    try {
      
      const { error } = await supabase
        .from("resources")
        .update({ ai_analysis: analysis })
        .eq("id", resourceId);

      if (error) {
        throw error;
      }

      // Re-fetch resources to update the UI
      await fetchAllResources();
    } catch (error) {
      console.error("Error setting AI analysis:", error);
    }
  };

  const setPlagiarismResult = async (
    resourceId: string,
    result: PlagiarismResult,
  ) => {
    try {
      
      const { error } = await supabase
        .from("resources")
        .update({ plagiarism_result: result })
        .eq("id", resourceId);

      if (error) {
        throw error;
      }

      // Re-fetch resources to update the UI
      await fetchAllResources();
    } catch (error) {
      console.error("Error setting plagiarism result:", error);
    }
  };

  const getResourceById = (id: string) => resources.find((r) => r.id === id);

  const getResourcesByStatus = (status: ResourceStatus) =>
    resources.filter((r) => r.status === status);

  const getResourcesByUploader = (uploaderId: string) =>
    resources.filter((r) => r.id === uploaderId);

  const incrementDownload = async (resourceId: string) => {
    try {
      
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId ? { ...r, downloads: r.downloads + 1 } : r,
        ),
      );

      
      const { error } = await supabase.rpc("increment_resource_downloads", {
        resource_id: resourceId,
      });

      if (error) {
        console.error("Error incrementing download count:", error);
        
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId ? { ...r, downloads: r.downloads - 1 } : r,
          ),
        );
      } else {
        
        fetchResources();
      }
    } catch (error) {
      console.error("Error in incrementDownload:", error);
    }
  };

  // Fetch resources on component mount
  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <ResourceContext.Provider
      value={{
        resources,
        fetchResources,
        updateResourceStatus,
        addReview,
        setAIAnalysis,
        setPlagiarismResult,
        getResourceById,
        getResourcesByStatus,
        getResourcesByUploader,
        incrementDownload,
        updateResource,
        deleteResource,
        fetchAllResources,
        loading,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};
