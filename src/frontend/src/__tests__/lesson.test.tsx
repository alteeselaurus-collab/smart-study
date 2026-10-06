import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningStep } from "@/backend";
import type {
  AiExplanation,
  CondensedPath,
  LessonDetail,
  LessonProgress,
  ProfileView,
} from "@/backend";
import LessonPage from "@/pages/LessonPage";

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
  memorizationPoints: ["Le numérateur est en haut", "Le dénominateur en bas"],
};

const PROGRESS: LessonProgress = {
  lessonId: 42n,
  masteryRate: 40n,
  updatedAt: 0n,
  currentStep: LearningStep.comprendre,
  steps: [
    { step: LearningStep.comprendre, completed: false },
    { step: LearningStep.exemple, completed: false },
  ],
};

const CONDENSED: CondensedPath = {
  lessonId: 42n,
  durationMinutes: 10n,
  steps: [LearningStep.comprendre, LearningStep.memoriser, LearningStep.tester],
  summary: "Parcours condensé de 10 minutes.",
};

const AI_ANSWER: AiExplanation = {
  question: "Pourquoi le dénominateur ne peut-il pas être zéro ?",
  answer: "Parce qu'on ne peut pas diviser un tout en zéro part.",
  level: "college",
};

function baseActor(overrides: Record<string, unknown> = {}) {
  return createMockActor({
    getProfile: PROFILE,
    getRewards: { badges: [], level: 1n, points: 0n },
    getLesson: LESSON,
    getLessonProgress: PROGRESS,
    getCondensedPath: CONDENSED,
    ...overrides,
  });
}

describe("LessonPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("shows the lesson content and the 7-step path with the current step", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/lecon/$lessonId", LessonPage, "/lecon/42");

    expect(await screen.findByText("Les fractions")).toBeInTheDocument();
    expect(
      screen.getByText("Une fraction représente une part d'un tout."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("1/2 d'une pizza, c'est une moitié."),
    ).toBeInTheDocument();
    expect(screen.getByText("Numérateur")).toBeInTheDocument();

    // The 7-step rail is present with every step label.
    const stepList = screen.getByTestId("step_path.list");
    for (const label of [
      "Comprendre",
      "Exemple",
      "S'entraîner",
      "Corriger",
      "Mémoriser",
      "Tester",
      "Maîtriser",
    ]) {
      expect(within(stepList).getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("Étape 1 / 7")).toBeInTheDocument();
  });

  it("advances to the next step through the backend", async () => {
    const user = userEvent.setup();
    const actor = baseActor({
      advanceStep: { ...PROGRESS, currentStep: LearningStep.exemple },
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/lecon/$lessonId", LessonPage, "/lecon/42");

    const advance = await screen.findByTestId("lesson.advance_button");
    await user.click(advance);

    await waitFor(() => {
      expect(actor.advanceStep).toHaveBeenCalledWith(42n);
    });
  });

  it("asks the AI teacher and renders the simple explanation", async () => {
    const user = userEvent.setup();
    const actor = baseActor({ askAiTeacher: AI_ANSWER });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/lecon/$lessonId", LessonPage, "/lecon/42");

    const input = await screen.findByTestId("lesson.ai_teacher.input");
    await user.type(
      input,
      "Pourquoi le dénominateur ne peut-il pas être zéro ?",
    );
    await user.click(screen.getByTestId("lesson.ai_teacher.submit_button"));

    await waitFor(() => {
      expect(actor.askAiTeacher).toHaveBeenCalledWith(
        42n,
        "Pourquoi le dénominateur ne peut-il pas être zéro ?",
      );
    });
    const answer = await screen.findByTestId("lesson.ai_teacher.answer");
    expect(
      within(answer).getByText(
        "Parce qu'on ne peut pas diviser un tout en zéro part.",
      ),
    ).toBeInTheDocument();
    expect(within(answer).getByText("Niveau college")).toBeInTheDocument();
  });

  it("requests a condensed path for the chosen duration", async () => {
    const user = userEvent.setup();
    const actor = baseActor();
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/lecon/$lessonId", LessonPage, "/lecon/42");

    const twenty = await screen.findByTestId("lesson.duration.20");
    await user.click(twenty);

    await waitFor(() => {
      expect(actor.getCondensedPath).toHaveBeenCalledWith(42n, 20n);
    });
    expect(
      await screen.findByTestId("lesson.condensed.result"),
    ).toBeInTheDocument();
  });
});
