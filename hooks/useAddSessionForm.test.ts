import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAddSessionForm } from "./useAddSessionForm";
import { createSessions } from "@/lib/sessions";
import { SWRConfig } from "swr";
import { SnackbarProvider, useSnackbar } from "notistack";
import React from "react";

vi.mock("@/lib/sessions");

vi.mock("notistack", async () => {
  const actual = await vi.importActual("notistack");
  return {
    ...actual,
    useSnackbar: vi.fn(),
  };
});

vi.mock("@auth0/nextjs-auth0", () => ({
  useUser: vi.fn(() => ({
    user: { email: "test@example.com" },
  })),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    React.createElement(SnackbarProvider, {}, children),
  );
};

describe("useAddSessionForm", () => {
  const mockEnqueueSnackbar = vi.fn();
  vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSnackbar).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: vi.fn(),
    });
  });

  it("should initialize with empty form values", () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    expect(result.current.formik.values).toEqual({
      carId: "",
      trackId: "",
      uploadFiles: [],
    });
  });

  it("should have form invalid when values are empty", async () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldTouched("carId", true);
      result.current.formik.setFieldTouched("trackId", true);
    });

    await waitFor(() => {
      expect(result.current.formik.isValid).toBe(false);
    });
  });

  it("should validate carId is required", async () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldTouched("carId", true);
      result.current.formik.setFieldValue("carId", "");
    });

    await waitFor(() => {
      expect(result.current.formik.errors.carId).toBe("Car is required");
    });
  });

  it("should validate trackId is required", async () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldTouched("trackId", true);
      result.current.formik.setFieldValue("trackId", "");
    });

    await waitFor(() => {
      expect(result.current.formik.errors.trackId).toBe("Track is required");
    });
  });

  it("should be valid when all required fields are filled", async () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await waitFor(() => {
      expect(result.current.formik.isValid).toBe(true);
    });
  });

  it("should create session successfully", async () => {
    vi.mocked(createSessions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(createSessions).toHaveBeenCalledWith("/sessions", {
        carId: "car123",
        trackId: "track456",
        uploadFiles: [],
      });
    });
  });

  it("should show success snackbar after successful submission", async () => {
    vi.mocked(createSessions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith("Session created", {
        variant: "success",
      });
    });
  });

  it("should reset form after successful submission", async () => {
    vi.mocked(createSessions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.values).toEqual({
        carId: "",
        trackId: "",
        uploadFiles: [],
      });
    });
  });

  it("should call onSuccess callback after successful submission", async () => {
    vi.mocked(createSessions).mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAddSessionForm(onSuccess), {
      wrapper,
    });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
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
    vi.mocked(createSessions).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        "Failed to create session",
        {
          variant: "error",
        },
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should log error to console when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(createSessions).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to create session:",
        error,
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should not reset form when submission fails", async () => {
    const error = new Error("Network error");
    vi.mocked(createSessions).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.values).toEqual({
        carId: "car123",
        trackId: "track456",
        uploadFiles: [],
      });
    });

    consoleErrorSpy.mockRestore();
  });

  it("should set submitting to false after successful submission", async () => {
    vi.mocked(createSessions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
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
    vi.mocked(createSessions).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(result.current.formik.isSubmitting).toBe(false);
    });

    consoleErrorSpy.mockRestore();
  });

  it("should handle form field changes", () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

    act(() => {
      result.current.formik.handleChange({
        target: { name: "carId", value: "car123" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formik.values.carId).toBe("car123");

    act(() => {
      result.current.formik.handleChange({
        target: { name: "trackId", value: "track456" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formik.values.trackId).toBe("track456");
  });

  it("should handle form field blur", async () => {
    const { result } = renderHook(() => useAddSessionForm(), { wrapper });

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
    vi.mocked(createSessions).mockRejectedValue(error);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAddSessionForm(onSuccess), {
      wrapper,
    });

    act(() => {
      result.current.formik.setFieldValue("carId", "car123");
      result.current.formik.setFieldValue("trackId", "track456");
    });

    await act(async () => {
      await result.current.formik.submitForm();
    });

    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
