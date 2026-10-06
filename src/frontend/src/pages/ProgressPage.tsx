import {
  Award,
  BookOpenCheck,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { ActivityEntry, Badge, SubjectMastery } from "@/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress, useRewards } from "@/hooks/useQueries";
import { formatPercent, formatPoints, formatRelative } from "@/lib/format";

/** Points needed to reach the next level (matches backend levelForPoints = points / 100 + 1). */
const POINTS_PER_LEVEL = 100n;

const RING_HUES = [
  "var(--step-1)",
  "var(--step-2)",
  "var(--step-3)",
  "var(--step-4)",
  "var(--step-5)",
  "var(--step-6)",
  "var(--step-7)",
];

const CHART_HUES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function clampPercent(value: bigint): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** Circular mastery ring drawn with SVG, animated via the ring-fill keyframe. */
function MasteryRing({
  value,
  hue,
  label,
}: {
  value: number;
  hue: string;
  label: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex size-24 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 80 80"
        className="size-24 -rotate-90"
        role="img"
        aria-label={`${label} : ${value} % de maîtrise`}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="oklch(var(--muted))"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={hue}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-ring-fill"
          style={
            {
              "--ring-circumference": `${circumference}`,
              "--ring-offset": `${offset}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="absolute font-mono text-lg font-bold text-foreground">
        {value}%
      </span>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" data-ocid="progress.loading_state">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => `subject-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-36 w-full rounded-2xl" />
          ),
        )}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function SubjectMasteryCard({
  subject,
  index,
}: {
  subject: SubjectMastery;
  index: number;
}) {
  const value = clampPercent(subject.masteryRate);
  const hue = RING_HUES[index % RING_HUES.length];
  return (
    <Card
      data-ocid={`progress.subject_card.${index + 1}`}
      className="animate-fade-in-up rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lifted"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <MasteryRing value={value} hue={hue} label={subject.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-foreground">
            {subject.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {value >= 80
              ? "Maîtrisé — continue comme ça !"
              : value >= 50
                ? "En bonne voie"
                : "À renforcer"}
          </p>
          <p className="mt-2 font-mono text-sm font-bold text-foreground">
            {formatPercent(subject.masteryRate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  entry,
  index,
}: { entry: ActivityEntry; index: number }) {
  return (
    <li
      data-ocid={`progress.activity_item.${index + 1}`}
      className="flex items-start gap-3 py-3"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpenCheck className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.kind}
        </p>
        <p className="truncate text-sm text-muted-foreground">{entry.detail}</p>
      </div>
      <span className="shrink-0 whitespace-nowrap font-mono text-xs text-muted-foreground">
        {formatRelative(entry.at)}
      </span>
    </li>
  );
}

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  return (
    <Card
      data-ocid={`progress.badge_card.${index + 1}`}
      className="animate-pop-in rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lifted"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
          <span aria-hidden="true">{badge.icon}</span>
        </span>
        <p className="font-display text-base font-bold text-foreground">
          {badge.name}
        </p>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: rewards, isLoading: rewardsLoading } = useRewards();

  const isLoading = progressLoading || rewardsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Ma progression
        </h1>
        <OverviewSkeleton />
      </div>
    );
  }

  const totalPoints = progress?.totalPoints ?? rewards?.points ?? 0n;
  const level = progress?.level ?? rewards?.level ?? 0n;
  const subjects = progress?.subjects ?? [];
  const recentActivity = progress?.recentActivity ?? [];
  const badges = rewards?.badges ?? [];

  const pointsIntoLevel = totalPoints % POINTS_PER_LEVEL;
  const levelProgress = Number((pointsIntoLevel * 100n) / POINTS_PER_LEVEL);
  const pointsToNext = POINTS_PER_LEVEL - pointsIntoLevel;

  const chartData = subjects.map((subject, index) => ({
    name: subject.name,
    mastery: clampPercent(subject.masteryRate),
    fill: CHART_HUES[index % CHART_HUES.length],
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Révisions intelligentes
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Ma progression
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Suis ta maîtrise par matière, gagne des points et débloque des badges
          au fil de tes révisions.
        </p>
      </header>

      {/* Overview header */}
      <section
        data-ocid="progress.overview_section"
        className="animate-fade-in-up overflow-hidden rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-lifted md:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <TrendingUp className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-foreground/80">
                Points totaux
              </p>
              <p
                data-ocid="progress.total_points"
                className="font-mono text-4xl font-extrabold leading-none"
              >
                {formatPoints(totalPoints)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Star className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-foreground/80">
                Niveau actuel
              </p>
              <p
                data-ocid="progress.level"
                className="font-mono text-4xl font-extrabold leading-none"
              >
                {Number(level)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mastery per subject */}
      <section data-ocid="progress.mastery_section" className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Maîtrise par matière
          </h2>
        </div>

        {subjects.length === 0 ? (
          <Card
            data-ocid="progress.mastery_empty_state"
            className="rounded-2xl border border-dashed border-border bg-card shadow-soft"
          >
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <BookOpenCheck className="size-7" aria-hidden="true" />
              </span>
              <p className="font-display text-lg font-bold">
                Aucune matière suivie pour l'instant
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Commence une leçon pour voir ta maîtrise progresser matière par
                matière.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject, index) => (
                <SubjectMasteryCard
                  key={subject.subjectId.toString()}
                  subject={subject}
                  index={index}
                />
              ))}
            </div>

            {chartData.length > 1 && (
              <Card
                data-ocid="progress.mastery_chart"
                className="mt-6 rounded-2xl border border-border bg-card shadow-soft"
              >
                <CardHeader>
                  <CardTitle className="font-display text-lg font-bold">
                    Vue d'ensemble
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                      >
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={(v: number) => `${v}%`}
                          tick={{ fontSize: 12 }}
                          stroke="oklch(var(--muted-foreground))"
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={96}
                          tick={{ fontSize: 12 }}
                          stroke="oklch(var(--muted-foreground))"
                        />
                        <Bar
                          dataKey="mastery"
                          radius={[0, 8, 8, 0]}
                          barSize={18}
                        >
                          {chartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>

      {/* Recent activity */}
      <section data-ocid="progress.activity_section" className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Activité récente
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <Card
            data-ocid="progress.activity_empty_state"
            className="rounded-2xl border border-dashed border-border bg-card shadow-soft"
          >
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Sparkles className="size-7" aria-hidden="true" />
              </span>
              <p className="font-display text-lg font-bold">
                Pas encore d'activité
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Tes leçons, exercices et contrôles récents apparaîtront ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-border bg-card shadow-soft">
            <CardContent className="p-2 sm:p-4">
              <ul className="divide-y divide-border">
                {recentActivity.map((entry, index) => (
                  <ActivityRow
                    key={`${entry.lessonId.toString()}-${entry.at.toString()}-${index}`}
                    entry={entry}
                    index={index}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Rewards */}
      <section data-ocid="progress.rewards_section" className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Award className="size-5 text-accent" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Récompenses
          </h2>
        </div>

        <Card className="rounded-2xl border border-border bg-card shadow-soft">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-foreground">
                  <Sparkles className="size-6 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Points disponibles
                  </p>
                  <p
                    data-ocid="progress.rewards_points"
                    className="font-mono text-2xl font-extrabold text-foreground"
                  >
                    {formatPoints(rewards?.points ?? totalPoints)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Star className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Niveau
                  </p>
                  <p
                    data-ocid="progress.rewards_level"
                    className="font-mono text-2xl font-extrabold text-foreground"
                  >
                    {Number(level)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">
                  Prochain niveau
                </span>
                <span className="font-mono text-muted-foreground">
                  {formatPoints(pointsIntoLevel)} /{" "}
                  {formatPoints(POINTS_PER_LEVEL)}
                </span>
              </div>
              <Progress
                value={levelProgress}
                data-ocid="progress.level_progress"
                aria-label={`Progression vers le niveau ${Number(level) + 1}`}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Encore {formatPoints(pointsToNext)} points pour atteindre le
                niveau {Number(level) + 1}.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h3 className="mb-3 font-display text-lg font-bold tracking-tight">
            Badges débloqués
          </h3>
          {badges.length === 0 ? (
            <Card
              data-ocid="progress.badges_empty_state"
              className="rounded-2xl border border-dashed border-border bg-card shadow-soft"
            >
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Award className="size-7" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-bold">
                  Aucun badge pour l'instant
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Réussis des activités pour débloquer tes premiers badges.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {badges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
