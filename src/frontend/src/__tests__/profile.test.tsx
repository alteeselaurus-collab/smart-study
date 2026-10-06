import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileView, ProgressOverview, RewardState } from "@/backend";
import ProfilePage from "@/pages/ProfilePage";

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
  points: 250n,
  studentLevel: 3n,
  lessonsCompleted: 4n,
  exercisesCompleted: 12n,
  updatedAt: 0n,
};

const PROGRESS: ProgressOverview = {
  totalPoints: 250n,
  level: 3n,
  subjects: [{ subjectId: 1n, name: "Mathématiques", masteryRate: 80n }],
  recentActivity: [],
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

describe("ProfilePage", () => {
  beforeEach(() => {
    useActorMock.mockReset();
  });

  it("shows the student settings, statistics and badges", async () => {
    useActorMock.mockReturnValue(mockUseActor(baseActor()));

    renderRoute("/profil", ProfilePage);

    // Settings form with the four selectors (rendered once the profile loads).
    expect(
      await screen.findByTestId("profile.settings_card"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("profile.level_select"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile.country_select")).toBeInTheDocument();
    expect(screen.getByTestId("profile.curriculum_select")).toBeInTheDocument();
    expect(screen.getByTestId("profile.language_select")).toBeInTheDocument();

    // Personal statistics.
    expect(screen.getByTestId("profile.stat.points")).toHaveTextContent("250");
    expect(screen.getByTestId("profile.stat.level")).toHaveTextContent("3");
    expect(screen.getByTestId("profile.stat.lessons")).toHaveTextContent("4");
    expect(screen.getByTestId("profile.stat.exercises")).toHaveTextContent(
      "12",
    );

    // Badge and the current settings summary.
    expect(screen.getByText("Premier pas")).toBeInTheDocument();
    expect(screen.getByTestId("profile.summary.country")).toHaveTextContent(
      "France",
    );
    expect(screen.getByTestId("profile.summary.language")).toHaveTextContent(
      "Français",
    );
  });

  it("saves the profile when a setting changes", async () => {
    const user = userEvent.setup();
    const actor = baseActor({
      updateProfile: { ...PROFILE, country: "BE" },
    });
    useActorMock.mockReturnValue(mockUseActor(actor));

    renderRoute("/profil", ProfilePage);

    const countrySelect = await screen.findByTestId("profile.country_select");
    await user.click(countrySelect);
    const belgium = await screen.findByRole("option", { name: "Belgique" });
    await user.click(belgium);

    // DIAGNOSTIC
    // eslint-disable-next-line no-console
    console.log("TRIGGER_TEXT:", countrySelect.textContent);
    // eslint-disable-next-line no-console
    console.log("OPTION_COUNT:", screen.queryAllByRole("option").length);
    // eslint-disable-next-line no-console
    console.log(
      "HINT_PRESENT:",
      screen.queryByText("Modifie un réglage pour pouvoir l'enregistrer.") !==
        null,
    );
    // eslint-disable-next-line no-console
    console.log(
      "SUMMARY_COUNTRY:",
      screen.queryByTestId("profile.summary.country")?.textContent,
    );
    // eslint-disable-next-line no-console
    console.log(
      "LEVEL_SELECT:",
      screen.queryByTestId("profile.level_select")?.textContent,
    );
    // eslint-disable-next-line no-console
    console.log(
      "CURRICULUM_SELECT:",
      screen.queryByTestId("profile.curriculum_select")?.textContent,
    );
    // eslint-disable-next-line no-console
    console.log(
      "LANGUAGE_SELECT:",
      screen.queryByTestId("profile.language_select")?.textContent,
    );

    const save = screen.getByTestId("profile.save_button");
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    await waitFor(() => {
      expect(actor.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ country: "BE" }),
      );
    });
    expect(
      await screen.findByTestId("profile.success_state"),
    ).toBeInTheDocument();
  });
});
