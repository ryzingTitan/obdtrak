import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackMap } from "./TrackMap";

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

describe("TrackMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display Current Vehicle Position in popup", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    expect(container.textContent).toContain("Current Vehicle Position");
  });

  it("should show no GPS message for zero coordinates", () => {
    render(<TrackMap latitude={0} longitude={0} />);

    expect(
      screen.getByText("No GPS coordinates available"),
    ).toBeInTheDocument();
  });

  it("should render Leaflet map for valid coordinates", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    const mapContainer = container.querySelector(
      '[data-testid="map-container"]',
    );
    expect(mapContainer).toBeInTheDocument();
  });

  it("should render as MUI Paper component", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    const paper = container.querySelector(".MuiPaper-root");
    expect(paper).toBeInTheDocument();
  });
});
