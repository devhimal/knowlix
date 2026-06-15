import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
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
  reviewerRole: "senior" | "mentor" | "admin";
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
  uploaderEmail: string;
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

interface ResourceContextType {
  resources: Resource[];
  fetchResources: () => Promise<void>;
  updateResourceStatus: (id: string, status: ResourceStatus) => Promise<void>;
  addReview: (resourceId: string, review: ReviewFeedback) => Promise<void>;
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

  fetchAllResources: () => Promise<void>; 
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")

        .order("created_at", { ascending: false }); 

      if (error) {
        throw error;
      }

      
      const fetchedResources: Resource[] = data.map((dbResource: any) => {
        console.log("Raw dbResource (from fetchResources):", dbResource); 

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
          reviews: dbResource.reviews || undefined, 
        };
        console.log("Mapped resource (from fetchResources):", resource); 
        return resource;
      });

      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setResources, supabase]);

  useEffect(() => {
    fetchResources();
  }, []); 

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

      const fetchedResources: Resource[] = data.map((dbResource: any) => {
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
          reviews: dbResource.reviews || undefined, 
        };
        return resource;
      });

      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching all resources:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);

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

      
      fetchResources();
    } catch (error: any) {
      console.error("Error updating resource status:", error);
    }
  };

  const addReview = async (resourceId: string, review: ReviewFeedback) => {
    try {
      
      const { data: existingResource, error: fetchError } = await supabase
        .from("resources")
        .select("reviews")
        .eq("id", resourceId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const currentReviews: ReviewFeedback[] = existingResource?.reviews || [];
      const updatedReviews = [...currentReviews, review];

      
      const { error: updateError } = await supabase
        .from("resources")
        .update({ reviews: updatedReviews as any }) 
        .eq("id", resourceId);

      if (updateError) {
        throw updateError;
      }

      
      fetchResources();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const setAIAnalysis = async (resourceId: string, analysis: AIAnalysis) => {
    try {
      
      const { error } = await supabase
        .from("resources")
        .update({ ai_analysis: analysis as any })
        .eq("id", resourceId);

      if (error) {
        throw error;
      }

      
      fetchResources();
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
        .update({ plagiarism_result: result as any })
        .eq("id", resourceId);

      if (error) {
        throw error;
      }

      
      fetchResources();
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

