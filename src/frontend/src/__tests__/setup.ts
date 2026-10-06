import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` hooks; make them queryable by test id
// without misreading a missing semantic selector as a timing failure.
configure({ testIdAttribute: "data-ocid" });

// Vitest runs without globals here, so RTL's automatic cleanup is not
// registered; without this every render accumulates in the same document.
afterEach(() => {
  cleanup();
});

// jsdom does not implement the pointer-capture and scroll APIs Radix UI's
// Select calls while opening its listbox; without these stubs the interaction
// throws `target.hasPointerCapture is not a function` before any option renders.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Recharts' ResponsiveContainer observes its box; jsdom has no ResizeObserver.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverStub;
}
