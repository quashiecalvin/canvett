// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { exportToCsv } from "./csv"

const blobText = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(blob)
  })

describe("exportToCsv", () => {
  let capturedBlob
  let clickSpy

  beforeEach(() => {
    capturedBlob = null
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn((blob) => {
        capturedBlob = blob
        return "blob:mock-url"
      }),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("does nothing for empty or missing rows", () => {
    exportToCsv("empty.csv", [])
    exportToCsv("empty.csv", null)
    expect(clickSpy).not.toHaveBeenCalled()
  })

  it("builds a CSV with headers from the first row and quoted values", async () => {
    exportToCsv("data.csv", [
      { name: "Jane", score: 91 },
      { name: "Bob", score: 75 },
    ])

    expect(clickSpy).toHaveBeenCalledOnce()
    const text = await blobText(capturedBlob)
    expect(text).toBe('name,score\n"Jane","91"\n"Bob","75"')
  })

  it("escapes embedded double quotes and converts null to empty string", async () => {
    exportToCsv("data.csv", [{ name: 'Jane "JJ" Doe', note: null }])

    const text = await blobText(capturedBlob)
    expect(text).toBe('name,note\n"Jane ""JJ"" Doe",""')
  })

  it("triggers a download with the given filename and revokes the object URL", () => {
    exportToCsv("report.csv", [{ a: 1 }])

    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
    expect(clickSpy).toHaveBeenCalledOnce()
  })
})
