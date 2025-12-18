import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Telemetry from "./page";
import { Session, Record } from "@/types/api";

const mockSession: Session = {
  id: "session-1",
  startTime: "2024-01-15T10:00:00Z",
  endTime: "2024-01-15T11:00:00Z",
  trackName: "Test Track",
  trackLatitude: 40.7128,
  trackLongitude: -74.006,
  carYear: 2020,
  carMake: "Test",
  carModel: "Car",
};

const mockRecord: Record = {
  sessionId: "session-1",
  timestamp: "2024-01-15T10:00:00Z",
  longitude: -74.006,
  latitude: 40.7128,
  altitude: 100,
  intakeAirTemperature: 85,
  boostPressure: 12.5,
  coolantTemperature: 195,
  engineRpm: 4500,
  speed: 87,
  throttlePosition: 75,
  airFuelRatio: 14.7,
  oilPressure: 45,
  manifoldPressure: 25.3,
  massAirFlow: 10,
};

const mockUseSessions = vi.fn();
const mockUseRecords = vi.fn();

vi.mock("@/hooks/useSessions", () => ({
  useSessions: () => mockUseSessions(),
}));

vi.mock("@/hooks/useRecords", () => ({
  useRecords: () => mockUseRecords(),
}));

// Mock react-leaflet components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 17),
  }),
}));

// Mock Leaflet
vi.mock("leaflet", () => ({
  default: {
    icon: vi.fn(() => ({})),
    Marker: {
      prototype: {
        options: {},
      },
    },
  },
}));

describe("Telemetry Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no sessions, no records (shows empty state)
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
    });
    mockUseRecords.mockReturnValue({
      records: [],
      isLoading: false,
    });
  });

  it("should display empty state when no session is selected", () => {
    mockUseSessions.mockReturnValue({
      sessions: [mockSession],
      isLoading: false,
    });

    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Select a Session");
    expect(container.textContent).toContain(
      "Choose a track session from the dropdown above to view telemetry data",
    );
  });

  it("should render SessionSelector component", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Session");
  });

  it("should handle sessions loading state", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: true,
    });

    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Session");
  });

  it("should handle no sessions available", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
    });

    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Session");
  });

  it("should render page with correct structure", () => {
    const { container } = render(<Telemetry />);

    const pageContainer = container.firstChild;
    expect(pageContainer).toBeInTheDocument();
  });

  it("should display sessions ordered by start time descending", async () => {
    const mockSessions: Session[] = [
      {
        id: "1",
        startTime: "2024-01-15T10:00:00Z",
        endTime: "2024-01-15T11:00:00Z",
        trackName: "Laguna Seca",
        trackLatitude: 36.5811,
        trackLongitude: -121.7536,
        carYear: 2020,
        carMake: "Toyota",
        carModel: "Camry",
      },
      {
        id: "2",
        startTime: "2024-01-16T14:00:00Z",
        endTime: "2024-01-16T15:30:00Z",
        trackName: "Circuit of the Americas",
        trackLatitude: 30.1328,
        trackLongitude: -97.6411,
        carYear: 2021,
        carMake: "Honda",
        carModel: "Civic",
      },
      {
        id: "3",
        startTime: "2024-01-10T09:00:00Z",
        endTime: "2024-01-10T10:30:00Z",
        trackName: "Watkins Glen",
        trackLatitude: 42.3369,
        trackLongitude: -76.9275,
        carYear: 2019,
        carMake: "Ford",
        carModel: "Mustang",
      },
    ];

    mockUseSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
    });

    const user = userEvent.setup();
    const { container } = render(<Telemetry />);

    const autocomplete = container.querySelector('input[role="combobox"]');
    expect(autocomplete).toBeInTheDocument();
    await user.click(autocomplete!);

    // The first option should be the session with the latest startTime (2024-01-16)
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Circuit of the Americas");
    expect(options[1]).toHaveTextContent("Laguna Seca");
    expect(options[2]).toHaveTextContent("Watkins Glen");
  });
});
