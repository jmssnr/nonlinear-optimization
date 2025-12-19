"use client";

import DualFeasibility from "@/components/dual-feasibility";
import IterationLogTable from "@/components/iteration-log-table";
import OptimizationProblem from "@/components/optimization-problem";
import PrimalFeasibility from "@/components/primal-feasibility";
import { solver } from "@/core/interior-point/solver";
import { nlp } from "@/core/problems/nlp-1";
import { useAnimate } from "@/hooks/useAnimate";

export default function Home() {
  const { iterations } = useAnimate(solver, nlp, {});

  return (
    <main className="flex h-screen w-screen bg-gray-900 text-gray-100">
      <aside className="hidden h-full w-3xs border-r border-gray-700 sm:block lg:w-xl">
        <IterationLogTable iterations={iterations} />
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-2">
        <OptimizationProblem iterations={iterations} />
        <div className="flex min-h-0 w-full min-w-0 flex-1 gap-2">
          <PrimalFeasibility
            data={iterations.map((iteration) => iteration.primalInfeasibility)}
          />
          <DualFeasibility
            data={iterations.map((iteration) => iteration.primalInfeasibility)}
          />
        </div>
      </section>
    </main>
  );
}
