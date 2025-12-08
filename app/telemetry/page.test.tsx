import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Telemetry from "./page";

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
  it("should render page header", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Live Telemetry");
    expect(container.textContent).toContain("Real-time track session data");
  });

  it("should render TrackMap component with coordinates", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Track Position");
    expect(container.textContent).toContain("40.712800");
    expect(container.textContent).toContain("-74.006000");
  });

  it("should render RpmGauge with engine RPM", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Engine RPM");
    expect(container.textContent).toContain("4500");
    expect(container.textContent).toContain("Redline: 7000");
  });

  it("should render Vehicle Speed gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Vehicle Speed");
    expect(container.textContent).toContain("87");
    expect(container.textContent).toContain("MPH");
  });

  it("should render Coolant Temperature gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Coolant Temp");
    expect(container.textContent).toContain("195");
    expect(container.textContent).toContain("°F");
  });

  it("should render Intake Temperature gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Intake Temp");
    expect(container.textContent).toContain("85");
  });

  it("should render Throttle gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Throttle");
    expect(container.textContent).toContain("75");
    expect(container.textContent).toContain("%");
  });

  it("should render Boost gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Boost");
    expect(container.textContent).toContain("12.5");
    expect(container.textContent).toContain("PSI");
  });

  it("should render Manifold Pressure gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Manifold");
    expect(container.textContent).toContain("25.3");
    expect(container.textContent).toContain("inHg");
  });

  it("should render Oil Pressure gauge", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("Oil Pressure");
    expect(container.textContent).toContain("45");
  });

  it("should render all required gauges", () => {
    const { container } = render(<Telemetry />);

    const gaugeLabels = [
      "Vehicle Speed",
      "Coolant Temp",
      "Intake Temp",
      "Throttle",
      "Boost",
      "Manifold",
      "Oil Pressure",
    ];

    gaugeLabels.forEach((label) => {
      expect(container.textContent).toContain(label);
    });
  });

  it("should render progress bars for gauges with showBar=true", () => {
    render(<Telemetry />);

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it("should display current position indicator on map", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("CURRENT POSITION");
  });

  it("should use mock telemetry data", () => {
    const { container } = render(<Telemetry />);

    expect(container.textContent).toContain("87"); // speed
    expect(container.textContent).toContain("195"); // coolant temp
    expect(container.textContent).toContain("4500"); // RPM
    expect(container.textContent).toContain("12.5"); // boost
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

  it("should render SVG track visualization", () => {
    const { container } = render(<Telemetry />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render MUI Paper components", () => {
    const { container } = render(<Telemetry />);

    const papers = container.querySelectorAll(".MuiPaper-root");
    expect(papers.length).toBeGreaterThan(0);
  });
});
