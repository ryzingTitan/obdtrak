import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditSessionModal from "./EditSessionModal";
import { useEditSessionForm } from "@/hooks/useEditSessionForm";
import useSWR from "swr";
import { Car, Session } from "@/types/api";
import Track from "@/types/api";

vi.mock("@/hooks/useEditSessionForm");
vi.mock("swr");

const mockTracks: Track[] = [
  {
    id: "track1",
    name: "Laguna Seca",
    latitude: 36.5844,
    longitude: -121.7544,
  },
  {
    id: "track2",
    name: "Circuit of the Americas",
    latitude: 30.1328,
    longitude: -97.6411,
  },
];

const mockCars: Car[] = [
  { id: "car1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "car2", year: 2021, make: "Honda", model: "Civic" },
];

const mockSession: Session = {
  id: "session1",
  startTime: "2024-01-15T10:00:00Z",
  endTime: "2024-01-15T11:00:00Z",
  trackName: "Laguna Seca",
  trackLatitude: 36.5844,
  trackLongitude: -121.7544,
  carYear: 2020,
  carMake: "Toyota",
  carModel: "Camry",
};

describe("EditSessionModal", () => {
  const mockOnClose = vi.fn();
  const mockFormik = {
    values: {
      carId: "car1",
      trackId: "track1",
      uploadFiles: [],
    },
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
    setFieldValue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: mockFormik as never,
    });

    vi.mocked(useSWR).mockImplementation((key: string) => {
      if (key === "/cars") {
        return {
          data: mockCars,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as never;
      }
      if (key === "/tracks") {
        return {
          data: mockTracks,
          error: undefined,
          isLoading: false,
          isValidating: false,
          mutate: vi.fn(),
        } as never;
      }
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      } as never;
    });
  });

  it("should render the dialog", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Session")).toBeInTheDocument();
  });

  it("should display session ID as read-only", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const sessionIdField = within(dialog).getByLabelText("Session ID");
    expect(sessionIdField).toBeInTheDocument();
    expect(sessionIdField).toHaveValue("session1");
    expect(sessionIdField).toBeDisabled();
  });

  it("should render track name dropdown", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Track Name")).toBeInTheDocument();
  });

  it("should render car dropdown", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Car")).toBeInTheDocument();
  });

  it("should render cancel and update buttons", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("should disable update button when form is invalid", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        isValid: false,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const updateButton = screen.getByRole("button", { name: /update/i });
    expect(updateButton).toBeDisabled();
  });

  it("should enable update button when form is valid", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const updateButton = screen.getByRole("button", { name: /update/i });
    expect(updateButton).not.toBeDisabled();
  });

  it("should call resetForm and onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", {
      name: /cancel/i,
    });
    await user.click(cancelButton);

    expect(mockFormik.resetForm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call handleSubmit when update is clicked", async () => {
    const user = userEvent.setup();
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const updateButton = screen.getByRole("button", { name: /update/i });
    await user.click(updateButton);

    expect(mockFormik.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should display track name error when touched and invalid", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        errors: {
          trackId: "Track is required",
        },
        touched: {
          trackId: true,
        },
        isValid: false,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const trackSelect = within(dialog).getAllByLabelText("Track Name")[0];
    expect(trackSelect).toHaveAttribute("aria-invalid", "true");
  });

  it("should display car error when touched and invalid", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        errors: {
          carId: "Car is required",
        },
        touched: {
          carId: true,
        },
        isValid: false,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const carSelect = within(dialog).getAllByLabelText("Car")[0];
    expect(carSelect).toHaveAttribute("aria-invalid", "true");
  });

  it("should render file upload dropzone with single file message", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        /drag and drop a file here, or click to select a file/i,
      ),
    ).toBeInTheDocument();
  });

  it("should call setFieldValue when a file is uploaded", async () => {
    const user = userEvent.setup();
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const file = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    const dialog = screen.getByRole("dialog");
    const input = dialog.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, file);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", [
      file,
    ]);
  });

  it("should display uploaded file in a list", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [mockFile],
        },
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("test.txt")).toBeInTheDocument();
  });

  it("should display file size in KB", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    Object.defineProperty(mockFile, "size", { value: 2048 });

    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [mockFile],
        },
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("2.00 KB")).toBeInTheDocument();
  });

  it("should remove file when delete button is clicked", async () => {
    const user = userEvent.setup();

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [mockFile],
        },
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const deleteButton = within(dialog).getByRole("button", {
      name: /delete/i,
    });

    await user.click(deleteButton);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", []);
  });

  it("should not display file list when no files are uploaded", () => {
    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("list")).not.toBeInTheDocument();
  });

  it("should show loading state when submitting", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        isSubmitting: true,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const updateButton = within(dialog).getByRole("button", {
      name: /updating/i,
    });

    expect(updateButton).toBeInTheDocument();
    expect(updateButton).toHaveTextContent("Updating...");
  });

  it("should disable update button when submitting", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        isSubmitting: true,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const updateButton = within(dialog).getByRole("button", {
      name: /updating/i,
    });

    expect(updateButton).toBeDisabled();
  });

  it("should disable cancel button when submitting", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        isSubmitting: true,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const dialog = screen.getByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", {
      name: /cancel/i,
    });

    expect(cancelButton).toBeDisabled();
  });

  it("should show circular progress when submitting", () => {
    vi.mocked(useEditSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        isSubmitting: true,
      } as never,
    });

    render(<EditSessionModal session={mockSession} onClose={mockOnClose} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
  });
});
