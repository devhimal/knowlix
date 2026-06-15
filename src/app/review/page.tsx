"use client";
import { useState, useEffect } from 'react';


import { useResources, Resource, ResourceStatus } from '@/context/ResourceContext';
import { useNotifications } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Brain, 
  ShieldCheck, 
  Users, 
  UserCog,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewQueue() {
  
  const { resources, updateResourceStatus, addReview, setAIAnalysis, setPlagiarismResult } = useResources();
  const { addNotification } = useNotifications();
  
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [rating, setRating] = useState(5);

  
  const user = { id: 'mock-user-id', name: 'Mock Admin', role: 'admin' }; 
  const isAuthenticated = true; 

  useEffect(() => {
    
    
    
    
    console.log("Review Queue loaded - (Authentication check removed)");
  }, []); 

  
  const getResourcesForReview = () => {
    
    if (user?.role === 'admin') {
      return resources.filter(r => r.status === 'pending_admin');
    } else if (user?.role === 'mentor' || user?.role === 'senior') {
      return resources.filter(r => r.status === 'pending_review');
    }
    return [];
  };

  const pendingResources = getResourcesForReview();
  const aiPendingResources = resources.filter(r => r.status === 'pending_ai');
  const plagiarismPendingResources = resources.filter(r => r.status === 'pending_plagiarism');

  const handleAIAnalysis = async (resource: Resource) => {
    toast.info('Simulating AI content analysis...');
    
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analysisResult = {
      relevanceScore: Math.floor(Math.random() * 20) + 80,
      qualityScore: Math.floor(Math.random() * 20) + 80,
      completenessScore: Math.floor(Math.random() * 20) + 80,
      suggestions: [
        'Consider adding more examples for clarity',
        'Include visual diagrams where applicable',
      ],
      passed: true,
      analyzedAt: new Date().toISOString(),
    };

    setAIAnalysis(resource.id, analysisResult);
    
    if (analysisResult.passed) {
      updateResourceStatus(resource.id, 'pending_plagiarism');
      toast.success('Simulated AI analysis passed! Moving to plagiarism check.');
    } else {
      updateResourceStatus(resource.id, 'rejected');
      toast.error('Simulated AI analysis failed. Resource rejected.');
    }
  };

  const handlePlagiarismCheck = async (resource: Resource) => {
    toast.info('Simulating plagiarism detection...');
    
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plagiarismResult = {
      similarity: Math.floor(Math.random() * 15),
      sources: Math.random() > 0.7 ? ['https://example.com/reference'] : [],
      passed: true,
      checkedAt: new Date().toISOString(),
    };

    setPlagiarismResult(resource.id, plagiarismResult);
    
    if (plagiarismResult.passed) {
      updateResourceStatus(resource.id, 'pending_review');
      toast.success('Simulated Plagiarism check passed! Moving to peer review.');
    } else {
      updateResourceStatus(resource.id, 'rejected');
      toast.error('Simulated Plagiarism detected. Resource rejected.');
    }
  };

  const handleApprove = async (resource: Resource) => {
    if (!reviewComment.trim()) {
      toast.error('Please provide review feedback');
      return;
    }

    const review = {
      reviewerId: user?.id || 'mock-reviewer-id',
      reviewerName: user?.name || 'Mock Reviewer',
      reviewerRole: user?.role as 'senior' | 'mentor' | 'admin',
      rating,
      comment: reviewComment,
      date: new Date().toISOString(),
    };

    addReview(resource.id, review);

    if (user?.role === 'admin') {
      updateResourceStatus(resource.id, 'approved');
      toast.success('Simulated Resource approved and published!');
      
      addNotification({
        type: 'approval',
        title: 'Resource Approved',
        message: `Your resource "${resource.title}" has been approved and is now live!`,
        resourceId: resource.id,
      });
    } else {
      updateResourceStatus(resource.id, 'pending_admin');
      toast.success('Simulated Review submitted. Sent to admin for final approval.');
    }

    setSelectedResource(null);
    setReviewComment('');
    setRating(5);
  };

  const handleReject = async (resource: Resource) => {
    if (!reviewComment.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    const review = {
      reviewerId: user?.id || 'mock-reviewer-id',
      reviewerName: user?.name || 'Mock Reviewer',
      reviewerRole: user?.role as 'senior' | 'mentor' | 'admin',
      comment: reviewComment,
      date: new Date().toISOString(),
    };

    addReview(resource.id, review);
    updateResourceStatus(resource.id, 'rejected');
    
    toast.success('Simulated Resource rejected with feedback.');
    
    addNotification({
      type: 'feedback',
      title: 'Resource Rejected',
      message: `Your resource "${resource.title}" was rejected. Please review the feedback.`,
      resourceId: resource.id,
    });

    setSelectedResource(null);
    setReviewComment('');
  };

  const getWorkflowStage = (status: ResourceStatus): number => {
    const stages = {
      'pending_ai': 1,
      'pending_plagiarism': 2,
      'pending_review': 3,
      'pending_admin': 4,
      'approved': 5,
      'rejected': 0,
      'flagged': 0,
    };
    return stages[status] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Queue</h1>
        <p className="text-gray-600 mb-8">Review and approve academic resources</p>

        {}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Brain />} 
            value={aiPendingResources.length} 
            label="Pending AI Check" 
            color="blue" 
          />
          <StatCard 
            icon={<ShieldCheck />} 
            value={plagiarismPendingResources.length} 
            label="Pending Plagiarism" 
            color="purple" 
          />
          <StatCard 
            icon={<Users />} 
            value={resources.filter(r => r.status === 'pending_review').length} 
            label="Pending Review" 
            color="orange" 
          />
          <StatCard 
            icon={<CheckCircle />} 
            value={resources.filter(r => r.status === 'approved').length} 
            label="Approved" 
            color="green" 
          />
        </div>

        {}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingResources.length})</TabsTrigger>
            {user?.role === 'admin' && (
              <>
                <TabsTrigger value="ai">AI Analysis ({aiPendingResources.length})</TabsTrigger>
                <TabsTrigger value="plagiarism">Plagiarism Check ({plagiarismPendingResources.length})</TabsTrigger>
              </>
            )}
            <TabsTrigger value="all">All Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {pendingResources.length > 0 ? (
                pendingResources.map((resource) => (
                  <ResourceReviewCard
                    key={resource.id}
                    resource={resource}
                    onSelect={setSelectedResource}
                    selected={selectedResource?.id === resource.id}
                  />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No resources pending review</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {user?.role === 'admin' && (
            <>
              <TabsContent value="ai">
                <div className="grid gap-4">
                  {aiPendingResources.map((resource) => (
                    <AIAnalysisCard
                      key={resource.id}
                      resource={resource}
                      onAnalyze={handleAIAnalysis}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="plagiarism">
                <div className="grid gap-4">
                  {plagiarismPendingResources.map((resource) => (
                    <PlagiarismCheckCard
                      key={resource.id}
                      resource={resource}
                      onCheck={handlePlagiarismCheck}
                    />
                  ))}
                </div>
              </TabsContent>
            </>
          )}

          <TabsContent value="all">
            <div className="grid gap-4">
              {resources.map((resource) => (
                <ResourceStatusCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {}
        {selectedResource && (
          <Card className="mt-8 p-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review: {selectedResource.title}</h3>
            
            {}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Workflow Progress</span>
                <span className="text-sm text-gray-500">
                  Stage {getWorkflowStage(selectedResource.status)}/5
                </span>
              </div>
              <Progress value={getWorkflowStage(selectedResource.status) * 20} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>AI Check</span>
                <span>Plagiarism</span>
                <span>Peer Review</span>
                <span>Admin</span>
                <span>Live</span>
              </div>
            </div>

            {}
            {selectedResource.aiAnalysis && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Analysis Results
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <ScoreCard 
                    label="Relevance" 
                    score={selectedResource.aiAnalysis.relevanceScore} 
                  />
                  <ScoreCard 
                    label="Quality" 
                    score={selectedResource.aiAnalysis.qualityScore} 
                  />
                  <ScoreCard 
                    label="Completeness" 
                    score={selectedResource.aiAnalysis.completenessScore} 
                  />
                </div>
                {selectedResource.aiAnalysis.suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Suggestions:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedResource.aiAnalysis.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {}
            {selectedResource.plagiarismResult && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Plagiarism Check Results
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Similarity Score</span>
                      <span className={`text-lg font-bold ${
                        selectedResource.plagiarismResult.similarity < 10 ? 'text-green-600' : 
                        selectedResource.plagiarismResult.similarity < 20 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {selectedResource.plagiarismResult.similarity}%
                      </span>
                    </div>
                    <Progress 
                      value={selectedResource.plagiarismResult.similarity} 
                      className="h-2" 
                    />
                  </div>
                  {selectedResource.plagiarismResult.passed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {}
            {selectedResource.reviews && selectedResource.reviews.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Previous Reviews</h4>
                <div className="space-y-3">
                  {selectedResource.reviews.map((review, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{review.reviewerName}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {review.reviewerRole}
                          </Badge>
                        </div>
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{review.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={rating === r ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRating(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comment *
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Provide detailed feedback on the resource quality, relevance, and completeness..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => handleApprove(selectedResource)} 
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  onClick={() => handleReject(selectedResource)} 
                  variant="destructive" 
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setSelectedResource(null)} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, color }: any) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-2">
      <div className={`text-${color}-600`}>{icon}</div>
      <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </Card>
);

const ResourceReviewCard = ({ 
  resource, 
  onSelect, 
  selected 
}: { 
  resource: Resource; 
  onSelect: (resource: Resource) => void;
  selected: boolean;
}) => (
  <Card 
    className={`p-6 cursor-pointer transition-all ${selected ? 'border-2 border-blue-500' : 'hover:shadow-lg'}`}
    onClick={() => onSelect(resource)}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="bg-blue-100 p-3 rounded-lg">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{resource.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{resource.subject}</span>
            <span>•</span>
            <span>{resource.semester}</span>
            <span>•</span>
            <span>By {resource.uploader}</span>
            <span>•</span>
            <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Badge variant="outline">{resource.status.replace('_', ' ')}</Badge>
    </div>
  </Card>
);

const AIAnalysisCard = ({ resource, onAnalyze }: { resource: Resource; onAnalyze: (r: Resource) => void }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Brain className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
          <p className="text-sm text-gray-600">{resource.subject} • {resource.semester}</p>
        </div>
      </div>
      <Button onClick={() => onAnalyze(resource)}>
        Run AI Analysis
      </Button>
    </div>
  </Card>
);

const PlagiarismCheckCard = ({ resource, onCheck }: { resource: Resource; onCheck: (r: Resource) => void }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="bg-purple-100 p-3 rounded-lg">
          <ShieldCheck className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
          <p className="text-sm text-gray-600">{resource.subject} • {resource.semester}</p>
        </div>
      </div>
      <Button onClick={() => onCheck(resource)}>
        Check Plagiarism
      </Button>
    </div>
  </Card>
);

const ResourceStatusCard = ({ resource }: { resource: Resource }) => {
  const getStatusColor = (status: ResourceStatus) => {
    const colors = {
      'pending_ai': 'blue',
      'pending_plagiarism': 'purple',
      'pending_review': 'orange',
      'pending_admin': 'yellow',
      'approved': 'green',
      'rejected': 'red',
      'flagged': 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-gray-100 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{resource.title}</h3>
            <p className="text-sm text-gray-600">
              {resource.subject} • {resource.semester} • By {resource.uploader}
            </p>
          </div>
        </div>
        <Badge 
          variant={resource.status === 'approved' ? 'secondary' : 'outline'}
          className={resource.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
        >
          {resource.status.replace('_', ' ')}
        </Badge>
      </div>
    </Card>
  );
};

const ScoreCard = ({ label, score }: { label: string; score: number }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-lg font-bold ${
        score >= 90 ? 'text-green-600' : 
        score >= 70 ? 'text-yellow-600' : 
        'text-red-600'
      }`}>
        {score}%
      </span>
    </div>
    <Progress value={score} className="h-2" />
  </div>
);