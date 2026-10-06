import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningStep } from "@/backend";
import type { ProfileView, SubjectView } from "@/backend";
import HomePage from "@/pages/HomePage";

import { createMockActor, mockUseActor, renderRoute } from "./helpers";

const useActorMock = vi.hoisted(() => vi.fn());
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: useActorMock,
}));

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

describe("HomePage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("renders the slogan, the 7-step method and the subject selection", async () => {
    const actor = createMockActor({
      listSubjects: SUBJECTS,
      getProfile: PROFILE,
      getProgress: {
        subjects: [],
        recentActivity: [],
        level: 1n,
        totalPoints: 0n,
      },
      getRewards: { badges: [], level: 1n, points: 0n },
      listLessons: [],
      getCondensedPath: null,
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/", HomePage);

    // Slogan is the accepted home requirement. It also appears in the header
    // brand and the empty-state hint, so assert the hero copy specifically.
    const hero = await screen.findByTestId("home.hero.section");
    expect(
      within(hero).getByText("Apprendre. Comprendre. Maîtriser."),
    ).toBeInTheDocument();

    // The 7-step method is visible with every step label.
    const stepList = screen.getByTestId("step_path.list");
    expect(stepList).toBeInTheDocument();
    for (const label of [
      "Comprendre",
      "Exemple",
      "S'entraîner",
      "Corriger",
      "Mémoriser",
      "Tester",
      "Maîtriser",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }

    // Subject selection renders the subjects returned by the backend. Scope to
    // the subjects section: "Français" is also the language selector's value.
    const subjectsSection = await screen.findByTestId("home.subjects.section");
    expect(
      within(subjectsSection).getByText("Mathématiques"),
    ).toBeInTheDocument();
    expect(within(subjectsSection).getByText("Français")).toBeInTheDocument();
    expect(screen.getByTestId("home.subject_card.1")).toBeInTheDocument();
  });

  it("shows the empty state when no subject is available", async () => {
    const actor = createMockActor({
      listSubjects: [],
      getProfile: PROFILE,
      getProgress: {
        subjects: [],
        recentActivity: [],
        level: 1n,
        totalPoints: 0n,
      },
      getRewards: { badges: [], level: 1n, points: 0n },
      listLessons: [],
      getCondensedPath: null,
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/", HomePage);

    expect(
      await screen.findByTestId("home.subjects.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucune matière disponible")).toBeInTheDocument();
  });

  it("requests a condensed path for the chosen duration and navigates to the lesson", async () => {
    const user = userEvent.setup();
    const actor = createMockActor({
      listSubjects: SUBJECTS,
      getProfile: PROFILE,
      getProgress: {
        subjects: [],
        recentActivity: [],
        level: 1n,
        totalPoints: 0n,
      },
      getRewards: { badges: [], level: 1n, points: 0n },
      listLessons: [
        { id: 42n, title: "Les fractions", level: "college", subjectId: 1n },
      ],
      getCondensedPath: {
        lessonId: 42n,
        durationMinutes: 5n,
        steps: [
          LearningStep.comprendre,
          LearningStep.memoriser,
          LearningStep.tester,
        ],
        summary: "Parcours condensé de 5 minutes.",
      },
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/", HomePage);

    const fiveMinuteButton = await screen.findByTestId(
      "home.duration.1.button",
    );
    await user.click(fiveMinuteButton);

    // The chosen duration is forwarded to the backend as a bigint.
    await waitFor(() => {
      expect(actor.getCondensedPath).toHaveBeenCalledWith(42n, 5n);
    });
  });

  it("updates the profile when the language selector changes", async () => {
    const user = userEvent.setup();
    const actor = createMockActor({
      listSubjects: SUBJECTS,
      getProfile: PROFILE,
      getProgress: {
        subjects: [],
        recentActivity: [],
        level: 1n,
        totalPoints: 0n,
      },
      getRewards: { badges: [], level: 1n, points: 0n },
      listLessons: [],
      getCondensedPath: null,
      updateProfile: { ...PROFILE, language: "en" },
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/", HomePage);

    const languageSelect = await screen.findByTestId(
      "home.profile.language.select",
    );
    await user.click(languageSelect);
    const englishOption = await screen.findByRole("option", {
      name: "English",
    });
    await user.click(englishOption);

    await waitFor(() => {
      expect(actor.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ language: "en" }),
      );
    });
  });
});
