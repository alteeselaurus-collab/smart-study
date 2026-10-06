import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Typed access to the SMART STUDY backend actor.
 *
 * `useActor(createActor)` must be called at the top level of a React hook —
 * never inside a query or mutation callback. Every backend read/write in the
 * app goes through the hooks in `@/hooks/useQueries` and `@/hooks/useProfile`,
 * which build on this hook.
 */
export function useBackendActor() {
  return useActor(createActor);
}

export { createActor };
