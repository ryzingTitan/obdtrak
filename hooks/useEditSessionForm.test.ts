import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEditSessionForm } from "./useEditSessionForm";
import { updateSession } from "@/lib/sessions";
import { getAllCars } from "@/lib/cars";
import { getAllTracks } from "@/lib/tracks";
import { SWRConfig } from "swr";
import { SnackbarProvider, useSnackbar } from "notistack";
import React from "react";
import { Session } from "@/types/api";

vi.mock("@/lib/sessions");
vi.mock("@/lib/cars");
vi.mock("@/lib/tracks");

vi.mock("notistack", async () => {
  const actual = await vi.importActual("notistack");
  return {
    ...actual,
    useSnackbar: vi.fn(),
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    React.createElement(SnackbarProvider, {}, children),
  );
};

describe("useEditSessionForm", () => {
  const mockEnqueueSnackbar = vi.fn();

  const mockSession: Session = {
    id: "session123",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    carYear: 2020,
    carMake: "Toyota",
    carModel: "Supra",
    trackName: "Laguna Seca",
    trackLatitude: 36.5844,
    trackLongitude: -121.7544,
  };

  const mockCars = [
    {
      id: "car123",
      year: 2020,
      make: "Toyota",
      model: "Supra",
    },
    {
      id: "car456",
      year: 2021,
      make: "Honda",
      model: "Civic",
    },
  ];

  const mockTracks = [
    {
      id: "track123",
      name: "Laguna Seca",
      latitude: 36.5844,
      longitude: -121.7544,
    },
    {
      id: "track456",
      name: "Watkins Glen",
      latitude: 42.3369,
      longitude: -76.9275,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSnackbar).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: vi.fn(),
    });
    vi.mocked(getAllCars).mockResolvedValue(mockCars);
    vi.mocked(getAllTracks).mockResolvedValue(mockTracks);
  });

  it("should initialize with session values", async () => {
    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
      expect(result.current.formik.values.trackId).toBe("track123");
      expect(result.current.formik.values.uploadFiles).toEqual([]);
    });
  });

  it("should handle session with no matching car", async () => {
    const sessionWithNoMatchingCar: Session = {
      ...mockSession,
      carYear: 2019,
      carMake: "Unknown",
      carModel: "Unknown",
    };

    const { result } = renderHook(
      () => useEditSessionForm(sessionWithNoMatchingCar),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("");
    });
  });

  it("should handle session with no matching track", async () => {
    const sessionWithNoMatchingTrack: Session = {
      ...mockSession,
      trackName: "Unknown Track",
    };

    const { result } = renderHook(
      () => useEditSessionForm(sessionWithNoMatchingTrack),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.formik.values.trackId).toBe("");
    });
  });

  it("should update session successfully", async () => {
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    act(() => {
      result.current.formik.setFieldValue("carId", "car456");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(updateSession).toHaveBeenCalledWith("/sessions/session123", {
        carId: "car456",
        trackId: "track456",
        uploadFiles: [],
      });
    });
  });

  it("should show success snackbar after successful submission", async () => {
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith("Session updated", {
        variant: "success",
      });
    });
  });

  it("should reset form after successful submission", async () => {
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    act(() => {
      result.current.formik.setFieldValue("uploadFiles", [
        new File(["content"], "test.txt"),
      ]);
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.values.uploadFiles).toEqual([]);
    });
  });

  it("should call onSuccess callback after successful submission", async () => {
    vi.mocked(updateSession).mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useEditSessionForm(mockSession, onSuccess),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("should show error snackbar when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(updateSession).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Failed to update session",
        {
          variant: "error",
        },
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should log error to console when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(updateSession).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to update session:",
        error,
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should not reset form when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(updateSession).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    act(() => {
      result.current.formik.setFieldValue("carId", "car456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car456");
    });

    consoleErrorSpy.mockRestore();
  });

  it("should set submitting to false after successful submission", async () => {
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.isSubmitting).toBe(false);
    });
  });

  it("should set submitting to false after failed submission", async () => {
    const error = new Error("Network error");
    vi.mocked(updateSession).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.isSubmitting).toBe(false);
    });

    consoleErrorSpy.mockRestore();
  });

  it("should handle form field changes", async () => {
    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    act(() => {
      result.current.formik.handleChange({
        target: { name: "carId", value: "car456" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formik.values.carId).toBe("car456");

    act(() => {
      result.current.formik.handleChange({
        target: { name: "trackId", value: "track456" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formik.values.trackId).toBe("track456");
  });

  it("should handle form field blur", async () => {
    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    act(() => {
      result.current.formik.handleBlur({
        target: { name: "carId" },
      } as React.FocusEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.formik.touched.carId).toBe(true);
    });

    act(() => {
      result.current.formik.handleBlur({
        target: { name: "trackId" },
      } as React.FocusEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.formik.touched.trackId).toBe(true);
    });
  });

  it("should not call onSuccess when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(updateSession).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useEditSessionForm(mockSession, onSuccess),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should reinitialize form when session changes", async () => {
    const { result, rerender } = renderHook(
      ({ session }: { session: Session }) => useEditSessionForm(session),
      {
        wrapper,
        initialProps: { session: mockSession },
      },
    );

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
      expect(result.current.formik.values.trackId).toBe("track123");
    });

    const newSession: Session = {
      id: "session456",
      startTime: "2024-01-16T14:00:00Z",
      endTime: "2024-01-16T15:00:00Z",
      carYear: 2021,
      carMake: "Honda",
      carModel: "Civic",
      trackName: "Watkins Glen",
      trackLatitude: 42.3369,
      trackLongitude: -76.9275,
    };

    rerender({ session: newSession });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car456");
      expect(result.current.formik.values.trackId).toBe("track456");
    });
  });

  it("should handle uploadFiles field", async () => {
    const { result } = renderHook(() => useEditSessionForm(mockSession), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.formik.values.carId).toBe("car123");
    });

    const testFile = new File(["content"], "test.txt");

    act(() => {
      result.current.formik.setFieldValue("uploadFiles", [testFile]);
    });

    expect(result.current.formik.values.uploadFiles).toEqual([testFile]);
  });
});
