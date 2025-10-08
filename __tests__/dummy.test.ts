import { returnTrue } from "@/lib/dummy";

describe("Dummy", () => {
  it("should pass", () => {
    expect(returnTrue()).toBe(true);
  });
});
