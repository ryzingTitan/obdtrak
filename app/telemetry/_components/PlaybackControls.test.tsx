import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaybackControls } from "./PlaybackControls";

const mockRecord = {
  id: "1",
  sessionId: "1",
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
  altitude: 100,
  airFuelRatio: null,
  massAirFlow: null,
};

describe("PlaybackControls", () => {
  const defaultProps = {
    isPlaying: false,
    playbackSpeed: 1 as const,
    currentRecordIndex: 0,
    currentRecord: mockRecord,
    totalRecords: 100,
    recordsLoading: false,
    onPlayPause: vi.fn(),
    onReset: vi.fn(),
    onSpeedChange: vi.fn(),
    onSeek: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
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

  it("should display current record timestamp", () => {
    const { container } = render(<PlaybackControls {...defaultProps} />);

    // Timestamp will be in local time, so just check that some time is displayed
    expect(container.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it("should not display timestamp when current record is null", () => {
    const { container } = render(
      <PlaybackControls {...defaultProps} currentRecord={null} />,
    );

    expect(container.textContent).not.toContain("10:30:00");
  });

  it("should render slider", () => {
    render(<PlaybackControls {...defaultProps} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
  });

  it("should display correct slider value", () => {
    render(<PlaybackControls {...defaultProps} currentRecordIndex={50} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
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

  it("should call onSeek when slider value changes", () => {
    const onSeek = vi.fn();
    render(<PlaybackControls {...defaultProps} onSeek={onSeek} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();

    // Simulate slider value change
    fireEvent.change(slider, { target: { value: "75" } });
    expect(onSeek).toHaveBeenCalled();
  });

  it("should disable slider when records are loading", () => {
    render(<PlaybackControls {...defaultProps} recordsLoading={true} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeDisabled();
  });

  it("should disable slider when there are no records", () => {
    render(<PlaybackControls {...defaultProps} totalRecords={0} />);

    const slider = screen.getByRole("slider");
    expect(slider).toBeDisabled();
  });

  it("should set slider max to totalRecords - 1", () => {
    render(<PlaybackControls {...defaultProps} totalRecords={100} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "99");
  });

  it("should set slider min to 0", () => {
    render(<PlaybackControls {...defaultProps} totalRecords={100} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
  });

  it("should have correct aria-label for accessibility", () => {
    render(<PlaybackControls {...defaultProps} />);

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-label", "Playback position");
  });

  it("should handle seeking to first record", () => {
    const onSeek = vi.fn();
    render(
      <PlaybackControls
        {...defaultProps}
        currentRecordIndex={50}
        onSeek={onSeek}
      />,
    );

    const slider = screen.getByRole("slider");

    fireEvent.change(slider, { target: { value: "0" } });
    expect(onSeek).toHaveBeenCalled();
  });

  it("should handle seeking to last record", () => {
    const onSeek = vi.fn();
    render(
      <PlaybackControls
        {...defaultProps}
        currentRecordIndex={0}
        totalRecords={100}
        onSeek={onSeek}
      />,
    );

    const slider = screen.getByRole("slider");

    fireEvent.change(slider, { target: { value: "99" } });
    expect(onSeek).toHaveBeenCalled();
  });
});
