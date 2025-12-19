import { Matrix } from "@/core/linear-algebra/matrix";

export function block(layout: Matrix[][]): Matrix {
  if (!layout.length) throw new Error("block(): empty layout.");

  const R = layout.length;

  // Row heights & per-row total widths
  const rowHeights = layout.map((row) => (row.length ? row[0].rows : 0));
  const rowWidths = layout.map((row) => row.reduce((s, m) => s + m.cols, 0));

  // Validate consistent row heights and total width
  const totalCols = rowWidths[0];
  for (let r = 0; r < R; r++) {
    if (rowWidths[r] !== totalCols)
      throw new Error("block(): row width mismatch.");
    for (let c = 1; c < layout[r].length; c++)
      if (layout[r][c].rows !== rowHeights[r])
        throw new Error("block(): block height mismatch in row.");
  }

  // Final matrix shape
  const totalRows = rowHeights.reduce((a, b) => a + b, 0);
  const out = new Float64Array(totalRows * totalCols);

  // Copy data block-by-block
  let rOff = 0;
  for (let r = 0; r < R; r++) {
    let cOff = 0;
    for (const B of layout[r]) {
      for (let br = 0; br < B.rows; br++) {
        const dest = (rOff + br) * totalCols + cOff;
        const src0 = br * B.cols;
        out.set(B.data.subarray(src0, src0 + B.cols), dest);
      }
      cOff += B.cols;
    }
    rOff += rowHeights[r];
  }

  return new Matrix(totalRows, totalCols, out);
}
