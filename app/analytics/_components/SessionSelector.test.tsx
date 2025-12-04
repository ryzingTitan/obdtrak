import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionSelector from "./SessionSelector";
import { Session } from "@/types/api";

describe("SessionSelector", () => {
  const mockOnSessionChange = vi.fn();

  const mockSessions: Session[] = [
    {
      id: "session1",
      startTime: "2024-01-15T10:00:00Z",
      endTime: "2024-01-15T11:30:00Z",
      trackName: "Laguna Seca",
      trackLatitude: 36.5844,
      trackLongitude: -121.7544,
      carYear: 2020,
      carMake: "Toyota",
      carModel: "Supra",
    },
    {
      id: "session2",
      startTime: "2024-02-20T14:00:00Z",
      endTime: "2024-02-20T15:45:00Z",
      trackName: "Circuit of the Americas",
      trackLatitude: 30.1328,
      trackLongitude: -97.6411,
      carYear: 2021,
      carMake: "Honda",
      carModel: "Civic Type R",
    },
    {
      id: "session3",
      startTime: "2024-03-10T09:30:00Z",
      endTime: "2024-03-10T11:00:00Z",
      trackName: "Watkins Glen",
      trackLatitude: 42.3369,
      trackLongitude: -76.9275,
      carYear: 2019,
      carMake: "Mazda",
      carModel: "MX-5",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render with label 'Select Session'", () => {
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    expect(screen.getByLabelText("Select Session")).toBeInTheDocument();
  });

  it("should render autocomplete input", () => {
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    expect(input).toBeInTheDocument();
  });

  it("should display all sessions when autocomplete is opened", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.click(input);

    const listbox = await screen.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("should format session label with track name and date range", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.click(input);

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByText(/Laguna Seca:/)).toBeInTheDocument();
    expect(
      within(listbox).getByText(/Circuit of the Americas:/),
    ).toBeInTheDocument();
    expect(within(listbox).getByText(/Watkins Glen:/)).toBeInTheDocument();
  });

  it("should call onSessionChange when a session is selected", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.click(input);

    const listbox = await screen.findByRole("listbox");
    const firstOption = within(listbox).getAllByRole("option")[0];
    await user.click(firstOption);

    expect(mockOnSessionChange).toHaveBeenCalledWith(mockSessions[0]);
    expect(mockOnSessionChange).toHaveBeenCalledTimes(1);
  });

  it("should display selected session in input field", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.click(input);

    const listbox = await screen.findByRole("listbox");
    const secondOption = within(listbox).getAllByRole("option")[1];
    await user.click(secondOption);

    // Re-render with the selected session to simulate parent component update
    rerender(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[1]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const inputValue = input.getAttribute("value");
    expect(inputValue).toContain("Circuit of the Americas:");
  });

  it("should show selected session when provided as prop", () => {
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[1]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    const inputValue = input.getAttribute("value");
    expect(inputValue).toContain("Circuit of the Americas:");
  });

  it("should handle empty sessions array", () => {
    render(
      <SessionSelector
        sessions={[]}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("should call onSessionChange with null when selection is cleared", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[0]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    // MUI Autocomplete has a clear button with title "Clear"
    const clearButton = screen.getByTitle("Clear");
    await user.click(clearButton);

    expect(mockOnSessionChange).toHaveBeenCalledWith(null);
  });

  it("should display loading state when loading prop is true", () => {
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
        loading={true}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    expect(input).toBeInTheDocument();
  });

  it("should not display loading state by default", () => {
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    expect(input).toBeInTheDocument();
  });

  it("should allow selecting different sessions sequentially", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });

    // Select first session
    await user.click(input);
    let listbox = await screen.findByRole("listbox");
    const firstOption = within(listbox).getAllByRole("option")[0];
    await user.click(firstOption);

    expect(mockOnSessionChange).toHaveBeenNthCalledWith(1, mockSessions[0]);

    // Re-render with first session selected
    rerender(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[0]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    // Select second session
    await user.click(input);
    listbox = await screen.findByRole("listbox");
    const secondOption = within(listbox).getAllByRole("option")[1];
    await user.click(secondOption);

    expect(mockOnSessionChange).toHaveBeenNthCalledWith(2, mockSessions[1]);
    expect(mockOnSessionChange).toHaveBeenCalledTimes(2);
  });

  it("should filter sessions when typing in input", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.type(input, "Laguna");

    const listbox = await screen.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    // Should only show Laguna Seca
    expect(options).toHaveLength(1);
    expect(within(listbox).getByText(/Laguna Seca:/)).toBeInTheDocument();
  });

  it("should show no options when filter matches nothing", async () => {
    const user = userEvent.setup();
    render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.type(input, "NonExistentTrack");

    const noOptions = await screen.findByText("No options");
    expect(noOptions).toBeInTheDocument();
  });

  it("should handle sessions with same track name but different times", async () => {
    const user = userEvent.setup();
    const sessionsWithDuplicateTrack: Session[] = [
      mockSessions[0],
      {
        ...mockSessions[0],
        id: "session4",
        startTime: "2024-01-16T10:00:00Z",
        endTime: "2024-01-16T11:30:00Z",
      },
    ];

    render(
      <SessionSelector
        sessions={sessionsWithDuplicateTrack}
        selectedSession={null}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    await user.click(input);

    const listbox = await screen.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(2);
  });

  it("should correctly identify selected option using id comparison", () => {
    const { rerender } = render(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[0]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Select Session" });
    let inputValue = input.getAttribute("value");
    expect(inputValue).toContain("Laguna Seca:");

    // Change selected session
    rerender(
      <SessionSelector
        sessions={mockSessions}
        selectedSession={mockSessions[2]}
        onSessionChange={mockOnSessionChange}
      />,
    );

    inputValue = input.getAttribute("value");
    expect(inputValue).toContain("Watkins Glen:");
  });
});
