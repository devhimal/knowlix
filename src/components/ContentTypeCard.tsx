import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface ContentType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

interface ContentTypeCardProps {
  contentType: ContentType;
}

export function ContentTypeCard({ contentType }: ContentTypeCardProps) {
  const Icon = contentType.icon;
  const router = useRouter();
  const params = useParams() as { type?: string; resourceType?: string; classNumber?: string; subjectId?: string } | null;
  const { type, resourceType, classNumber, subjectId } = params || {};

  const handleClick = () => {
    if (resourceType && type && classNumber && subjectId) {
      router.push(
        `/resources/${resourceType}/curriculum/${type}/class/${classNumber}/subject/${subjectId}/content/${contentType.id}`
      );
    }
  };

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-2 shadow-lg group"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`w-20 h-20 bg-gradient-to-br ${contentType.color} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow group-hover:scale-110 transform duration-200`}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {contentType.name}
          </h3>
        </div>
      </div>
    </Card>
  );
}