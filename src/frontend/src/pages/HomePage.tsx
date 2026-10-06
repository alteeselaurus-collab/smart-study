import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  GraduationCap,
  Loader2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StepPath } from "@/components/StepPath";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import {
  useCondensedPath,
  useLessons,
  useProgress,
  useRewards,
  useSubjects,
} from "@/hooks/useQueries";
import { formatPoints } from "@/lib/format";
import {
  createTranslator,
  normalizeLanguage,
  normalizeLevel,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  CURRICULA,
  LANGUAGES,
  LearningStep,
  type ProfileInput,
  type SubjectView,
} from "@/types";

const DURATIONS: { minutes: bigint; label: string; hint: string }[] = [
  { minutes: 5n, label: "5 min", hint: "L'essentiel" },
  { minutes: 10n, label: "10 min", hint: "Un bon rythme" },
  { minutes: 20n, label: "20 min", hint: "En profondeur" },
];

const RING_COLORS = [
  "text-step-1",
  "text-step-2",
  "text-step-3",
  "text-step-4",
  "text-step-5",
  "text-step-6",
  "text-step-7",
];

function ProgressRing({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-12 -rotate-90", className)}
      role="img"
      aria-label={`Maîtrise ${clamped} %`}
    >
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        strokeWidth="5"
        className="stroke-border"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="stroke-current transition-smooth"
      />
    </svg>
  );
}

function SubjectCard({
  subject,
  mastery,
  index,
  continueLabel,
}: {
  subject: SubjectView;
  mastery: number;
  index: number;
  continueLabel: string;
}) {
  const ringColor = RING_COLORS[index % RING_COLORS.length];
  return (
    <Link
      to="/matieres/$subjectId"
      params={{ subjectId: subject.id.toString() }}
      data-ocid={`home.subject_card.${index + 1}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xl"
        >
          {subject.icon}
        </span>
        <div className={cn("relative", ringColor)}>
          <ProgressRing value={mastery} />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-foreground">
            {mastery}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-bold text-foreground">
          {subject.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {subject.description}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
        {continueLabel}
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function SubjectSkeleton() {
  return (
    <div
      data-ocid="home.subjects.loading_state"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="size-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

function ProfileSelector() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [draft, setDraft] = useState<ProfileInput | null>(null);
  const t = createTranslator(normalizeLanguage(profile?.language));

  useEffect(() => {
    if (isLoading || draft) return;
    setDraft({
      country: profile?.country ?? COUNTRIES[0]?.value ?? "FR",
      curriculum:
        profile?.curriculum ?? CURRICULA[0]?.value ?? "Programme national",
      language: profile?.language ?? LANGUAGES[0]?.value ?? "fr",
      level: normalizeLevel(profile?.level),
    });
  }, [profile, draft, isLoading]);

  function patch(partial: Partial<ProfileInput>) {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...partial };
      updateProfile.mutate(next);
      return next;
    });
  }

  if (isLoading || !draft) {
    return (
      <div
        data-ocid="home.profile.loading_state"
        className="grid gap-3 sm:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, i) => `profile-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ),
        )}
      </div>
    );
  }

  return (
    <div data-ocid="home.profile.panel" className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          {t("profile.country")}
        </span>
        <Select
          value={draft.country}
          onValueChange={(value) => patch({ country: value })}
        >
          <SelectTrigger
            aria-label={t("profile.country")}
            data-ocid="home.profile.country.select"
            className="w-full rounded-xl"
          >
            <SelectValue placeholder={t("profile.chooseCountry")} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          {t("profile.curriculum")}
        </span>
        <Select
          value={draft.curriculum}
          onValueChange={(value) => patch({ curriculum: value })}
        >
          <SelectTrigger
            aria-label={t("profile.curriculum")}
            data-ocid="home.profile.curriculum.select"
            className="w-full rounded-xl"
          >
            <SelectValue placeholder={t("profile.chooseCurriculum")} />
          </SelectTrigger>
          <SelectContent>
            {CURRICULA.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          {t("profile.language")}
        </span>
        <Select
          value={draft.language}
          onValueChange={(value) => patch({ language: value })}
        >
          <SelectTrigger
            aria-label={t("profile.language")}
            data-ocid="home.profile.language.select"
            className="w-full rounded-xl"
          >
            <SelectValue placeholder={t("profile.chooseLanguage")} />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function RewardsSummary() {
  const { data: rewards, isLoading } = useRewards();
  const { data: profile } = useProfile();
  const t = createTranslator(normalizeLanguage(profile?.language));

  if (isLoading) {
    return (
      <div
        data-ocid="home.rewards.loading_state"
        className="grid grid-cols-3 gap-3"
      >
        {Array.from({ length: 3 }, (_, i) => `reward-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-20 w-full rounded-2xl" />
          ),
        )}
      </div>
    );
  }

  const points = rewards?.points ?? 0n;
  const level = rewards?.level ?? 0n;
  const badges = rewards?.badges ?? [];

  return (
    <div data-ocid="home.rewards.panel" className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center shadow-soft">
          <Sparkles className="size-5 text-accent" aria-hidden="true" />
          <span className="font-mono text-lg font-bold text-foreground">
            {formatPoints(points)}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t("rewards.points")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center shadow-soft">
          <Trophy className="size-5 text-primary" aria-hidden="true" />
          <span className="font-mono text-lg font-bold text-foreground">
            {Number(level)}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t("rewards.level")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center shadow-soft">
          <Star className="size-5 text-step-6" aria-hidden="true" />
          <span className="font-mono text-lg font-bold text-foreground">
            {badges.length}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t("rewards.badges")}
          </span>
        </div>
      </div>

      {badges.length > 0 ? (
        <ul
          data-ocid="home.rewards.badges.list"
          className="flex flex-wrap gap-2"
        >
          {badges.slice(0, 4).map((badge, index) => (
            <li
              key={badge.id}
              data-ocid={`home.rewards.badge.${index + 1}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground"
              title={badge.description}
            >
              <span aria-hidden="true">{badge.icon}</span>
              {badge.name}
            </li>
          ))}
        </ul>
      ) : (
        <p
          data-ocid="home.rewards.empty_state"
          className="text-sm text-muted-foreground"
        >
          {t("rewards.empty")}
        </p>
      )}
    </div>
  );
}

function DurationChips() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<bigint | null>(null);
  const { data: subjects } = useSubjects();
  const { data: profile } = useProfile();
  const t = createTranslator(normalizeLanguage(profile?.language));
  const activeLevel = normalizeLevel(profile?.level);
  const firstSubjectId = subjects?.[0]?.id;
  const { data: lessons } = useLessons(firstSubjectId, activeLevel);
  const firstLessonId = lessons?.[0]?.id;
  const { data: path, isFetching } = useCondensedPath(
    selected !== null ? firstLessonId : undefined,
    selected ?? 5n,
  );

  useEffect(() => {
    if (selected !== null && path) {
      void navigate({
        to: "/lecon/$lessonId",
        params: { lessonId: path.lessonId.toString() },
        search: { duration: Number(selected) },
      });
    }
  }, [selected, path, navigate]);

  return (
    <div data-ocid="home.duration.panel" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-display text-sm font-bold text-foreground">
          {t("home.duration.title")}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {DURATIONS.map((duration, index) => {
          const active = selected === duration.minutes;
          const highlighted = index === DURATIONS.length - 1;
          return (
            <button
              key={duration.label}
              type="button"
              data-ocid={`home.duration.${index + 1}.button`}
              onClick={() => setSelected(duration.minutes)}
              disabled={isFetching && active}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl border px-3 py-3 text-center transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70",
                highlighted
                  ? "border-transparent bg-gradient-accent text-accent-foreground shadow-soft"
                  : "border-border bg-secondary text-secondary-foreground hover:border-primary/40",
                active &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <span className="flex items-center gap-1.5 font-display text-base font-extrabold">
                {active && isFetching ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {duration.label}
              </span>
              <span className="text-[11px] font-medium opacity-80">
                {duration.hint}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t("home.duration.hint")}</p>
    </div>
  );
}

export default function HomePage() {
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: progress } = useProgress();
  const { data: profile } = useProfile();
  const t = createTranslator(normalizeLanguage(profile?.language));

  const masteryBySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of progress?.subjects ?? []) {
      map.set(entry.subjectId.toString(), Number(entry.masteryRate));
    }
    return map;
  }, [progress]);

  const greetingName = profile?.level
    ? `${t("home.level")} ${profile.level}`
    : t("home.student");

  return (
    <div
      data-ocid="home.page"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10"
    >
      {/* Hero */}
      <section
        data-ocid="home.hero.section"
        className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-lifted sm:p-8"
      >
        <div className="relative z-10 flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <GraduationCap className="size-3.5" aria-hidden="true" />
            {greetingName}
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {t("home.greeting")}
          </h1>
          <p className="max-w-xl text-sm text-primary-foreground/85 sm:text-base">
            {t("home.slogan")}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-full bg-white text-primary hover:bg-white/90"
            >
              <Link to="/matieres" data-ocid="home.hero.primary_button">
                <BookOpen className="size-4" aria-hidden="true" />
                {t("home.explore")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            >
              <Link to="/revisions" data-ocid="home.hero.secondary_button">
                <Flame className="size-4" aria-hidden="true" />
                {t("home.revise")}
              </Link>
            </Button>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
        />
      </section>

      {/* Duration chips */}
      <section data-ocid="home.duration.section" className="mt-6">
        <DurationChips />
      </section>

      {/* 7-step learning path */}
      <section
        data-ocid="home.step_path.section"
        className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold text-foreground">
              {t("home.method.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("home.method.subtitle")}
            </p>
          </div>
        </div>
        <StepPath currentStep={LearningStep.comprendre} variant="full" />
      </section>

      {/* Subjects */}
      <section data-ocid="home.subjects.section" className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {t("home.subjects.title")}
          </h2>
          <Link
            to="/matieres"
            data-ocid="home.subjects.link"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t("home.subjects.seeAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {subjectsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => `subject-skeleton-${i}`).map(
              (id) => (
                <SubjectSkeleton key={id} />
              ),
            )}
          </div>
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id.toString()}
                subject={subject}
                mastery={masteryBySubject.get(subject.id.toString()) ?? 0}
                index={index}
                continueLabel={t("home.continue")}
              />
            ))}
          </div>
        ) : (
          <div
            data-ocid="home.subjects.empty_state"
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center"
          >
            <BookOpen
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-display text-base font-bold text-foreground">
              {t("home.subjects.empty")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("home.subjects.emptyHint")}
            </p>
          </div>
        )}
      </section>

      {/* Rewards */}
      <section data-ocid="home.rewards.section" className="mt-6">
        <h2 className="mb-3 font-display text-lg font-extrabold text-foreground">
          {t("home.progress.title")}
        </h2>
        <RewardsSummary />
      </section>

      {/* Profile selector */}
      <section
        data-ocid="home.profile.section"
        className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
      >
        <div className="mb-4">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {t("home.program.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("home.program.subtitle")}
          </p>
        </div>
        <ProfileSelector />
      </section>
    </div>
  );
}
