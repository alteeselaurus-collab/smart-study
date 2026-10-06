import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Lightbulb,
  ListChecks,
  Play,
  Timer,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExam, useStartExam, useSubmitExam } from "@/hooks/useQueries";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExamResult, ExamSession, ExamView } from "@/types";

function parseLessonId(raw: string | undefined): bigint | undefined {
  if (!raw) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function CountdownBadge({ secondsLeft }: { secondsLeft: number }) {
  const urgent = secondsLeft <= 30;
  return (
    <span
      data-ocid="exam.timer"
      role="timer"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg font-extrabold tabular-nums",
        urgent
          ? "bg-destructive/15 text-destructive"
          : "bg-primary/10 text-primary",
      )}
    >
      <Timer className="size-5" aria-hidden="true" />
      {formatDuration(secondsLeft)}
    </span>
  );
}

function QuestionCard({
  index,
  total,
  prompt,
  choices,
  selected,
  onSelect,
}: {
  index: number;
  total: number;
  prompt: string;
  choices: string[];
  selected: number | null;
  onSelect: (choiceIndex: number) => void;
}) {
  return (
    <Card
      data-ocid={`exam.question.${index + 1}`}
      className="rounded-2xl border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
        Question {index + 1} / {total}
      </span>
      <h2 className="mt-4 font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
        {prompt}
      </h2>
      <fieldset className="mt-4 space-y-2.5">
        <legend className="sr-only">Choisis ta réponse</legend>
        {choices.map((choice, choiceIndex) => {
          const isSelected = selected === choiceIndex;
          return (
            <label
              key={choice}
              data-ocid={`exam.choice.${index + 1}.${choiceIndex + 1}`}
              className={cn(
                "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-smooth",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/60",
              )}
            >
              <input
                type="radio"
                name={`exam-question-${index}`}
                value={choiceIndex}
                checked={isSelected}
                onChange={() => onSelect(choiceIndex)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + choiceIndex)}
              </span>
              <span className="min-w-0 flex-1 break-words text-foreground">
                {choice}
              </span>
            </label>
          );
        })}
      </fieldset>
    </Card>
  );
}

function ResultPanel({
  result,
  exam,
  lessonId,
}: {
  result: ExamResult;
  exam: ExamView;
  lessonId: bigint | undefined;
}) {
  const score = Number(result.score);
  const total = Number(result.total);
  const ratio = total > 0 ? score / total : 0;
  const passed = ratio >= 0.5;

  return (
    <div className="space-y-6">
      <Card
        data-ocid="exam.result_panel"
        className="rounded-2xl border-border bg-gradient-subtle p-6 text-center shadow-soft sm:p-8"
      >
        <span
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-2xl",
            passed
              ? "bg-success/15 text-success"
              : "bg-accent/20 text-accent-foreground",
          )}
        >
          <Trophy className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground">
          {passed ? "Bravo, contrôle réussi !" : "Contrôle terminé"}
        </h2>
        <p
          data-ocid="exam.final_score"
          className="mt-2 font-mono text-4xl font-extrabold text-primary"
        >
          {score} / {total}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {Math.round(ratio * 100)} % de bonnes réponses
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 rounded-full font-bold"
          >
            <Link
              to="/exercices/$lessonId"
              params={{ lessonId: lessonId?.toString() ?? "" }}
              data-ocid="exam.practice_link"
            >
              Refaire les exercices
            </Link>
          </Button>
          <Button asChild type="button" className="h-11 rounded-full font-bold">
            <Link
              to="/lecon/$lessonId"
              params={{ lessonId: lessonId?.toString() ?? "" }}
              data-ocid="exam.lesson_link"
            >
              Revoir la leçon
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Card>

      <section aria-labelledby="exam-correction-title">
        <h3
          id="exam-correction-title"
          className="mb-3 font-display text-xl font-bold text-foreground"
        >
          Correction détaillée
        </h3>
        <div className="space-y-4">
          {result.results.map((item, index) => {
            const selectedIndex = Number(item.selectedIndex);
            const correctIndex = Number(item.correctIndex);
            const choices = exam.questions[index]?.choices ?? [];
            return (
              <Card
                key={item.exerciseId.toString()}
                data-ocid={`exam.correction.${index + 1}`}
                className="rounded-2xl border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 font-mono text-xs font-bold text-muted-foreground">
                    Question {index + 1}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                      item.correct
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive",
                    )}
                  >
                    {item.correct ? (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                      <XCircle className="size-3.5" aria-hidden="true" />
                    )}
                    {item.correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="mt-3 font-display text-base font-bold leading-snug text-foreground">
                  {item.prompt}
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-muted-foreground">
                      <X
                        className="size-4 text-destructive"
                        aria-hidden="true"
                      />
                      Ta réponse :
                    </dt>
                    <dd
                      className={cn(
                        "min-w-0 break-words font-medium",
                        item.correct ? "text-success" : "text-destructive",
                      )}
                    >
                      {choices[selectedIndex] ?? "Aucune réponse"}
                    </dd>
                  </div>
                  {!item.correct && (
                    <div className="flex items-start gap-2">
                      <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-muted-foreground">
                        <Check
                          className="size-4 text-success"
                          aria-hidden="true"
                        />
                        Bonne réponse :
                      </dt>
                      <dd className="min-w-0 break-words font-medium text-success">
                        {choices[correctIndex] ?? "—"}
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
                  <Lightbulb
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>{item.explanation}</span>
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function ExamPage() {
  const params = useParams({ strict: false });
  const lessonId = parseLessonId(params.lessonId);

  const { data: exam, isLoading } = useExam(lessonId);
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const examRef = useRef(exam);
  examRef.current = exam;
  const resultRef = useRef(result);
  resultRef.current = result;
  const submittingRef = useRef(false);

  const questions = useMemo(() => exam?.questions ?? [], [exam]);
  const answeredCount = Object.keys(answers).length;

  const doSubmit = useCallback(
    (auto: boolean) => {
      const currentSession = sessionRef.current;
      const currentExam = examRef.current;
      if (!currentSession || !currentExam || submittingRef.current) return;
      if (resultRef.current) return;
      submittingRef.current = true;
      if (auto) setAutoSubmitted(true);
      const payload = currentExam.questions.map((question) => {
        const selected = answersRef.current[question.exerciseId.toString()];
        return {
          exerciseId: question.exerciseId,
          selectedIndex: BigInt(selected ?? -1),
        };
      });
      submitExam.mutate(
        { sessionId: currentSession.sessionId, answers: payload },
        {
          onSuccess: (data) => {
            setResult(data);
            setSecondsLeft(null);
          },
          onSettled: () => {
            submittingRef.current = false;
          },
        },
      );
    },
    [submitExam],
  );

  useEffect(() => {
    if (!session || result) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current === null) return current;
        if (current <= 1) {
          window.clearInterval(interval);
          doSubmit(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session, result, doSubmit]);

  function handleStart() {
    if (!exam) return;
    startExam.mutate(exam.id, {
      onSuccess: (data) => {
        setSession(data);
        setAnswers({});
        setResult(null);
        setAutoSubmitted(false);
        setSecondsLeft(Number(data.durationSeconds));
      },
    });
  }

  function handleSelect(exerciseId: bigint, choiceIndex: number) {
    setAnswers((current) => ({
      ...current,
      [exerciseId.toString()]: choiceIndex,
    }));
  }

  const inProgress = session !== null && result === null;
  const allAnswered =
    questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Fil d'Ariane" className="mb-4">
        <Link
          to="/lecon/$lessonId"
          params={{ lessonId: lessonId?.toString() ?? "" }}
          data-ocid="exam.back_link"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-smooth hover:text-primary"
        >
          <ArrowRight className="size-4 rotate-180" aria-hidden="true" />
          Retour à la leçon
        </Link>
      </nav>

      <header className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-step-6/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-step-6">
          <ListChecks className="size-3.5" aria-hidden="true" />
          Tester
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {exam?.title ?? "Mode contrôle"}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Réponds à toutes les questions avant la fin du temps imparti. Le
          contrôle se corrige automatiquement.
        </p>
      </header>

      {isLoading ? (
        <div data-ocid="exam.loading_state" className="space-y-4">
          <Card className="rounded-2xl border-border bg-card p-6 shadow-soft">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-11 w-48 rounded-full" />
          </Card>
          {Array.from({ length: 2 }, (_, i) => `exam-skeleton-${i}`).map(
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
                </div>
              </Card>
            ),
          )}
        </div>
      ) : !exam ? (
        <Card
          data-ocid="exam.empty_state"
          className="rounded-2xl border-border bg-card p-8 text-center shadow-soft"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ListChecks className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            Aucun contrôle disponible
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Cette leçon n'a pas encore de contrôle. Tu peux t'entraîner avec les
            exercices en attendant.
          </p>
          <Button
            asChild
            type="button"
            className="mt-5 h-11 rounded-full font-bold"
          >
            <Link
              to="/exercices/$lessonId"
              params={{ lessonId: lessonId?.toString() ?? "" }}
              data-ocid="exam.empty_practice_button"
            >
              Aller aux exercices
            </Link>
          </Button>
        </Card>
      ) : result ? (
        <ResultPanel result={result} exam={exam} lessonId={lessonId} />
      ) : !inProgress ? (
        <Card
          data-ocid="exam.intro_panel"
          className="rounded-2xl border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground">
                {questions.length} question
                {questions.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Durée : {formatDuration(Number(exam.durationSeconds))}
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden="true"
              />
              Le chronomètre démarre dès que tu lances le contrôle.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden="true"
              />
              Tu peux répondre dans l'ordre que tu veux.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden="true"
              />
              À la fin du temps, le contrôle est envoyé automatiquement.
            </li>
          </ul>
          <Button
            type="button"
            onClick={handleStart}
            disabled={startExam.isPending}
            data-ocid="exam.start_button"
            className="mt-6 h-12 w-full rounded-full text-base font-bold sm:w-auto sm:px-8"
          >
            <Play className="size-5" aria-hidden="true" />
            {startExam.isPending ? "Démarrage…" : "Commencer le contrôle"}
          </Button>
          {startExam.isError && (
            <p
              data-ocid="exam.start_error"
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-destructive"
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
              Impossible de démarrer le contrôle. Réessaie.
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <div
            data-ocid="exam.status_bar"
            className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-soft backdrop-blur"
          >
            <span className="font-display text-sm font-bold text-foreground">
              {answeredCount} / {questions.length} répondu
              {answeredCount > 1 ? "es" : "e"}
            </span>
            {secondsLeft !== null && (
              <CountdownBadge secondsLeft={secondsLeft} />
            )}
          </div>

          {autoSubmitted && (
            <p
              data-ocid="exam.auto_submit_notice"
              className="flex items-center gap-2 rounded-xl bg-warning/15 px-4 py-3 text-sm font-semibold text-warning-foreground"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              Le temps est écoulé : ton contrôle a été envoyé automatiquement.
            </p>
          )}

          {questions.map((question, index) => (
            <QuestionCard
              key={question.exerciseId.toString()}
              index={index}
              total={questions.length}
              prompt={question.prompt}
              choices={question.choices}
              selected={answers[question.exerciseId.toString()] ?? null}
              onSelect={(choiceIndex) =>
                handleSelect(question.exerciseId, choiceIndex)
              }
            />
          ))}

          <div className="sticky bottom-20 z-30 md:bottom-4">
            <Button
              type="button"
              onClick={() => doSubmit(false)}
              disabled={!allAnswered || submitExam.isPending}
              data-ocid="exam.submit_button"
              className="h-12 w-full rounded-full text-base font-bold shadow-lifted"
            >
              {submitExam.isPending
                ? "Envoi en cours…"
                : allAnswered
                  ? "Terminer et voir ma note"
                  : `Réponds encore à ${questions.length - answeredCount} question${questions.length - answeredCount > 1 ? "s" : ""}`}
            </Button>
          </div>

          {submitExam.isError && (
            <p
              data-ocid="exam.submit_error"
              className="flex items-center gap-2 text-sm font-semibold text-destructive"
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
              L'envoi a échoué. Vérifie ta connexion et réessaie.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
