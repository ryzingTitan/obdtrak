import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Tracks from "./page";
import React from "react";

vi.mock("./_components/TracksDataGrid", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "tracks-data-grid" }),
}));

describe("Tracks Page", () => {
  it("should render TracksDataGrid component", () => {
    render(<Tracks />);

    expect(screen.getByTestId("tracks-data-grid")).toBeInTheDocument();
  });
});
