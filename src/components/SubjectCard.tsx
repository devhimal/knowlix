import { BookOpen } from "lucide-react";
import { Card } from "./ui/card";
import { useNavigate, useParams } from "react-router";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const navigate = useNavigate();
  const { resourceType, type, classNumber } = useParams<{
    resourceType: string;
    type: string;
    classNumber: string;
  }>();

  const handleClick = () => {
    navigate(
      `/resources/${resourceType}/curriculum/${type}/class/${classNumber}/subject/${subject.id}`
    );
  };

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-2 shadow-lg group"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-20 h-20 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow group-hover:scale-110 transform duration-200`}>
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-gray-800">
            {subject.name}
          </h3>
        </div>
      </div>
    </Card>
  );
}
