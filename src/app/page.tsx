"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResources } from "@/context/ResourceContext";
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
} from "lucide-react";
import { useState } from "react";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";

export default function HomePage() {
  const router = useRouter();
  const { resources } = useResources();
  const [activeCategory, setActiveCategory] = useState("plus-two");
  const [activeSubCategory, setActiveSubCategory] =
    useState("plus-two-science");

  const mainCategories = [
    {
      id: "plus-two",
      label: "Plus Two",
      icon: GraduationCap,
      color: "bg-primary",
      subCategories: [
        { id: "plus-two-science", label: "Science", program: "Science" },
        {
          id: "plus-two-management",
          label: "Management",
          program: "Management",
        },
      ],
    },
    {
      id: "bachelors",
      label: "Bachelors",
      icon: BookOpen,
      color: "bg-secondary",
      subCategories: [
        {
          id: "bachelors-science-sem1",
          label: "Science - Sem I",
          program: "Science",
          semester: "Semester I",
        },
        {
          id: "bachelors-science-sem2",
          label: "Science - Sem II",
          program: "Science",
          semester: "Semester II",
        },
      ],
    },
    {
      id: "ctevt",
      label: "CTEVT",
      icon: Wrench,
      color: "bg-accent",
      subCategories: [
        {
          id: "ctevt-computer-sem1",
          label: "Computer - Sem I",
          program: "Computer Engineering",
          semester: "Semester I",
        },
        {
          id: "ctevt-computer-sem2",
          label: "Computer - Sem II",
          program: "Computer Engineering",
          semester: "Semester II",
        },
        {
          id: "ctevt-civil-sem1",
          label: "Civil - Sem I",
          program: "Civil Engineering",
          semester: "Semester I",
        },
        {
          id: "ctevt-civil-sem2",
          label: "Civil - Sem II",
          program: "Civil Engineering",
          semester: "Semester II",
        },
      ],
    },
  ];

  const getFilteredResources = () => {
    const category = mainCategories.find((c) => c.id === activeCategory);
    const subCategory = category?.subCategories.find(
      (sc) => sc.id === activeSubCategory,
    );

    if (!subCategory) return [];

    let filtered = resources.filter(
      (r) =>
        r.status === "approved" &&
        r.category.id === activeCategory &&
        r.program === subCategory.program,
    );

    if ("semester" in subCategory && subCategory.semester) {
      filtered = filtered.filter((r) => r.semester === subCategory.semester);
    }

    return filtered.slice(0, 6);
  };

  const filteredResources = getFilteredResources();

  const popularResources = resources
    .filter((r) => r.status === "approved")
    .sort((a, b) => b.downloads - a.downloads)
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

  const currentCategory = mainCategories.find((c) => c.id === activeCategory);
  const currentSubCategory = currentCategory?.subCategories.find(
    (sc) => sc.id === activeSubCategory,
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Academic Resource Platform
          </h1>
          <p className="text-xl text-foreground mb-8 max-w-3xl mx-auto">
            Your one-stop platform for academic resources. Access verified study
            materials from Plus Two, Bachelors, and CTEVT programs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push("/login")}
              size="lg"
              className="px-8"
            >
              Get Started
            </Button>
            <Button
              onClick={() => router.push("/resources")}
              size="lg"
              variant="outline"
              className="px-8"
            >
              Browse All Resources
            </Button>
          </div>
        </div>

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
              {mainCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveSubCategory(category.subCategories[0].id);
                    }}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                      ${
                        isActive
                          ? `${category.color} text-primary-foreground shadow-lg transform scale-105`
                          : "bg-primary text-foreground hover:bg-muted hover:text-secondary"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {currentCategory && (
            <div className="bg-background rounded-xl shadow-md p-2 mt-2 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {currentCategory.subCategories.map((subCategory) => {
                  const isActive = activeSubCategory === subCategory.id;

                  return (
                    <button
                      key={subCategory.id}
                      onClick={() => setActiveSubCategory(subCategory.id)}
                      className={`
                        px-4 py-2 rounded-md font-medium text-sm transition-all whitespace-nowrap
                        ${
                          isActive
                            ? `bg-primary text-primary-foreground`
                            : "bg-transparent text-foreground hover:bg-primary"
                        }
                      `}
                    >
                      <span>{subCategory.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {currentCategory?.icon &&
                  (() => {
                    const Icon = currentCategory.icon;
                    return <Icon className="h-6 w-6 text-secondary" />;
                  })()}
                {currentSubCategory?.label}
              </h2>
              <Button variant="ghost" onClick={() => router.push("/resources")}>
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <FeedResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
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
                          {resource.rating}
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

const FeedResourceCard = ({ resource }: { resource: any }) => {
  const router = useRouter();

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "notes":
        return "bg-primary/10 text-primary";
      case "book":
        return "bg-secondary/10 text-secondary-foreground";
      case "assignment":
        return "bg-accent/10 text-accent";
      case "guide":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-xl transition-shadow cursor-pointer flex gap-4"
      onClick={() => router.push("/resources")}
    >
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
          <span>{resource.subject}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{resource.semester}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>By {resource.uploader}</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {resource.rating}
          </span>
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
