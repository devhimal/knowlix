import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  id: number;
  title: string;
  description: string;
  subject: string;
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
}

interface ResourceContextType {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'uploadDate' | 'downloads' | 'rating' | 'reviews'>) => Promise<number | null>;
  updateResourceStatus: (id: number, status: ResourceStatus) => Promise<void>;
  addReview: (resourceId: number, review: ReviewFeedback) => Promise<void>;
  setAIAnalysis: (resourceId: number, analysis: AIAnalysis) => Promise<void>;
  setPlagiarismResult: (resourceId: number, result: PlagiarismResult) => Promise<void>;
  getResourceById: (id: number) => Resource | undefined;
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

  // Load resources from Supabase
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map database fields (snake_case) to Frontend fields (camelCase)
        const mappedResources: Resource[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          subject: item.subject,
          semester: item.semester,
          course: item.course,
          category: item.category,
          subCategory: item.sub_category,
          program: item.program,
          type: item.type,
          fileType: item.file_type,
          fileSize: item.file_size,
          uploader: item.uploader,
          uploaderId: item.uploader_id,
          uploaderEmail: item.uploader_email,
          uploadDate: item.upload_date,
          status: item.status,
          downloads: item.downloads,
          rating: Number(item.rating),
          reviews: item.reviews || [],
          aiAnalysis: item.ai_analysis,
          plagiarismResult: item.plagiarism_result,
          price: item.price,
          isFree: item.is_free,
        }));
        setResources(mappedResources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resource: Omit<Resource, 'id' | 'uploadDate' | 'downloads' | 'rating' | 'reviews'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          title: resource.title,
          description: resource.description,
          subject: resource.subject,
          semester: resource.semester,
          course: resource.course,
          category: resource.category,
          sub_category: resource.subCategory,
          program: resource.program,
          type: resource.type,
          file_type: resource.fileType,
          file_size: resource.fileSize,
          uploader: resource.uploader,
          uploader_id: resource.uploaderId,
          uploader_email: resource.uploaderEmail,
          status: 'pending_ai',
          is_free: resource.isFree,
          price: resource.price,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await fetchResources(); // Refresh list
        return data.id;
      }
      return null;
    } catch (err) {
      console.error('Error adding resource:', err);
      return null;
    }
  };

  const updateResourceStatus = async (id: number, status: ResourceStatus) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setResources(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
    } catch (err) {
      console.error('Error updating resource status:', err);
    }
  };

  const addReview = async (resourceId: number, review: ReviewFeedback) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      const updatedReviews = [...resource.reviews, review];
      const { error } = await supabase
        .from('resources')
        .update({ reviews: updatedReviews })
        .eq('id', resourceId);

      if (error) throw error;
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, reviews: updatedReviews } : r)
      );
    } catch (err) {
      console.error('Error adding review:', err);
    }
  };

  const setAIAnalysis = async (resourceId: number, analysis: AIAnalysis) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ ai_analysis: analysis })
        .eq('id', resourceId);

      if (error) throw error;
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, aiAnalysis: analysis } : r)
      );
    } catch (err) {
      console.error('Error setting AI analysis:', err);
    }
  };

  const setPlagiarismResult = async (resourceId: number, result: PlagiarismResult) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ plagiarism_result: result })
        .eq('id', resourceId);

      if (error) throw error;
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, plagiarismResult: result } : r)
      );
    } catch (err) {
      console.error('Error setting plagiarism result:', err);
    }
  };

  const getResourceById = (id: number) => resources.find(r => r.id === id);

  const getResourcesByStatus = (status: ResourceStatus) =>
    resources.filter(r => r.status === status);

  const getResourcesByUploader = (uploaderId: string) =>
    resources.filter(r => r.uploaderId === uploaderId);

  return (
    <ResourceContext.Provider value={{
      resources,
      addResource,
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
