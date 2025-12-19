import AreaChart from "@/components/chart/area-chart";
import ResponsiveContainer from "@/components/chart/responsive-container";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DualFeasibility = ({ data }: { data: number[] }) => {
  return (
    <Card className="min-h-0 min-w-0 flex-1">
      <CardHeader>
        <CardTitle>Dual Feasibility</CardTitle>
        <CardDescription>
          Infinity norm of the Jacobian of the Lagrangian function
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full min-h-0 w-full min-w-0">
        <ResponsiveContainer>
          {({ width, height }) => (
            <AreaChart width={width} height={height} data={data} color="blue"/>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DualFeasibility;
