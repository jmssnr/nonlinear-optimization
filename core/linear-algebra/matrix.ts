export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: Float64Array;

  static fromColumn(data: number[]): Matrix {
    return new Matrix(data.length, 1, new Float64Array(data));
  }

  static fromRow(data: number[]): Matrix {
    return new Matrix(1, data.length, new Float64Array(data));
  }

  static identity(n: number): Matrix {
    const data = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      data[i * n + i] = 1;
    }
    return new Matrix(n, n, data);
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols, new Float64Array(rows * cols));
  }

  static diag(vector: Matrix): Matrix {
    if (!vector.isColumnVector()) {
      throw new Error("Input must be a column vector Matrix.");
    }
    const data = Array.from(vector.data);
    const n = data.length;
    const out = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      out[i * n + i] = data[i];
    }
    return new Matrix(n, n, out);
  }

  static ones(n: number): Matrix {
    return new Matrix(n, 1, new Float64Array(n).fill(1));
  }

  static vstackColumns(vectors: Matrix[]): Matrix {
    if (vectors.length === 0) {
      throw new Error("No vectors provided for stacking.");
    }

    for (const vec of vectors) {
      if (!vec.isColumnVector()) {
        throw new Error("All inputs must be column vectors.");
      }
    }

    const totalRows = vectors.reduce((sum, vec) => sum + vec.rows, 0);

    const outData = new Float64Array(totalRows);

    let offset = 0;
    for (const vec of vectors) {
      outData.set(vec.data, offset);
      offset += vec.rows;
    }

    return new Matrix(totalRows, 1, outData);
  }

  constructor(rows: number, cols: number, data: Float64Array | number[]) {
    if (rows * cols !== data.length) {
      throw new Error("Provided number of rows and cols does not match data");
    }
    this.rows = rows;
    this.cols = cols;
    this.data =
      data instanceof Float64Array
        ? data
        : new Float64Array(data ?? rows * cols);
  }

  private idx(row: number, col: number) {
    return row * this.cols + col;
  }

  get(row: number, col: number) {
    return this.data[this.idx(row, col)];
  }

  add(other: Matrix) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Dimension mismatch for addition");
    }
    const out = new Float64Array(this.data.length);

    for (let i = 0; i < this.data.length; i++) {
      out[i] = this.data[i] + other.data[i];
    }

    return new Matrix(this.rows, this.cols, out);
  }

  subtract(other: Matrix) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Dimension mismatch for subraction");
    }

    return this.add(other.scale(-1));
  }

  scale(scaler: number) {
    const out = new Float64Array(this.data.length);

    for (let i = 0; i < this.data.length; i++) {
      out[i] = this.data[i] * scaler;
    }
    return new Matrix(this.rows, this.cols, out);
  }

  multiply(other: Matrix) {
    if (this.cols !== other.rows)
      throw new Error("Matrix dimension mismatch in mul.");

    const m = this.rows;
    const n = this.cols;
    const p = other.cols;

    const out = new Float64Array(m * p);
    const Bd = other.data;
    const Ad = this.data;

    for (let r = 0; r < m; r++) {
      const rowOff = r * n;
      const outRowOff = r * p;
      for (let c = 0; c < p; c++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += Ad[rowOff + k] * Bd[k * p + c];
        }
        out[outRowOff + c] = sum;
      }
    }

    return new Matrix(m, p, out);
  }

  transpose() {
    const out = new Float64Array(this.rows * this.cols);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        out[c * this.rows + r] = this.get(r, c);
      }
    }

    return new Matrix(this.cols, this.rows, out);
  }

  isColumnVector(): boolean {
    return this.cols === 1;
  }

  isRowVector(): boolean {
    return this.rows === 1;
  }
}
