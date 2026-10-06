import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LessonDetail,
  LessonProgress,
  LessonSummary,
  ProfileView,
  SubjectView,
} from "@/backend";
import SubjectDetailPage from "@/pages/SubjectDetailPage";
import SubjectsPage from "@/pages/SubjectsPage";

import { createMockActor, mockUseActor, renderRoute } from "./helpers";

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
}));

const PROFILE: ProfileView = {
  level: "college",
  country: "FR",
  curriculum: "national",
  language: "fr",
  points: 0n,
  studentLevel: 1n,
  lessonsCompleted: 0n,
  exercisesCompleted: 0n,
  updatedAt: 0n,
};

const SUBJECTS: SubjectView[] = [
  {
    id: 1n,
    name: "Mathématiques",
    description: "Nombres, calcul, géométrie et raisonnement.",
    icon: "➗",
  },
  {
    id: 2n,
    name: "Français",
    description: "Lecture, grammaire, orthographe et expression écrite.",
    icon: "📖",
  },
];

const LESSONS: LessonSummary[] = [
  { id: 42n, title: "Les fractions", level: "college", subjectId: 1n },
  { id: 43n, title: "Les nombres décimaux", level: "college", subjectId: 1n },
];

const LESSON: LessonDetail = {
  id: 42n,
  subjectId: 1n,
  title: "Les fractions",
  level: "college",
  country: "FR",
  curriculum: "national",
  language: "fr",
  explanation: "Une fraction représente une part d'un tout.",
  example: "1/2 d'une pizza, c'est une moitié.",
  keyPoints: ["Numérateur", "Dénominateur"],
  memorizationSummary: "Une fraction, c'est une part d'un tout.",
  memorizationPoints: ["Le numérateur est en haut"],
};

const PROGRESS: LessonProgress = {
  lessonId: 42n,
  masteryRate: 40n,
  updatedAt: 0n,
  currentStep: "comprendre" as LessonProgress["currentStep"],
  steps: [],
};

function baseActor(overrides: Record<string, unknown> = {}) {
  return createMockActor({
    getProfile: PROFILE,
    getRewards: { badges: [], level: 1n, points: 0n },
    listSubjects: SUBJECTS,
    getProgress: {
      subjects: [{ subjectId: 1n, name: "Mathématiques", masteryRate: 80n }],
      recentActivity: [],
      level: 1n,
      totalPoints: 0n,
    },
    listLessons: LESSONS,
    getLesson: LESSON,
    getLessonProgress: PROGRESS,
    ...overrides,
  });
}

describe("SubjectsPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("lists the subjects and links each one to its course list", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/matieres", SubjectsPage);

    const math = await screen.findByTestId("subjects.item.1");
    expect(within(math).getByText("Mathématiques")).toBeInTheDocument();
    expect(screen.getByTestId("subjects.item.2")).toBeInTheDocument();

    // Each card is a link into the subject's detail route.
    expect(math).toHaveAttribute("href", "/matieres/1");
  });

  it("shows the empty state when the catalogue has no subject", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor({ listSubjects: [] })));

    renderRoute("/matieres", SubjectsPage);

    expect(
      await screen.findByTestId("subjects.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucune matière disponible")).toBeInTheDocument();
  });
});

describe("SubjectDetailPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("lists the courses of a subject and previews explanation, example and key points", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/matieres/$subjectId", SubjectDetailPage, "/matieres/1");

    // The subject header and both lessons are rendered.
    expect(
      await screen.findByRole("heading", { name: "Mathématiques" }),
    ).toBeInTheDocument();
    const first = await screen.findByTestId("subject_detail.lesson.1");
    expect(within(first).getByText("Les fractions")).toBeInTheDocument();
    expect(screen.getByTestId("subject_detail.lesson.2")).toBeInTheDocument();

    // The course preview carries the method's explanation, example and key points.
    expect(
      within(first).getByText("Une fraction représente une part d'un tout."),
    ).toBeInTheDocument();
    expect(
      within(first).getByText("1/2 d'une pizza, c'est une moitié."),
    ).toBeInTheDocument();
    expect(within(first).getByText("Numérateur")).toBeInTheDocument();

    // Each course opens its detail page.
    expect(
      within(first).getByTestId("subject_detail.open_lesson_button.1"),
    ).toHaveAttribute("href", "/lecon/42");
  });

  it("re-queries the course list when the level filter changes", async () => {
    const user = userEvent.setup();
    const actor = baseActor();
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/matieres/$subjectId", SubjectDetailPage, "/matieres/1");

    await screen.findByTestId("subject_detail.lesson.1");
    await user.click(screen.getByTestId("subject_detail.level.lycee.tab"));

    await waitFor(() => {
      expect(actor.listLessons).toHaveBeenCalledWith(1n, "lycee");
    });
  });

  it("shows the empty state when the subject has no course at this level", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor({ listLessons: [] })));

    renderRoute("/matieres/$subjectId", SubjectDetailPage, "/matieres/1");

    expect(
      await screen.findByTestId("subject_detail.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucun cours pour ce niveau")).toBeInTheDocument();
  });
});
