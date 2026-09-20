import { describe, expect, test } from "bun:test";
import { AppFailure, OK, failed, failureReason, isQuotaError } from "./failure";

describe("failureReason", () => {
  test("a reason passes through, an AppFailure gives its own", () => {
    expect(failureReason("quota")).toBe("quota");
    expect(failureReason(new AppFailure("limit"))).toBe("limit");
  });

  test("an Outcome gives its reason, a good one reads unknown", () => {
    expect(failureReason(failed("notFound"))).toBe("notFound");
    expect(failureReason(OK)).toBe("unknown");
  });

  test("the browser's storage errors read quota, by name or by code", () => {
    expect(failureReason(new DOMException("full", "QuotaExceededError"))).toBe("quota");
    expect(isQuotaError({ name: "NS_ERROR_DOM_QUOTA_REACHED" })).toBe(true);
    expect(isQuotaError({ code: 22 })).toBe(true);
    expect(isQuotaError(new Error("full"))).toBe(false);
  });

  test("a dismissed native sheet is a cancellation, not an error", () => {
    expect(failureReason(new DOMException("closed", "AbortError"))).toBe("cancelled");
  });

  test("a refused access reads denied, a missing API unsupported", () => {
    expect(failureReason(new DOMException("no", "NotAllowedError"))).toBe("denied");
    expect(failureReason(new DOMException("no", "NotSupportedError"))).toBe("unsupported");
  });

  test("an error from another realm is read by its name", () => {
    expect(failureReason({ name: "AbortError", message: "x" })).toBe("cancelled");
  });

  test("anything else is unknown, never a guess from the message", () => {
    expect(failureReason(new Error("quota exceeded"))).toBe("unknown");
    expect(failureReason(undefined)).toBe("unknown");
    expect(failureReason("not a reason")).toBe("unknown");
  });
});

describe("failed", () => {
  test("wraps whatever was caught into an Outcome", () => {
    const outcome = failed(new DOMException("full", "QuotaExceededError"));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("quota");
  });
});
