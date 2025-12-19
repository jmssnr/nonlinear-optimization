import { block } from "@/core/linear-algebra/block";
import { solveLinearSystem } from "@/core/linear-algebra/lusolve";
import { Matrix } from "@/core/linear-algebra/matrix";
import { Config, NonlinearProgram } from "@/core/types";

export const getProblemSize = (nlp: NonlinearProgram) => {
  if (!nlp.initialGuess.isColumnVector) {
    throw new Error("Initial guess must be a column vector");
  }
  const numVariables = nlp.initialGuess.rows;
  const numIneqConstraints = nlp.constraints.filter(
    (c) => c.type === "inequality",
  ).length;
  const numEqConstraints = nlp.constraints.length - numIneqConstraints;

  return { numEqConstraints, numIneqConstraints, numVariables };
};

export const feasibilityCheck = (
  gradObjective: Matrix,
  Jg: Matrix,
  Jh: Matrix,
  g: (x: Matrix) => Matrix,
  h: (x: Matrix) => Matrix,
  xk: Matrix,
  sk: Matrix,
  yk: Matrix,
  zk: Matrix,
) => {
  const primalInfeasibility = Math.max(
    Math.hypot(...Array.from(g(xk).data)),
    Math.hypot(...Array.from(h(xk).subtract(sk).data)),
  );

  const dualInfeasibility = Math.max(
    ...Array.from(
      gradObjective
        .subtract(Jg.transpose().multiply(yk))
        .subtract(Jh.transpose().multiply(zk)).data,
    ).map((x) => Math.abs(x)),
  );

  return { primalInfeasibility, dualInfeasibility };
};

export const optimalityError = (
  gradObjective: Matrix,
  Jg: Matrix,
  Jh: Matrix,
  g: (x: Matrix) => Matrix,
  h: (x: Matrix) => Matrix,
  xk: Matrix,
  sk: Matrix,
  yk: Matrix,
  zk: Matrix,
) => {
  const { primalInfeasibility, dualInfeasibility } = feasibilityCheck(
    gradObjective,
    Jg,
    Jh,
    g,
    h,
    xk,
    sk,
    yk,
    zk,
  );

  return (barrierParameter: number, epsilon: number) => {
    const complementary = Math.hypot(
      ...Array.from(
        Matrix.diag(sk)
          .multiply(zk)
          .subtract(Matrix.ones(zk.data.length).scale(barrierParameter)).data,
      ),
    );

    return (
      Math.max(primalInfeasibility, dualInfeasibility, complementary) <= epsilon
    );
  };
};

export const updateBarrierParameter = (
  barrierParameter: number,
  config: Required<Config>,
) => {
  return Math.max(
    config.globalTolerance / 10,
    Math.min(
      config.linearDecreaseFactor * barrierParameter,
      barrierParameter ** config.superLinearDecreaseFactor,
    ),
  );
};

export const solveKKTSystem = (
  gradObjective: Matrix,
  Jg: Matrix,
  Jh: Matrix,
  g: (x: Matrix) => Matrix,
  h: (x: Matrix) => Matrix,
  Bk: Matrix,
  xk: Matrix,
  yk: Matrix,
  zk: Matrix,
  sk: Matrix,
  barrierParameter: number,
) => {
  const numIneqConstraints = zk.rows;
  const numVariables = xk.rows;
  const numEqConstraints = yk.rows;

  const residuals = Matrix.vstackColumns([
    gradObjective
      .subtract(Jg.transpose().multiply(yk))
      .subtract(Jh.transpose().multiply(zk)),
    Matrix.diag(sk)
      .multiply(zk)
      .subtract(Matrix.ones(numIneqConstraints).scale(barrierParameter)),
    g(xk),
    h(xk).subtract(sk),
  ]).scale(-1);

  const M = block([
    [
      Bk,
      Matrix.zeros(numVariables, numIneqConstraints),
      Jg.transpose().scale(-1),
      Jh.transpose().scale(-1),
    ],
    [
      Matrix.zeros(numIneqConstraints, numVariables),
      Matrix.diag(zk),
      Matrix.zeros(numIneqConstraints, numEqConstraints),
      Matrix.diag(sk),
    ],
    [
      Jg,
      Matrix.zeros(numEqConstraints, 2 * numIneqConstraints + numEqConstraints),
    ],
    [
      Jh,
      Matrix.identity(numIneqConstraints).scale(-1),
      Matrix.zeros(numIneqConstraints, numEqConstraints + numIneqConstraints),
    ],
  ]);

  const delta = solveLinearSystem(M, residuals);

  const px = Matrix.fromColumn(Array.from(delta.data).slice(0, numVariables));

  const ps = Matrix.fromColumn(
    Array.from(delta.data).slice(
      numVariables,
      numVariables + numIneqConstraints,
    ),
  );

  const py = Matrix.fromColumn(
    Array.from(delta.data).slice(
      numVariables + numIneqConstraints,
      numVariables + numIneqConstraints + numEqConstraints,
    ),
  );

  const pz = Matrix.fromColumn(
    Array.from(delta.data).slice(
      numVariables + numIneqConstraints + numEqConstraints,
      numVariables + numIneqConstraints + numEqConstraints + numIneqConstraints,
    ),
  );

  return { px, ps, py, pz };
};

export const maximumStepSize = (s: Matrix, ps: Matrix, tau = 0.995) => {
  let alphaMax = 1;
  for (let i = 0; i < s.rows; i++) {
    if (ps.get(i, 0) < 0) {
      const nextAlpha = (-tau * s.get(i, 0)) / ps.get(i, 0);

      if (nextAlpha < alphaMax) {
        alphaMax = nextAlpha;
      }
    }
  }

  if (alphaMax < 0) {
    throw new Error("Can't find dual feasible step size");
  }
  return alphaMax;
};
