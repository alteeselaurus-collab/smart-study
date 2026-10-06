import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** List every subject available in the catalogue. */
export function useSubjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

/** List lessons for a subject at a given school level. */
export function useLessons(subjectId: bigint | undefined, level: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["lessons", subjectId?.toString() ?? "none", level],
    queryFn: async () => {
      if (!actor || subjectId === undefined) return [];
      return actor.listLessons(subjectId, level);
    },
    enabled: !!actor && !isFetching && subjectId !== undefined,
  });
}

/** Full detail for a single lesson. */
export function useLesson(lessonId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["lesson", lessonId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || lessonId === undefined) return null;
      return actor.getLesson(lessonId);
    },
    enabled: !!actor && !isFetching && lessonId !== undefined,
  });
}

/** Exercises attached to a lesson. */
export function useExercises(lessonId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["exercises", lessonId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || lessonId === undefined) return [];
      return actor.listExercises(lessonId);
    },
    enabled: !!actor && !isFetching && lessonId !== undefined,
  });
}

/** Exam definition for a lesson. */
export function useExam(lessonId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["exam", lessonId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || lessonId === undefined) return null;
      return actor.getExam(lessonId);
    },
    enabled: !!actor && !isFetching && lessonId !== undefined,
  });
}

/** Per-lesson step progress. */
export function useLessonProgress(lessonId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["lessonProgress", lessonId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || lessonId === undefined) return null;
      return actor.getLessonProgress(lessonId);
    },
    enabled: !!actor && !isFetching && lessonId !== undefined,
  });
}

/** Lessons the student should revise, ordered by priority. */
export function useRevisions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["revisions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRevisions();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Global progress overview: points, level, subject mastery, recent activity. */
export function useProgress() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Points, level and badges for the student. */
export function useRewards() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRewards();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Condensed revision path for a lesson at a chosen duration. */
export function useCondensedPath(
  lessonId: bigint | undefined,
  durationMinutes: bigint,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "condensedPath",
      lessonId?.toString() ?? "none",
      durationMinutes.toString(),
    ],
    queryFn: async () => {
      if (!actor || lessonId === undefined) return null;
      return actor.getCondensedPath(lessonId, durationMinutes);
    },
    enabled: !!actor && !isFetching && lessonId !== undefined,
  });
}

/** Advance the student to the next step of a lesson. */
export function useAdvanceStep() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: bigint) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.advanceStep(lessonId);
    },
    onSuccess: (_data, lessonId) => {
      void queryClient.invalidateQueries({
        queryKey: ["lessonProgress", lessonId.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}

/** Submit a single exercise answer and get correction feedback. */
export function useSubmitAnswer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      exerciseId: bigint;
      selectedIndex: bigint;
    }) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.submitAnswer(input.exerciseId, input.selectedIndex);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["lessonProgress"] });
    },
  });
}

/** Start an exam session for an exam. */
export function useStartExam() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (examId: bigint) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.startExam(examId);
    },
  });
}

/** Submit a completed exam and receive the graded result. */
export function useSubmitExam() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: bigint;
      answers: { exerciseId: bigint; selectedIndex: bigint }[];
    }) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.submitExam(input.sessionId, input.answers);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["rewards"] });
      void queryClient.invalidateQueries({ queryKey: ["revisions"] });
    },
  });
}

/** Ask the AI teacher a question about a lesson. */
export function useAskAiTeacher() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: { lessonId: bigint; question: string }) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.askAiTeacher(input.lessonId, input.question);
    },
  });
}
