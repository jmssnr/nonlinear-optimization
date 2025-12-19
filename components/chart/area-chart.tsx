import { ChartColor, chartColors } from "@/components/chart/colors";
import { cn } from "@/utils";
import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";

const AreaChart = (props: {
  width: number;
  height: number;
  color?: ChartColor;
  data: number[];
}) => {
  const { width, height, data, color = "violet" } = props;

  const xScale = scaleLinear().range([0, width]).domain([0, data.length]);
  const yScale = scaleLinear()
    .range([height, 0])
    .domain([0, max(data) ?? 1]);

  const areaPath = area<number>()
    .x((_, i) => xScale(i))
    .y0(() => yScale(0))
    .y1((d) => yScale(d));

  const linePath = line<number>()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d));

  return (
    <svg width={width} height={height} overflow={"visible"}>
      <path d={areaPath(data) ?? ""} className={cn(chartColors[color].fill)} />
      <path
        d={linePath(data) ?? ""}
        className={cn(chartColors[color].stroke, "fill-none stroke-1")}
      />
    </svg>
  );
};

export default AreaChart;
