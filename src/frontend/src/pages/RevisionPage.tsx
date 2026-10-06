import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  Flame,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLesson, useLessonProgress, useRevisions } from "@/hooks/useQueries";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RevisionItem } from "@/types";

type PriorityTier = {
  label: string;
  /** Tailwind classes for the priority chip. */
  chip: string;
  /** Tailwind classes for the left accent bar. */
  bar: string;
  icon: typeof Flame;
};

/** Map a numeric backend priority (higher = more urgent) to a visual tier. */
function priorityTier(priority: bigint): PriorityTier {
  const value = Number(priority);
  if (value >= 3) {
    return {
      label: "Priorité haute",
      chip: "border-transparent bg-destructive/12 text-destructive",
      bar: "bg-destructive",
      icon: Flame,
    };
  }
  if (value === 2) {
    return {
      label: "Priorité moyenne",
      chip: "border-transparent bg-accent/20 text-accent-foreground",
      bar: "bg-accent",
      icon: AlertTriangle,
    };
  }
  return {
    label: "Priorité basse",
    chip: "border-transparent bg-secondary text-secondary-foreground",
    bar: "bg-step-4",
    icon: CalendarClock,
  };
}

/** Pick an icon that reflects why the lesson needs review. */
function reasonIcon(reason: string): typeof Flame {
  const normalized = reason.toLowerCase();
  if (normalized.includes("erreur")) return AlertTriangle;
  if (normalized.includes("temps") || normalized.includes("jour"))
    return CalendarClock;
  return Brain;
}

function RevisionSkeleton() {
  return (
    <div className="space-y-3" data-ocid="revisions.loading_state">
      {Array.from({ length: 4 }, (_, i) => `revision-skeleton-${i}`).map(
        (id) => (
          <Card key={id} className="rounded-2xl">
            <CardContent className="flex items-center gap-4">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

function RevisionRow({
  item,
  selected,
  onSelect,
}: {
  item: RevisionItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const tier = priorityTier(item.priority);
  const TierIcon = tier.icon;
  const ReasonIcon = reasonIcon(item.reason);
  const { data: progress } = useLessonProgress(item.lessonId);
  const mastery = progress?.masteryRate ?? 0n;
  const masteryValue = Math.min(100, Math.max(0, Number(mastery)));

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl transition-smooth",
        selected
          ? "border-primary/50 shadow-lifted"
          : "hover:border-primary/30 hover:shadow-soft",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1.5", tier.bar)}
      />
      <CardContent className="flex flex-col gap-4 pl-7 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Afficher la fiche de mémorisation de ${item.title}`}
          data-ocid={`revisions.item.${Number(item.lessonId)}`}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn(
              "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl",
              tier.chip,
            )}
          >
            <TierIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate font-display text-base font-bold text-foreground">
                {item.title}
              </span>
              <Badge className={cn("rounded-full", tier.chip)}>
                {tier.label}
              </Badge>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpenCheck className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Matière #{Number(item.subjectId)}
              </span>
            </span>
            <span className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <ReasonIcon
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0">{item.reason}</span>
            </span>
          </span>
        </button>

        <div className="flex shrink-0 flex-col gap-3 sm:w-44">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Maîtrise</span>
              <span className="font-mono text-foreground">
                {formatPercent(mastery)}
              </span>
            </div>
            <Progress
              value={masteryValue}
              aria-label={`Taux de maîtrise : ${formatPercent(mastery)}`}
            />
          </div>
          <Button
            asChild
            size="sm"
            className="w-full rounded-full"
            data-ocid={`revisions.revise_button.${Number(item.lessonId)}`}
          >
            <Link
              to="/lecon/$lessonId"
              params={{ lessonId: item.lessonId.toString() }}
            >
              Réviser
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MemorizationPanel({ lessonId }: { lessonId: bigint | undefined }) {
  const { data: lesson, isLoading } = useLesson(lessonId);

  if (lessonId === undefined) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Lightbulb className="size-6" aria-hidden="true" />
          </span>
          <p className="font-display text-base font-bold text-foreground">
            Choisis une leçon à réviser
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Sélectionne une leçon dans la liste pour afficher sa fiche de
            mémorisation et retenir l'essentiel avant de t'entraîner.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl" data-ocid="memorization.loading_state">
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (!lesson) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Impossible de charger la fiche de cette leçon.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-2xl border-primary/20 bg-gradient-subtle"
      data-ocid="memorization.panel"
    >
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Brain className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fiche de mémorisation
            </p>
            <h2 className="font-display text-lg font-extrabold leading-tight text-foreground">
              {lesson.title}
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground">
          {lesson.memorizationSummary}
        </p>

        {lesson.memorizationPoints.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Points essentiels à retenir
            </p>
            <ul className="space-y-2">
              {lesson.memorizationPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          asChild
          className="w-full rounded-full"
          data-ocid="memorization.practice_button"
        >
          <Link
            to="/lecon/$lessonId"
            params={{ lessonId: lesson.id.toString() }}
          >
            Réviser cette leçon
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RevisionPage() {
  const { data: revisions, isLoading, isError, refetch } = useRevisions();
  const [selectedId, setSelectedId] = useState<bigint | undefined>(undefined);

  const ordered = useMemo(
    () =>
      [...(revisions ?? [])].sort(
        (a, b) => Number(b.priority) - Number(a.priority),
      ),
    [revisions],
  );

  const activeId = selectedId ?? ordered[0]?.lessonId;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      data-ocid="revisions.page"
    >
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Révisions intelligentes
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          À revoir en priorité
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Ton programme s'adapte à tes erreurs et au temps écoulé depuis ta
          dernière révision. Commence par le haut de la liste.
        </p>
      </header>

      {isLoading && <RevisionSkeleton />}

      {isError && (
        <Card
          className="rounded-2xl border-destructive/30"
          data-ocid="revisions.error_state"
        >
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
              <AlertTriangle className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-base font-bold text-foreground">
              Impossible de charger tes révisions
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Vérifie ta connexion puis réessaie.
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void refetch()}
              data-ocid="revisions.retry_button"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && ordered.length === 0 && (
        <Card
          className="rounded-2xl border-dashed"
          data-ocid="revisions.empty_state"
        >
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-success/12 text-success">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-bold text-foreground">
              Rien à réviser pour le moment
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Bravo ! Toutes tes leçons sont à jour. Explore une nouvelle
              matière pour continuer à progresser.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/matieres" data-ocid="revisions.explore_button">
                Explorer les matières
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && ordered.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section aria-label="Leçons à réviser" className="space-y-3">
            {ordered.map((item) => (
              <RevisionRow
                key={item.lessonId.toString()}
                item={item}
                selected={item.lessonId === activeId}
                onSelect={() => setSelectedId(item.lessonId)}
              />
            ))}
          </section>

          <aside className="lg:sticky lg:top-24">
            <MemorizationPanel lessonId={activeId} />
          </aside>
        </div>
      )}
    </div>
  );
}
