import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaybackControls } from "./PlaybackControls";

const mockRecord = {
  id: 1,
  sessionId: 1,
  timestamp: "2024-01-15T10:30:00Z",
  coolantTemperature: 195,
  intakeAirTemperature: 85,
  engineRpm: 3000,
  speed: 65,
  throttlePosition: 45,
  boostPressure: 5,
  manifoldPressure: 15,
  oilPressure: 40,
  latitude: 0,
  longitude: 0,
};

describe("PlaybackControls", () => {
  const defaultProps = {
    isPlaying: false,
    playbackSpeed: 1 as const,
    currentRecordIndex: 0,
    currentRecord: mockRecord,
    totalRecords: 100,
    progressPercentage: 0,
    recordsLoading: false,
    onPlayPause: vi.fn(),
    onReset: vi.fn(),
    onSpeedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render play icon when not playing", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    const playIcon = container.querySelector('[data-testid="PlayArrowIcon"]');
    expect(playIcon).toBeInTheDocument();
  });

  it("should render pause icon when playing", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} isPlaying={true} />,
    );

    const pauseIcon = container.querySelector('[data-testid="PauseIcon"]');
    expect(pauseIcon).toBeInTheDocument();
  });

  it("should call onPlayPause when play/pause button is clicked", async () => {
    const user = userEvent.setup();
    const onPlayPause = vi.fn();
    const { container } = render(
      <PlaybackControls {...defaultProps} onPlayPause={onPlayPause} />,
    );

    const playButton = container.querySelector(
      '[data-testid="PlayArrowIcon"]',
    )?.parentElement;
    expect(playButton).toBeInTheDocument();
    if (playButton) {
      await user.click(playButton);
      expect(onPlayPause).toHaveBeenCalledTimes(1);
    }
  });

  it("should render reset button", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    const replayIcon = container.querySelector('[data-testid="ReplayIcon"]');
    expect(replayIcon).toBeInTheDocument();
  });

  it("should call onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const { container } = render(
      <PlaybackControls {...defaultProps} onReset={onReset} />,
    );

    const resetButton = container.querySelector(
      '[data-testid="ReplayIcon"]',
    )?.parentElement;
    expect(resetButton).toBeInTheDocument();
    if (resetButton) {
      await user.click(resetButton);
      expect(onReset).toHaveBeenCalledTimes(1);
    }
  });

  it("should render all playback speed options", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    expect(container.textContent).toContain("1x");
    expect(container.textContent).toContain("2x");
    expect(container.textContent).toContain("4x");
  });

  it("should display current record index and total records", () => {
    const { container } = render(
      <PlaybackControls
        {...defaultProps}
        currentRecordIndex={25}
        totalRecords={100}
      />,
    );

    expect(container.textContent).toContain("Record 26 of 100");
  });

  it("should display current record timestamp", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    // Timestamp will be in local time, so just check that some time is displayed
    expect(container.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it("should not display timestamp when current record is null", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} currentRecord={null} />,
    );

    expect(container.textContent).toContain("Record 1 of 100");
    expect(container.textContent).not.toContain("10:30:00");
  });

  it("should render progress bar", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("should display correct progress percentage", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} progressPercentage={50} />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should disable buttons when records are loading", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} recordsLoading={true} />,
    );

    const playButton = container.querySelector(
      '[data-testid="PlayArrowIcon"]',
    )?.parentElement;
    const resetButton = container.querySelector(
      '[data-testid="ReplayIcon"]',
    )?.parentElement;

    expect(playButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it("should not disable buttons when records are not loading", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} recordsLoading={false} />,
    );

    const playButton = container.querySelector(
      '[data-testid="PlayArrowIcon"]',
    )?.parentElement;
    const resetButton = container.querySelector(
      '[data-testid="ReplayIcon"]',
    )?.parentElement;

    expect(playButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
  });

  it("should highlight selected playback speed", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} playbackSpeed={2} />,
    );

    const speedButtons = container.querySelectorAll(
      ".MuiToggleButton-root.Mui-selected",
    );
    const selectedButton = Array.from(speedButtons).find((btn) =>
      btn.textContent?.includes("2x"),
    );

    expect(selectedButton).toBeInTheDocument();
  });
});
