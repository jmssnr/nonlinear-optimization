"use client";

import ContourLines from "@/components/chart/contour-lines";
import ResponsiveContainer from "@/components/chart/responsive-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Matrix } from "@/core/linear-algebra/matrix";
import { nlp } from "@/core/problems/nlp-1";
import { Iteration } from "@/core/types";
import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { useState } from "react";

const Chart = (props: {
  width: number;
  height: number;
  iterations: Iteration[];
  handleNewInitialGuess: (x: Matrix) => void;
}) => {
  const [hover, setHover] = useState<null | { x: number; y: number }>(null);
  const { width, height, iterations, handleNewInitialGuess } = props;

  const xScale = scaleLinear().domain([0, 3]).range([0, width]);
  const yScale = scaleLinear().domain([0, 3]).range([height, 0]);

  const thresholds = range(1, 12).map((i) => Math.pow(2, i));

  const equalityConstraint = range(0, 3, 0.1).map((x2) => ({
    x1: x2 ** 2,
    x2,
  }));

  const inEqualityConstraint = range(0, 3, 0.1).map((x1) => ({
    x1,
    x2: x1 ** 4 - 1,
  }));

  const linePath = line<{ x1: number; x2: number }>()
    .x((d) => xScale(d.x1))
    .y((d) => yScale(d.x2));

  const linePathIter = line<Iteration["x"]>()
    .x((d) => xScale(d.get(0, 0)))
    .y((d) => yScale(d.get(1, 0)));

  return (
    <svg
      className="cursor-crosshair"
      width={width}
      height={height}
      onPointerMove={(event) => {
        const { left, top } = event.currentTarget.getBoundingClientRect();
        setHover({ x: event.clientX - left, y: event.clientY - top });
      }}
      onPointerLeave={() => setHover(null)}
      onPointerDown={(event) => {
        const { left, top } = event.currentTarget.getBoundingClientRect();

        const x1 = xScale.invert(event.clientX - left);
        const x2 = yScale.invert(event.clientY - top);

        handleNewInitialGuess(new Matrix(2, 1, [x1, x2]));
      }}
    >
      <ContourLines xScale={xScale} yScale={yScale} fun={nlp.objective} />
      <path
        d={linePath(equalityConstraint) ?? ""}
        className="fill-none stroke-violet-500 stroke-1"
      />
      <path
        d={linePath(inEqualityConstraint) ?? ""}
        className="fill-none stroke-amber-500 stroke-1"
      />
      <path
        d={linePathIter(iterations.map((it) => it.x)) ?? ""}
        className="fill-none stroke-pink-600 stroke-1 opacity-20"
      />
      {hover && (
        <g>
          <line
            x1={hover.x}
            x2={hover.x}
            y1={0}
            y2={height}
            className="stroke-gray-600"
          />
          <line
            y1={hover.y}
            y2={hover.y}
            x1={0}
            x2={width}
            className="stroke-gray-600"
          />
        </g>
      )}
      {iterations.map((iteration, index) => (
        <g key={index}>
          <circle
            r={5}
            className="fill-pink-500 opacity-25"
            cx={xScale(iteration.x.get(0, 0))}
            cy={yScale(iteration.x.get(1, 0))}
          />
          <circle
            r={2}
            className="fill-pink-500"
            cx={xScale(iteration.x.get(0, 0))}
            cy={yScale(iteration.x.get(1, 0))}
          />
        </g>
      ))}
    </svg>
  );
};

const OptimizationProblem = ({
  iterations,
  handleNewInitialGuess,
}: {
  handleNewInitialGuess: (x: Matrix) => void;
  iterations: Iteration[];
}) => {
  return (
    <Card className="min-h-0 w-full min-w-0 flex-2">
      <CardHeader>
        <CardTitle>Optimization Problem</CardTitle>
        <CardDescription>
          Objective contour with{" "}
          <span className="text-violet-500">equality</span> and{" "}
          <span className="text-amber-500">inequality</span> constraints
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full min-h-0 w-full min-w-0">
        <ResponsiveContainer>
          {({ width, height }) => (
            <Chart
              handleNewInitialGuess={handleNewInitialGuess}
              iterations={iterations}
              width={width}
              height={height}
            />
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OptimizationProblem;
