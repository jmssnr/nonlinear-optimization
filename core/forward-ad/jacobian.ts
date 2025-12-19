import { Var } from "@/core/forward-ad/var";
import { Matrix } from "@/core/linear-algebra/matrix";

export const jacobian = (F: (vars: Var[]) => Var[], x: Matrix) => {
  const n = x.data.length;
  const m = F(Array.from(x.data).map((v) => new Var(v, 0))).length;

  const J = new Float64Array(n * m);

  for (let j = 0; j < n; j++) {
    const vars = Array.from(x.data).map(
      (xi, i) => new Var(xi, i === j ? 1 : 0),
    );
    const out = F(vars);
    for (let i = 0; i < m; i++) {
      J[i * n + j] = out[i].derivative;
    }
  }

  return new Matrix(m, n, J);
};
