"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Box, Alert } from "@mui/material";
import { getTempColor } from "./_components/telemetryUtils";
import { useSessions } from "@/hooks/useSessions";
import { useRecords } from "@/hooks/useRecords";
import { Session } from "@/types/api";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import SessionSelector from "@/components/SessionSelector/SessionSelector";
import {
  PlaybackControls,
  type PlaybackSpeed,
} from "./_components/PlaybackControls";
import {
  TelemetryGauges,
  GAUGE_LIMITS,
  type TelemetryData,
} from "./_components/TelemetryGauges";
import ViewTabs from "./_components/ViewTabs";

// Dynamically import TrackMap to avoid SSR issues with Leaflet
const TrackMap = dynamic(
  () =>
    import("./_components/TrackMap").then((mod) => ({ default: mod.TrackMap })),
  { ssr: false },
);

// Dynamically import VideoPlayer to avoid SSR issues
const VideoPlayer = dynamic(
  () =>
    import("./_components/VideoPlayer").then((mod) => ({
      default: mod.VideoPlayer,
    })),
  { ssr: false },
);

export default function Telemetry() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [currentView, setCurrentView] = useState<number>(0); // 0 = map, 1 = video
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { records, isLoading: recordsLoading } = useRecords(
    selectedSession?.id || null,
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  }, [sessions]);

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

  // Calculate video time from currentRecordIndex
  const currentVideoTime = useMemo(() => {
    if (records.length === 0 || currentRecordIndex === 0) return 0;
    const startTime = new Date(records[0].timestamp).getTime();
    const currentTime = new Date(
      records[currentRecordIndex].timestamp,
    ).getTime();
    return (currentTime - startTime) / 1000; // convert to seconds
  }, [records, currentRecordIndex]);

  // Calculate total telemetry duration
  const telemetryDuration = useMemo(() => {
    if (records.length < 2) return 0;
    const startTime = new Date(records[0].timestamp).getTime();
    const endTime = new Date(records[records.length - 1].timestamp).getTime();
    return (endTime - startTime) / 1000;
  }, [records]);

  // Check for duration mismatch (> 5 second difference)
  const hasDurationMismatch = useMemo(() => {
    if (!videoDuration || !telemetryDuration) return false;
    return Math.abs(videoDuration - telemetryDuration) > 5;
  }, [videoDuration, telemetryDuration]);

  // Event handlers wrapped in useCallback to prevent unnecessary re-renders
  const handleVideoSeek = useCallback(
    (videoTime: number) => {
      if (records.length === 0) return;

      // Find closest record index for given video time
      const startTime = new Date(records[0].timestamp).getTime();
      const targetTimestamp = startTime + videoTime * 1000;

      let closestIndex = 0;
      let minDiff = Infinity;

      records.forEach((record, index) => {
        const recordTime = new Date(record.timestamp).getTime();
        const diff = Math.abs(recordTime - targetTimestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      setCurrentRecordIndex(closestIndex);
    },
    [records],
  );

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

  const handleSessionChange = useCallback((newValue: Session | null) => {
    setSelectedSession(newValue);
    // Reset playback when session changes
    setCurrentRecordIndex(0);
    setIsPlaying(false);
    setVideoDuration(null);
    // Reset to map view if new session has no video
    if (!newValue?.videoUrl) {
      setCurrentView(0);
    }
  }, []);

  const handleSpeedChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newSpeed: PlaybackSpeed | null) => {
      if (newSpeed !== null) {
        setPlaybackSpeed(newSpeed);
      }
    },
    [],
  );

  const handleSeek = useCallback((newIndex: number) => {
    setCurrentRecordIndex(newIndex);
    // Playback continues automatically if isPlaying is true
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        pb: { xs: 9, sm: 10 }, // Extra padding for bottom navigation
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
      }}
    >
      <SessionSelector
        sessions={sortedSessions}
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
          currentRecord={currentRecord}
          currentRecordIndex={currentRecordIndex}
          totalRecords={records.length}
          recordsLoading={recordsLoading}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onSeek={handleSeek}
        />
      )}

      {/* View Toggle Tabs */}
      {selectedSession && records.length > 0 && (
        <ViewTabs
          currentView={currentView}
          onViewChange={setCurrentView}
          hasVideo={!!selectedSession.videoUrl}
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
          {/* Map/Video Section */}
          <Box
            sx={{
              flex: { xs: "initial", md: "7" },
              height: { xs: "400px", md: "auto" },
              minWidth: 0,
            }}
          >
            {currentView === 0 ? (
              <TrackMap
                latitude={mapLocation.latitude}
                longitude={mapLocation.longitude}
              />
            ) : (
              selectedSession.videoUrl && (
                <>
                  {hasDurationMismatch && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      Video duration ({videoDuration?.toFixed(1)}s) doesn&apos;t
                      match telemetry duration ({telemetryDuration.toFixed(1)}s)
                    </Alert>
                  )}
                  <VideoPlayer
                    videoUrl={selectedSession.videoUrl}
                    currentTime={currentVideoTime}
                    isPlaying={isPlaying}
                    onTimeUpdate={handleVideoSeek}
                    onDurationChange={setVideoDuration}
                    onError={(error) => console.error("Video error:", error)}
                  />
                </>
              )
            )}
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
    </Box>
  );
}
