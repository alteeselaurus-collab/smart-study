import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileView, ProgressOverview, RewardState } from "@/backend";
import ProgressPage from "@/pages/ProgressPage";

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

const PROGRESS: ProgressOverview = {
  totalPoints: 250n,
  level: 3n,
  subjects: [
    { subjectId: 1n, name: "Mathématiques", masteryRate: 80n },
    { subjectId: 2n, name: "Français", masteryRate: 45n },
  ],
  recentActivity: [
    {
      lessonId: 42n,
      kind: "Exercice",
      detail: "Les fractions",
      at: BigInt(Date.now() - 5 * 60_000) * 1_000_000n,
    },
  ],
};

const REWARDS: RewardState = {
  points: 250n,
  level: 3n,
  badges: [
    {
      id: "first-step",
      icon: "🌟",
      name: "Premier pas",
      description: "Première leçon",
    },
  ],
};

function baseActor(overrides: Record<string, unknown> = {}) {
  return createMockActor({
    getProfile: PROFILE,
    getProgress: PROGRESS,
    getRewards: REWARDS,
    ...overrides,
  });
}

describe("ProgressPage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("shows mastery per subject, recent activity and rewards", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/progression", ProgressPage);

    // Points and level overview.
    expect(
      await screen.findByTestId("progress.total_points"),
    ).toHaveTextContent("250");
    expect(screen.getByTestId("progress.level")).toHaveTextContent("3");

    // Mastery per subject.
    const math = await screen.findByTestId("progress.subject_card.1");
    expect(within(math).getByText("Mathématiques")).toBeInTheDocument();
    expect(within(math).getByText("80 %")).toBeInTheDocument();
    expect(screen.getByTestId("progress.subject_card.2")).toBeInTheDocument();

    // Recent activity.
    const activity = screen.getByTestId("progress.activity_item.1");
    expect(within(activity).getByText("Exercice")).toBeInTheDocument();
    expect(within(activity).getByText("Les fractions")).toBeInTheDocument();

    // Badge unlocked.
    expect(screen.getByTestId("progress.badge_card.1")).toBeInTheDocument();
    expect(screen.getByText("Premier pas")).toBeInTheDocument();
  });

  it("shows empty states when there is no mastery, activity or badge", async () => {
    useActorMock.mockReturnValue(
      mockUseActor(
        baseActor({
          getProgress: {
            totalPoints: 0n,
            level: 1n,
            subjects: [],
            recentActivity: [],
          },
          getRewards: { points: 0n, level: 1n, badges: [] },
        }),
      ),
    );

    renderRoute("/progression", ProgressPage);

    expect(
      await screen.findByTestId("progress.mastery_empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("progress.activity_empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("progress.badges_empty_state"),
    ).toBeInTheDocument();
  });
});
