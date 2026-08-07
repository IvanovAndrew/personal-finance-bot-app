import React, {useState} from 'react';
import {Building2, Code, Link, Plus, QrCode, Trash2} from 'lucide-react';
import {appStyles, receiptStyles, commonStyles} from '../../App.styles';
import {YerevanCityGrid} from "./YerevanCityGrid.tsx";
import {JsonGrid} from "./JsonGrid.tsx";
import {QRLinkGrid} from "./QRUrl.tsx";
import {ReceiptParamsGrid} from "./ReceiptParamsGrid.tsx";
import {financeApi} from "../../services/api.ts";
import {formatISODateTime} from "../../utils/dateformatter.ts";

type MainTabMode = 'yerevan_city' | 'fns_ru' | 'manual';
type RuInputSubMode = 'params' | 'qr_url' | 'json';

interface ManualItem {
    id: string;
    name: string;
    price: string;
    quantity: string;
}

export const ReceiptTab: React.FC = () => {
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

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleProcess = async () => {
        if (isLoading) return;

        try {
            if (mainTab === 'yerevan_city') {
                if (!ycBarcode.trim()) {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
                    window.Telegram?.WebApp?.showAlert?.('Please enter a barcode');
                    return;
                }

                setIsLoading(true);

                const { success, error } = await financeApi.saveYerevanCityCheck({
                    date: ycDate,
                    barcode: ycBarcode.trim(),
                });

                if (success) {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
                    window.Telegram?.WebApp?.showAlert?.('Receipt saved successfully!');
                    setYcBarcode('');
                } else {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
                    window.Telegram?.WebApp?.showAlert?.(error || 'Failed to save receipt');
                }
            } else if (mainTab === 'fns_ru') {
                setIsLoading(true);

                let result: { success: boolean; error?: string } = { success: false, error: 'Unknown mode' };

                if (ruSubMode === 'qr_url') {
                    if (!urlInput.trim()) {
                        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
                        window.Telegram?.WebApp?.showAlert?.('Please enter a QR link');
                        setIsLoading(false);
                        return;
                    }

                    result = await financeApi.saveFnsCheckFromUrl({
                        url: urlInput.trim()
                    });
                } else if (ruSubMode === 'params') {
                    if (!ruSum || !ruFn || !ruFd || !ruFp) {
                        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
                        window.Telegram?.WebApp?.showAlert?.('Please fill in all fiscal details');
                        setIsLoading(false);
                        return;
                    }

                    result = await financeApi.saveFnsCheckByRequisites({
                        dateTime: formatISODateTime(ruDate, ruTime),
                        fiscalDocumentNumber: ruFd.trim(),
                        fiscalDocumentSign: ruFp.trim(),
                        fiscalNumber: ruFn.trim(),
                        totalPrice: parseFloat(ruSum.replace(',', '.')) || 0
                    });
                } else if (ruSubMode === 'json') {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('warning');
                    window.Telegram?.WebApp?.showAlert?.('JSON mode is not implemented yet');
                    setIsLoading(false);
                    return;
                }

                if (result.success) {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
                    window.Telegram?.WebApp?.showAlert?.('Receipt saved successfully!');

                    if (ruSubMode === 'qr_url') {
                        setUrlInput('');
                    } else if (ruSubMode === 'params') {
                        setRuSum('');
                        setRuFn('');
                        setRuFd('');
                        setRuFp('');
                        setRuTime('');
                    }
                } else {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
                    window.Telegram?.WebApp?.showAlert?.(result.error || 'Failed to save receipt');
                }
            } else if (mainTab === 'manual') {
                // Обработка для ручного ввода
            }
        } catch (error) {
            console.error('Error processing receipt:', error);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
            window.Telegram?.WebApp?.showAlert?.('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
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

                        <button
                            onClick={() => setRuSubMode('json')}
                            style={{
                                ...receiptStyles.subChip,
                                ...(ruSubMode === 'json' ? receiptStyles.subChipActive : {})
                            }}
                        >
                            <Code size={13} />
                            <span>JSON</span>
                        </button>
                    </div>

                {ruSubMode === 'params' && <ReceiptParamsGrid date={ruDate} setDate={setRuDate} time={ruTime} setTime={setRuTime} sum={ruSum} setSum={setRuSum} fiscalNumber={ruFn} setFiscalNumber={setRuFn} fiscalDocument={ruFd} setFiscalDocument={setRuFd} fiscalDocumentSign={ruFp} setFiscalDocumentSign={setRuFp} />}

                {ruSubMode === 'qr_url' && <QRLinkGrid urlInput={urlInput} setUrlInput={setUrlInput} />}

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

        </div>
    );
};

