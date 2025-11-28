import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTracks } from "./useTracks";
import {
  createTrack,
  deleteTrack,
  getAllTracks,
  updateTrack,
} from "@/lib/tracks";
import Track from "@/types/api";
import { SWRConfig } from "swr";
import { SnackbarProvider } from "notistack";
import React from "react";

vi.mock("@/lib/tracks");

vi.mock("@mui/x-data-grid", () => ({
  GridRowModes: { Edit: "edit", View: "view" },
}));

const mockTracks: Track[] = [
  { id: "1", name: "Laguna Seca", latitude: 36.5844, longitude: -121.7538 },
  {
    id: "2",
    name: "Circuit of the Americas",
    latitude: 30.1328,
    longitude: -97.6411,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    React.createElement(SnackbarProvider, {}, children),
  );
};

describe("useTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllTracks).mockResolvedValue(mockTracks);
  });

  it("should fetch tracks on mount", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    expect(getAllTracks).toHaveBeenCalledWith("/tracks");
  });

  it("should set isLoading to true while fetching", () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle adding a new row", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    act(() => {
      result.current.handleAddNew();
    });

    await waitFor(() => {
      expect(result.current.rows?.length).toBe(3);
    });

    const newRow = result.current.rows?.[0];
    expect(newRow?.id).toMatch(/^new-\d+$/);
    expect(newRow?.name).toBe("");
    expect(newRow?.latitude).toBe(0);
    expect(newRow?.longitude).toBe(0);
  });

  it("should set row to edit mode when handleEditClick is called", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("edit");
  });

  it("should set row to view mode when handleSaveClick is called", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    act(() => {
      const saveHandler = result.current.handleSaveClick("1");
      saveHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("view");
  });

  it("should remove new row when handleCancelClick is called", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    act(() => {
      result.current.handleAddNew();
    });

    const newRowId = result.current.rows?.[0]?.id;

    act(() => {
      const cancelHandler = result.current.handleCancelClick(newRowId!);
      cancelHandler();
    });

    await waitFor(() => {
      expect(result.current.rows?.length).toBe(2);
    });
  });

  it("should set existing row to view mode with ignoreModifications when handleCancelClick is called", async () => {
    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("edit");

    act(() => {
      const cancelHandler = result.current.handleCancelClick("1");
      cancelHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("view");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result.current.rowModesModel["1"] as any)?.ignoreModifications).toBe(
      true,
    );
    expect(result.current.rows?.length).toBe(2);
  });

  it("should call deleteTrack when handleDeleteClick is called", async () => {
    vi.mocked(deleteTrack).mockResolvedValue();

    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    await act(async () => {
      const deleteHandler = result.current.handleDeleteClick("1");
      await deleteHandler();
    });

    expect(deleteTrack).toHaveBeenCalledWith("/tracks", "1");
  });

  it("should call createTrack when processRowUpdate is called with new row", async () => {
    const newTrack: Track = {
      id: "3",
      name: "Nürburgring",
      latitude: 50.3356,
      longitude: 6.9475,
    };
    vi.mocked(createTrack).mockResolvedValue(newTrack);

    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    const newRow = {
      id: "new-123",
      name: "Nürburgring",
      latitude: 50.3356,
      longitude: 6.9475,
    };

    await act(async () => {
      await result.current.processRowUpdate(newRow, newRow);
    });

    expect(createTrack).toHaveBeenCalledWith("/tracks", newRow);
  });

  it("should call updateTrack when processRowUpdate is called with existing row", async () => {
    const updatedTrack: Track = {
      id: "1",
      name: "Laguna Seca Updated",
      latitude: 36.5844,
      longitude: -121.7538,
    };
    vi.mocked(updateTrack).mockResolvedValue(updatedTrack);

    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    await act(async () => {
      await result.current.processRowUpdate(updatedTrack, mockTracks[0]);
    });

    expect(updateTrack).toHaveBeenCalledWith("/tracks", "1", updatedTrack);
  });

  it("should handle errors when creating a track fails", async () => {
    vi.mocked(createTrack).mockRejectedValue(
      new Error("Failed to create track"),
    );

    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    const newRow = {
      id: "new-123",
      name: "Test Track",
      latitude: 0,
      longitude: 0,
    };

    await expect(
      act(async () => {
        await result.current.processRowUpdate(newRow, newRow);
      }),
    ).rejects.toThrow();
  });

  it("should handle errors when deleting a track fails", async () => {
    vi.mocked(deleteTrack).mockRejectedValue(
      new Error("Failed to delete track"),
    );

    const { result } = renderHook(() => useTracks(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockTracks);
    });

    await act(async () => {
      const deleteHandler = result.current.handleDeleteClick("1");
      await deleteHandler();
    });

    expect(deleteTrack).toHaveBeenCalledWith("/tracks", "1");
  });
});
