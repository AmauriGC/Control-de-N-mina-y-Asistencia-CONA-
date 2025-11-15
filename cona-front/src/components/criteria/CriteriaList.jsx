import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCriteria } from "./useCriteria";

export function CriteriaList({
  value,
  criteria = [],
  successLabel = "Todos los criterios cumplidos",
  className,
  size = "sm",
  showIcons = true,
}) {
  const { failing, passing, allPassed } = useCriteria(value, criteria);

  const textSize = size === "md" ? "text-sm" : "text-[12px]";

  return (
    <div className={cn("space-y-1", className)}>
      {criteria.map((c) => {
        const isFailing = failing.some((f) => f.id === c.id);
        const Icon = isFailing ? X : Check;
        return (
          <p
            key={c.id}
            className={cn(textSize, "flex items-center gap-1", isFailing ? "text-destructive" : "text-green-600")}
          >
            {showIcons && <Icon className={cn(size === "md" ? "size-4" : "size-3")} />}
            {c.label}
          </p>
        );
      })}
      {allPassed && (
        <p className={cn(textSize, "flex items-center gap-1 font-medium text-green-700")}>
          {showIcons && <Check className={cn(size === "md" ? "size-4" : "size-3")} />} {successLabel}
        </p>
      )}
    </div>
  );
}
