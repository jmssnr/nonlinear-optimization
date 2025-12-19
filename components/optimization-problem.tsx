import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Iteration } from "@/core/types";

const OptimizationProblem = ({ iterations }: { iterations: Iteration[] }) => {
  return (
    <Card className="min-h-0 w-full min-w-0 flex-2">
      <CardHeader>
        <CardTitle>Optimization Problem</CardTitle>
        <CardDescription>
          Objective contour and constraint functions
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full min-h-0 w-full min-w-0"></CardContent>
    </Card>
  );
};

export default OptimizationProblem;
