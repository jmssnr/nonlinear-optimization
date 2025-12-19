import { Config } from "@/core/types";

export const defaultConfig: Required<Config> = {
  mu_initial: 0.1,
  barrierToleranceFactor: 10,
  linearDecreaseFactor: 0.2,
  superLinearDecreaseFactor: 1.5,
  globalTolerance: 1e-8,
  maxIterations: 300,
  gammaPhi: 1e-8,
  gammaTheta: 1e-5,
};
