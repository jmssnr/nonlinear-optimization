import { Var } from "@/core/forward-ad/var";
import { Matrix } from "@/core/linear-algebra/matrix";

export const evalFn = (f: (a: Var[]) => Var[], x: Matrix) => {
  const out = f(Array.from(x.data).map((xi) => new Var(xi))).map(
    (fi) => fi.value,
  );
  return new Matrix(out.length, 1, out);
};
