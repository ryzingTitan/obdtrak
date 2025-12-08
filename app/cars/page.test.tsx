import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Cars from "./page";
import React from "react";

vi.mock("./_components/CarsDataGrid", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "cars-data-grid" }),
}));

describe("Cars Page", () => {
  it("should render CarsDataGrid component", () => {
    render(<Cars />);

    expect(screen.getByTestId("cars-data-grid")).toBeInTheDocument();
  });
});
