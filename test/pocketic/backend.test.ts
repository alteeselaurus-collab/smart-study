import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers the empty-state reads instead of trapping", async () => {
  // A fresh caller has no profile and no progress yet.
  await expect(actor.getProfile()).resolves.toEqual([]);
  await expect(actor.getLessonProgress(1n)).resolves.toEqual([]);
  await expect(actor.listRevisions()).resolves.toEqual([]);

  // The seeded catalogue is present and non-empty.
  const subjects = await actor.listSubjects();
  expect(subjects.length).toBeGreaterThan(0);
  expect(subjects.map((s) => s.name)).toContain("Mathématiques");
});

it("reads a seeded lesson with its method content", async () => {
  const lesson = await actor.getLesson(1n);
  expect(lesson).toHaveLength(1);
  const detail = lesson[0];
  expect(detail.title).toBe("Les fractions");
  expect(detail.explanation.length).toBeGreaterThan(0);
  expect(detail.example.length).toBeGreaterThan(0);
  expect(detail.keyPoints.length).toBeGreaterThan(0);
  expect(detail.memorizationSummary.length).toBeGreaterThan(0);
});

it("round-trips a profile through the real canister", async () => {
  const updated = await actor.updateProfile({
    level: "lycee",
    country: "BE",
    curriculum: "national",
    language: "fr",
  });
  expect(updated).toMatchObject({
    level: "lycee",
    country: "BE",
    curriculum: "national",
    language: "fr",
  });

  const read = await actor.getProfile();
  expect(read).toHaveLength(1);
  expect(read[0]).toMatchObject({ level: "lycee", country: "BE" });
});

it("advances the 7-step path and reports mastery", async () => {
  // Candid variants decode as `{ <variantName>: null }`, not as a bare string.
  const first = await actor.advanceStep(1n);
  expect(first.currentStep).toEqual({ exemple: null });
  expect(first.masteryRate).toBeGreaterThan(0n);

  const second = await actor.advanceStep(1n);
  expect(second.currentStep).toEqual({ entrainer: null });
  expect(second.masteryRate).toBeGreaterThan(first.masteryRate);
});

it("grades an exercise answer with an explained correction", async () => {
  // Exercise 1's correct index is 0 ("3/4").
  const wrong = await actor.submitAnswer(1n, 1n);
  expect(wrong.correct).toBe(false);
  expect(wrong.correctIndex).toBe(0n);
  expect(wrong.explanation.length).toBeGreaterThan(0);

  const right = await actor.submitAnswer(1n, 0n);
  expect(right.correct).toBe(true);
  expect(right.correctIndex).toBe(0n);
});

it("runs a timed exam and returns a score with a detailed correction", async () => {
  const exam = await actor.getExam(1n);
  expect(exam).toHaveLength(1);
  expect(exam[0].questions.length).toBeGreaterThan(0);

  const session = await actor.startExam(1n);
  expect(session.submitted).toBe(false);
  expect(session.durationSeconds).toBeGreaterThan(0n);

  const result = await actor.submitExam(session.sessionId, [
    { exerciseId: 1n, selectedIndex: 0n },
    { exerciseId: 2n, selectedIndex: 1n },
  ]);
  expect(result.total).toBe(2n);
  expect(result.score).toBe(2n);
  expect(result.results).toHaveLength(2);
  expect(result.results.every((r) => r.correct)).toBe(true);
  expect(result.results[0].explanation.length).toBeGreaterThan(0);
});

it("builds a condensed path whose steps match the chosen duration", async () => {
  const short = await actor.getCondensedPath(1n, 5n);
  expect(short.durationMinutes).toBe(5n);
  expect(short.steps).toHaveLength(3);

  const long = await actor.getCondensedPath(1n, 20n);
  expect(long.durationMinutes).toBe(20n);
  expect(long.steps).toHaveLength(7);
});

it("awards points, level and badges after a successful activity", async () => {
  const before = await actor.getRewards();
  await actor.submitAnswer(1n, 0n);
  const after = await actor.getRewards();
  expect(after.points).toBeGreaterThan(before.points);
  expect(after.badges.map((b) => b.id)).toContain("premier-pas");
});

it("keeps one caller's profile and progress out of another's", async () => {
  const { createIdentity } = await import("@dfinity/pic");
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  actor.setIdentity(alice);
  await actor.updateProfile({
    level: "primaire",
    country: "SN",
    curriculum: "francais",
    language: "fr",
  });
  await actor.advanceStep(1n);

  actor.setIdentity(bob);
  // Bob never wrote a profile or progress, so he sees the empty state.
  await expect(actor.getProfile()).resolves.toEqual([]);
  await expect(actor.getLessonProgress(1n)).resolves.toEqual([]);
});
