import { jacobian } from "@/core/forward-ad/jacobian";
import { evalFn } from "@/core/forward-ad/utils";
import { Var } from "@/core/forward-ad/var";
import { Matrix } from "@/core/linear-algebra/matrix";
import { NonlinearProgram } from "@/core/types";

const f = (x: Var[]) => {
  const x1 = x[0];
  const x2 = x[1];
  const a = new Var(1.5);

  return [
    x1
      .multiply(x2)
      .subtract(a)
      .power(2)
      .multiply(new Var(-1))
      .subtract(x2.subtract(a).power(2))
      .exp()
      .multiply(new Var(-1000)),
  ];
};

const g = (x: Var[]) => {
  const x1 = x[0];
  const x2 = x[1];

  return [x1.subtract(x2.power(2))];
};

const h = (x: Var[]) => {
  const x1 = x[0];
  const x2 = x[1];
  return [x1.power(4).multiply(new Var(-1)).add(x2).add(new Var(1))];
};

export const nlp: NonlinearProgram = {
  objective: (x: Matrix) => evalFn(f, x),
  gradient: (x: Matrix) => jacobian(f, x).transpose(),
  initialGuess: new Matrix(2, 1, [2.5, 2.5]),
  constraints: [
    {
      type: "equality",
      fun: (x: Matrix) => evalFn(g, x),
      jac: (x: Matrix) => jacobian(g, x),
    },
    {
      type: "inequality",
      fun: (x: Matrix) => evalFn(h, x),
      jac: (x: Matrix) => jacobian(h, x),
    },
  ],
};
