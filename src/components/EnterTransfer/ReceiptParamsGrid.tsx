import React from "react";
import { CustomDatePicker } from "../CustomDatePicker";
import {commonStyles, receiptStyles} from '../../App.styles';

interface ReceiptParamsGridProps {
    date: Date;
    setDate: (date: Date) => void;

    time: string;
    setTime: (time: string) => void;

    sum: string;
    setSum: (sum: string) => void;

    fiscalNumber: string;
    setFiscalNumber: (fn: string) => void;

    fiscalDocument: string;
    setFiscalDocument: (fd: string) => void;

    fiscalDocumentSign: string;
    setFiscalDocumentSign: (fp: string) => void;
}

export const ReceiptParamsGrid: React.FC<ReceiptParamsGridProps> = (props) => {

    return (
        <div style={commonStyles.card}>
            <div style={commonStyles.cardTitle}>Check requisite</div>
            <p style={commonStyles.cardSub}>Fiscal data from receipt or QR code</p>

            <div style={commonStyles.row2}>
                <div style={commonStyles.inputGroup}>
                    <label style={receiptStyles.label}>Date</label>
                    <CustomDatePicker selectedDate={props.date} onChange={props.setDate} />
                </div>
                <div style={commonStyles.inputGroup}>
                    <label style={commonStyles.label}>Time</label>
                    <input
                        type="time"
                        value={props.time}
                        onChange={e => props.setTime(e.target.value)}
                        style={commonStyles.input}
                    />
                </div>
            </div>

            <div style={commonStyles.inputGroup}>
                <label style={commonStyles.label}>Sum (₽)</label>
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder="1250.50"
                    value={props.sum}
                    onChange={e => props.setSum(e.target.value)}
                    style={commonStyles.input}
                />
            </div>

            <div style={receiptStyles.inputGroup}>
                <label style={receiptStyles.label}>Fiscal Number</label>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="16 digits"
                    value={props.fiscalNumber}
                    onChange={e => props.setFiscalNumber(e.target.value)}
                    style={commonStyles.input}
                />
            </div>

            <div style={receiptStyles.row2}>
                <div style={receiptStyles.inputGroup}>
                    <label style={receiptStyles.label}>Fiscal Document</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="up to 10 digits"
                        value={props.fiscalDocument}
                        onChange={e => props.setFiscalDocument(e.target.value)}
                        style={commonStyles.input}
                    />
                </div>
                <div style={receiptStyles.inputGroup}>
                    <label style={receiptStyles.label}>Fiscal Sign</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="up to 10 digits"
                        value={props.fiscalDocumentSign}
                        onChange={e => props.setFiscalDocumentSign(e.target.value)}
                        style={commonStyles.input}
                    />
                </div>
            </div>
        </div>
    );
};