import { LearningStep } from "@/backend";
import type {
  ActivityEntry,
  AiExplanation,
  AnswerResult,
  Badge,
  CondensedPath,
  ExamResult,
  ExamSession,
  ExamView,
  ExerciseView,
  LessonDetail,
  LessonProgress,
  LessonSummary,
  ProfileInput,
  ProfileView,
  ProgressOverview,
  RevisionItem,
  RewardState,
  StepState,
  SubjectView,
} from "@/backend";

export { LearningStep };
export type {
  ActivityEntry,
  AiExplanation,
  AnswerResult,
  Badge,
  CondensedPath,
  ExamResult,
  ExamSession,
  ExamView,
  ExerciseView,
  LessonDetail,
  LessonProgress,
  LessonSummary,
  ProfileInput,
  ProfileView,
  ProgressOverview,
  RevisionItem,
  RewardState,
  StepState,
  SubjectView,
};

/** Ordered 7-step learning method: Comprendre → … → Maîtriser. */
export const LEARNING_STEPS: LearningStep[] = [
  LearningStep.comprendre,
  LearningStep.exemple,
  LearningStep.entrainer,
  LearningStep.corriger,
  LearningStep.memoriser,
  LearningStep.tester,
  LearningStep.maitriser,
];

/** French label for each learning step. */
export const STEP_LABELS: Record<LearningStep, string> = {
  [LearningStep.comprendre]: "Comprendre",
  [LearningStep.exemple]: "Exemple",
  [LearningStep.entrainer]: "S'entraîner",
  [LearningStep.corriger]: "Corriger",
  [LearningStep.memoriser]: "Mémoriser",
  [LearningStep.tester]: "Tester",
  [LearningStep.maitriser]: "Maîtriser",
};

/** Short helper text shown under each step node. */
export const STEP_HINTS: Record<LearningStep, string> = {
  [LearningStep.comprendre]: "La leçon expliquée simplement",
  [LearningStep.exemple]: "Un exemple concret pas à pas",
  [LearningStep.entrainer]: "Des exercices pour t'entraîner",
  [LearningStep.corriger]: "Comprends tes erreurs",
  [LearningStep.memoriser]: "Retiens l'essentiel",
  [LearningStep.tester]: "Un contrôle en temps limité",
  [LearningStep.maitriser]: "Tu maîtrises la leçon",
};

/** Tailwind class for the hue of each step (step-1 … step-7 tokens). */
export const STEP_COLOR_CLASS: Record<LearningStep, string> = {
  [LearningStep.comprendre]: "bg-step-1",
  [LearningStep.exemple]: "bg-step-2",
  [LearningStep.entrainer]: "bg-step-3",
  [LearningStep.corriger]: "bg-step-4",
  [LearningStep.memoriser]: "bg-step-5",
  [LearningStep.tester]: "bg-step-6",
  [LearningStep.maitriser]: "bg-step-7",
};

/** Text color class matching each step hue. */
export const STEP_TEXT_CLASS: Record<LearningStep, string> = {
  [LearningStep.comprendre]: "text-step-1",
  [LearningStep.exemple]: "text-step-2",
  [LearningStep.entrainer]: "text-step-3",
  [LearningStep.corriger]: "text-step-4",
  [LearningStep.memoriser]: "text-step-5",
  [LearningStep.tester]: "text-step-6",
  [LearningStep.maitriser]: "text-step-7",
};

/** Border color class matching each step hue. */
export const STEP_BORDER_CLASS: Record<LearningStep, string> = {
  [LearningStep.comprendre]: "border-step-1",
  [LearningStep.exemple]: "border-step-2",
  [LearningStep.entrainer]: "border-step-3",
  [LearningStep.corriger]: "border-step-4",
  [LearningStep.memoriser]: "border-step-5",
  [LearningStep.tester]: "border-step-6",
  [LearningStep.maitriser]: "border-step-7",
};

/** Index of a step in the canonical order (0-based). */
export function stepIndex(step: LearningStep): number {
  return LEARNING_STEPS.indexOf(step);
}

/** Country options for the profile selector. */
export const COUNTRIES: { value: string; label: string }[] = [
  { value: "FR", label: "France" },
  { value: "BE", label: "Belgique" },
  { value: "CH", label: "Suisse" },
  { value: "CA", label: "Canada" },
  { value: "SN", label: "Sénégal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "CM", label: "Cameroun" },
  { value: "MA", label: "Maroc" },
  { value: "DZ", label: "Algérie" },
  { value: "TN", label: "Tunisie" },
  { value: "US", label: "États-Unis" },
  { value: "GB", label: "Royaume-Uni" },
];

/** Curriculum options for the profile selector. */
export const CURRICULA: { value: string; label: string }[] = [
  { value: "national", label: "Programme national" },
  { value: "francais", label: "Programme français" },
  { value: "ib", label: "Baccalauréat international (IB)" },
  { value: "cambridge", label: "Cambridge International" },
  { value: "anglophone", label: "Programme anglophone" },
];

/** Interface and content language options. */
export const LANGUAGES: { value: string; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "es", label: "Español" },
];

/** School level options. */
export const LEVELS: { value: string; label: string }[] = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
  { value: "superieur", label: "Études supérieures" },
];
