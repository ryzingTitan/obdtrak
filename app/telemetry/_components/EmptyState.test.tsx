import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("should render title and message text", () => {
    const { container } = render(
      <EmptyState title="No Data" message="Please select a session" />,
    );

    expect(container.textContent).toContain("No Data");
    expect(container.textContent).toContain("Please select a session");
  });

  it("should render both title and message with different content", () => {
    const { container } = render(
      <EmptyState
        title="No Sessions Available"
        message="Create a track session to view telemetry data"
      />,
    );

    expect(container.textContent).toContain("No Sessions Available");
    expect(container.textContent).toContain(
      "Create a track session to view telemetry data",
    );
  });

  it("should render as MUI Box component", () => {
    const { container } = render(
      <EmptyState title="Test" message="Test message" />,
    );

    const box = container.querySelector(".MuiBox-root");
    expect(box).toBeInTheDocument();
  });

  it("should render title with correct heading variant", () => {
    const { container } = render(
      <EmptyState title="Unique Test Title" message="Unique test message" />,
    );

    const title = container.querySelector("h6");
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe("Unique Test Title");
  });
});
