import { bfgs } from "@/core/interior-point/bfgs";
import { defaultConfig } from "@/core/interior-point/defaults";
import {
  feasibilityCheck,
  getProblemSize,
  maximumStepSize,
  optimalityError,
  solveKKTSystem,
  updateBarrierParameter,
} from "@/core/interior-point/utils";

import { Matrix } from "@/core/linear-algebra/matrix";
import { Config, NonlinearProgram } from "@/core/types";

export function* solver(nlp: NonlinearProgram, configuration?: Config) {
  const config = { ...defaultConfig, configuration };

  const { numEqConstraints, numIneqConstraints, numVariables } =
    getProblemSize(nlp);

  let Bk = Matrix.identity(numVariables);
  let xk = nlp.initialGuess;
  let sk = Matrix.fromColumn([...Array(numIneqConstraints)].map((_) => 1));
  let yk = Matrix.fromColumn([...Array(numEqConstraints)].map((_) => 1));
  let zk = Matrix.fromColumn([...Array(numIneqConstraints)].map((_) => 1));
  let barrierParameter = config.mu_initial;

  const equalityConstraints = nlp.constraints.filter(
    (c) => c.type === "equality",
  );
  const inequalityConstraints = nlp.constraints.filter(
    (c) => c.type === "inequality",
  );

  const g = (x: Matrix) =>
    new Matrix(
      numEqConstraints,
      1,
      equalityConstraints.flatMap((c) => Array.from(c.fun(x).data)),
    );

  const h = (x: Matrix) => {
    return new Matrix(
      numIneqConstraints,
      1,
      inequalityConstraints.flatMap((c) => Array.from(c.fun(x).data)),
    );
  };

  const equalityJacobian = (x: Matrix) =>
    new Matrix(
      numEqConstraints,
      numVariables,
      nlp.constraints
        .filter((c) => c.type === "equality")
        .flatMap((c) => Array.from(c.jac(x).data)),
    );

  const inequalityJacobian = (x: Matrix) =>
    new Matrix(
      numEqConstraints,
      numVariables,
      nlp.constraints
        .filter((c) => c.type === "inequality")
        .flatMap((c) => Array.from(c.jac(x).data)),
    );

  const phi = (xk: Matrix, sk: Matrix) =>
    nlp.objective(xk).get(0, 0) -
    barrierParameter *
      Array.from(sk.data).reduce((acc, curr) => (acc += Math.log(curr)));

  const theta = (xk: Matrix, sk: Matrix) =>
    Math.max(
      Math.hypot(...Array.from(g(xk).data)),
      Math.hypot(...Array.from(h(xk).subtract(sk).data)),
    );

  for (let i = 0; i < config.maxIterations; i++) {
    const gradObjective = nlp.gradient(xk);
    const Jg = equalityJacobian(xk);
    const Jh = inequalityJacobian(xk);

    const error = optimalityError(gradObjective, Jg, Jh, g, h, xk, sk, yk, zk);

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
    if (error(0, config.globalTolerance)) {
      return {
        x: xk,
        primalInfeasibility,
        dualInfeasibility,
        status: "success",
      } as const;
    }

    yield {
      x: xk,
      primalInfeasibility,
      dualInfeasibility,
      status: "pending",
    } as const;

    while (
      error(barrierParameter, config.barrierToleranceFactor * barrierParameter)
    ) {
      barrierParameter = updateBarrierParameter(barrierParameter, config);
    }

    const { px, ps, py, pz } = solveKKTSystem(
      gradObjective,
      Jg,
      Jh,
      g,
      h,
      Bk,
      xk,
      yk,
      zk,
      sk,
      barrierParameter,
    );

    const primalStepsize = maximumStepSize(sk, ps);
    const dualStepsize = maximumStepSize(zk, pz);

    let alphaPrimal = primalStepsize;
    for (let l = 0; l < 100; l++) {
      alphaPrimal = 2 ** -l * primalStepsize;

      const cCond =
        theta(xk.add(px.scale(alphaPrimal)), sk.add(ps.scale(alphaPrimal))) <=
        (1 - config.gammaTheta) * theta(xk, sk);
      const objCond =
        phi(xk.add(px.scale(alphaPrimal)), sk.add(ps.scale(alphaPrimal))) <=
        phi(xk, sk) - config.gammaPhi * theta(xk, sk);

      if (cCond || objCond) {
        break;
      }
    }

    const xNext = xk.add(px.scale(alphaPrimal));
    const sNext = sk.add(ps.scale(alphaPrimal));
    const yNext = yk.add(py.scale(dualStepsize));
    const zNext = zk.add(pz.scale(dualStepsize));

    const deltaL = nlp
      .gradient(xNext)
      .subtract(equalityJacobian(xNext).transpose().multiply(yNext))
      .subtract(inequalityJacobian(xNext).transpose().multiply(zNext))
      .subtract(
        gradObjective
          .subtract(Jg.transpose().multiply(yNext))
          .subtract(Jh.transpose().multiply(zNext)),
      );

    const deltaX = xNext.subtract(xk);

    Bk = bfgs(deltaX, deltaL, Bk);
    xk = xNext;
    sk = sNext;
    yk = yNext;
    zk = zNext;
  }

  return {
    x: xk,
    primalInfeasibility: Infinity,
    dualInfeasibility: Infinity,
    status: "failed",
  } as const;
}
