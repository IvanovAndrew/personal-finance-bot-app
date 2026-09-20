import { Download } from "lucide-react";
import { type FC, useState } from "react";

import { type ExportFormat, financeApi } from "../services/api.ts";
import { fromDateInputValue, toDateInputValue } from "../utils/exportExpenses.ts";
import type {Currency} from "../types/finance.ts";
import {theme} from "../App.styles.ts";
import {BottomSheet} from "./BottomSheet.tsx";
import {deliverFile} from "../utils/deliverfile.ts";

const MAX_DAYS = 366;

interface ExportSheetProps {
    initialDate: Date;
    currency: Currency;
    onClose: () => void;
}

const shiftDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const ExportSheet: FC<ExportSheetProps> = ({ initialDate, currency, onClose }) => {
    const [from, setFrom] = useState(toDateInputValue(initialDate));
    const [to, setTo] = useState(toDateInputValue(initialDate));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [format, setFormat] = useState<ExportFormat>("xlsx");

    const setRange = (a: Date, b: Date) => {
        setFrom(toDateInputValue(a));
        setTo(toDateInputValue(b));
        setError(null);
    };

    const today = new Date();
    const presets = [
        { label: "This day", apply: () => setRange(initialDate, initialDate) },
        { label: "Last 7 days", apply: () => setRange(shiftDays(today, -6), today) },
        {
            label: "This month",
            apply: () => setRange(new Date(today.getFullYear(), today.getMonth(), 1), today),
        },
    ];

    const validate = (): string | null => {
        if (!from || !to) return "Pick both dates";
        const a = fromDateInputValue(from);
        const b = fromDateInputValue(to);
        if (a > b) return "Start date is after end date";
        if ((b.getTime() - a.getTime()) / 86_400_000 + 1 > MAX_DAYS) return `Maximum range is ${MAX_DAYS} days`;
        return null;
    };

    const handleDownload = async () => {
        const problem = validate();
        if (problem) {
            setError(problem);
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const { id, fileName } = await financeApi.createExport({
                startDate: fromDateInputValue(from),
                endDate: fromDateInputValue(to),
                currency: currency.name,
                format,
            });
            if (!id) {
                setError("No expenses in this period");
                return;
            }
            deliverFile(financeApi.getExportUrl(id), fileName);
            onClose();
        } catch (e) {
            console.error(e);
            setError("Failed to prepare the file. Try again.");
        } finally {
            setBusy(false);
        }
    };

    const inputStyle = {
        width: "100%",
        boxSizing: "border-box" as const,
        padding: "10px 12px",
        border: "none",
        borderRadius: 12,
        background: theme.colors.surfacePressed,
        color: theme.colors.textPrimary,
        fontSize: 15,
        colorScheme: "dark",
    };
    const labelStyle = { display: "flex", flexDirection: "column" as const, gap: 6, flex: 1, minWidth: 0 };
    const captionStyle = { fontSize: 12, color: theme.colors.textSecondary };

    return (
        <BottomSheet title="Download" onClose={onClose}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {presets.map((p) => (
                        <button
                            key={p.label}
                            type="button"
                            onClick={p.apply}
                            style={{
                                padding: "6px 12px",
                                border: "none",
                                borderRadius: 999,
                                background: theme.colors.surfacePressed,
                                color: theme.colors.textPrimary,
                                fontSize: 13,
                                cursor: "pointer",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <label style={labelStyle}>
                        <span style={captionStyle}>From</span>
                        <input
                            type="date"
                            value={from}
                            max={to || undefined}
                            onChange={(e) => { setFrom(e.target.value); setError(null); }}
                            style={inputStyle}
                        />
                    </label>
                    <label style={labelStyle}>
                        <span style={captionStyle}>To</span>
                        <input
                            type="date"
                            value={to}
                            min={from || undefined}
                            onChange={(e) => { setTo(e.target.value); setError(null); }}
                            style={inputStyle}
                        />
                    </label>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    {(["xlsx", "pdf"] as const).map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFormat(f)}
                            style={{
                                flex: 1,
                                padding: "10px 0",
                                border: "none",
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                background: format === f ? theme.colors.bgElement : theme.colors.surfacePressed,
                                color: format === f ? "#0b0b0c" : theme.colors.textPrimary,
                            }}
                        >
                            {f === "xlsx" ? "Excel" : "PDF"}
                        </button>
                    ))}
                </div>

                {error && <div style={{ fontSize: 13, color: "#ff6b6b" }}>{error}</div>}

                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={busy}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "14px 16px",
                        border: "none",
                        borderRadius: 14,
                        background: theme.colors.primary,
                        color: "#0b0b0c",
                        fontSize: 15,
                        fontWeight: 700,
                        opacity: busy ? 0.6 : 1,
                        cursor: busy ? "default" : "pointer",
                    }}
                >
                    <Download size={18} />
                    {busy ? "Preparing..." : `Download ${format}`}
                </button>
            </div>
        </BottomSheet>
    );
};

