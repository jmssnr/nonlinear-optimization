import ContourLines from "@/components/chart/contour-lines";
import ResponsiveContainer from "@/components/chart/responsive-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { nlp } from "@/core/problems/nlp-1";
import { Iteration } from "@/core/types";
import { extent, range } from "d3-array";
import { scaleLinear, scaleSequentialLog } from "d3-scale";
import { interpolateYlGnBu } from "d3-scale-chromatic";

const Chart = (props: {
  width: number;
  height: number;
  iterations: Iteration[];
}) => {
  const { width, height, iterations } = props;

  const xScale = scaleLinear().domain([0, 3]).range([0, width]);
  const yScale = scaleLinear().domain([0, 3]).range([height, 0]);

  const thresholds = range(1, 12).map((i) => Math.pow(2, i));

  const colorScale = scaleSequentialLog(
    extent(thresholds) as [number, number],
    interpolateYlGnBu,
  );

  return (
    <svg width={width} height={height}>
      <ContourLines xScale={xScale} yScale={yScale} fun={nlp.objective} />
      {iterations.map((iteration, index) => (
        <circle
          r={5}
          className="fill-violet-800 stroke-violet-700 opacity-65"
          key={index}
          cx={xScale(iteration.x.get(0, 0))}
          cy={yScale(iteration.x.get(1, 0))}
        />
      ))}
    </svg>
  );
};

const OptimizationProblem = ({ iterations }: { iterations: Iteration[] }) => {
  return (
    <Card className="min-h-0 w-full min-w-0 flex-2">
      <CardHeader>
        <CardTitle>Optimization Problem</CardTitle>
        <CardDescription>
          Objective contour and constraint functions
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full min-h-0 w-full min-w-0">
        <ResponsiveContainer>
          {({ width, height }) => (
            <Chart iterations={iterations} width={width} height={height} />
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OptimizationProblem;
