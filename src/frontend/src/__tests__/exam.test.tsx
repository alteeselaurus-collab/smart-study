import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ExamResult, ExamSession, ExamView, ProfileView } from "@/backend";
import ExamPage from "@/pages/ExamPage";

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

const EXAM: ExamView = {
  id: 5n,
  lessonId: 42n,
  title: "Contrôle : Les fractions",
  durationSeconds: 600n,
  questions: [
    {
      exerciseId: 7n,
      prompt: "Quelle fraction représente une moitié ?",
      choices: ["1/2", "1/3", "2/3"],
    },
  ],
};

const SESSION: ExamSession = {
  sessionId: 99n,
  examId: 5n,
  lessonId: 42n,
  startedAt: 0n,
  submitted: false,
  durationSeconds: 600n,
};

const RESULT: ExamResult = {
  examId: 5n,
  sessionId: 99n,
  score: 1n,
  total: 1n,
  results: [
    {
      exerciseId: 7n,
      prompt: "Quelle fraction représente une moitié ?",
      selectedIndex: 0n,
      correctIndex: 0n,
      correct: true,
      explanation: "Une moitié, c'est 1 part sur 2, donc 1/2.",
    },
  ],
};

function baseActor(overrides: Record<string, unknown> = {}) {
  return createMockActor({
    getProfile: PROFILE,
    getRewards: { badges: [], level: 1n, points: 0n },
    getExam: EXAM,
    startExam: SESSION,
    submitExam: RESULT,
    ...overrides,
  });
}

describe("ExamPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("runs a timed exam and shows the final score with a detailed correction", async () => {
    const user = userEvent.setup();
    const actor = baseActor();
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/controle/$lessonId", ExamPage, "/controle/42");

    // Intro panel, then start the timed session.
    expect(await screen.findByTestId("exam.intro_panel")).toBeInTheDocument();
    await user.click(screen.getByTestId("exam.start_button"));

    await waitFor(() => {
      expect(actor.startExam).toHaveBeenCalledWith(5n);
    });

    // The countdown is visible once the session starts.
    expect(await screen.findByTestId("exam.timer")).toBeInTheDocument();

    // Answer the single question, then submit.
    await user.click(screen.getByTestId("exam.choice.1.1"));
    await user.click(screen.getByTestId("exam.submit_button"));

    await waitFor(() => {
      expect(actor.submitExam).toHaveBeenCalledWith(99n, [
        { exerciseId: 7n, selectedIndex: 0n },
      ]);
    });

    // Final score and detailed correction.
    expect(await screen.findByTestId("exam.final_score")).toHaveTextContent(
      "1 / 1",
    );
    const correction = await screen.findByTestId("exam.correction.1");
    expect(within(correction).getByText("Correct")).toBeInTheDocument();
    expect(
      within(correction).getByText("Une moitié, c'est 1 part sur 2, donc 1/2."),
    ).toBeInTheDocument();
  });

  it("shows the empty state when the lesson has no exam", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor({ getExam: null })));

    renderRoute("/controle/$lessonId", ExamPage, "/controle/42");

    expect(await screen.findByTestId("exam.empty_state")).toBeInTheDocument();
    expect(screen.getByText("Aucun contrôle disponible")).toBeInTheDocument();
  });
});
