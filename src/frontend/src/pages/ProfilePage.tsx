import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Loader2,
  PencilLine,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useProgress, useRewards } from "@/hooks/useQueries";
import { formatPoints } from "@/lib/format";
import {
  COUNTRIES,
  CURRICULA,
  LANGUAGES,
  LEVELS,
  type ProfileInput,
  type ProfileView,
} from "@/types";

type Draft = ProfileInput;

const EMPTY_DRAFT: Draft = {
  level: "",
  country: "",
  curriculum: "",
  language: "",
};

function labelFor(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * Map a stored profile value onto a known option value. The backend may store
 * a label ("France", "Programme national") while the selects use codes
 * ("FR", "national"), so match by value first, then by label, and fall back to
 * the first option when the stored value is unknown.
 */
function normalizeValue(
  options: { value: string; label: string }[],
  value: string,
): string {
  if (options.some((option) => option.value === value)) return value;
  const byLabel = options.find((option) => option.label === value);
  if (byLabel) return byLabel.value;
  return options[0]?.value ?? "";
}

function normalizeDraft(profile: ProfileView): Draft {
  return {
    level: normalizeValue(LEVELS, profile.level),
    country: normalizeValue(COUNTRIES, profile.country),
    curriculum: normalizeValue(CURRICULA, profile.curriculum),
    language: normalizeValue(LANGUAGES, profile.language),
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  ocid,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-extrabold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">
          {label}
        </p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  const ids = Array.from({ length: 4 }, (_, i) => `profile-skeleton-${i}`);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ids.map((id) => (
        <div key={id} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: progress } = useProgress();
  const { data: rewards } = useRewards();
  const updateProfile = useUpdateProfile();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saved, setSaved] = useState(false);
  const initialized = useRef(false);

  // One-time initialization of the editable draft from the loaded profile.
  // Stored values are normalized against the option lists so a select always
  // matches a real option and the dirty check compares like with like. The ref
  // guard keeps a refetch or a new object reference from overwriting the
  // student's in-progress edits.
  useEffect(() => {
    if (!profile || initialized.current) return;
    initialized.current = true;
    setDraft(normalizeDraft(profile));
  }, [profile]);

  const normalizedProfile = profile ? normalizeDraft(profile) : null;

  const isDirty =
    !!normalizedProfile &&
    (draft.level !== normalizedProfile.level ||
      draft.country !== normalizedProfile.country ||
      draft.curriculum !== normalizedProfile.curriculum ||
      draft.language !== normalizedProfile.language);

  const canSave =
    isDirty &&
    draft.level !== "" &&
    draft.country !== "" &&
    draft.curriculum !== "" &&
    draft.language !== "" &&
    !updateProfile.isPending;

  /**
   * Radix Select can emit an empty string when its controlled value transitions
   * from the placeholder ("") to a real value. Ignore those so a spurious ""
   * can never wipe a field the student already has.
   */
  function handleChange(field: keyof Draft) {
    return (value: string) => {
      if (!value) return;
      setDraft((current) => ({ ...current, [field]: value }));
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    setSaved(false);
    updateProfile.mutate(draft, {
      onSuccess: () => setSaved(true),
    });
  }

  const points = profile?.points ?? rewards?.points ?? 0n;
  const studentLevel = profile?.studentLevel ?? rewards?.level ?? 0n;
  const lessonsCompleted = profile?.lessonsCompleted ?? 0n;
  const exercisesCompleted = profile?.exercisesCompleted ?? 0n;
  const badges = rewards?.badges ?? [];
  const subjects = progress?.subjects ?? [];

  return (
    <div
      data-ocid="profile.page"
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
    >
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Mon espace
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Profil élève
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Choisis ton niveau, ton pays, ton programme et ta langue. Tes leçons
          et tes exercices s'adaptent automatiquement à tes réglages.
        </p>
      </header>

      {isError ? (
        <Card data-ocid="profile.error_state" className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-display text-lg font-bold">
              Impossible de charger ton profil
            </p>
            <p className="text-sm text-muted-foreground">
              Vérifie ta connexion puis réessaie.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="profile.retry_button"
              onClick={() => void refetch()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Settings form */}
          <Card
            data-ocid="profile.settings_card"
            className="rounded-2xl shadow-soft"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl font-extrabold">
                <PencilLine
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                Mes réglages
              </CardTitle>
              <CardDescription>
                Ces choix définissent le contenu que tu vois dans l'application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ProfileSkeleton />
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="profile-level">Niveau scolaire</Label>
                    <Select
                      value={draft.level}
                      onValueChange={handleChange("level")}
                    >
                      <SelectTrigger
                        id="profile-level"
                        data-ocid="profile.level_select"
                        className="h-11 w-full rounded-lg"
                      >
                        <SelectValue placeholder="Choisir un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-country">Pays</Label>
                    <Select
                      value={draft.country}
                      onValueChange={handleChange("country")}
                    >
                      <SelectTrigger
                        id="profile-country"
                        data-ocid="profile.country_select"
                        className="h-11 w-full rounded-lg"
                      >
                        <SelectValue placeholder="Choisir un pays" />
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

                  <div className="space-y-2">
                    <Label htmlFor="profile-curriculum">
                      Programme scolaire
                    </Label>
                    <Select
                      value={draft.curriculum}
                      onValueChange={handleChange("curriculum")}
                    >
                      <SelectTrigger
                        id="profile-curriculum"
                        data-ocid="profile.curriculum_select"
                        className="h-11 w-full rounded-lg"
                      >
                        <SelectValue placeholder="Choisir un programme" />
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

                  <div className="space-y-2">
                    <Label htmlFor="profile-language">
                      Langue d'interface et de contenu
                    </Label>
                    <Select
                      value={draft.language}
                      onValueChange={handleChange("language")}
                    >
                      <SelectTrigger
                        id="profile-language"
                        data-ocid="profile.language_select"
                        className="h-11 w-full rounded-lg"
                      >
                        <SelectValue placeholder="Choisir une langue" />
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

                  <div className="sm:col-span-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="submit"
                        data-ocid="profile.save_button"
                        disabled={!canSave}
                        className="h-11 rounded-full px-6 font-semibold"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                            Enregistrement…
                          </>
                        ) : (
                          "Enregistrer mes réglages"
                        )}
                      </Button>
                      {saved && !updateProfile.isPending && (
                        <span
                          data-ocid="profile.success_state"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"
                        >
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Réglages enregistrés
                        </span>
                      )}
                    </div>
                    {updateProfile.isError && (
                      <p
                        data-ocid="profile.error_state"
                        className="mt-3 text-sm font-medium text-destructive"
                      >
                        L'enregistrement a échoué. Réessaie dans un instant.
                      </p>
                    )}
                    {!isDirty && !saved && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Modifie un réglage pour pouvoir l'enregistrer.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Statistics + badges */}
          <div className="space-y-6">
            <Card
              data-ocid="profile.stats_card"
              className="rounded-2xl shadow-soft"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <Target className="size-5 text-primary" aria-hidden="true" />
                  Mes statistiques
                </CardTitle>
                <CardDescription>
                  Ta progression personnelle sur SMART STUDY.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from(
                      { length: 4 },
                      (_, i) => `stat-skeleton-${i}`,
                    ).map((id) => (
                      <Skeleton key={id} className="h-20 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                      icon={Sparkles}
                      label="Points gagnés"
                      value={formatPoints(points)}
                      hint="Récompenses cumulées"
                      ocid="profile.stat.points"
                    />
                    <StatCard
                      icon={GraduationCap}
                      label="Niveau élève"
                      value={String(studentLevel)}
                      hint="Ton rang actuel"
                      ocid="profile.stat.level"
                    />
                    <StatCard
                      icon={BookOpenCheck}
                      label="Leçons terminées"
                      value={String(lessonsCompleted)}
                      hint="Parcours complétés"
                      ocid="profile.stat.lessons"
                    />
                    <StatCard
                      icon={Trophy}
                      label="Exercices réussis"
                      value={String(exercisesCompleted)}
                      hint="Entraînements validés"
                      ocid="profile.stat.exercises"
                    />
                  </div>
                )}

                {subjects.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Maîtrise par matière
                    </h3>
                    <ul className="space-y-3">
                      {subjects.map((subject) => (
                        <li key={subject.subjectId.toString()}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-semibold text-foreground">
                              {subject.name}
                            </span>
                            <span className="shrink-0 font-mono text-xs font-bold text-muted-foreground">
                              {Number(subject.masteryRate)} %
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-primary"
                              style={{
                                width: `${Math.min(100, Math.max(0, Number(subject.masteryRate)))}%`,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              data-ocid="profile.badges_card"
              className="rounded-2xl shadow-soft"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-xl font-extrabold">
                  <Award className="size-5 text-accent" aria-hidden="true" />
                  Mes badges
                </CardTitle>
                <CardDescription>
                  Les récompenses que tu as débloquées.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-wrap gap-3">
                    {Array.from(
                      { length: 3 },
                      (_, i) => `badge-skeleton-${i}`,
                    ).map((id) => (
                      <Skeleton key={id} className="h-24 w-32 rounded-2xl" />
                    ))}
                  </div>
                ) : badges.length === 0 ? (
                  <div
                    data-ocid="profile.badges_empty_state"
                    className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center"
                  >
                    <Award
                      className="size-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="font-semibold text-foreground">
                      Aucun badge pour l'instant
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Termine des leçons et des exercices pour débloquer tes
                      premiers badges.
                    </p>
                  </div>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {badges.map((badge) => (
                      <li
                        key={badge.id}
                        data-ocid="profile.badge_item"
                        className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-3"
                      >
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-xl"
                          aria-hidden="true"
                        >
                          {badge.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {badge.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {profile && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  data-ocid="profile.summary.level"
                  className="rounded-full px-3 py-1"
                >
                  {labelFor(LEVELS, profile.level)}
                </Badge>
                <Badge
                  variant="secondary"
                  data-ocid="profile.summary.country"
                  className="rounded-full px-3 py-1"
                >
                  {labelFor(COUNTRIES, profile.country)}
                </Badge>
                <Badge
                  variant="secondary"
                  data-ocid="profile.summary.curriculum"
                  className="rounded-full px-3 py-1"
                >
                  {labelFor(CURRICULA, profile.curriculum)}
                </Badge>
                <Badge
                  variant="secondary"
                  data-ocid="profile.summary.language"
                  className="rounded-full px-3 py-1"
                >
                  {labelFor(LANGUAGES, profile.language)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
