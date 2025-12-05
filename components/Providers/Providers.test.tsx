import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "./Providers";

describe("Providers", () => {
  it("should render children", () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>,
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should wrap children with SWRConfig and SnackbarProvider", () => {
    const { container } = render(
      <Providers>
        <div>Test Content</div>
      </Providers>,
    );

    expect(container.querySelector("div")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
