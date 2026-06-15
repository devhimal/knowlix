"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResources, Resource } from "@/context/ResourceContext";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Upload,
  Search,
  Shield,
  MessageCircle,
  TrendingUp,
  Star,
  FileText,
  CheckCircle,
  Award,
  GraduationCap,
  Building2,
  Wrench,
  Download,
  Check, // Add Check icon
  Zap,   // Add Zap icon
  Lock,  // Add Lock icon
  ShoppingCart, // Add ShoppingCart icon
} from "lucide-react";
import { useState } from "react";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { categories, semesters } from "@/lib/constants";
import { toast } from "sonner";
import { getDownloadUrl } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress"; // Importing Progress for loading indicator


export default function HomePage() {
  const router = useRouter();
  const { resources, loading } = useResources(); // Get loading state from useResources()
  const { user } = useAuth(); // Get user from AuthContext
  const { hasPurchased, isSubscribed } = usePayment(); // Get payment context
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const getFilteredResources = () => {
    let filtered = resources.filter((r) => r.status === "approved");

    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.category.id === selectedCategory);
    }
    if (selectedSubCategory !== "all") {
      filtered = filtered.filter(
        (r) => r.subCategory.id === selectedSubCategory,
      );
    }
    if (selectedSemester !== "all") {
      filtered = filtered.filter((r) => r.semester === selectedSemester);
    }

    return filtered;
  };

  const filteredResources = getFilteredResources();

  const popularResources = resources
    .filter((r) => r.status === "approved")
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0)) // Ensure downloads are numbers for sorting
    .slice(0, 5);

  const announcements = [
    {
      id: 1,
      type: "mentor",
      author: "Dr. Robert Mentor",
      message:
        "New study materials for CTEVT Computer Engineering Semester II uploaded!",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "system",
      author: "System",
      message: "Platform now supports all Plus Two and CTEVT programs",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "mentor",
      author: "Prof. Alice Senior",
      message: "Tips for Bachelor's Science students: Focus on fundamentals!",
      time: "1 day ago",
    },
  ];

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentSubCategory = currentCategory?.subCategories.find(
    (sc) => sc.id === selectedSubCategory,
  );

  const iconMap: Record<string, React.ElementType> = {
    "plus-two": GraduationCap,
    bachelors: BookOpen,
    ctevt: Wrench,
  };

  const colorMap: Record<string, string> = {
    "plus-two": "bg-primary",
    bachelors: "bg-secondary",
    ctevt: "bg-accent",
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 bg-white">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary/5 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-6 animate-fade-in">
                <Star className="h-4 w-4 fill-primary" />
                <span>Nepal's #1 Academic Resource Hub</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
                Master Your Studies with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  Padyantra
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Unlock unlimited access to verified notes, solved papers, and
                expert guides for{" "}
                <span className="font-semibold text-gray-900">
                  Plus Two, Bachelors, and CTEVT
                </span>{" "}
                programs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  onClick={() => router.push("/login")}
                  size="lg"
                  className="h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Start Learning Free
                </Button>
                <Link
                  href={"#explore-resources"}
                  className="h-14 px-10 text-lg border-2 hover:bg-gray-50 transition-all"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Explore Resources
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                    5K+
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Trusted by 5,000+ Students
                  </p>
                </div>
              </div>
            </div>

            {/* Right Illustration/Image */}
            <div className="flex-1 relative w-full max-w-2xl mx-auto">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
                  alt="Students studying"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary hover:bg-primary border-none">
                      New
                    </Badge>
                    <span className="text-sm font-medium">
                      Subscription Model Active
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    Access 10,000+ Premium PDF Notes
                  </p>
                </div>
              </div>

              {/* Floating Cards */}
              <div
                className="absolute -top-6 -right-6 z-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Verified Content
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      100% Accuracy
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      Weekly Growth
                    </div>
                    <div className="text-2xl font-black text-primary">+24%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="https://kingscollege.edu.np"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="bg-secondary text-secondary-foreground rounded-2xl shadow-xl mb-12 overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Container */}
            <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center gap-8">
              {/* Logo Section */}
              <div className="flex-shrink-0 bg-primary/10 backdrop-blur-sm p-4 rounded-xl border border-primary/20">
                <img
                  src="https://kingscollege.edu.np/logo/kings-new-logo-main.png"
                  alt="King's College Nepal Logo"
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold">
                  King's College Nepal
                </h2>

                <p className="mt-3 text-primary leading-relaxed max-w-2xl">
                  King’s College is one of Nepal’s leading institutions focused
                  on entrepreneurship, innovation, and leadership development.
                  The college empowers students with practical knowledge, modern
                  business skills, and a transformative mindset to solve
                  real-world challenges.
                </p>

                {/* Info Row */}
                <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-primary">
                  <span>📍 Babar Mahal, Kathmandu</span>
                  <span>📞 +977 1 5325909</span>
                  <span>✉️ info@kingscollege.edu.np</span>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <span className="inline-block bg-secondary-foreground text-secondary font-semibold px-6 py-2 rounded-lg hover:bg-primary transition">
                    Visit Official Website →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a>
        <div className="mb-8">
          <div className="bg-background rounded-xl shadow-md p-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => {
                const Icon = iconMap[category.id];
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubCategory("all"); // Reset subcategory when main category changes
                      setSelectedSemester("all"); // Reset semester when main category changes
                    }}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                      ${
                        isActive
                          ? `${colorMap[category.id]} text-primary-foreground shadow-lg transform scale-105`
                          : "bg-primary text-foreground hover:bg-muted hover:text-secondary"
                      }
                    `}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {currentCategory && (
            <div className="bg-background rounded-xl shadow-md p-2 mt-2 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {currentCategory.subCategories.map((subCategory) => {
                  const isActive = selectedSubCategory === subCategory.id;

                  return (
                    <button
                      key={subCategory.id}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                      className={`
                        px-4 py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap
                        ${
                          isActive
                            ? `bg-primary text-primary-foreground`
                            : "bg-transparent text-foreground hover:bg-primary"
                        }
                      `}
                    >
                      <span>{subCategory.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Semester Tabs */}
          <div
            className="bg-background rounded-xl shadow-md p-2 mt-2 overflow-x-auto"
            id="explore-resources"
          >
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`
                  px-4 py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap
                  ${
                    selectedSemester === "all"
                      ? `bg-primary text-primary-foreground`
                      : "bg-transparent text-foreground hover:bg-primary"
                  }
                `}
              >
                <span>All Semesters</span>
              </button>
              {semesters.map((semester) => {
                const isActive = selectedSemester === semester.id;
                return (
                  <button
                    key={semester.id}
                    onClick={() => setSelectedSemester(semester.id)}
                    className={`
                      px-4 py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap
                      ${
                        isActive
                          ? `bg-primary text-primary-foreground`
                          : "bg-transparent text-foreground hover:bg-primary"
                      }
                    `}
                  >
                    <span>{semester.name}</span>
                  </button>
                );
              })}
            </div>
          </div>{" "}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {selectedCategory !== "all" &&
                  iconMap[selectedCategory] &&
                  (() => {
                    const Icon = iconMap[selectedCategory];
                    return <Icon className="h-6 w-6 text-secondary" />;
                  })()}
                {selectedCategory === "all"
                  ? "All Resources"
                  : currentCategory?.name}{" "}
                {selectedSubCategory !== "all" &&
                  ` - ${currentSubCategory?.name}`}
              </h2>
              <Button variant="ghost" onClick={() => router.push("/resources")}>
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? ( // Check if loading
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <BookOpen className="h-16 w-16 mx-auto animate-pulse" />
                  </div>
                  <p className="text-foreground text-lg">Loading resources...</p>
                  <Progress value={null} className="w-1/2 mx-auto mt-4" /> {/* Indeterminate progress */}
                </Card>
              ) : filteredResources.length > 0 ? ( // If not loading, check if resources exist
                filteredResources.map((resource) => (
                  <FeedResourceCard
                    key={resource.id}
                    resource={resource}
                    user={user} // Pass user to FeedResourceCard
                    isSubscribed={user ? isSubscribed(user.id) : false} // Pass isSubscribed status
                    hasPurchased={hasPurchased(resource.id)} // Pass hasPurchased status
                  />
                ))
              ) : ( // If not loading and no resources
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <BookOpen className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-foreground text-lg">
                    No resources found in this category
                  </p>
                  <Button
                    onClick={() => router.push("/upload")}
                    variant="outline"
                    className="mt-4"
                  >
                    Be the first to upload
                  </Button>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-secondary to-primary text-secondary-foreground">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Platform Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground">
                    Total Resources
                  </span>
                  <span className="text-2xl font-bold">
                    {resources.filter((r) => r.status === "approved").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground">
                    Plus Two Materials
                  </span>
                  <span className="text-2xl font-bold">
                    {
                      resources.filter(
                        (r) =>
                          r.category.id === "plus-two" &&
                          r.status === "approved",
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground">
                    Bachelors Materials
                  </span>
                  <span className="text-2xl font-bold">
                    {
                      resources.filter(
                        (r) =>
                          r.category.id === "bachelors" &&
                          r.status === "approved",
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground">
                    CTEVT Materials
                  </span>
                  <span className="text-2xl font-bold">
                    {
                      resources.filter(
                        (r) =>
                          r.category.id === "ctevt" && r.status === "approved",
                      ).length
                    }
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-secondary" />
                Announcements
              </h3>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2">
                      <Badge
                        variant={
                          announcement.type === "mentor"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {announcement.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {announcement.author}
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {announcement.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {announcement.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Popular Resources
              </h3>
              <div className="space-y-4">
                {popularResources.map((resource, index) => (
                  <div
                    key={resource.id}
                    className="flex items-start gap-3 cursor-pointer hover:bg-primary p-2 rounded-lg transition-colors"
                    onClick={() => router.push("/resources")}
                  >
                    <div className="text-2xl font-bold text-secondary w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resource.downloads.toLocaleString()} downloads
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-foreground">
                          {resource.average_rating?.toFixed(1)} (
                          {resource.total_ratings})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Testimonials />
        <Newsletter />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<BookOpen className="h-12 w-12 text-primary" />}
            title="Multi-Level Support"
            description="Resources for Plus Two (Science, Management), Bachelors, and CTEVT programs all in one place."
          />
          <FeatureCard
            icon={<Search className="h-12 w-12 text-primary" />}
            title="Easy Navigation"
            description="Browse by educational level, program, and semester with our organized category system."
          />
          <FeatureCard
            icon={<Upload className="h-12 w-12 text-primary" />}
            title="Student Contributions"
            description="Share your notes and help fellow students. Upload PDFs, documents, and presentations."
          />
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-primary" />}
            title="Verified Content"
            description="All resources are reviewed and verified by our team to ensure quality and accuracy."
          />
          <FeatureCard
            icon={<MessageCircle className="h-12 w-12 text-primary" />}
            title="Community Support"
            description="Connect with seniors, mentors, and peers for academic guidance and collaboration."
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-primary" />}
            title="Growing Library"
            description="Access thousands of study materials contributed by students across Nepal."
          />
        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-20 text-center">
          <StatCard
            number={
              resources.filter((r) => r.status === "approved").length + "+"
            }
            label="Study Materials"
          />
          <StatCard number="8+" label="Programs Covered" />
          <StatCard number="5,000+" label="Active Students" />
          <StatCard number="500+" label="Senior Mentors" />
        </div>
      </div>
    </div>
  );
}

interface FeedResourceCardProps {
  resource: Resource;
  user: any; // User from AuthContext
  isSubscribed: boolean; // From usePayment
  hasPurchased: boolean; // From usePayment
}

const FeedResourceCard = ({
  resource,
  user,
  isSubscribed,
  hasPurchased,
}: FeedResourceCardProps) => {
  const router = useRouter();
  const { incrementDownload } = useResources();

  const handleDownload = async (res: any) => {
    if (!user) {
      toast.error("Please log in to download resources.");
      router.push("/login");
      return;
    }

    if (!res.file_path) {
      toast.error("File path not available for download.");
      return;
    }

    // Check if it's a premium resource and user is not entitled
    if (!res.isFree && !isSubscribed && !hasPurchased && user.id !== res.uploaderId) {
      toast.info("This is a premium resource. Please subscribe or purchase to download.");
      router.push(`/resources/${res.id}`); // Redirect to resource details page for purchase option
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

    toast.success(`Downloading ${res.title}`);
    window.open(downloadUrl, "_blank");
    incrementDownload(res.id); // Increment download count
  };

  const getActionButton = () => {
    if (resource.isFree) {
      return (
        <Button size="sm" onClick={() => handleDownload(resource)}>
          <Download className="h-4 w-4 mr-2" />
          Download Free
        </Button>
      );
    }

    // If subscribed, purchased, or it's the user's own resource, allow download
    if (isSubscribed || hasPurchased || user?.id === resource.uploaderId) {
      return (
        <Button size="sm" onClick={() => handleDownload(resource)} variant="default">
          <Check className="h-4 w-4 mr-2" />
          Download
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => router.push(`/resources/${resource.id}`)} variant="default">
        <ShoppingCart className="h-4 w-4 mr-2" /> {/* Changed from Zap to ShoppingCart */}
        Buy Now
      </Button>
    );
  };

  return (
    <Card className="p-4 hover:shadow-xl transition-shadow flex gap-4">
      <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-center">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {resource.title}
          </h3>
          {resource.isFree ? (
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-500"
            >
              Free
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-500"
            >
              NPR {resource.price}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {resource.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{resource.subjectName}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{resource.semester}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>By {resource.uploader}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {resource.average_rating?.toFixed(1)} ({resource.total_ratings})
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/resources/${resource.id}`)}
          >
            View Details
          </Button>
          {getActionButton()}
        </div>
      </div>
    </Card>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="bg-card rounded-xl p-8 shadow-lg">
    <div className="text-4xl font-bold text-primary mb-2">{number}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);
