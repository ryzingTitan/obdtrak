"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import { Paper, Box, CircularProgress, Typography } from "@mui/material";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
  onError?: (error: string) => void;
  onDurationChange?: (duration: number) => void;
}

export function VideoPlayer({
  videoUrl,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onError,
  onDurationChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSeekingRef = useRef(false);

  // Initialize video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered");
    videoRef.current.appendChild(videoElement);

    // Initialize player
    const player = videojs(
      videoElement,
      {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
          {
            src: videoUrl,
            type: "application/x-mpegURL",
          },
        ],
      },
      () => {
        setIsLoading(false);
      },
    );

    playerRef.current = player;

    // Handle duration change
    player.on("durationchange", () => {
      const duration = player.duration();
      if (duration && onDurationChange) {
        onDurationChange(duration);
      }
    });

    // Handle errors
    player.on("error", () => {
      const error = player.error();
      let message = "An error occurred while loading the video";

      if (error) {
        // Provide HLS-specific error messages based on MediaError codes
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            message = "Video playback was aborted";
            break;
          case 2: // MEDIA_ERR_NETWORK
            message = "Network error occurred while loading the video stream";
            break;
          case 3: // MEDIA_ERR_DECODE
            message =
              "Video stream could not be decoded - the format may be unsupported or corrupted";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            message =
              "Video format is not supported or the stream URL is invalid";
            break;
          case 5: // MEDIA_ERR_ENCRYPTED
            message = "Video stream is encrypted and cannot be played";
            break;
          default:
            message = error.message || message;
        }
      }

      setErrorMessage(message);
      setIsLoading(false);
      if (onError) {
        onError(message);
      }
    });

    // Handle user seeking
    player.on("seeked", () => {
      if (isSeekingRef.current) {
        isSeekingRef.current = false;
        return;
      }
      const time = player.currentTime();
      if (onTimeUpdate && typeof time === "number") {
        onTimeUpdate(time);
      }
    });

    // Cleanup
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
      }
    };
  }, [videoUrl, onDurationChange, onError, onTimeUpdate]);

  // Sync currentTime prop with player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    const playerTime = player.currentTime();
    if (typeof playerTime !== "number") return;

    const timeDiff = Math.abs(playerTime - currentTime);

    // Only seek if difference is significant to avoid jank
    if (timeDiff > 0.5) {
      isSeekingRef.current = true;
      player.currentTime(currentTime);
    }
  }, [currentTime]);

  // Sync isPlaying prop with player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    if (isPlaying) {
      const playPromise = player.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    } else {
      player.pause();
    }
  }, [isPlaying]);

  if (errorMessage) {
    return (
      <Paper
        elevation={3}
        sx={{
          height: { xs: "400px", md: "500px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        }}
      >
        <Box sx={{ textAlign: "center", p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Video Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {errorMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        height: { xs: "400px", md: "500px" },
        position: "relative",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        overflow: "hidden",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        ref={videoRef}
        sx={{
          width: "100%",
          height: "100%",
          "& .video-js": {
            width: "100%",
            height: "100%",
          },
        }}
      />
    </Paper>
  );
}
