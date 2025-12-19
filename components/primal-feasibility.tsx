import AreaChart from "@/components/chart/area-chart";
import ResponsiveContainer from "@/components/chart/responsive-container";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PrimalFeasibility = ({ data }: { data: number[] }) => {
  return (
    <Card className="min-h-0 min-w-0 flex-1">
      <CardHeader>
        <CardTitle>Primal Feasibility</CardTitle>
        <CardDescription>
          Infinity norm of equality and inequality constraints
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full min-h-0 w-full min-w-0">
        <ResponsiveContainer>
          {({ width, height }) => (
            <AreaChart width={width} height={height} data={data} />
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PrimalFeasibility;
