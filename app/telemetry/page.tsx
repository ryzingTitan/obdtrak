"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import { TrackMap } from "./_components/TrackMap";
import { getTempColor } from "./_components/telemetryUtils";
import { useSessions } from "@/hooks/useSessions";
import { useRecords } from "@/hooks/useRecords";
import { Session } from "@/types/api";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SessionSelector } from "./_components/SessionSelector";
import {
  PlaybackControls,
  type PlaybackSpeed,
} from "./_components/PlaybackControls";
import {
  TelemetryGauges,
  GAUGE_LIMITS,
  type TelemetryData,
} from "./_components/TelemetryGauges";
import { PageHeader } from "./_components/PageHeader";

export default function Telemetry() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { records, isLoading: recordsLoading } = useRecords(
    selectedSession?.id || null,
  );

  // Playback interval - update based on playback speed
  useEffect(() => {
    if (!isPlaying || records.length === 0) return;

    const interval = setInterval(() => {
      setCurrentRecordIndex((prevIndex) => {
        // Stop at the last record
        if (prevIndex >= records.length - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, records.length, playbackSpeed]);

  // Get current record for display - memoized to prevent unnecessary recalculations
  const currentRecord = useMemo(
    () => (records.length > 0 ? records[currentRecordIndex] : null),
    [records, currentRecordIndex],
  );

  // Check if any record has boost pressure > 0 - memoized to avoid re-scanning on every render
  const hasBoostData = useMemo(
    () => records.some((record) => (record.boostPressure ?? 0) > 0),
    [records],
  );

  // Check if any record has oil pressure > 0 - memoized to avoid re-scanning on every render
  const hasOilPressureData = useMemo(
    () => records.some((record) => (record.oilPressure ?? 0) > 0),
    [records],
  );

  // Check if any record has manifold pressure > 0 - memoized to avoid re-scanning on every render
  const hasManifoldPressureData = useMemo(
    () => records.some((record) => (record.manifoldPressure ?? 0) > 0),
    [records],
  );

  // Use current record data or default values - memoized to prevent object recreation
  const telemetry = useMemo<TelemetryData>(
    () => ({
      coolantTemperature: currentRecord?.coolantTemperature ?? 0,
      intakeAirTemperature: currentRecord?.intakeAirTemperature ?? 0,
      engineRpm: currentRecord?.engineRpm ?? 0,
      speed: currentRecord?.speed ?? 0,
      throttlePosition: currentRecord?.throttlePosition ?? 0,
      boostPressure: currentRecord?.boostPressure ?? 0,
      manifoldPressure: currentRecord?.manifoldPressure ?? 0,
      oilPressure: currentRecord?.oilPressure ?? 0,
    }),
    [currentRecord],
  );

  // Track location for map - separate from telemetry data
  const mapLocation = useMemo(
    () => ({
      latitude: currentRecord?.latitude ?? selectedSession?.trackLatitude ?? 0,
      longitude:
        currentRecord?.longitude ?? selectedSession?.trackLongitude ?? 0,
    }),
    [currentRecord, selectedSession],
  );

  // Calculate colors based on current values - memoized to prevent recalculation
  const coolantColor = useMemo(
    () =>
      getTempColor(telemetry.coolantTemperature, GAUGE_LIMITS.COOLANT_TEMP_MAX),
    [telemetry.coolantTemperature],
  );

  const intakeColor = useMemo(
    () =>
      getTempColor(
        telemetry.intakeAirTemperature,
        GAUGE_LIMITS.INTAKE_TEMP_MAX,
      ),
    [telemetry.intakeAirTemperature],
  );

  // Calculate progress percentage - memoized to prevent recalculation
  const progressPercentage = useMemo(
    () =>
      records.length > 0
        ? ((currentRecordIndex + 1) / records.length) * 100
        : 0,
    [currentRecordIndex, records.length],
  );

  // Event handlers wrapped in useCallback to prevent unnecessary re-renders
  const handlePlayPause = useCallback(() => {
    if (records.length === 0) return;

    // If at the end, restart from beginning
    if (currentRecordIndex >= records.length - 1 && !isPlaying) {
      setCurrentRecordIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [records.length, currentRecordIndex, isPlaying]);

  const handleReset = useCallback(() => {
    setCurrentRecordIndex(0);
    setIsPlaying(false);
  }, []);

  const handleSessionChange = useCallback(
    (_event: React.SyntheticEvent, newValue: Session | null) => {
      setSelectedSession(newValue);
      // Reset playback when session changes
      setCurrentRecordIndex(0);
      setIsPlaying(false);
    },
    [],
  );

  const handleSpeedChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newSpeed: PlaybackSpeed | null) => {
      if (newSpeed !== null) {
        setPlaybackSpeed(newSpeed);
      }
    },
    [],
  );

  // Shared page layout wrapper
  const PageLayout = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        pb: { xs: 9, sm: 10 }, // Extra padding for bottom navigation
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
      }}
    >
      <PageHeader
        title="Live Telemetry"
        subtitle="Real-time track session data"
      />
      {children}
    </Box>
  );

  return (
    <PageLayout>
      <SessionSelector
        sessions={sessions}
        selectedSession={selectedSession}
        onSessionChange={handleSessionChange}
        loading={sessionsLoading}
      />

      {/* Empty state: No session selected */}
      {!selectedSession && (
        <EmptyState
          title="Select a Session"
          message="Choose a track session from the dropdown above to view telemetry data"
        />
      )}

      {/* Playback Controls */}
      {selectedSession && records.length > 0 && (
        <PlaybackControls
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentRecordIndex={currentRecordIndex}
          currentRecord={currentRecord}
          totalRecords={records.length}
          progressPercentage={progressPercentage}
          recordsLoading={recordsLoading}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
        />
      )}

      {/* Main Layout */}
      {selectedSession && records.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          {/* Track Map Section */}
          <Box sx={{ flex: { xs: "1", md: "7" }, minWidth: 0 }}>
            <TrackMap
              latitude={mapLocation.latitude}
              longitude={mapLocation.longitude}
            />
          </Box>

          {/* Telemetry Gauges Section */}
          <Box sx={{ flex: { xs: "1", md: "5" }, minWidth: 0 }}>
            <TelemetryGauges
              telemetry={telemetry}
              coolantColor={coolantColor}
              intakeColor={intakeColor}
              hasBoostData={hasBoostData}
              hasOilPressureData={hasOilPressureData}
              hasManifoldPressureData={hasManifoldPressureData}
            />
          </Box>
        </Box>
      )}
    </PageLayout>
  );
}
