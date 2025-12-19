import { Matrix } from "@/core/linear-algebra/matrix";

export function luDecompose(A: Matrix): Int32Array {
  const n = A.rows;
  if (n !== A.cols) throw new Error("Matrix must be square.");

  const piv = new Int32Array(n);
  for (let i = 0; i < n; i++) piv[i] = i;

  const data = A.data;

  for (let k = 0; k < n; k++) {
    // Pivot selection
    let maxRow = k;
    let maxVal = Math.abs(data[k * n + k]);
    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(data[i * n + k]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = i;
      }
    }

    if (maxVal === 0) throw new Error("Matrix is singular.");

    // Swap rows if needed
    if (maxRow !== k) {
      for (let j = 0; j < n; j++) {
        const tmp = data[k * n + j];
        data[k * n + j] = data[maxRow * n + j];
        data[maxRow * n + j] = tmp;
      }
      const tmpP = piv[k];
      piv[k] = piv[maxRow];
      piv[maxRow] = tmpP;
    }

    // Eliminate
    const Akk = data[k * n + k];
    for (let i = k + 1; i < n; i++) {
      const idx = i * n + k;
      const mult = data[idx] / Akk;
      data[idx] = mult;

      const rowI = i * n;
      const rowK = k * n;
      for (let j = k + 1; j < n; j++) {
        data[rowI + j] -= mult * data[rowK + j];
      }
    }
  }

  return piv;
}

export function luSolve(A: Matrix, piv: Int32Array, b: Matrix): Matrix {
  const n = A.rows;
  if (!b.isColumnVector() || b.rows !== n)
    throw new Error("b must be column vector with correct size.");

  const x = new Float64Array(n);
  const data = A.data;

  // Apply pivot to b
  for (let i = 0; i < n; i++) {
    x[i] = b.data[piv[i]];
  }

  // Forward substitution: L*y = Pb
  for (let i = 0; i < n; i++) {
    let sum = x[i];
    for (let j = 0; j < i; j++) {
      sum -= data[i * n + j] * x[j];
    }
    x[i] = sum;
  }

  // Backward substitution: U*x = y
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i];
    for (let j = i + 1; j < n; j++) {
      sum -= data[i * n + j] * x[j];
    }
    x[i] = sum / data[i * n + i];
  }

  return Matrix.fromColumn(Array.from(x));
}

export const solveLinearSystem = (A: Matrix, b: Matrix) => {
  const piv = luDecompose(A);
  return luSolve(A, piv, b);
};
