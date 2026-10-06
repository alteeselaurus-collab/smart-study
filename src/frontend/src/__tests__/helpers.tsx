import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

import type { backendInterface } from "@/backend";
import { Layout } from "@/components/Layout";

/**
 * A typed stand-in for the generated backend actor. Every method is a Vitest
 * mock so a test can assert the exact call the UI made, and the return type is
 * pinned to the generated `backendInterface` so a signature drift is a
 * type-check failure rather than a silent `undefined`.
 */
export type MockActor = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

export function createMockActor(
  overrides: Partial<Record<keyof backendInterface, unknown>> = {},
): MockActor {
  const actor = {
    advanceStep: vi.fn(),
    askAiTeacher: vi.fn(),
    assignCallerUserRole: vi.fn(),
    execute: vi.fn(),
    getApiDoc: vi.fn(),
    getCallerUserRole: vi.fn(),
    getCondensedPath: vi.fn(),
    getExam: vi.fn(),
    getLesson: vi.fn(),
    getLessonProgress: vi.fn(),
    getProfile: vi.fn(),
    getProgress: vi.fn(),
    getRewards: vi.fn(),
    isCallerAdmin: vi.fn(),
    listExercises: vi.fn(),
    listLessons: vi.fn(),
    listRevisions: vi.fn(),
    listSubjects: vi.fn(),
    schema: vi.fn(),
    startExam: vi.fn(),
    submitAnswer: vi.fn(),
    submitExam: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as MockActor;

  for (const [key, value] of Object.entries(overrides)) {
    (actor as Record<string, unknown>)[key] = vi.fn().mockResolvedValue(value);
  }
  return actor;
}

/**
 * The `useActor` hook from core-infrastructure is the single seam every query
 * and mutation goes through. Mocking it keeps the tests local and typed: the
 * actor is a `MockActor`, never a real canister.
 */
export function mockUseActor(actor: MockActor) {
  return { actor, isFetching: false, isAuthenticated: true };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}

/**
 * Render a single page inside a real TanStack Router (memory history) and the
 * shared `Layout`, so navigation links and the header/footer are exercised as
 * they are in the app rather than in isolation.
 */
export function renderRoute(
  path: string,
  component: () => ReactNode,
  initialEntry: string = path,
  queryClient: QueryClient = createTestQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  const rootRoute = createRootRoute({
    component: () => (
      <Layout>
        <Outlet />
      </Layout>
    ),
  });
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}
