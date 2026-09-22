import { describe, expect, it } from "vitest";

import {
    buildFnsParamsPayload,
    buildFnsUrlPayload,
    buildYerevanCityPayload,
    validateFnsParams,
    validateFnsUrl,
    validateYerevanCity,
} from "./receiptForms.ts";

describe("validateYerevanCity", () => {
    it("requires a non-blank barcode", () => {
        expect(validateYerevanCity("")).toBe("Please enter a barcode");
        expect(validateYerevanCity("   ")).toBe("Please enter a barcode");
        expect(validateYerevanCity("LN0123456789")).toBeNull();
    });
});

describe("buildYerevanCityPayload", () => {
    it("trims the barcode", () => {
        const date = new Date(2026, 8, 20);
        expect(buildYerevanCityPayload(date, "  LN01  ")).toEqual({ date, barcode: "LN01" });
    });
});

describe("validateFnsUrl / buildFnsUrlPayload", () => {
    it("requires a non-blank url and trims it", () => {
        expect(validateFnsUrl("")).toBe("Please enter a QR link");
        expect(validateFnsUrl("  t=...  ")).toBeNull();
        expect(buildFnsUrlPayload("  t=...  ")).toEqual({ url: "t=..." });
    });
});

describe("validateFnsParams", () => {
    const full = { date: new Date(), time: "12:30", sum: "1250.50", fiscalNumber: "1", fiscalDocument: "2", fiscalDocumentSign: "3" };
    it("requires sum, fiscalNumber, fiscalDocument and fiscalDocumentSign", () => {
        expect(validateFnsParams(full)).toBeNull();
        for (const field of ["sum", "fiscalNumber", "fiscalDocument", "fiscalDocumentSign"] as const) {
            expect(validateFnsParams({ ...full, [field]: "" })).toBe("Please fill in all fiscal details");
        }
    });
    it("does not require time (matches the old code, which never validated it)", () => {
        expect(validateFnsParams({ ...full, time: "" })).toBeNull();
    });
});

describe("buildFnsParamsPayload", () => {
    it("builds the ISO datetime, trims fiscal fields, accepts a comma decimal separator", () => {
        const payload = buildFnsParamsPayload({ date: new Date(2026, 8, 20), time: "12:30", sum: "1250,50", fiscalNumber: " 111 ", fiscalDocument: " 222 ", fiscalDocumentSign: " 333 " });
        expect(payload).toEqual({ dateTime: "2026-09-20T12:30:00", fiscalDocumentNumber: "222", fiscalDocumentSign: "333", fiscalNumber: "111", totalPrice: 1250.5 });
    });
    it("an unparsable sum becomes 0, exactly like the old `parseFloat(...) || 0`", () => {
        expect(buildFnsParamsPayload({ date: new Date(), time: "", sum: "abc", fiscalNumber: "1", fiscalDocument: "1", fiscalDocumentSign: "1" }).totalPrice).toBe(0);
    });
});
