import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewTabs from "./ViewTabs";

describe("ViewTabs", () => {
  it("renders track map tab", () => {
    const { container } = render(
      <ViewTabs currentView={0} onViewChange={vi.fn()} hasVideo={false} />,
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent("Track Map");
    cleanup();
  });

  it("renders both tabs when video is available", () => {
    const { container } = render(
      <ViewTabs currentView={0} onViewChange={vi.fn()} hasVideo={true} />,
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent("Track Map");
    expect(tabs[1]).toHaveTextContent("Video");
    cleanup();
  });

  it("hides video tab when video is not available", () => {
    const { container } = render(
      <ViewTabs currentView={0} onViewChange={vi.fn()} hasVideo={false} />,
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent("Track Map");
    cleanup();
  });

  it("calls onViewChange when tab is clicked", async () => {
    const user = userEvent.setup();
    const handleViewChange = vi.fn();

    const { container } = render(
      <ViewTabs
        currentView={0}
        onViewChange={handleViewChange}
        hasVideo={true}
      />,
    );

    const tabs = container.querySelectorAll('[role="tab"]');
    await user.click(tabs[1]); // Click video tab

    expect(handleViewChange).toHaveBeenCalledWith(1);
    cleanup();
  });

  it("displays correct tab as selected", () => {
    const { container, rerender } = render(
      <ViewTabs currentView={0} onViewChange={vi.fn()} hasVideo={true} />,
    );

    let tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    rerender(
      <ViewTabs currentView={1} onViewChange={vi.fn()} hasVideo={true} />,
    );

    tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    cleanup();
  });
});
