import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TelemetryGauges } from "./TelemetryGauges";

vi.mock("./Gauge", () => ({
  Gauge: ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: number;
    unit: string;
  }) => (
    <div data-testid={`gauge-${label}`}>
      {label}: {value} {unit}
    </div>
  ),
}));

vi.mock("./RpmGauge", () => ({
  RpmGauge: ({ rpm }: { rpm: number }) => (
    <div data-testid="rpm-gauge">RPM: {rpm} / 6000</div>
  ),
}));

const mockTelemetryData = {
  coolantTemperature: 195,
  intakeAirTemperature: 85,
  engineRpm: 3000,
  speed: 65,
  throttlePosition: 45,
  boostPressure: 5,
  manifoldPressure: 15,
  oilPressure: 40,
};

describe("TelemetryGauges", () => {
  const defaultProps = {
    telemetry: mockTelemetryData,
    coolantColor: "#ff5722",
    intakeColor: "#ff9800",
    hasBoostData: false,
    hasOilPressureData: false,
    hasManifoldPressureData: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render RPM gauge", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    expect(container.textContent).toContain("RPM: 3000 / 6000");
  });

  it("should render speed gauge", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    expect(container.textContent).toContain("Vehicle Speed: 65 MPH");
  });

  it("should render coolant temperature gauge", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    expect(container.textContent).toContain("Coolant Temp: 195 °F");
  });

  it("should render intake temperature gauge", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    expect(container.textContent).toContain("Intake Temp: 85 °F");
  });

  it("should render throttle position gauge", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    expect(container.textContent).toContain("Throttle: 45 %");
  });

  it("should render boost gauge when hasBoostData is true", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasBoostData={true} />,
    );

    expect(container.textContent).toContain("Boost: 5 PSI");
  });

  it("should not render boost gauge when hasBoostData is false", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasBoostData={false} />,
    );

    expect(container.textContent).not.toContain("Boost:");
  });

  it("should render manifold pressure gauge when hasManifoldPressureData is true", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasManifoldPressureData={true} />,
    );

    expect(container.textContent).toContain("Manifold: 15 PSI");
  });

  it("should not render manifold pressure gauge when hasManifoldPressureData is false", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasManifoldPressureData={false} />,
    );

    expect(container.textContent).not.toContain("Manifold:");
  });

  it("should render oil pressure gauge when hasOilPressureData is true", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasOilPressureData={true} />,
    );

    expect(container.textContent).toContain("Oil Pressure: 40 PSI");
  });

  it("should not render oil pressure gauge when hasOilPressureData is false", () => {
    const { container } = render(
      <TelemetryGauges {...defaultProps} hasOilPressureData={false} />,
    );

    expect(container.textContent).not.toContain("Oil Pressure:");
  });

  it("should render all optional gauges when all flags are true", () => {
    const { container } = render(
      <TelemetryGauges
        {...defaultProps}
        hasBoostData={true}
        hasOilPressureData={true}
        hasManifoldPressureData={true}
      />,
    );

    expect(container.textContent).toContain("Boost: 5 PSI");
    expect(container.textContent).toContain("Manifold: 15 PSI");
    expect(container.textContent).toContain("Oil Pressure: 40 PSI");
  });

  it("should render grid layout", () => {
    const { container } = render(<TelemetryGauges {...defaultProps} />);

    const grid = container.querySelector(".MuiBox-root");
    expect(grid).toBeInTheDocument();
  });

  it("should update telemetry values correctly", () => {
    const updatedTelemetry = {
      ...mockTelemetryData,
      speed: 120,
      engineRpm: 6500,
    };

    const { container } = render(
      <TelemetryGauges {...defaultProps} telemetry={updatedTelemetry} />,
    );

    expect(container.textContent).toContain("Vehicle Speed: 120 MPH");
    expect(container.textContent).toContain("RPM: 6500 / 6000");
  });
});
