import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { Layout } from "@/components/Layout";
import ExamPage from "@/pages/ExamPage";
import HomePage from "@/pages/HomePage";
import LessonPage from "@/pages/LessonPage";
import PracticePage from "@/pages/PracticePage";
import ProfilePage from "@/pages/ProfilePage";
import ProgressPage from "@/pages/ProgressPage";
import RevisionPage from "@/pages/RevisionPage";
import SubjectDetailPage from "@/pages/SubjectDetailPage";
import SubjectsPage from "@/pages/SubjectsPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matieres",
  component: SubjectsPage,
});

const subjectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/matieres/$subjectId",
  component: SubjectDetailPage,
});

const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lecon/$lessonId",
  validateSearch: (search: Record<string, unknown>): { duration?: number } => {
    const raw = Number(search.duration);
    return raw === 5 || raw === 10 || raw === 20 ? { duration: raw } : {};
  },
  component: LessonPage,
});

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercices/$lessonId",
  component: PracticePage,
});

const examRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/controle/$lessonId",
  component: ExamPage,
});

const revisionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/revisions",
  component: RevisionPage,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progression",
  component: ProgressPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profil",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  subjectsRoute,
  subjectDetailRoute,
  lessonRoute,
  practiceRoute,
  examRoute,
  revisionsRoute,
  progressRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
