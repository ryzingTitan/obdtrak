import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sessions from "./page";
import React from "react";

vi.mock("./_components/SessionsDataGrid", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "sessions-data-grid" }),
}));

describe("Sessions Page", () => {
  it("should render SessionsDataGrid component", () => {
    render(<Sessions />);

    expect(screen.getByTestId("sessions-data-grid")).toBeInTheDocument();
  });
});
