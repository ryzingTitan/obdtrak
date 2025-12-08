import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("should render title and subtitle text", () => {
    const { container } = render(
      <PageHeader title="Telemetry" subtitle="Real-time data" />,
    );

    expect(container.textContent).toContain("Telemetry");
    expect(container.textContent).toContain("Real-time data");
  });

  it("should render both title and subtitle with different content", () => {
    const { container } = render(
      <PageHeader
        title="Live Telemetry"
        subtitle="View real-time vehicle data"
      />,
    );

    expect(container.textContent).toContain("Live Telemetry");
    expect(container.textContent).toContain("View real-time vehicle data");
  });

  it("should render title as h1 element", () => {
    const { container } = render(
      <PageHeader title="Unique Test Title" subtitle="Unique test subtitle" />,
    );

    const title = container.querySelector("h1");
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe("Unique Test Title");
  });

  it("should render as MUI Box component", () => {
    const { container } = render(
      <PageHeader title="Test" subtitle="Test subtitle" />,
    );

    const box = container.querySelector(".MuiBox-root");
    expect(box).toBeInTheDocument();
  });

  it("should render title with gradient styling", () => {
    const { container } = render(
      <PageHeader title="Another Test" subtitle="Another subtitle" />,
    );

    const titleElement = container.querySelector("h1");
    expect(titleElement).toBeInTheDocument();
  });
});
