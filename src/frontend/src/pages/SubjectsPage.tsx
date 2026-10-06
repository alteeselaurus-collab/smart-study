import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { useProgress, useSubjects } from "@/hooks/useQueries";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LEVELS } from "@/types";

function levelLabel(value: string): string {
  return LEVELS.find((l) => l.value === value)?.label ?? value;
}

function MasteryBar({ rate }: { rate: bigint }) {
  const pct = Math.max(0, Math.min(100, Number(rate)));
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        tabIndex={0}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Taux de maîtrise"
      >
        <div
          className="h-full rounded-full bg-gradient-primary transition-smooth"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-xs font-bold text-primary">
        {formatPercent(rate)}
      </span>
    </div>
  );
}

function SubjectCardSkeleton() {
  return (
    <div
      data-ocid="subjects.loading_state"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="mt-5 h-2 w-full rounded-full" />
    </div>
  );
}

export default function SubjectsPage() {
  const { data: profile } = useProfile();
  const { data: subjects, isLoading, isError, refetch } = useSubjects();
  const { data: progress } = useProgress();
  const [level, setLevel] = useState<string | null>(null);

  const activeLevel = level ?? profile?.level ?? "college";

  const masteryBySubject = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const s of progress?.subjects ?? []) {
      map.set(s.subjectId.toString(), s.masteryRate);
    }
    return map;
  }, [progress]);

  const list = subjects ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <BookOpen className="size-4" aria-hidden="true" />
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choisis ta matière
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Sélectionne une matière pour découvrir ses cours et progresser pas à
            pas selon la méthode en 7 étapes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
          <GraduationCap className="size-5 text-accent" aria-hidden="true" />
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ton niveau
            </p>
            <p className="font-display text-sm font-bold">
              {levelLabel(activeLevel)}
            </p>
          </div>
        </div>
      </header>

      <fieldset
        data-ocid="subjects.level_filter"
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Filtrer par niveau"
      >
        {LEVELS.map((l) => {
          const active = l.value === activeLevel;
          return (
            <button
              key={l.value}
              type="button"
              data-ocid={`subjects.level.${l.value}.tab`}
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `subject-skeleton-${i}`).map(
            (id) => (
              <SubjectCardSkeleton key={id} />
            ),
          )}
        </div>
      ) : isError ? (
        <div
          data-ocid="subjects.error_state"
          className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <p className="font-display text-lg font-bold text-foreground">
            Impossible de charger les matières
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifie ta connexion puis réessaie.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-full"
            data-ocid="subjects.retry_button"
            onClick={() => void refetch()}
          >
            Réessayer
          </Button>
        </div>
      ) : list.length === 0 ? (
        <div
          data-ocid="subjects.empty_state"
          className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <BookOpen className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-bold">
            Aucune matière disponible
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les matières apparaîtront ici dès qu'elles seront ajoutées.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((subject, index) => {
            const mastery = masteryBySubject.get(subject.id.toString());
            return (
              <li key={subject.id.toString()}>
                <Link
                  to="/matieres/$subjectId"
                  params={{ subjectId: subject.id.toString() }}
                  data-ocid={`subjects.item.${index + 1}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl"
                      aria-hidden="true"
                    >
                      {subject.icon || "📘"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-display text-lg font-bold tracking-tight">
                        {subject.name}
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {subject.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Maîtrise
                    </p>
                    {mastery === undefined ? (
                      <p className="text-sm text-muted-foreground">
                        Pas encore commencé
                      </p>
                    ) : (
                      <MasteryBar rate={mastery} />
                    )}
                  </div>

                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Voir les cours
                    <ChevronRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
