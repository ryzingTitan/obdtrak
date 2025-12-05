import useSWR from "swr";
import { Record } from "@/types/api";
import { getRecordsBySessionId } from "@/lib/records";

export const useRecords = (sessionId: string | null) => {
  const swrKey = sessionId ? `/sessions/${sessionId}/records` : null;
  const { data, isLoading } = useSWR<Record[]>(swrKey, getRecordsBySessionId);

  return {
    records: data || [],
    isLoading,
  };
};
