import { Matrix } from "@/core/linear-algebra/matrix";

type ConstraintType = "equality" | "inequality";

type Constraint = {
  type: ConstraintType;
  fun: (x: Matrix) => Matrix;
  jac: (x: Matrix) => Matrix;
};

export type NonlinearProgram = {
  objective: (x: Matrix) => Matrix;
  gradient: (x: Matrix) => Matrix;
  constraints: Array<Constraint>;
  initialGuess: Matrix;
};

export type Config = {
  mu_initial?: number;
  barrierToleranceFactor?: number;
  linearDecreaseFactor?: number;
  superLinearDecreaseFactor?: number;
  globalTolerance?: number;
  maxIterations?: number;
  gammaTheta?: number;
  gammaPhi?: number;
};

export type Iteration = {
  x: Matrix;
  primalInfeasibility: number;
  dualInfeasibility: number;
  status: "pending" | "success" | "failed";
};

export type OptimizerFn = (
  nlp: NonlinearProgram,
  config: Config,
) => Generator<Iteration, Iteration, void>;
