import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "./Footer";

const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation with Tracks and Cars", () => {
    mockPathname.mockReturnValue("/tracks");
    render(<Footer />);

    expect(screen.getByText("Tracks")).toBeInTheDocument();
    expect(screen.getByText("Cars")).toBeInTheDocument();
  });

  it("should initialize with correct value for /tracks route", () => {
    mockPathname.mockReturnValue("/tracks");
    render(<Footer />);

    const tracksButton = screen.getAllByText("Tracks")[0].closest("button");
    expect(tracksButton).toBeInTheDocument();
  });

  it("should initialize with correct value for /cars route", () => {
    mockPathname.mockReturnValue("/cars");
    render(<Footer />);

    const carsButton = screen.getAllByText("Cars")[0].closest("button");
    expect(carsButton).toBeInTheDocument();
  });

  it("should navigate to /tracks when Tracks is clicked", async () => {
    mockPathname.mockReturnValue("/cars");
    const user = userEvent.setup();
    render(<Footer />);

    const tracksButton = screen.getAllByText("Tracks")[0];
    await user.click(tracksButton);

    expect(mockPush).toHaveBeenCalledWith("/tracks");
  });

  it("should navigate to /cars when Cars is clicked", async () => {
    mockPathname.mockReturnValue("/tracks");
    const user = userEvent.setup();
    render(<Footer />);

    const carsButton = screen.getAllByText("Cars")[0];
    await user.click(carsButton);

    expect(mockPush).toHaveBeenCalledWith("/cars");
  });

  it("should render when pathname is not recognized", () => {
    mockPathname.mockReturnValue("/unknown");
    render(<Footer />);

    const tracksButton = screen.getAllByText("Tracks")[0].closest("button");
    expect(tracksButton).toBeInTheDocument();
  });
});
