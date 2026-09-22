import { Building2, Link, Plus, QrCode, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { appStyles, commonStyles, receiptStyles } from '../../../App.styles.ts';
import { financeApi, type ShopExpensesDto } from "../../../services/api.ts";
import type { Category, Currency } from "../../../types/finance.ts";
import { useStatusModal } from "./hooks/useStatusModal.ts";
import { showAlert } from "./telegram.ts";
import { CheckSavedSuccessModal } from "../../CheckSavedSuccessModal.tsx";
import { StatusModal } from "../../StatusModal.tsx";
import { JsonGrid } from "../JsonGrid.tsx";
import { QRLinkGrid } from "../QRUrl.tsx";
import { ReceiptParamsGrid } from "../ReceiptParamsGrid.tsx";
import { YerevanCityGrid } from "../YerevanCityGrid.tsx";
import {
    buildFnsParamsPayload,
    buildFnsUrlPayload,
    buildYerevanCityPayload,
    validateFnsParams,
    validateFnsUrl,
    validateYerevanCity,
} from "./receiptForms.ts";
import { ONE_SECOND } from "../../../constants/time.ts";

type MainTabMode = 'yerevan_city' | 'fns_ru' | 'manual';
type RuInputSubMode = 'params' | 'qr_url' | 'json';

interface ManualItem {
    id: string;
    name: string;
    price: string;
    quantity: string;
}

interface ReceiptTabProps {
    categories: Category[],
    currencies: Currency[]
}

export const ReceiptTab: React.FC<ReceiptTabProps> = ({ categories, currencies }) => {
    const [mainTab, setMainTab] = useState<MainTabMode>('yerevan_city');
    const [ruSubMode, setRuSubMode] = useState<RuInputSubMode>('qr_url');

    // Yerevan city form
    const [ycDate, setYcDate] = useState<Date>(new Date());
    const [ycBarcode, setYcBarcode] = useState<string>('');

    // FNS RF form
    const [ruDate, setRuDate] = useState<Date>(new Date());
    const [ruTime, setRuTime] = useState<string>('');
    const [ruSum, setRuSum] = useState<string>('');
    const [ruFn, setRuFn] = useState<string>('');
    const [ruFd, setRuFd] = useState<string>('');
    const [ruFp, setRuFp] = useState<string>('');

    // URL & JSON
    const [urlInput, setUrlInput] = useState<string>('');
    const [jsonInput, setJsonInput] = useState<string>('');

    // Manual
    const [manualStore, setManualStore] = useState<string>('');
    const [manualItems, setManualItems] = useState<ManualItem[]>([
        { id: '1', name: '', price: '', quantity: '1' }
    ]);

    const [currency, setCurrency] = useState<Currency>(currencies[0]);

    const status = useStatusModal();
    const [savedCheck, setSavedCheck] = useState<ShopExpensesDto | undefined>(undefined);

    const addManualItem = () => {
        setManualItems(prev => [
            ...prev,
            { id: Date.now().toString(), name: '', price: '', quantity: '1' }
        ]);
    };

    const removeManualItem = (id: string) => {
        if (manualItems.length === 1) return;
        setManualItems(prev => prev.filter(item => item.id !== id));
    };

    const updateManualItem = (id: string, field: keyof ManualItem, value: string) => {
        setManualItems(prev =>
            prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    /** Runs one submission: validate -> "loading" -> API call -> "success"/"error". One haptic per outcome (via useStatusModal). */
    const submit = async (
        validationError: string | null,
        call: () => Promise<{ success: boolean; error?: string; shopExpenses?: ShopExpensesDto }>,
        onSuccess: (shopExpenses: ShopExpensesDto | undefined) => void
    ) => {
        if (validationError) {
            showAlert(validationError);
            status.show('error', validationError, 2000);
            return;
        }

        status.show('loading', 'Loading and parsing receipt...', 0);

        try {
            const { success, error, shopExpenses } = await call();

            if (success) {
                status.show('success', 'Receipt saved successfully!');
                onSuccess(shopExpenses);
            } else {
                status.show('error', error || 'Failed to save receipt', 2000);
            }
        } catch (error) {
            console.error('Error processing receipt:', error);
            status.show('error', 'An unexpected error occurred.', 5 * ONE_SECOND);
        }
    };

    const handleProcess = async () => {
        if (mainTab === 'yerevan_city') {
            await submit(
                validateYerevanCity(ycBarcode),
                () => financeApi.saveYerevanCityCheck(buildYerevanCityPayload(ycDate, ycBarcode)),
                (shopExpenses) => {
                    setYcBarcode('');
                    setCurrency(currencies.find(c => c.name === 'AMD') || currencies[0]);
                    setSavedCheck(shopExpenses);
                }
            );
        } else if (mainTab === 'fns_ru') {
            if (ruSubMode === 'qr_url') {
                await submit(
                    validateFnsUrl(urlInput),
                    () => financeApi.saveFnsCheckFromUrl(buildFnsUrlPayload(urlInput)),
                    (shopExpenses) => {
                        setCurrency(currencies.find(c => c.name === 'RUR') || currencies[0]);
                        setSavedCheck(shopExpenses);
                        setUrlInput('');
                    }
                );
            } else if (ruSubMode === 'params') {
                const input = { date: ruDate, time: ruTime, sum: ruSum, fiscalNumber: ruFn, fiscalDocument: ruFd, fiscalDocumentSign: ruFp };
                await submit(
                    validateFnsParams(input),
                    () => financeApi.saveFnsCheckByRequisites(buildFnsParamsPayload(input)),
                    (shopExpenses) => {
                        setCurrency(currencies.find(c => c.name === 'RUR') || currencies[0]);
                        setSavedCheck(shopExpenses);
                        setRuSum('');
                        setRuFn('');
                        setRuFd('');
                        setRuFp('');
                        setRuTime('');
                    }
                );
            }
            // 'json': no submit button reaches this mode (see the note on JsonGrid) -- nothing to wire up.
        } else if (mainTab === 'manual') {
            // Обработка для ручного ввода
        }
    };

    return (
        <div style={appStyles.tabContent}>

            {/* Top-level tabs */}
            <div style={receiptStyles.mainTabs}>
                <button
                    onClick={() => setMainTab('yerevan_city')}
                    style={{
                        ...receiptStyles.mainTabBtn,
                        ...(mainTab === 'yerevan_city' ? receiptStyles.mainTabActive : {})
                    }}
                >
                    <Building2 size={15} />
                    <span>Yerevan city</span>
                </button>

                <button
                    onClick={() => setMainTab('fns_ru')}
                    style={{
                        ...receiptStyles.mainTabBtn,
                        ...(mainTab === 'fns_ru' ? receiptStyles.mainTabActive : {})
                    }}
                >
                    <QrCode size={15} />
                    <span>FNS Receipt</span>
                </button>

                {/*
                <button
                    onClick={() => setMainTab('manual')}
                    style={{
                        ...receiptStyles.mainTabBtn,
                        ...(mainTab === 'manual' ? receiptStyles.mainTabActive : {})
                    }}
                >
                    <Edit3 size={15} />
                    <span>Manual</span>
                </button>
                */}
            </div>

            {/* --- Tab 1 --- */}
            {mainTab === 'yerevan_city' && <YerevanCityGrid date={ycDate} setDate={setYcDate} barcode={ycBarcode} setBarcode={setYcBarcode} />}

            {/* --- Tab 2: RU (FNS) --- */}
            {mainTab === 'fns_ru' && (
                <>
                    <div style={receiptStyles.subSelector}>
                        <button
                            onClick={() => setRuSubMode('params')}
                            style={{
                                ...receiptStyles.subChip,
                                ...(ruSubMode === 'params' ? receiptStyles.subChipActive : {})
                            }}
                        >
                            <QrCode size={13} />
                            <span>Requisites</span>
                        </button>

                        <button
                            onClick={() => setRuSubMode('qr_url')}
                            style={{
                                ...receiptStyles.subChip,
                                ...(ruSubMode === 'qr_url' ? receiptStyles.subChipActive : {})
                            }}
                        >
                            <Link size={13} />
                            <span>QR Link</span>
                        </button>
                    </div>

                {ruSubMode === 'params' && <ReceiptParamsGrid date={ruDate} setDate={setRuDate} time={ruTime} setTime={setRuTime} sum={ruSum} setSum={setRuSum} fiscalNumber={ruFn} setFiscalNumber={setRuFn} fiscalDocument={ruFd} setFiscalDocument={setRuFd} fiscalDocumentSign={ruFp} setFiscalDocumentSign={setRuFp} />}

                {ruSubMode === 'qr_url' && <QRLinkGrid urlInput={urlInput} setUrlInput={setUrlInput} />}

                {/* Unreachable: no button ever sets ruSubMode to 'json'. Kept until the JSON mode is wired up or removed. */}
                {ruSubMode === 'json' && <JsonGrid json={jsonInput} setJson={setJsonInput} />}
                </>
            )}

            {mainTab === 'manual' && (
                <div style={commonStyles.card}>
                    <div style={commonStyles.cardTitle}>Manual</div>
                    <p style={commonStyles.cardSub}>Enter the goods</p>

                    <input
                        type="text"
                        placeholder="Shop title"
                        value={manualStore}
                        onChange={e => setManualStore(e.target.value)}
                        style={{ ...receiptStyles.input, marginBottom: '6px' }}
                    />

                    <div style={receiptStyles.manualList}>
                        {manualItems.map((item, index) => (
                            <div key={item.id} style={receiptStyles.manualRow}>
                                <input
                                    type="text"
                                    placeholder={`Good #${index + 1}`}
                                    value={item.name}
                                    onChange={e => updateManualItem(item.id, 'name', e.target.value)}
                                    style={{ ...receiptStyles.input, flex: 2 }}
                                />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={e => updateManualItem(item.id, 'price', e.target.value)}
                                    style={{ ...receiptStyles.input, flex: 1 }}
                                />
                                <button
                                    onClick={() => removeManualItem(item.id)}
                                    style={receiptStyles.deleteBtn}
                                >
                                    <Trash2 size={16} color="#FF453A" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={addManualItem} style={receiptStyles.addItemBtn}>
                        <Plus size={16} /> Add an item
                    </button>
                </div>
            )}

            <button onClick={handleProcess} style={commonStyles.primaryBtn}>
                <span>{mainTab === 'manual' ? 'Save Receipt' : 'Load and parse'}</span>
            </button>

            {status.state && <StatusModal status={status.state.status} statusMessage={status.state.message} />}

            <CheckSavedSuccessModal
                isOpen={!!savedCheck}
                onClose={() => setSavedCheck(undefined)}
                check={savedCheck}
                categories={categories}
                currency={currency}
            />

        </div>
    );
};
