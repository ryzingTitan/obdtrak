import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Analytics from "./page";
import { Session, Record } from "@/types/api";

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

const mockRecords: Record[] = [
  {
    sessionId: 1,
    timestamp: "2024-01-15T10:00:00Z",
    longitude: -121.7536,
    latitude: 36.5811,
    altitude: 100,
    intakeAirTemperature: 25,
    boostPressure: 1.5,
    coolantTemperature: 90,
    engineRpm: 3000,
    speed: 60,
    throttlePosition: 50,
    airFuelRatio: 14.7,
    oilPressure: 40,
    manifoldPressure: 1.2,
    massAirFlow: 10,
  },
  {
    sessionId: 1,
    timestamp: "2024-01-15T10:00:01Z",
    longitude: -121.7537,
    latitude: 36.5812,
    altitude: 101,
    intakeAirTemperature: 26,
    boostPressure: 1.6,
    coolantTemperature: 91,
    engineRpm: 3100,
    speed: 61,
    throttlePosition: 51,
    airFuelRatio: 14.8,
    oilPressure: 41,
    manifoldPressure: 1.3,
    massAirFlow: 11,
  },
];

const mockUseSessions = vi.fn();
const mockUseRecords = vi.fn();

vi.mock("@/hooks/useSessions", () => ({
  useSessions: () => mockUseSessions(),
}));

vi.mock("@/hooks/useRecords", () => ({
  useRecords: (sessionId: string | null) => mockUseRecords(sessionId),
}));

describe("Analytics Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
    });
    mockUseRecords.mockReturnValue({
      records: [],
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the Autocomplete component", () => {
    render(<Analytics />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should display sessions ordered by start time descending", async () => {
    const user = userEvent.setup();
    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    // The first option should be the session with the latest startTime (2024-01-16)
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Circuit of the Americas");
    expect(options[1]).toHaveTextContent("Laguna Seca");
    expect(options[2]).toHaveTextContent("Watkins Glen");
  });

  it("should format session labels as trackName: startTime - endTime", async () => {
    const user = userEvent.setup();
    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    // Check that the label format includes trackName and formatted dates
    // The format should be: trackName: MM-DD-YYYY h:mm A - MM-DD-YYYY h:mm A
    expect(
      screen.getByText(
        /Circuit of the Americas: 01-16-2024 \d{1,2}:\d{2} [AP]M - 01-16-2024 \d{1,2}:\d{2} [AP]M/i,
      ),
    ).toBeInTheDocument();
  });

  it("should show loading state when sessions are loading", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: true,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    expect(autocomplete).toBeInTheDocument();
  });

  it("should allow selecting a session", async () => {
    const user = userEvent.setup();
    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    expect(screen.getByDisplayValue(/Laguna Seca/i)).toBeInTheDocument();
  });

  it("should handle empty sessions list", () => {
    mockUseSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
    });

    render(<Analytics />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should not display DataGrid when no session is selected", () => {
    render(<Analytics />);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("should display DataGrid when a session is selected", async () => {
    const user = userEvent.setup();
    mockUseRecords.mockReturnValue({
      records: mockRecords,
      isLoading: false,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should display records in DataGrid", async () => {
    const user = userEvent.setup();
    mockUseRecords.mockReturnValue({
      records: mockRecords,
      isLoading: false,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("Timestamp")).toBeInTheDocument();
    expect(within(grid).getByText("3000")).toBeInTheDocument();
  });

  it("should format timestamp column correctly", async () => {
    const user = userEvent.setup();
    mockUseRecords.mockReturnValue({
      records: mockRecords,
      isLoading: false,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    // Check for timestamp format: MM-DD-YYYY h:mm:ss A
    const timestamps = screen.getAllByText(
      /01-15-2024 \d{1,2}:\d{2}:\d{2} [AP]M/i,
    );
    expect(timestamps.length).toBeGreaterThan(0);
    expect(timestamps[0]).toBeInTheDocument();
  });

  it("should show loading state in DataGrid when records are loading", async () => {
    const user = userEvent.setup();
    mockUseRecords.mockReturnValue({
      records: [],
      isLoading: true,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should display all record fields in DataGrid columns", async () => {
    const user = userEvent.setup();
    mockUseRecords.mockReturnValue({
      records: mockRecords,
      isLoading: false,
    });

    render(<Analytics />);

    const autocomplete = screen.getByRole("combobox");
    await user.click(autocomplete);

    const option = screen.getByText(/Laguna Seca/i);
    await user.click(option);

    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("Timestamp")).toBeInTheDocument();
    expect(within(grid).getByText("Intake Air Temp")).toBeInTheDocument();
    expect(within(grid).getByText("Boost Pressure (PSI)")).toBeInTheDocument();
    expect(within(grid).getByText("Coolant Temp")).toBeInTheDocument();
    expect(within(grid).getByText("Engine RPM")).toBeInTheDocument();
    expect(within(grid).getByText("Speed (MPH)")).toBeInTheDocument();
    expect(within(grid).getByText("Throttle Position")).toBeInTheDocument();
    expect(within(grid).getByText("AFR")).toBeInTheDocument();
    expect(within(grid).getByText("Oil Pressure (PSI)")).toBeInTheDocument();
    expect(
      within(grid).getByText("Manifold Pressure (PSI)"),
    ).toBeInTheDocument();
    expect(within(grid).getByText("Mass Air Flow (G/S)")).toBeInTheDocument();
  });
});
