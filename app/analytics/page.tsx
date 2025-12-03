"use client";

import { Box } from "@mui/material";
import { useSessions } from "@/hooks/useSessions";
import { useRecords } from "@/hooks/useRecords";
import { Session } from "@/types/api";
import { useMemo, useState } from "react";
import SessionSelector from "./_components/SessionSelector";
import AnalyticsTabs from "./_components/AnalyticsTabs";
import SummaryTab from "./_components/SummaryTab";
import TemperatureChart from "./_components/TemperatureChart";
import BoostChart from "./_components/BoostChart";

export default function Analytics() {
  const { sessions, isLoading: sessionsLoading } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const { records, isLoading: recordsLoading } = useRecords(
    selectedSession?.id || null,
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  }, [sessions]);

  return (
    <Box sx={{ padding: 2 }}>
      <SessionSelector
        sessions={sortedSessions}
        selectedSession={selectedSession}
        onSessionChange={setSelectedSession}
        loading={sessionsLoading}
      />
      {selectedSession && (
        <>
          <AnalyticsTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          {currentTab === 0 && (
            <SummaryTab records={records} loading={recordsLoading} />
          )}
          {currentTab === 1 && <TemperatureChart records={records} />}
          {currentTab === 2 && <BoostChart records={records} />}
        </>
      )}
    </Box>
  );
}
