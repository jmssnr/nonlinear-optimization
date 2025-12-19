import { Config, Iteration, NonlinearProgram, OptimizerFn } from "@/core/types";
import { useEffect, useRef, useState } from "react";

export const useAnimate = (
  optimizerFn: OptimizerFn,
  nlp: NonlinearProgram,
  config: Config,
  throttle = 100,
) => {
  const [state, setState] = useState<Iteration[]>([]);
  const optimizer = useRef(optimizerFn(nlp, config));
  const frameIdRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const frame = (time: number) => {
    if (time - lastUpdateRef.current >= throttle) {
      lastUpdateRef.current = time;

      const result = optimizer.current.next();

      setState((prev) => [...prev, result.value]);

      if (!result.done) {
        frameIdRef.current = requestAnimationFrame(frame);
      }
    } else {
      frameIdRef.current = requestAnimationFrame(frame);
    }
  };

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, []);

  const startNew = (x0: NonlinearProgram["initialGuess"]) => {
    setState([]);
    cancelAnimationFrame(frameIdRef.current);
    optimizer.current = optimizerFn({ ...nlp, initialGuess: x0 }, config);
    frameIdRef.current = requestAnimationFrame(frame);
  };

  return { iterations: state, startNew };
};
