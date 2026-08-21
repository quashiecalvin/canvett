import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { timeAgo } from "./time"

const NOW = new Date("2026-01-01T12:00:00Z")

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const secondsAgo = (secs) => new Date(NOW.getTime() - secs * 1000).toISOString()

  it("returns 'just now' for very recent dates", () => {
    expect(timeAgo(secondsAgo(0))).toBe("just now")
    expect(timeAgo(secondsAgo(59))).toBe("just now")
  })

  it("returns singular units", () => {
    expect(timeAgo(secondsAgo(60))).toBe("1 minute ago")
    expect(timeAgo(secondsAgo(3600))).toBe("1 hour ago")
    expect(timeAgo(secondsAgo(86400))).toBe("1 day ago")
    expect(timeAgo(secondsAgo(604800))).toBe("1 week ago")
    expect(timeAgo(secondsAgo(2592000))).toBe("1 month ago")
    expect(timeAgo(secondsAgo(31536000))).toBe("1 year ago")
  })

  it("returns plural units", () => {
    expect(timeAgo(secondsAgo(120))).toBe("2 minutes ago")
    expect(timeAgo(secondsAgo(7200))).toBe("2 hours ago")
    expect(timeAgo(secondsAgo(172800))).toBe("2 days ago")
    expect(timeAgo(secondsAgo(63072000))).toBe("2 years ago")
  })

  it("picks the largest applicable unit", () => {
    expect(timeAgo(secondsAgo(90000))).toBe("1 day ago")
    expect(timeAgo(secondsAgo(3660))).toBe("1 hour ago")
  })
})
