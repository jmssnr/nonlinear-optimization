import { Matrix } from "@/core/linear-algebra/matrix";
import { ScaleLinear, scaleSequential } from "d3-scale";

import { ticks } from "d3-array";
import { contours } from "d3-contour";
import { geoPath } from "d3-geo";
import { interpolateYlGnBu } from "d3-scale-chromatic";

const ContourLines = (props: {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  fun: (x: Matrix) => Matrix;
}) => {
  const { xScale, yScale, fun } = props;

  const innerWidth = xScale.range()[1];
  const innerHeight = yScale.range()[0];

  const q = 2;
  const x0 = -q / 2;
  const x1 = innerWidth + 28 + q;
  const y0 = -q / 2;
  const y1 = innerHeight + q;

  const n = Math.ceil((x1 - x0) / q);
  const m = Math.ceil((y1 - y0) / q);

  const grid = new Array<number>(n * m);

  let min = Infinity;
  let max = -Infinity;

  for (let j = 0; j < m; ++j) {
    for (let i = 0; i < n; ++i) {
      const value = fun(
        new Matrix(2, 1, [
          xScale.invert(i * q + x0),
          yScale.invert(j * q + y0),
        ]),
      ).get(0, 0);

      if (Number.isFinite(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }

      grid[j * n + i] = value;
    }
  }

  const maxAbs = Math.max(Math.abs(min), Math.abs(max));

  const thresholds = ticks(-maxAbs, maxAbs, 20);

  const colorScale = scaleSequential([-maxAbs, maxAbs], interpolateYlGnBu);

  const contour = contours()
    .size([n, m])
    .thresholds(thresholds)(grid)
    .map(({ type, value, coordinates }) => ({
      type,
      value,
      coordinates: coordinates.map((rings) =>
        rings.map((points) =>
          points.map((point) => [-q + q * point[0], -q + q * point[1]]),
        ),
      ),
    }));

  return contour.map((line, i) => (
    <path
      key={`contour-line-${i}`}
      d={geoPath()(line) || ""}
      stroke={colorScale(line.value)}
      fill={colorScale(line.value)}
      fillOpacity={0.005}
      strokeOpacity={0.5}
    />
  ));
};

export default ContourLines;
