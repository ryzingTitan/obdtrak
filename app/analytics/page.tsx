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
import ThrottleChart from "./_components/ThrottleChart";
import SpeedChart from "./_components/SpeedChart";
import OilPressureChart from "./_components/OilPressureChart";
import { EmptyState } from "@/components/EmptyState/EmptyState";

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
      {!selectedSession && (
        <EmptyState
          title="Select a Session"
          message="Choose a track session from the dropdown above to view analytics"
        />
      )}
      {selectedSession && (
        <>
          <AnalyticsTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          {currentTab === 0 && (
            <SummaryTab records={records} loading={recordsLoading} />
          )}
          {currentTab === 1 && <TemperatureChart records={records} />}
          {currentTab === 2 && <BoostChart records={records} />}
          {currentTab === 3 && <ThrottleChart records={records} />}
          {currentTab === 4 && <SpeedChart records={records} />}
          {currentTab === 5 && <OilPressureChart records={records} />}
        </>
      )}
    </Box>
  );
}
