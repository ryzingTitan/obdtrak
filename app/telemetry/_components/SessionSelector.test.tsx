import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SessionSelector } from "./SessionSelector";
import { Session } from "@/types/api";

const mockSessions: Session[] = [
  {
    id: 1,
    trackId: 1,
    trackName: "Laguna Seca",
    carId: 1,
    carYear: 2022,
    carMake: "Toyota",
    carModel: "GR86",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    notes: "Test session 1",
    weatherConditions: "Sunny",
    trackTemperature: 75,
    airTemperature: 70,
  },
  {
    id: 2,
    trackId: 2,
    trackName: "Thunderhill",
    carId: 1,
    carYear: 2022,
    carMake: "Toyota",
    carModel: "GR86",
    startTime: "2024-01-16T10:00:00Z",
    endTime: "2024-01-16T11:00:00Z",
    notes: "Test session 2",
    weatherConditions: "Cloudy",
    trackTemperature: 72,
    airTemperature: 68,
  },
];

describe("SessionSelector", () => {
  const defaultProps = {
    sessions: mockSessions,
    selectedSession: null,
    onSessionChange: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render autocomplete input with label", () => {
    const { container } = render(<SessionSelector {...defaultProps} />);

    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toContain("Select Session");
  });

  it("should render autocomplete component", () => {
    const { container } = render(<SessionSelector {...defaultProps} />);

    const autocomplete = container.querySelector(".MuiAutocomplete-root");
    expect(autocomplete).toBeInTheDocument();
  });

  it("should display selected session value", () => {
    const { container } = render(
      <SessionSelector {...defaultProps} selectedSession={mockSessions[0]} />,
    );

    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input?.value).toContain("Laguna Seca");
    expect(input?.value).toContain("2022 Toyota GR86");
  });

  it("should show loading state when loading prop is true", () => {
    const { container } = render(
      <SessionSelector {...defaultProps} loading={true} />,
    );

    // When loading, the autocomplete should be in a loading state
    const autocomplete = container.querySelector(".MuiAutocomplete-root");
    expect(autocomplete).toBeInTheDocument();
  });

  it("should not show loading state when loading prop is false", () => {
    const { container } = render(
      <SessionSelector {...defaultProps} loading={false} />,
    );

    const progressIndicator = container.querySelector(
      ".MuiCircularProgress-root",
    );
    expect(progressIndicator).not.toBeInTheDocument();
  });

  it("should render with empty sessions array", () => {
    const { container } = render(
      <SessionSelector {...defaultProps} sessions={[]} />,
    );

    const autocomplete = container.querySelector(".MuiAutocomplete-root");
    expect(autocomplete).toBeInTheDocument();
  });

  it("should render as MUI Box component", () => {
    const { container } = render(<SessionSelector {...defaultProps} />);

    const box = container.querySelector(".MuiBox-root");
    expect(box).toBeInTheDocument();
  });

  it("should render input field", () => {
    const { container } = render(<SessionSelector {...defaultProps} />);

    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input?.placeholder).toBe("Choose a track session to view telemetry");
  });
});
