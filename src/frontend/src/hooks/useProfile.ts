import { createActor } from "@/backend";
import type { ProfileInput } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The signed-in student's profile (country, curriculum, language, level). */
export function useProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Update the student's profile settings. */
export function useUpdateProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      if (!actor) throw new Error("Le serveur n'est pas encore prêt.");
      return actor.updateProfile(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
