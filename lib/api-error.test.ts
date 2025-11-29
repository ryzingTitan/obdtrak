import { describe, it, expect } from "vitest";
import { ApiError } from "./api-error";

describe("ApiError", () => {
  it("should create an ApiError with all properties", () => {
    const error = new ApiError("Test error", 404, "Not Found");
    expect(error.message).toBe("Test error");
    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
    expect(error.name).toBe("ApiError");
  });

  it("should be an instance of Error", () => {
    const error = new ApiError("Test error", 500, "Internal Server Error");
    expect(error).toBeInstanceOf(Error);
  });
});
