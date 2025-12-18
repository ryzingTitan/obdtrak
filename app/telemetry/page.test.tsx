import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("should render page header", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Live Telemetry");
    expect(container.textContent).toContain("Real-time track session data");
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

    expect(container.textContent).toContain("Select Session");
  });

  it("should handle sessions loading state", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: true,
    });

    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Select Session");
  });

  it("should handle no sessions available", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
    });

    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Select Session");
  });

  it("should render page with correct structure", () => {
    const { container } = render(<Telemetry />);

    const pageContainer = container.firstChild;
    expect(pageContainer).toBeInTheDocument();
  });

  it("should render header with heading role", () => {
    const { container } = render(<Telemetry />);

    const header = container.querySelector("h1");
    expect(header).toBeInTheDocument();
    expect(header?.textContent).toContain("Live Telemetry");
  });
});
