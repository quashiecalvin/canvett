import { describe, it, expect } from "vitest"
import { scoreBarColor } from "./scoreColor"

describe("scoreBarColor", () => {
  it("returns success for scores of 75 and above", () => {
    expect(scoreBarColor(75)).toBe("bg-success")
    expect(scoreBarColor(100)).toBe("bg-success")
  })

  it("returns amber for scores between 50 and 74", () => {
    expect(scoreBarColor(50)).toBe("bg-score-amber")
    expect(scoreBarColor(74.9)).toBe("bg-score-amber")
  })

  it("returns danger for scores below 50", () => {
    expect(scoreBarColor(49.9)).toBe("bg-danger")
    expect(scoreBarColor(0)).toBe("bg-danger")
  })
})
