import type { SaveFnsCheckByRequisitesPayload, SaveFnsCheckFromUrlPayload, SaveYerevanCityCheckPayload } from "../../../services/api.ts";
import { formatISODateTime } from "../../../utils/dateformatter.ts";

// Pure validation and payload-building for the three receipt-submission modes.
// Each `validate*` returns an error message, or null when the input is good enough to submit.

export const validateYerevanCity = (barcode: string): string | null =>
    barcode.trim() ? null : "Please enter a barcode";

export const buildYerevanCityPayload = (date: Date, barcode: string): SaveYerevanCityCheckPayload => ({
    date,
    barcode: barcode.trim(),
});

export const validateFnsUrl = (url: string): string | null => (url.trim() ? null : "Please enter a QR link");

export const buildFnsUrlPayload = (url: string): SaveFnsCheckFromUrlPayload => ({ url: url.trim() });

export interface FnsParamsInput {
    date: Date;
    time: string;
    sum: string;
    fiscalNumber: string;
    fiscalDocument: string;
    fiscalDocumentSign: string;
}

export const validateFnsParams = ({ sum, fiscalNumber, fiscalDocument, fiscalDocumentSign }: FnsParamsInput): string | null =>
    sum && fiscalNumber && fiscalDocument && fiscalDocumentSign ? null : "Please fill in all fiscal details";

export const buildFnsParamsPayload = (input: FnsParamsInput): SaveFnsCheckByRequisitesPayload => ({
    dateTime: formatISODateTime(input.date, input.time),
    fiscalDocumentNumber: input.fiscalDocument.trim(),
    fiscalDocumentSign: input.fiscalDocumentSign.trim(),
    fiscalNumber: input.fiscalNumber.trim(),
    totalPrice: parseFloat(input.sum.replace(",", ".")) || 0,
});
