import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LessonDetail,
  LessonProgress,
  ProfileView,
  RevisionItem,
} from "@/backend";
import RevisionPage from "@/pages/RevisionPage";

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

const REVISIONS: RevisionItem[] = [
  {
    lessonId: 42n,
    title: "Les fractions",
    subjectId: 1n,
    priority: 3n,
    reason: "Des erreurs récentes",
  },
  {
    lessonId: 43n,
    title: "Les nombres décimaux",
    subjectId: 1n,
    priority: 1n,
    reason: "Pas révisé depuis 10 jours",
  },
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
  keyPoints: ["Numérateur"],
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
    listRevisions: REVISIONS,
    getLesson: LESSON,
    getLessonProgress: PROGRESS,
    ...overrides,
  });
}

describe("RevisionPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("lists lessons to revise by priority and shows the memorization sheet", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/revisions", RevisionPage);

    // Both lessons are listed, highest priority first.
    const high = await screen.findByTestId("revisions.item.42");
    const low = screen.getByTestId("revisions.item.43");
    expect(within(high).getByText("Les fractions")).toBeInTheDocument();
    expect(within(high).getByText("Priorité haute")).toBeInTheDocument();
    expect(within(low).getByText("Priorité basse")).toBeInTheDocument();

    // The first lesson's memorization sheet is shown by default.
    const sheet = await screen.findByTestId("memorization.panel");
    expect(
      within(sheet).getByText("Une fraction, c'est une part d'un tout."),
    ).toBeInTheDocument();
    expect(
      within(sheet).getByText("Le numérateur est en haut"),
    ).toBeInTheDocument();
  });

  it("shows the empty state when nothing needs revision", async () => {
    useActorMock.mockReturnValue(
      mockUseActor(baseActor({ listRevisions: [] })),
    );

    renderRoute("/revisions", RevisionPage);

    expect(
      await screen.findByTestId("revisions.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Rien à réviser pour le moment"),
    ).toBeInTheDocument();
  });
});
