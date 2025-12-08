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

  it("should render Track Position header", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    expect(container.textContent).toContain("Track Position");
  });

  it("should display formatted latitude and longitude", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    expect(container.textContent).toContain("40.712800");
    expect(container.textContent).toContain("-74.006000");
  });

  it("should format coordinates to 6 decimal places", () => {
    const { container } = render(
      <TrackMap latitude={40.123456789} longitude={-74.987654321} />,
    );

    expect(container.textContent).toContain("40.123457");
    expect(container.textContent).toContain("-74.987654");
  });

  it("should display CURRENT POSITION chip for valid coordinates", () => {
    const { container } = render(
      <TrackMap latitude={40.7128} longitude={-74.006} />,
    );

    expect(container.textContent).toContain("CURRENT POSITION");
  });

  it("should handle positive coordinates", () => {
    const { container } = render(
      <TrackMap latitude={51.5074} longitude={0.1278} />,
    );

    expect(container.textContent).toContain("51.507400");
    expect(container.textContent).toContain("0.127800");
  });

  it("should handle negative coordinates", () => {
    const { container } = render(
      <TrackMap latitude={-33.8688} longitude={-151.2093} />,
    );

    expect(container.textContent).toContain("-33.868800");
    expect(container.textContent).toContain("-151.209300");
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
