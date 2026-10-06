import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileView } from "@/backend";
import HomePage from "@/pages/HomePage";

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

function baseActor() {
  return createMockActor({
    getProfile: PROFILE,
    getRewards: { badges: [], level: 1n, points: 0n },
    listSubjects: [],
    getProgress: {
      subjects: [],
      recentActivity: [],
      level: 1n,
      totalPoints: 0n,
    },
    listLessons: [],
    getCondensedPath: null,
  });
}

describe("Layout navigation", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("exposes the five main destinations and marks the current one active", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/", HomePage);

    const nav = await screen.findByRole("navigation", {
      name: "Navigation principale",
    });
    for (const label of [
      "Accueil",
      "Matières",
      "Révisions",
      "Progression",
      "Profil",
    ]) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }

    // The home link is the active destination on the default route.
    expect(screen.getByTestId("nav.home.link")).toHaveAttribute(
      "data-status",
      "active",
    );
    expect(screen.getByTestId("nav.subjects.link")).not.toHaveAttribute(
      "data-status",
      "active",
    );
  });
});
