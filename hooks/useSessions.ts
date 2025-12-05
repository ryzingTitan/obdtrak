import useSWR from "swr";
import { Session } from "@/types/api";
import { getAllSessions } from "@/lib/sessions";
import { useUser } from "@auth0/nextjs-auth0";

export const useSessions = () => {
  const { user } = useUser();

  const swrKey = `/sessions?userEmail=${user?.email}`;
  const { data, isLoading } = useSWR<Session[]>(swrKey, getAllSessions);

  return {
    sessions: data || [],
    isLoading,
  };
};
