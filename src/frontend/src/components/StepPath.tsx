import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  LEARNING_STEPS,
  type LearningStep,
  STEP_COLOR_CLASS,
  STEP_HINTS,
  STEP_LABELS,
  type StepState,
  stepIndex,
} from "@/types";

type StepPathProps = {
  /** Current step of the lesson. */
  currentStep: LearningStep;
  /** Per-step completion flags from the backend. */
  steps?: StepState[];
  /** Compact rail for cards; full rail for lesson pages. */
  variant?: "full" | "compact";
  className?: string;
};

function isCompleted(
  step: LearningStep,
  steps: StepState[] | undefined,
  currentIndex: number,
): boolean {
  const match = steps?.find((entry) => entry.step === step);
  if (match) return match.completed;
  return stepIndex(step) < currentIndex;
}

/**
 * The signature 7-step learning path rail:
 * Comprendre → Exemple → S'entraîner → Corriger → Mémoriser → Tester → Maîtriser.
 * Each node carries its own hue and fills as the student advances.
 */
export function StepPath({
  currentStep,
  steps,
  variant = "full",
  className,
}: StepPathProps) {
  const currentIndex = stepIndex(currentStep);
  const compact = variant === "compact";

  return (
    <ol
      data-ocid="step_path.list"
      className={cn(
        "flex w-full items-start",
        compact ? "gap-1" : "gap-1.5 sm:gap-2",
        className,
      )}
    >
      {LEARNING_STEPS.map((step, index) => {
        const done = isCompleted(step, steps, currentIndex);
        const active = index === currentIndex;
        const reached = done || active;
        const isLast = index === LEARNING_STEPS.length - 1;

        return (
          <li
            key={step}
            data-ocid={`step_path.item.${index + 1}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <div className="flex w-full items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 flex-1 rounded-full transition-smooth",
                  index === 0
                    ? "bg-transparent"
                    : reached
                      ? STEP_COLOR_CLASS[step]
                      : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full font-display font-bold transition-smooth",
                  compact ? "size-6 text-[10px]" : "size-8 text-xs sm:size-9",
                  reached
                    ? cn(STEP_COLOR_CLASS[step], "text-white shadow-soft")
                    : "border border-border bg-card text-muted-foreground",
                  active && "ring-2 ring-offset-2 ring-offset-background",
                  active && STEP_COLOR_CLASS[step],
                )}
              >
                {done ? (
                  <Check className={compact ? "size-3" : "size-4"} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 flex-1 rounded-full transition-smooth",
                  isLast
                    ? "bg-transparent"
                    : done
                      ? STEP_COLOR_CLASS[step]
                      : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "w-full truncate text-center font-body font-semibold leading-tight",
                compact ? "text-[10px]" : "text-[11px] sm:text-xs",
                reached ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {STEP_LABELS[step]}
            </span>
            {!compact && (
              <span className="hidden w-full text-center text-[11px] leading-tight text-muted-foreground sm:block">
                {STEP_HINTS[step]}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
