import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddSessionModal from "./AddSessionModal";
import { useAddSessionForm } from "@/hooks/useAddSessionForm";
import useSWR from "swr";
import { Car } from "@/types/api";
import Track from "@/types/api";

vi.mock("@/hooks/useAddSessionForm");
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

describe("AddSessionModal", () => {
  const mockFormik = {
    values: {
      carId: "",
      trackId: "",
      uploadFiles: [],
    },
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSubmit: vi.fn(),
    resetForm: vi.fn(),
    setFieldValue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: mockFormik as never,
    });

    vi.mocked(useSWR).mockImplementation((key) => {
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

  it("should render the FAB button", () => {
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    expect(fabButtons.length).toBeGreaterThan(0);
  });

  it("should not show dialog initially", () => {
    render(<AddSessionModal />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should open dialog when FAB button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add Session")).toBeInTheDocument();
  });

  it("should render track name dropdown", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Track Name")).toBeInTheDocument();
  });

  it("should render car dropdown", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Car")).toBeInTheDocument();
  });

  it("should render cancel and save buttons", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("should disable save button when form is invalid", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("should enable save button when form is valid", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).not.toBeDisabled();
  });

  it("should call resetForm when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", {
      name: /cancel/i,
    });
    await user.click(cancelButton);

    expect(mockFormik.resetForm).toHaveBeenCalledTimes(1);
  });

  it("should call handleSubmit when save is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    expect(mockFormik.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should display track name error when touched and invalid", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        errors: {
          trackId: "Track is required",
        },
        touched: {
          trackId: true,
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const trackSelect = within(dialog).getAllByLabelText("Track Name")[0];
    expect(trackSelect).toHaveAttribute("aria-invalid", "true");
  });

  it("should display car error when touched and invalid", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        errors: {
          carId: "Car is required",
        },
        touched: {
          carId: true,
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const carSelect = within(dialog).getAllByLabelText("Car")[0];
    expect(carSelect).toHaveAttribute("aria-invalid", "true");
  });

  it("should handle empty tracks list", async () => {
    const user = userEvent.setup();

    vi.mocked(useSWR).mockImplementation((key) => {
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
          data: [],
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

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Track Name")).toBeInTheDocument();
  });

  it("should handle empty cars list", async () => {
    const user = userEvent.setup();

    vi.mocked(useSWR).mockImplementation((key) => {
      if (key === "/cars") {
        return {
          data: [],
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

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Car")).toBeInTheDocument();
  });

  it("should render file upload dropzone", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        /drag and drop files here, or click to select files/i,
      ),
    ).toBeInTheDocument();
  });

  it("should call setFieldValue when files are dropped", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const dialog = screen.getByRole("dialog");
    const input = dialog.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, file);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", [
      file,
    ]);
  });

  it("should display uploaded files in a list", async () => {
    const user = userEvent.setup();

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "",
          trackId: "",
          uploadFiles: [mockFile],
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("test.txt")).toBeInTheDocument();
  });

  it("should display file size in KB", async () => {
    const user = userEvent.setup();

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    Object.defineProperty(mockFile, "size", { value: 2048 });

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "",
          trackId: "",
          uploadFiles: [mockFile],
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("2.00 KB")).toBeInTheDocument();
  });

  it("should remove file when delete button is clicked", async () => {
    const user = userEvent.setup();

    const mockFile1 = new File(["test content 1"], "test1.txt", {
      type: "text/plain",
    });
    const mockFile2 = new File(["test content 2"], "test2.txt", {
      type: "text/plain",
    });

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "",
          trackId: "",
          uploadFiles: [mockFile1, mockFile2],
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const deleteButtons = within(dialog).getAllByRole("button", {
      name: /delete/i,
    });

    await user.click(deleteButtons[0]);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", [
      mockFile2,
    ]);
  });

  it("should upload multiple files", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const file1 = new File(["test content 1"], "test1.txt", {
      type: "text/plain",
    });
    const file2 = new File(["test content 2"], "test2.txt", {
      type: "text/plain",
    });

    const dialog = screen.getByRole("dialog");
    const input = dialog.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, [file1, file2]);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", [
      file1,
      file2,
    ]);
  });

  it("should append new files to existing files", async () => {
    const user = userEvent.setup();

    const existingFile = new File(["existing"], "existing.txt", {
      type: "text/plain",
    });

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "",
          trackId: "",
          uploadFiles: [existingFile],
        },
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const newFile = new File(["new content"], "new.txt", {
      type: "text/plain",
    });

    const dialog = screen.getByRole("dialog");
    const input = dialog.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, newFile);

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("uploadFiles", [
      existingFile,
      newFile,
    ]);
  });

  it("should not display file list when no files are uploaded", async () => {
    const user = userEvent.setup();
    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("list")).not.toBeInTheDocument();
  });

  it("should reset files when form is reset", async () => {
    const user = userEvent.setup();

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [mockFile],
        },
        isValid: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", {
      name: /cancel/i,
    });
    await user.click(cancelButton);

    expect(mockFormik.resetForm).toHaveBeenCalledTimes(1);
  });

  it("should show loading state when submitting", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
        isSubmitting: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const saveButton = within(dialog).getByRole("button", {
      name: /saving/i,
    });

    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveTextContent("Saving...");
  });

  it("should disable save button when submitting", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
        isSubmitting: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const saveButton = within(dialog).getByRole("button", {
      name: /saving/i,
    });

    expect(saveButton).toBeDisabled();
  });

  it("should disable cancel button when submitting", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
        isSubmitting: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const dialog = screen.getByRole("dialog");
    const cancelButton = within(dialog).getByRole("button", {
      name: /cancel/i,
    });

    expect(cancelButton).toBeDisabled();
  });

  it("should show circular progress when submitting", async () => {
    const user = userEvent.setup();

    vi.mocked(useAddSessionForm).mockReturnValue({
      formik: {
        ...mockFormik,
        values: {
          carId: "car1",
          trackId: "track1",
          uploadFiles: [],
        },
        isValid: true,
        isSubmitting: true,
      } as never,
    });

    render(<AddSessionModal />);

    const fabButtons = screen.getAllByRole("button", { name: /add session/i });
    await user.click(fabButtons[0]);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
  });
});
