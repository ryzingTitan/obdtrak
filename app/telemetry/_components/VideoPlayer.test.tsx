import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { VideoPlayer } from "./VideoPlayer";

// Mock video.js CSS import
vi.mock("video.js/dist/video-js.css", () => ({}));

// Mock video.js
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();
const mockCurrentTime = vi.fn();
const mockDuration = vi.fn();
const mockDispose = vi.fn();
const mockIsDisposed = vi.fn().mockReturnValue(false);
const mockOn = vi.fn();
const mockError = vi.fn();

vi.mock("video.js", () => ({
  default: vi.fn((element, options, callback) => {
    // Call the ready callback immediately
    if (callback) {
      setTimeout(callback, 0);
    }

    const player = {
      play: mockPlay,
      pause: mockPause,
      currentTime: mockCurrentTime,
      duration: mockDuration,
      dispose: mockDispose,
      isDisposed: mockIsDisposed,
      on: mockOn,
      error: mockError,
    };

    // Set default return values
    mockCurrentTime.mockReturnValue(0);
    mockDuration.mockReturnValue(100);

    return player;
  }),
}));

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentTime.mockReturnValue(0);
    mockDuration.mockReturnValue(100);
    mockIsDisposed.mockReturnValue(false);
  });

  it("renders without crashing", async () => {
    render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  it("shows loading spinner initially", () => {
    render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("hides loading spinner after initialization", async () => {
    render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  it("displays error message when video fails to load", async () => {
    mockOn.mockImplementation((event, callback) => {
      if (event === "error") {
        setTimeout(() => {
          mockError.mockReturnValue({ message: "Failed to load video" });
          callback();
        }, 0);
      }
    });

    render(
      <VideoPlayer
        videoUrl="https://example.com/invalid.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/video error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
    });
  });

  it("calls onError when video fails to load", async () => {
    const handleError = vi.fn();

    mockOn.mockImplementation((event, callback) => {
      if (event === "error") {
        setTimeout(() => {
          mockError.mockReturnValue({ message: "Failed to load video" });
          callback();
        }, 0);
      }
    });

    render(
      <VideoPlayer
        videoUrl="https://example.com/invalid.m3u8"
        currentTime={0}
        isPlaying={false}
        onError={handleError}
      />,
    );

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledWith("Failed to load video");
    });
  });

  it("calls onDurationChange when duration is set", async () => {
    const handleDurationChange = vi.fn();

    mockOn.mockImplementation((event, callback) => {
      if (event === "durationchange") {
        setTimeout(() => {
          mockDuration.mockReturnValue(120);
          callback();
        }, 0);
      }
    });

    render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
        onDurationChange={handleDurationChange}
      />,
    );

    await waitFor(() => {
      expect(handleDurationChange).toHaveBeenCalledWith(120);
    });
  });

  it("plays video when isPlaying is true", async () => {
    const { rerender } = render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    rerender(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={true}
      />,
    );

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  it("pauses video when isPlaying is false", async () => {
    const { rerender } = render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={true}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    rerender(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(mockPause).toHaveBeenCalled();
    });
  });

  it("seeks video when currentTime changes significantly", async () => {
    const { rerender } = render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    mockCurrentTime.mockReturnValue(0);

    rerender(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={10}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(mockCurrentTime).toHaveBeenCalledWith(10);
    });
  });

  it("does not seek when time difference is small", async () => {
    const { rerender } = render(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    mockCurrentTime.mockReturnValue(0.3);
    vi.clearAllMocks();

    rerender(
      <VideoPlayer
        videoUrl="https://example.com/stream.m3u8"
        currentTime={0.4}
        isPlaying={false}
      />,
    );

    await waitFor(() => {
      expect(mockCurrentTime).not.toHaveBeenCalledWith(0.4);
    });
  });

  it("displays HLS-specific error messages for different error codes", async () => {
    const testCases = [
      { code: 2, expectedMessage: /network error/i },
      { code: 3, expectedMessage: /could not be decoded/i },
      { code: 4, expectedMessage: /not supported|invalid/i },
    ];

    for (const { code, expectedMessage } of testCases) {
      mockOn.mockImplementation((event, callback) => {
        if (event === "error") {
          setTimeout(() => {
            mockError.mockReturnValue({ code, message: "" });
            callback();
          }, 0);
        }
      });

      const { unmount } = render(
        <VideoPlayer
          videoUrl="https://example.com/stream.m3u8"
          currentTime={0}
          isPlaying={false}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
      });

      unmount();
      vi.clearAllMocks();
    }
  });
});
