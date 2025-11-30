import useSWR from "swr";
import { Session } from "@/types/api";
import { getAllSessions } from "@/lib/sessions";

export const useSessions = () => {
  const swrKey = `/sessions`;
  const { data, isLoading } = useSWR<Session[]>(swrKey, getAllSessions);

  return {
    sessions: data || [],
    isLoading,
  };
};
