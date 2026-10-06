import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Lightbulb,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import {
  useLesson,
  useLessonProgress,
  useLessons,
  useSubjects,
} from "@/hooks/useQueries";
import { formatPercent } from "@/lib/format";
import {
  createTranslator,
  normalizeLanguage,
  normalizeLevel,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LEVELS } from "@/types";

function levelLabel(value: string): string {
  return LEVELS.find((l) => l.value === value)?.label ?? value;
}

function LessonPreview({
  lessonId,
  t,
}: {
  lessonId: bigint;
  t: (key: string) => string;
}) {
  const { data: lesson, isLoading } = useLesson(lessonId);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }
  if (!lesson) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {t("subject.explanation")}
        </p>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
          {lesson.explanation}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
          <Lightbulb className="size-3.5" aria-hidden="true" />
          {t("subject.example")}
        </p>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
          {lesson.example}
        </p>
      </div>
      {lesson.keyPoints.length > 0 && (
        <div className="rounded-xl border border-border bg-background/60 p-3 sm:col-span-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="size-3.5" aria-hidden="true" />
            {t("subject.keyPoints")}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {lesson.keyPoints.slice(0, 4).map((point) => (
              <li
                key={point}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LessonRow({
  lessonId,
  title,
  level,
  index,
  t,
}: {
  lessonId: bigint;
  title: string;
  level: string;
  index: number;
  t: (key: string) => string;
}) {
  const { data: progress } = useLessonProgress(lessonId);
  const mastery = progress?.masteryRate;

  return (
    <li
      data-ocid={`subject_detail.lesson.${index + 1}`}
      className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-smooth hover:border-primary/40 hover:shadow-lifted sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm font-extrabold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 font-display text-base font-bold tracking-tight sm:text-lg">
              {title}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {levelLabel(level)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("subject.mastery")}
            </span>
            {mastery === undefined ? (
              <span className="text-xs text-muted-foreground">
                {t("subject.notStarted")}
              </span>
            ) : (
              <span className="font-mono text-xs font-bold text-primary">
                {formatPercent(mastery)}
              </span>
            )}
          </div>

          <LessonPreview lessonId={lessonId} t={t} />

          <div className="mt-4">
            <Button
              asChild
              size="sm"
              className="rounded-full"
              data-ocid={`subject_detail.open_lesson_button.${index + 1}`}
            >
              <Link
                to="/lecon/$lessonId"
                params={{ lessonId: lessonId.toString() }}
              >
                {t("subject.openLesson")}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function SubjectDetailPage() {
  const { subjectId } = useParams({ from: "/matieres/$subjectId" });
  const parsedId = useMemo(() => {
    try {
      return BigInt(subjectId);
    } catch {
      return undefined;
    }
  }, [subjectId]);

  const { data: profile } = useProfile();
  const { data: subjects } = useSubjects();
  const [level, setLevel] = useState<string | null>(null);
  const t = createTranslator(normalizeLanguage(profile?.language));
  const activeLevel = level ?? normalizeLevel(profile?.level);

  const subject = subjects?.find((s) => s.id.toString() === subjectId);
  const {
    data: lessons,
    isLoading,
    isError,
    refetch,
  } = useLessons(parsedId, activeLevel);

  const list = lessons ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/matieres"
        data-ocid="subject_detail.back_link"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("subject.all")}
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-3xl"
          aria-hidden="true"
        >
          {subject?.icon || "📘"}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {subject?.name ?? "Cours de la matière"}
          </h1>
          {subject?.description && (
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              {subject.description}
            </p>
          )}
        </div>
      </header>

      <fieldset
        data-ocid="subject_detail.level_filter"
        className="mt-6 flex flex-wrap gap-2"
        aria-label={t("subject.filterLevel")}
      >
        {LEVELS.map((l) => {
          const active = l.value === activeLevel;
          return (
            <button
              key={l.value}
              type="button"
              data-ocid={`subject_detail.level.${l.value}.tab`}
              aria-pressed={active}
              onClick={() => setLevel(l.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          );
        })}
      </fieldset>

      {isLoading ? (
        <div
          data-ocid="subject_detail.loading_state"
          className="mt-8 space-y-4"
        >
          {Array.from({ length: 3 }, (_, i) => `lesson-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            ),
          )}
        </div>
      ) : isError ? (
        <div
          data-ocid="subject_detail.error_state"
          className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <p className="font-display text-lg font-bold">{t("subject.error")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subject.errorHint")}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full"
            data-ocid="subject_detail.retry_button"
            onClick={() => void refetch()}
          >
            {t("subject.retry")}
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div
          data-ocid="subject_detail.empty_state"
          className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-bold">
            {t("subject.empty")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subject.emptyHint")}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((lesson, index) => (
            <LessonRow
              key={lesson.id.toString()}
              lessonId={lesson.id}
              title={lesson.title}
              level={lesson.level}
              index={index}
              t={t}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
