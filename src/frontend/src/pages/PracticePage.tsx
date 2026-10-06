import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  RotateCcw,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExercises, useLesson, useSubmitAnswer } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import type { AnswerResult, ExerciseView } from "@/types";

function parseLessonId(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function ExerciseCard({
  exercise,
  index,
  total,
  selected,
  result,
  isPending,
  onSelect,
  onSubmit,
}: {
  exercise: ExerciseView;
  index: number;
  total: number;
  selected: number | null;
  result: AnswerResult | undefined;
  isPending: boolean;
  onSelect: (choiceIndex: number) => void;
  onSubmit: () => void;
}) {
  const answered = result !== undefined;
  const correctIndex = result ? Number(result.correctIndex) : -1;

  return (
    <Card
      data-ocid={`practice.exercise.${index + 1}`}
      className="overflow-hidden rounded-2xl border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
          Question {index + 1} / {total}
        </span>
        {answered && (
          <span
            data-ocid={`practice.result_badge.${index + 1}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
              result.correct
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            ) : (
              <XCircle className="size-3.5" aria-hidden="true" />
            )}
            {result.correct ? "Correct" : "Incorrect"}
          </span>
        )}
      </div>

      <h2 className="mt-4 font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
        {exercise.prompt}
      </h2>

      <fieldset className="mt-4 space-y-2.5" disabled={answered}>
        <legend className="sr-only">Choisis ta réponse</legend>
        {exercise.choices.map((choice, choiceIndex) => {
          const isSelected = selected === choiceIndex;
          const isCorrect = answered && choiceIndex === correctIndex;
          const isWrongPick = answered && isSelected && !isCorrect;
          return (
            <label
              key={`${exercise.id.toString()}-${choiceIndex}`}
              data-ocid={`practice.choice.${index + 1}.${choiceIndex + 1}`}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-smooth",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                !answered && isSelected && "border-primary bg-primary/5",
                !answered &&
                  !isSelected &&
                  "border-border bg-background hover:border-primary/40 hover:bg-muted/60",
                isCorrect && "border-success bg-success/10",
                isWrongPick && "border-destructive bg-destructive/10",
                answered &&
                  !isCorrect &&
                  !isWrongPick &&
                  "border-border bg-background opacity-70",
              )}
            >
              <input
                type="radio"
                name={`exercise-${exercise.id.toString()}`}
                value={choiceIndex}
                checked={isSelected}
                onChange={() => onSelect(choiceIndex)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold",
                  isCorrect &&
                    "border-success bg-success text-success-foreground",
                  isWrongPick &&
                    "border-destructive bg-destructive text-destructive-foreground",
                  !isCorrect &&
                    !isWrongPick &&
                    (isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"),
                )}
                aria-hidden="true"
              >
                {isCorrect ? (
                  <Check className="size-4" />
                ) : isWrongPick ? (
                  <X className="size-4" />
                ) : (
                  String.fromCharCode(65 + choiceIndex)
                )}
              </span>
              <span className="min-w-0 flex-1 break-words text-foreground">
                {choice}
              </span>
            </label>
          );
        })}
      </fieldset>

      {!answered && (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={selected === null || isPending}
          data-ocid={`practice.submit_button.${index + 1}`}
          className="mt-5 h-11 w-full rounded-full text-base font-bold sm:w-auto sm:px-8"
        >
          {isPending ? "Vérification…" : "Vérifier ma réponse"}
        </Button>
      )}

      {answered && (
        <div
          data-ocid={`practice.correction.${index + 1}`}
          className={cn(
            "mt-5 rounded-xl border-l-4 p-4",
            result.correct
              ? "border-success bg-success/10"
              : "border-destructive bg-destructive/10",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-2 font-display text-base font-bold",
              result.correct ? "text-success" : "text-destructive",
            )}
          >
            {result.correct ? (
              <CheckCircle2 className="size-5" aria-hidden="true" />
            ) : (
              <XCircle className="size-5" aria-hidden="true" />
            )}
            {result.correct ? "Bonne réponse !" : "Pas tout à fait…"}
          </p>
          {!result.correct && (
            <p className="mt-2 text-sm font-semibold text-foreground">
              La bonne réponse était :{" "}
              <span className="text-success">
                {exercise.choices[correctIndex]}
              </span>
            </p>
          )}
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <span>{result.explanation}</span>
          </p>
        </div>
      )}
    </Card>
  );
}

export default function PracticePage() {
  const params = useParams({ strict: false });
  const lessonId = parseLessonId(params.lessonId);

  const { data: lesson } = useLesson(lessonId);
  const { data: exercises, isLoading } = useExercises(lessonId);
  const submitAnswer = useSubmitAnswer();

  const [selectedByExercise, setSelectedByExercise] = useState<
    Record<string, number>
  >({});
  const [resultsByExercise, setResultsByExercise] = useState<
    Record<string, AnswerResult>
  >({});
  const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(
    null,
  );

  const list = useMemo(() => exercises ?? [], [exercises]);
  const answeredCount = Object.keys(resultsByExercise).length;
  const correctCount = Object.values(resultsByExercise).filter(
    (result) => result.correct,
  ).length;

  function handleSelect(exerciseId: bigint, choiceIndex: number) {
    setSelectedByExercise((current) => ({
      ...current,
      [exerciseId.toString()]: choiceIndex,
    }));
  }

  function handleSubmit(exercise: ExerciseView) {
    const key = exercise.id.toString();
    const selected = selectedByExercise[key];
    if (selected === undefined) return;
    setPendingExerciseId(key);
    submitAnswer.mutate(
      { exerciseId: exercise.id, selectedIndex: BigInt(selected) },
      {
        onSuccess: (result) => {
          setResultsByExercise((current) => ({ ...current, [key]: result }));
        },
        onSettled: () => {
          setPendingExerciseId((current) => (current === key ? null : current));
        },
      },
    );
  }

  function handleReset() {
    setSelectedByExercise({});
    setResultsByExercise({});
  }

  const allAnswered = list.length > 0 && answeredCount === list.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Fil d'Ariane" className="mb-4">
        <Link
          to="/lecon/$lessonId"
          params={{ lessonId: lessonId?.toString() ?? "" }}
          data-ocid="practice.back_link"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-smooth hover:text-primary"
        >
          <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
          Retour à la leçon
        </Link>
      </nav>

      <header className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-step-3/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-step-3">
          <ClipboardList className="size-3.5" aria-hidden="true" />
          S'entraîner
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Exercices
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {lesson
            ? `Entraîne-toi sur « ${lesson.title} » et corrige-toi immédiatement.`
            : "Réponds à chaque question et découvre la correction tout de suite."}
        </p>
      </header>

      {list.length > 0 && (
        <div
          data-ocid="practice.score_panel"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
        >
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-accent" aria-hidden="true" />
            <span className="font-display text-sm font-bold text-foreground">
              Score de la session
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-ocid="practice.score_value"
              className="font-mono text-lg font-extrabold text-primary"
            >
              {correctCount} / {list.length}
            </span>
            {answeredCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                data-ocid="practice.reset_button"
                className="rounded-full text-muted-foreground"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Recommencer
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div data-ocid="practice.loading_state" className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => `practice-skeleton-${i}`).map(
            (id) => (
              <Card
                key={id}
                className="rounded-2xl border-border bg-card p-6 shadow-soft"
              >
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <div className="mt-4 space-y-2.5">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </Card>
            ),
          )}
        </div>
      ) : list.length === 0 ? (
        <Card
          data-ocid="practice.empty_state"
          className="rounded-2xl border-border bg-card p-8 text-center shadow-soft"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ClipboardList className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Aucun exercice pour cette leçon
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Les exercices de cette leçon arrivent bientôt. En attendant, tu peux
            relire la leçon ou lancer un contrôle.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              asChild
              type="button"
              variant="outline"
              className="h-11 rounded-full font-bold"
            >
              <Link
                to="/lecon/$lessonId"
                params={{ lessonId: lessonId?.toString() ?? "" }}
                data-ocid="practice.empty_back_button"
              >
                Revoir la leçon
              </Link>
            </Button>
            <Button
              asChild
              type="button"
              className="h-11 rounded-full font-bold"
            >
              <Link
                to="/controle/$lessonId"
                params={{ lessonId: lessonId?.toString() ?? "" }}
                data-ocid="practice.empty_exam_button"
              >
                Passer au contrôle
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id.toString()}
              exercise={exercise}
              index={index}
              total={list.length}
              selected={selectedByExercise[exercise.id.toString()] ?? null}
              result={resultsByExercise[exercise.id.toString()]}
              isPending={pendingExerciseId === exercise.id.toString()}
              onSelect={(choiceIndex) => handleSelect(exercise.id, choiceIndex)}
              onSubmit={() => handleSubmit(exercise)}
            />
          ))}
        </div>
      )}

      {allAnswered && (
        <Card
          data-ocid="practice.summary_panel"
          className="mt-6 rounded-2xl border-border bg-gradient-subtle p-6 text-center shadow-soft"
        >
          <p className="font-display text-lg font-bold text-foreground">
            Session terminée : {correctCount} / {list.length} bonnes réponses
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prêt à te tester en temps limité ?
          </p>
          <Button
            asChild
            type="button"
            className="mt-4 h-11 rounded-full px-8 font-bold"
          >
            <Link
              to="/controle/$lessonId"
              params={{ lessonId: lessonId?.toString() ?? "" }}
              data-ocid="practice.exam_link"
            >
              Passer au contrôle
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      )}

      {!allAnswered && list.length > 0 && (
        <div className="mt-6 text-center">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 rounded-full font-bold"
          >
            <Link
              to="/controle/$lessonId"
              params={{ lessonId: lessonId?.toString() ?? "" }}
              data-ocid="practice.exam_link"
            >
              Passer au mode contrôle
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
