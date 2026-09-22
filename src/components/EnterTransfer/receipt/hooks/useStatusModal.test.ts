import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStatusModal } from "./useStatusModal.ts";

let haptics: string[];
beforeEach(() => {
    haptics = [];
    vi.useFakeTimers();
    (window as any).Telegram = { WebApp: { HapticFeedback: { notificationOccurred: (t: string) => haptics.push(t) } } };
});
afterEach(() => { vi.useRealTimers(); delete (window as any).Telegram; });

describe("useStatusModal", () => {
    it("starts empty", () => {
        const { result } = renderHook(() => useStatusModal());
        expect(result.current.state).toBeNull();
    });

    it("loading fires no haptic and does not auto-hide by default (autoHideMs 0)", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("loading", "Loading...", 0));
        expect(result.current.state).toEqual({ status: "loading", message: "Loading..." });
        act(() => { vi.advanceTimersByTime(10_000); });
        expect(result.current.state).not.toBeNull();
        expect(haptics).toEqual([]);
    });

    it("success fires exactly one success haptic and auto-hides after the given delay", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("success", "Saved!", 2000));
        expect(haptics).toEqual(["success"]);
        act(() => { vi.advanceTimersByTime(1999); });
        expect(result.current.state).not.toBeNull();
        act(() => { vi.advanceTimersByTime(1); });
        expect(result.current.state).toBeNull();
    });

    it("saved is treated like success", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("saved", "Saved"));
        expect(haptics).toEqual(["success"]);
    });

    it("error fires exactly one error haptic (was: two, see ReceiptTab's old warning+error double haptic)", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("error", "Nope", 2000));
        expect(haptics).toEqual(["error"]);
    });

    it("a new show() cancels the previous auto-hide timer, so it cannot clear a later status", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("error", "first", 1000));
        act(() => { vi.advanceTimersByTime(500); });
        act(() => result.current.show("success", "second", 5000));
        act(() => { vi.advanceTimersByTime(600); }); // total 1100ms: the first timer would have fired by now
        expect(result.current.state).toEqual({ status: "success", message: "second" });
    });

    it("hide() clears the state and cancels the pending timer", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("error", "x", 1000));
        act(() => result.current.hide());
        expect(result.current.state).toBeNull();
        act(() => { vi.advanceTimersByTime(2000); });
        expect(result.current.state).toBeNull();
    });

    it("autoHideMs 0 keeps success/error up until the next show() or hide()", () => {
        const { result } = renderHook(() => useStatusModal());
        act(() => result.current.show("error", "stays", 0));
        act(() => { vi.advanceTimersByTime(60_000); });
        expect(result.current.state).not.toBeNull();
    });

    it("unmounting clears the timer (no state update on an unmounted hook)", () => {
        const { result, unmount } = renderHook(() => useStatusModal());
        const warn = vi.spyOn(console, "error").mockImplementation(() => {});
        act(() => result.current.show("error", "x", 1000));
        unmount();
        act(() => { vi.advanceTimersByTime(2000); });
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });
});
