import { GraduationCap } from "lucide-react";
import { Card } from "./ui/card";
import { useRouter, useParams } from "next/navigation";

interface ClassCardProps {
  classNumber: number;
}

export function ClassCard({ classNumber }: ClassCardProps) {
  const router = useRouter();
  const params = useParams() as { resourceType?: string; type?: string } | null;
  const resourceType = params?.resourceType;
  const type = params?.type;

  const handleClick = () => {
    if (resourceType && type) {
      router.push(`/resources/${resourceType}/curriculum/${type}/class/${classNumber}`);
    }
  };

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-2 shadow-lg group"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/80 to-primary rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow group-hover:scale-110 transform duration-200">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-gray-800">
            Class {classNumber}
          </h3>
          <p className="text-sm text-gray-600">
            Grade {classNumber} Materials
          </p>
        </div>
      </div>
    </Card>
  );
}