import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  AnswerResult,
  ExerciseView,
  LessonDetail,
  ProfileView,
} from "@/backend";
import PracticePage from "@/pages/PracticePage";

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

const EXERCISES: ExerciseView[] = [
  {
    id: 7n,
    lessonId: 42n,
    prompt: "Quelle fraction représente une moitié ?",
    choices: ["1/2", "1/3", "2/3"],
  },
];

const CORRECTION: AnswerResult = {
  correct: false,
  correctIndex: 0n,
  explanation: "Une moitié, c'est 1 part sur 2, donc 1/2.",
};

function baseActor(overrides: Record<string, unknown> = {}) {
  return createMockActor({
    getProfile: PROFILE,
    getRewards: { badges: [], level: 1n, points: 0n },
    getLesson: LESSON,
    listExercises: EXERCISES,
    ...overrides,
  });
}

describe("PracticePage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("accepts an answer and shows the explained correction", async () => {
    const user = userEvent.setup();
    const actor = baseActor({ submitAnswer: CORRECTION });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/exercices/$lessonId", PracticePage, "/exercices/42");

    const exercise = await screen.findByTestId("practice.exercise.1");
    expect(
      within(exercise).getByText("Quelle fraction représente une moitié ?"),
    ).toBeInTheDocument();

    // Pick the wrong choice, then submit.
    await user.click(screen.getByTestId("practice.choice.1.2"));
    await user.click(screen.getByTestId("practice.submit_button.1"));

    await waitFor(() => {
      expect(actor.submitAnswer).toHaveBeenCalledWith(7n, 1n);
    });

    const correction = await screen.findByTestId("practice.correction.1");
    expect(
      within(correction).getByText("Pas tout à fait…"),
    ).toBeInTheDocument();
    // The correction names the right answer and explains it.
    expect(within(correction).getByText("1/2")).toBeInTheDocument();
    expect(
      within(correction).getByText("Une moitié, c'est 1 part sur 2, donc 1/2."),
    ).toBeInTheDocument();
  });

  it("shows the empty state when the lesson has no exercise", async () => {
    useActorMock.mockReturnValue(
      mockUseActor(baseActor({ listExercises: [] })),
    );

    renderRoute("/exercices/$lessonId", PracticePage, "/exercices/42");

    expect(
      await screen.findByTestId("practice.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aucun exercice pour cette leçon"),
    ).toBeInTheDocument();
  });
});
