import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { categories, semesters } from '@/app/upload/page'; // Import categories and semesters

export type ResourceStatus = 
  | 'pending_ai'      // Step 1: Waiting for AI content check
  | 'pending_plagiarism' // Step 2: Waiting for plagiarism check
  | 'pending_review'  // Step 3: Waiting for senior/mentor review
  | 'pending_admin'   // Step 4: Waiting for admin approval
  | 'approved'        // Step 5: Approved and live
  | 'rejected'        // Rejected at any stage
  | 'flagged';        // Flagged by users

export interface ReviewFeedback {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'senior' | 'mentor' | 'admin';
  rating?: number;
  comment: string;
  date: string;
}

export interface AIAnalysis {
  relevanceScore: number; // 0-100
  qualityScore: number;   // 0-100
  completenessScore: number; // 0-100
  suggestions: string[];
  passed: boolean;
  analyzedAt: string;
}

export interface PlagiarismResult {
  similarity: number; // 0-100
  sources: string[];
  passed: boolean;
  checkedAt: string;
}

export interface Resource {
  id: string; // Changed from number to string
  title: string;
  description: string;
  subject: string; // This will remain the ID
  subjectName: string; // Human-readable subject name
  semester: string;
  course: string;
  category: {
    id: 'plus-two' | 'bachelors' | 'ctevt';
    name: string;
  };
  subCategory: {
    id: string;
    name: string;
  };
  program: string; // e.g., 'Science', 'Management', 'Computer Engineering'
  type?: 'notes' | 'book' | 'assignment' | 'guide'; // New field
  fileType: string;
  fileSize: string;
  uploader: string;
  uploaderId: string;
  uploaderEmail: string;
  uploadDate: string;
  status: ResourceStatus;
  downloads: number;
  rating: number;
  reviews: ReviewFeedback[];
  aiAnalysis?: AIAnalysis;
  plagiarismResult?: PlagiarismResult;
  price?: number;
  isFree: boolean;
  file_path?: string;
}

interface ResourceContextType {
  resources: Resource[];
  fetchResources: () => Promise<void>;
  updateResourceStatus: (id: string, status: ResourceStatus) => Promise<void>;
  addReview: (resourceId: string, review: ReviewFeedback) => Promise<void>;
  setAIAnalysis: (resourceId: string, analysis: AIAnalysis) => Promise<void>;
  setPlagiarismResult: (resourceId: string, result: PlagiarismResult) => Promise<void>;
  getResourceById: (id: string) => Resource | undefined;
  getResourcesByStatus: (status: ResourceStatus) => Resource[];
  getResourcesByUploader: (uploaderId: string) => Resource[];
  loading: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false }); // Order by most recent

      if (error) {
        throw error;
      }

      // Map Supabase data to Resource interface
      const fetchedResources: Resource[] = data.map((dbResource: any) => {
        console.log('Raw dbResource:', dbResource); // Log raw data

        const category = categories.find(c => c.id === dbResource.category_id);
        const subCategory = category?.subCategories.find(sc => sc.id === dbResource.sub_category_id);
        const subject = subCategory?.subjects.find(s => s.id === dbResource.subject);

        const resource: Resource = {
          id: dbResource.id,
          title: dbResource.title,
          description: dbResource.description,
          subject: dbResource.subject, // This remains the ID
          subjectName: subject?.name || dbResource.subject, // Human-readable name
          semester: dbResource.semester,
          course: dbResource.course || '', // Assuming course can be null
          category: {
            id: dbResource.category_id,
            name: category?.name || dbResource.category_id
          },
          subCategory: {
            id: dbResource.sub_category_id,
            name: subCategory?.name || dbResource.sub_category_id
          },
          program: dbResource.program || '', // Assuming program can be null
          fileType: dbResource.file_type,
          fileSize: `${dbResource.file_size_mb} MB`, // Convert back to string for display
          file_path: dbResource.file_path, // Re-added file_path mapping
          uploader: dbResource.uploader_name || 'Unknown',
          uploaderId: dbResource.uploader_id,
          uploaderEmail: dbResource.uploader_email,
          uploadDate: dbResource.created_at, // Use created_at as uploadDate
          status: dbResource.status,
          downloads: dbResource.downloads || 0,
          rating: dbResource.rating || 0,
          reviews: dbResource.reviews || [], // Assuming reviews is stored as JSONB or handled differently
          price: dbResource.price,
          isFree: dbResource.is_free,
        };
        console.log('Mapped resource:', resource); // Log mapped data
        return resource;
      });

      setResources(fetchedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setResources, supabase]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // addResource is removed from context as it's directly handled by Supabase in upload page

  const updateResourceStatus = async (id: string, status: ResourceStatus) => {
    // This function will need to be updated to interact with Supabase
    // For now, it will update local state.
    setResources(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    );
  };

  const addReview = async (resourceId: string, review: ReviewFeedback) => {
    // This function will need to be updated to interact with Supabase
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, reviews: [...r.reviews, review] } : r)
    );
  };

  const setAIAnalysis = async (resourceId: string, analysis: AIAnalysis) => {
    // This function will need to be updated to interact with Supabase
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, aiAnalysis: analysis } : r)
    );
  };

  const setPlagiarismResult = async (resourceId: string, result: PlagiarismResult) => {
    // This function will need to be updated to interact with Supabase
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, plagiarismResult: result } : r)
    );
  };

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const getResourcesByStatus = (status: ResourceStatus) =>
    resources.filter(r => r.status === status);

  const getResourcesByUploader = (uploaderId: string) =>
    resources.filter(r => r.id === uploaderId); // Assuming uploaderId is resource.id here, need to fix later if actual uploaderId is used

  return (
    <ResourceContext.Provider value={{
      resources,
      fetchResources,
      updateResourceStatus,
      addReview,
      setAIAnalysis,
      setPlagiarismResult,
      getResourceById,
      getResourcesByStatus,
      getResourcesByUploader,
      loading
    }}>
      {children}
    </ResourceContext.Provider>
  );
};
