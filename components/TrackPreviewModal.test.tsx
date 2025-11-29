import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrackPreviewModal from "./TrackPreviewModal";
import Track from "@/types/api";
import React from "react";

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

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "map-container" }, children),
  TileLayer: () => React.createElement("div", { "data-testid": "tile-layer" }),
  Marker: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "marker" }, children),
  Popup: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "popup" }, children),
}));

const mockTrack: Track = {
  id: "1",
  name: "Laguna Seca",
  latitude: 36.5844,
  longitude: -121.7538,
};

describe("TrackPreviewModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog when open is true and track is provided", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    expect(screen.getByText(/Preview Track: Laguna Seca/i)).toBeInTheDocument();
  });

  it("should render map container with track coordinates", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    expect(
      document.querySelector('[data-testid="map-container"]'),
    ).toBeInTheDocument();
  });

  it("should render tile layer", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    expect(
      document.querySelector('[data-testid="tile-layer"]'),
    ).toBeInTheDocument();
  });

  it("should render marker with popup", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    expect(
      document.querySelector('[data-testid="marker"]'),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-testid="popup"]')).toBeInTheDocument();
  });

  it("should display track name in popup", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    const popups = screen.getAllByText("Laguna Seca");
    expect(popups.length).toBeGreaterThan(0);
  });

  it("should render close button", () => {
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TrackPreviewModal track={mockTrack} open={true} onClose={mockOnClose} />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should not render when track is null", () => {
    const { container } = render(
      <TrackPreviewModal track={null} open={true} onClose={mockOnClose} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should display correct track name in dialog title", () => {
    const customTrack: Track = {
      id: "2",
      name: "Circuit of the Americas",
      latitude: 30.1328,
      longitude: -97.6411,
    };

    render(
      <TrackPreviewModal
        track={customTrack}
        open={true}
        onClose={mockOnClose}
      />,
    );

    expect(
      screen.getByText(/Preview Track: Circuit of the Americas/i),
    ).toBeInTheDocument();
  });
});
