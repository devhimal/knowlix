"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, CheckCircle, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Main categories and sub-categories data
const categories = [
  {
    id: 'plus-two',
    name: 'Plus Two',
    subCategories: [
      { id: 'plus-two-science', name: 'Science' },
      { id: 'plus-two-management', name: 'Management' },
    ],
  },
  {
    id: 'bachelors',
    name: 'Bachelors',
    subCategories: [
      { id: 'bachelors-science', name: 'Science' },
      { id: 'bachelors-management', name: 'Management' },
    ],
  },
  {
    id: 'ctevt',
    name: 'CTEVT',
    subCategories: [
      { id: 'ctevt-computer', name: 'Computer Engineering' },
      { id: 'ctevt-civil', name: 'Civil Engineering' },
    ],
  },
];

export default function UploadResource() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: '',
    subCategory: '',
    subject: '',
    semester: '',
    isFree: true,
    price: 0,
  });

  const router = useRouter();
  const { addResource } = useResources();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to upload resources');
      return;
    }
    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const resourceId = addResource({
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      semester: formData.semester,
      course: '', // This can be derived from category/subcategory if needed
      category: {
        id: formData.category as any,
        name: categories.find(c => c.id === formData.category)?.name || '',
      },
      subCategory: {
        id: formData.subCategory,
        name: categories.find(c => c.id === formData.category)?.subCategories.find(sc => sc.id === formData.subCategory)?.name || '',
      },
      program: '', // This can be derived as well
      fileType: formData.file?.name.split('.').pop()?.toUpperCase() || 'PDF',
      fileSize: formData.file ? `${(formData.file.size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
      uploader: user.name,
      uploaderId: user.id,
      uploaderEmail: user.email,
      status: 'pending_ai',
      isFree: formData.isFree,
      price: formData.isFree ? undefined : formData.price,
    });

    setUploading(false);
    setUploadSuccess(true);
    toast.success('Resource uploaded successfully! It will be reviewed and published soon.');
    addNotification({
      type: 'upload',
      title: 'Resource Uploaded',
      message: `Your resource "${formData.title}" has been uploaded and is pending review.`,
      resourceId,
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 formData={formData} handleChange={handleChange} handleNext={handleNext} />;
      case 2:
        return <Step2 formData={formData} handleChange={handleChange} handleNext={handleNext} handlePrev={handlePrev} />;
      case 3:
        return <Step3 formData={formData} handleChange={handleChange} handleNext={handleNext} handlePrev={handlePrev} />;
      case 4:
        return <Step4 formData={formData} handleSubmit={handleSubmit} handlePrev={handlePrev} uploading={uploading} />;
      default:
        return null;
    }
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-20 w-20 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Upload Successful!</h2>
          <p className="text-foreground mb-6">Your resource has been uploaded and is now being processed.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-background">      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center text-foreground mb-4">Upload Your Resource</h1>
        <p className="text-center text-foreground mb-8">Follow the steps to share your materials with the community.</p>
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex items-center ${s <= step ? 'text-secondary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-secondary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </div>
        <Card className="p-8">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleChange, handleNext }: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleChange('file', e.target.files[0]);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 1: Upload File</h2>
      <Label htmlFor="file">Select File *</Label>
      <div className="mt-2">
        <label
          htmlFor="file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-secondary transition-colors bg-primary"
        >
          {formData.file ? (
            <div className="text-center">
              <FileText className="h-12 w-12 text-secondary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">{formData.file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground"><span className="font-medium text-secondary">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX (max 10MB)</p>
            </div>
          )}
        </label>
        <input id="file" type="file" className="hidden" onChange={handleFileChange} required />
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} disabled={!formData.file}>
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const Step2 = ({ formData, handleChange, handleNext, handlePrev }: any) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Step 2: Resource Details</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Resource Title *</Label>
          <Input id="title" placeholder="e.g., Data Structures Complete Notes" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Brief description of the resource" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => handleChange('category', value)} required>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subCategory">Sub-category *</Label>
            <Select onValueChange={(value) => handleChange('subCategory', value)} required disabled={!formData.category}>
              <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
              <SelectContent>
                {categories.find(c => c.id === formData.category)?.subCategories.map(sc => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" placeholder="e.g., Computer Science" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="semester">Semester *</Label>
                <Input id="semester" placeholder="e.g., 5th" value={formData.semester} onChange={(e) => handleChange('semester', e.target.value)} required />
            </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>
        <Button onClick={handleNext} disabled={!formData.title || !formData.category || !formData.subCategory || !formData.subject || !formData.semester}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
      </div>
    </div>
  );
};

const Step3 = ({ formData, handleChange, handleNext, handlePrev }: any) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 3: Monetization</h2>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">Monetize Your Resource</h3>
          <p className="text-sm text-muted-foreground">Earn money by selling your study materials</p>
        </div>
        <Switch id="isFree" checked={!formData.isFree} onCheckedChange={(checked) => handleChange('isFree', !checked)} />
      </div>
      {!formData.isFree && (
        <div className="bg-primary p-4 rounded-lg border border-muted">
          <Label htmlFor="price" className="text-sm mb-2 block">Set Price (NPR) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">NPR</span>
            <Input id="price" type="number" placeholder="100" value={formData.price} onChange={(e) => handleChange('price', parseInt(e.target.value))} className="pl-14" min="10" step="10" required={!formData.isFree} />
          </div>
          <p className="text-xs text-foreground mt-2">Students can pay via eSewa, Khalti, or Bank Transfer</p>
        </div>
      )}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>
        <Button onClick={handleNext}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
      </div>
    </div>
  );
};

const Step4 = ({ formData, handleSubmit, handlePrev, uploading }: any) => {
    const categoryName = categories.find(c => c.id === formData.category)?.name;
    const subCategoryName = categories.find(c => c.id === formData.category)?.subCategories.find(sc => sc.id === formData.subCategory)?.name;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Step 4: Review and Submit</h2>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-foreground">File:</h3>
                    <p className="text-foreground">{formData.file?.name}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-foreground">Title:</h3>
                    <p className="text-foreground">{formData.title}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-foreground">Description:</h3>
                    <p className="text-foreground">{formData.description}</p>
                </div>
                <div className="p-4 border rounded-lg grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold text-foreground">Category:</h3>
                        <p className="text-foreground">{categoryName}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Sub-category:</h3>
                        <p className="text-foreground">{subCategoryName}</p>
                    </div>
                </div>
                <div className="p-4 border rounded-lg grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold text-foreground">Subject:</h3>
                        <p className="text-foreground">{formData.subject}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Semester:</h3>
                        <p className="text-foreground">{formData.semester}</p>
                    </div>
                </div>
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-foreground">Monetization:</h3>
                    <p className="text-foreground">{formData.isFree ? 'Free' : `Premium - NPR ${formData.price}`}</p>
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                    {uploading ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
