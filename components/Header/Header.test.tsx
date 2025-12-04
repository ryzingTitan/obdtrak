import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

const mockUseUser = vi.fn();

vi.mock("@auth0/nextjs-auth0", () => ({
  useUser: () => mockUseUser(),
}));

vi.mock("@/lib/auth0", () => ({
  logoutUrl: "/api/auth/logout",
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => {
    return <img src={src} alt={alt} width={width} height={height} />;
  },
}));

describe("Header", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { location?: Location }).location;
    window.location = { ...originalLocation, href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("should render app logo", () => {
    mockUseUser.mockReturnValue({
      user: { name: "Test User", image: "https://example.com/avatar.png" },
    });
    render(<Header />);

    const logos = screen.getAllByAltText("App Logo");
    expect(logos.length).toBeGreaterThan(0);
  });

  it("should render user avatar", () => {
    mockUseUser.mockReturnValue({
      user: { name: "Test User", image: "https://example.com/avatar.png" },
    });
    render(<Header />);

    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThan(0);
  });

  it("should render logout button", () => {
    mockUseUser.mockReturnValue({
      user: { name: "Test User", image: "https://example.com/avatar.png" },
    });
    render(<Header />);

    const logoutButton = screen.getAllByRole("button")[0];
    expect(logoutButton).toBeInTheDocument();
  });

  it("should redirect to logout URL when logout button is clicked", async () => {
    mockUseUser.mockReturnValue({
      user: { name: "Test User", image: "https://example.com/avatar.png" },
    });
    const user = userEvent.setup();
    render(<Header />);

    const logoutButton = screen.getAllByRole("button")[0];
    await user.click(logoutButton);

    expect(window.location.href).toBe("/api/auth/logout");
  });

  it("should handle user without image", () => {
    mockUseUser.mockReturnValue({
      user: { name: "Test User", image: null },
    });
    render(<Header />);

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("should handle undefined user", () => {
    mockUseUser.mockReturnValue({
      user: undefined,
    });
    render(<Header />);

    const logos = screen.getAllByAltText("App Logo");
    expect(logos.length).toBeGreaterThan(0);
  });
});
