import { useParams, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Loader2,
  NotebookPen,
  Send,
  Sparkles,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { StepPath } from "@/components/StepPath";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdvanceStep,
  useAskAiTeacher,
  useCondensedPath,
  useLesson,
  useLessonProgress,
} from "@/hooks/useQueries";
import { formatMinutes, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  type AiExplanation,
  type CondensedPath,
  LearningStep,
  STEP_COLOR_CLASS,
  STEP_LABELS,
  stepIndex,
} from "@/types";

const DURATIONS: bigint[] = [5n, 10n, 20n];

/** Next step after each step, used for the "étape suivante" hint. */
const NEXT_STEP: Record<LearningStep, LearningStep> = {
  [LearningStep.comprendre]: LearningStep.exemple,
  [LearningStep.exemple]: LearningStep.entrainer,
  [LearningStep.entrainer]: LearningStep.corriger,
  [LearningStep.corriger]: LearningStep.memoriser,
  [LearningStep.memoriser]: LearningStep.tester,
  [LearningStep.tester]: LearningStep.maitriser,
  [LearningStep.maitriser]: LearningStep.maitriser,
};

function parseLessonId(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function LessonSkeleton() {
  return (
    <div
      data-ocid="lesson.loading_state"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
    >
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/3" />
      <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-ocid="lesson.empty_state"
      className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6"
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <BookOpen className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
        Leçon introuvable
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Cette leçon n'existe pas ou n'est plus disponible. Retourne à tes
        matières pour en choisir une autre.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      data-ocid="lesson.error_state"
      className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6"
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
        Impossible de charger la leçon
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
      <span className="text-foreground/60">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function StepContent({
  step,
  explanation,
  example,
  keyPoints,
}: {
  step: LearningStep;
  explanation: string;
  example: string;
  keyPoints: string[];
}) {
  const index = stepIndex(step);

  return (
    <Card
      data-ocid="lesson.step_content.card"
      className="overflow-hidden rounded-2xl border-border shadow-soft"
    >
      <div className={cn("h-1.5 w-full", STEP_COLOR_CLASS[step])} />
      <CardHeader>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full font-display text-xs font-bold text-white",
              STEP_COLOR_CLASS[step],
            )}
          >
            {index + 1}
          </span>
          <CardTitle className="font-display text-xl font-extrabold">
            {STEP_LABELS[step]}
          </CardTitle>
        </div>
        <CardDescription>
          {index === 0
            ? "L'explication simple de la leçon."
            : index === 1
              ? "Un exemple concret pour bien visualiser."
              : "Les points clés à retenir pour cette étape."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Lightbulb className="size-4 text-accent" aria-hidden="true" />
            Explication simple
          </h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
            {explanation}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-muted/40 p-4">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <NotebookPen className="size-4 text-primary" aria-hidden="true" />
            Exemple concret
          </h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
            {example}
          </p>
        </section>

        <section>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <ListChecks className="size-4 text-success" aria-hidden="true" />
            Points clés à retenir
          </h3>
          <ul className="mt-3 space-y-2">
            {keyPoints.map((point) => (
              <li
                key={point}
                data-ocid={`lesson.key_point.${keyPoints.indexOf(point) + 1}`}
                className="flex items-start gap-2.5 text-foreground/90"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

function MemorizationSheet({
  summary,
  points,
}: {
  summary: string;
  points: string[];
}) {
  return (
    <Card
      data-ocid="lesson.memorization.card"
      className="rounded-2xl border-border bg-gradient-subtle shadow-soft"
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <CardTitle className="font-display text-lg font-extrabold">
            Fiche de mémorisation
          </CardTitle>
        </div>
        <CardDescription>
          Le résumé court et les points essentiels à retenir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-xl border border-border bg-card p-4 leading-relaxed text-foreground/90">
          {summary}
        </p>
        <ul className="space-y-2">
          {points.map((point) => (
            <li
              key={point}
              data-ocid={`lesson.memorization_point.${points.indexOf(point) + 1}`}
              className="flex items-start gap-2.5 text-sm text-foreground/90"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CondensedPathPanel({
  lessonId,
  duration,
  onDurationChange,
}: {
  lessonId: bigint;
  duration: bigint;
  onDurationChange: (value: bigint) => void;
}) {
  const { data, isLoading, isError } = useCondensedPath(lessonId, duration);

  return (
    <Card
      data-ocid="lesson.condensed.card"
      className="rounded-2xl border-border shadow-soft"
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Timer className="size-4" aria-hidden="true" />
          </span>
          <CardTitle className="font-display text-lg font-extrabold">
            Apprendre en 5, 10 ou 20 minutes
          </CardTitle>
        </div>
        <CardDescription>
          Choisis le temps dont tu disposes : on te prépare un parcours
          condensé.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Durée du parcours condensé</legend>
          {DURATIONS.map((value) => {
            const active = value === duration;
            return (
              <Button
                key={value.toString()}
                type="button"
                variant={active ? "default" : "outline"}
                className="rounded-full"
                aria-pressed={active}
                data-ocid={`lesson.duration.${value.toString()}`}
                onClick={() => onDurationChange(value)}
              >
                {formatMinutes(value)}
              </Button>
            );
          })}
        </fieldset>

        {isLoading && (
          <div data-ocid="lesson.condensed.loading_state" className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {isError && (
          <p
            data-ocid="lesson.condensed.error_state"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            Le parcours condensé n'a pas pu être chargé. Réessaie dans un
            instant.
          </p>
        )}

        {!isLoading && !isError && data && <CondensedResult path={data} />}
      </CardContent>
    </Card>
  );
}

function CondensedResult({ path }: { path: CondensedPath }) {
  return (
    <div
      data-ocid="lesson.condensed.result"
      className="space-y-4 rounded-xl border border-border bg-muted/40 p-4"
    >
      <p className="text-sm leading-relaxed text-foreground/90">
        {path.summary}
      </p>
      <ol className="flex flex-wrap gap-2">
        {path.steps.map((step, i) => (
          <li
            key={step}
            data-ocid={`lesson.condensed.step.${i + 1}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full font-display text-[10px] font-bold text-white",
                STEP_COLOR_CLASS[step],
              )}
            >
              {i + 1}
            </span>
            {STEP_LABELS[step]}
          </li>
        ))}
      </ol>
    </div>
  );
}

function AiTeacherPanel({ lessonId }: { lessonId: bigint }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AiExplanation | null>(null);
  const ask = useAskAiTeacher();

  const trimmed = question.trim();
  const canSubmit = trimmed.length > 0 && !ask.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const asked = trimmed;
    setQuestion("");
    setAnswer(null);
    ask.mutate(
      { lessonId, question: asked },
      {
        onSuccess: (data) => setAnswer(data),
        onError: () =>
          setQuestion((current) => (current === "" ? asked : current)),
      },
    );
  }

  return (
    <Card
      data-ocid="lesson.ai_teacher.card"
      className="rounded-2xl border-border shadow-soft"
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <GraduationCap className="size-4" aria-hidden="true" />
          </span>
          <CardTitle className="font-display text-lg font-extrabold">
            Professeur IA
          </CardTitle>
        </div>
        <CardDescription>
          Pose ta question en langage naturel : le professeur t'explique
          simplement, à ton niveau.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="ai-teacher-question"
            className="block text-sm font-semibold text-foreground"
          >
            Ta question sur la leçon
          </label>
          <Textarea
            id="ai-teacher-question"
            data-ocid="lesson.ai_teacher.input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex. : Pourquoi la photosynthèse a-t-elle besoin de lumière ?"
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full"
              data-ocid="lesson.ai_teacher.submit_button"
            >
              {ask.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              {ask.isPending ? "Le professeur réfléchit…" : "Demander"}
            </Button>
          </div>
        </form>

        {ask.isPending && (
          <div
            data-ocid="lesson.ai_teacher.loading_state"
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Le professeur prépare une explication simple…
          </div>
        )}

        {ask.isError && (
          <p
            data-ocid="lesson.ai_teacher.error_state"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            Oups, le professeur n'a pas pu répondre. Vérifie ta question et
            réessaie.
          </p>
        )}

        {answer && !ask.isPending && (
          <div
            data-ocid="lesson.ai_teacher.answer"
            className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full font-semibold">
                Niveau {answer.level}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {answer.question}
            </p>
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">
              {answer.answer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LessonPage() {
  const params = useParams({ strict: false }) as { lessonId?: string };
  const lessonId = parseLessonId(params.lessonId);
  const search = useSearch({ strict: false }) as { duration?: number };
  const [duration, setDuration] = useState<bigint>(
    BigInt(search.duration ?? 10),
  );

  const lessonQuery = useLesson(lessonId);
  const progressQuery = useLessonProgress(lessonId);
  const advance = useAdvanceStep();

  if (lessonId === undefined) return <EmptyState />;
  if (lessonQuery.isLoading) return <LessonSkeleton />;
  if (lessonQuery.isError) {
    return (
      <ErrorState message="Une erreur est survenue pendant le chargement. Réessaie dans un instant." />
    );
  }
  if (!lessonQuery.data) return <EmptyState />;

  const lesson = lessonQuery.data;
  const progress = progressQuery.data ?? null;
  const currentStep: LearningStep =
    progress?.currentStep ?? LearningStep.comprendre;
  const mastery = progress?.masteryRate ?? 0n;
  const isLastStep = stepIndex(currentStep) === 6;

  return (
    <div
      data-ocid="lesson.page"
      className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6"
    >
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-primary/10 font-semibold text-primary hover:bg-primary/10">
            Leçon
          </Badge>
          {progress && (
            <Badge
              variant="secondary"
              className="rounded-full font-semibold"
              data-ocid="lesson.mastery_badge"
            >
              Maîtrise : {formatPercent(mastery)}
            </Badge>
          )}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <MetaChip label="Matière" value={`#${lesson.subjectId.toString()}`} />
          <MetaChip label="Niveau" value={lesson.level} />
          <MetaChip label="Pays" value={lesson.country} />
          <MetaChip label="Programme" value={lesson.curriculum} />
          <MetaChip label="Langue" value={lesson.language} />
        </div>
      </header>

      <section
        aria-label="Parcours d'apprentissage en 7 étapes"
        className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold">
            Ton parcours en 7 étapes
          </h2>
          <span className="text-sm font-semibold text-muted-foreground">
            Étape {stepIndex(currentStep) + 1} / 7
          </span>
        </div>
        <StepPath currentStep={currentStep} steps={progress?.steps} />
      </section>

      <div className="mt-6 space-y-6">
        <StepContent
          step={currentStep}
          explanation={lesson.explanation}
          example={lesson.example}
          keyPoints={lesson.keyPoints}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {isLastStep
              ? "Tu es à la dernière étape : bravo !"
              : `Étape suivante : ${STEP_LABELS[NEXT_STEP[currentStep]]}`}
          </p>
          <Button
            type="button"
            className="rounded-full"
            disabled={advance.isPending || isLastStep}
            data-ocid="lesson.advance_button"
            onClick={() => advance.mutate(lesson.id)}
          >
            {advance.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4" aria-hidden="true" />
            )}
            {isLastStep ? "Leçon maîtrisée" : "Étape suivante"}
          </Button>
        </div>

        {advance.isError && (
          <p
            data-ocid="lesson.advance.error_state"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            Impossible d'avancer d'étape pour le moment. Réessaie.
          </p>
        )}

        <MemorizationSheet
          summary={lesson.memorizationSummary}
          points={lesson.memorizationPoints}
        />

        <CondensedPathPanel
          lessonId={lesson.id}
          duration={duration}
          onDurationChange={setDuration}
        />

        <AiTeacherPanel lessonId={lesson.id} />
      </div>
    </div>
  );
}
