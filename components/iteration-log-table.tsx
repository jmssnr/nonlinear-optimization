"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Iteration } from "@/core/types";
import { CircleCheckIcon, CircleDotIcon, CircleXIcon } from "lucide-react";
import { RefObject, useEffect, useRef } from "react";

const Caption = ({
  lastIteration,
  ref,
}: {
  lastIteration: Iteration | undefined;
  ref: RefObject<HTMLTableCaptionElement | null>;
}) => {
  if (lastIteration === undefined) return;

  let content = (
    <div className="flex items-center justify-center gap-2">
      <CircleDotIcon className="fill-violet-700 stroke-violet-300" />
      <p>Iterating...</p>
    </div>
  );

  if (lastIteration.status === "success") {
    content = (
      <div className="flex items-center justify-center gap-2">
        <CircleCheckIcon className="fill-green-700 stroke-green-300" />
        <p>Local optimum found!</p>
      </div>
    );
  }

  if (lastIteration.status === "failed") {
    content = (
      <div className="flex items-center justify-center gap-2">
        <CircleXIcon className="fill-red-700 stroke-red-300" />
        <p>No optimum found!</p>
      </div>
    );
  }

  return (
    <caption
      ref={ref}
      className="mt-6 pb-8 text-sm text-white [&_svg]:size-5 [&_svg]:stroke-2"
    >
      {content}
    </caption>
  );
};

const IterationLogTable = ({ iterations }: { iterations: Iteration[] }) => {
  const bottomRef = useRef<HTMLTableCaptionElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [iterations]);
  return (
    <ScrollArea className="h-full" type="always">
      <table className="relative min-w-full caption-bottom divide-y divide-white/15">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white"
            >
              iter
            </th>
            <th
              scope="col"
              className="min-w-30 py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white"
            >
              inf_pr
            </th>
            <th
              scope="col"
              className="min-w-30 py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-white"
            >
              inf_du
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {iterations.map((iteration, index) => (
            <tr key={`row-${index}`}>
              <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-white">
                {index}
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                {iteration.primalInfeasibility.toPrecision(3)}
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-400">
                {iteration.dualInfeasibility.toPrecision(3)}
              </td>
            </tr>
          ))}
        </tbody>
        <Caption lastIteration={iterations.at(-1)} ref={bottomRef} />
      </table>
    </ScrollArea>
  );
};

export default IterationLogTable;
