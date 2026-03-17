import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface ProgressItem {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "locked";
  progress?: number;
}

interface ProgressTrackerProps {
  items: ProgressItem[];
  title?: string;
}

export function ProgressTracker({ items, title = "Your Progress" }: ProgressTrackerProps) {
  const completed = items.filter(item => item.status === "completed").length;
  const total = items.length;
  const overallProgress = (completed / total) * 100;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
          {completed}/{total}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              item.status === "locked"
                ? "bg-gray-50 opacity-60"
                : item.status === "completed"
                ? "bg-green-50"
                : "bg-blue-50"
            }`}
          >
            <div className="flex-shrink-0">
              {item.status === "completed" && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {item.status === "in-progress" && (
                <Circle className="w-5 h-5 text-blue-600" />
              )}
              {item.status === "locked" && (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  item.status === "locked" ? "text-gray-500" : "text-gray-800"
                }`}
              >
                {item.name}
              </p>
              {item.status === "in-progress" && item.progress !== undefined && (
                <div className="mt-1">
                  <Progress value={item.progress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
