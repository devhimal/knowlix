"use client";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const params = useParams();
  const pathname = usePathname();
  const resourceType = params?.resourceType as string;
  const type = params?.type as string;
  const classNumber = params?.classNumber as string;
  const subjectId = params?.subjectId as string;
  const contentTypeId = params?.contentTypeId as string;

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
  ];

  if (resourceType) {
    items.push({
      label: resourceType === "student" ? "Student Resources" : "Pre-Resources",
      href: "/resources",
    });
  }

  if (type) {
    items.push({
      label: `${type.toUpperCase()} Curriculum`,
      href: `/resources/${resourceType}/curriculum/${type}`,
    });
  }

  if (classNumber) {
    items.push({
      label: `Class ${classNumber}`,
      href: `/resources/${resourceType}/curriculum/${type}/class/${classNumber}`,
    });
  }

  if (subjectId) {
    const subjectNames: Record<string, string> = {
      "mathematics": "Mathematics",
      "science": "Science",
      "social-science": "Social Science",
      "english": "English",
      "hindi": "Hindi",
      "nepali": "Nepali",
      "sanskrit": "Sanskrit",
      "computer": "Computer",
      "samajik": "Samajik/Social",
      "optional-mathematics": "Optional Mathematics",
      "hpe": "HPE",
    };
    items.push({
      label: subjectNames[subjectId] || subjectId,
      href: `/resources/${resourceType}/curriculum/${type}/class/${classNumber}/subject/${subjectId}`,
    });
  }

  if (contentTypeId) {
    const contentTypeNames: Record<string, string> = {
      "book": "Book",
      "mind-map": "Mind Map",
      "previous-years": "Previous Years QP",
      "sqp": "Sample QP",
      "faq": "FAQ",
      "quiz": "Quiz",
    };
    items.push({
      label: contentTypeNames[contentTypeId] || contentTypeId,
      href: pathname || "/",
    });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />}
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-800 whitespace-nowrap">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-blue-600 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
