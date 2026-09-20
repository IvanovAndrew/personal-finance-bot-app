import React, { useState } from "react";

import { appStyles, theme } from '../../App.styles';
import { QUICK_CATEGORY_INCOME_CODES, QUICK_CATEGORY_OUTCOME_CODES } from '../../constants/categories';
import { ONE_SECOND } from "../../constants/time.ts";
import { financeApi } from "../../services/api.ts";
import type { Category, Currency, SubCategory, TransactionType } from "../../types/finance.ts";
import { toDateOnlyString } from "../../utils/dateformatter.ts";
import { formatCurrencyValue } from "../../utils/numberformatter.ts";
import { Button } from '../Button.tsx';
import { CategorySwitcherModal } from '../CategorySwitcherModal.tsx';
import { CustomDatePicker } from "../CustomDatePicker.tsx";
import { SegmentedControl } from "../SegmentedControl.tsx";
import { StatusModal } from "../StatusModal.tsx";
import { chipStyle } from "../ui.ts";
import { ReceiptTab } from "./ReceiptTab.tsx";
import {STORAGE_KEYS} from "../../constants/storageKeys.ts";

interface EnterOutcomeTabProps {
    incomeCategories: Category[];
    outcomeCategories: Category[];
    currencies: Currency[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type InputMethod = 'manual' | 'receipt';

export const EnterTransactionTab: React.FC<EnterOutcomeTabProps> = ({
                                                                        incomeCategories,
                                                                        outcomeCategories,
                                                                        currencies
                                                                    }) => {

    var defaultCurrencyCode = localStorage.getItem(STORAGE_KEYS.CURRENCY) || currencies[0]?.name || 'AMD';
    
    const [inputMethod, setInputMethod] = useState<InputMethod>('manual');

    const [txType, setTxType] = useState<TransactionType>('expense');
    const [amountStr, setAmountStr] = useState<string>('');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies.find((currency) => currency.name === defaultCurrencyCode)?? currencies[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [shop, setShop] = useState<string>('');
    const [note, setNote] = useState<string>('');

    const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<Category | null>(null);
    const [selectedOutcomeCategory, setSelectedOutcomeCategory] = useState<Category | null>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<SubCategory | null>(null);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');

    if (!currencies.length || (!incomeCategories.length && !outcomeCategories.length)) {
        return <div style={{ color: theme.colors.textSecondary, padding: '20px', textAlign: 'center' }}>Loading transaction data...</div>;
    }

    const currentCategories = txType === 'income' ? incomeCategories : outcomeCategories;
    const activeCategory = txType === 'income' ? selectedIncomeCategory : selectedOutcomeCategory;

    const handleTxTypeChange = (type: TransactionType) => {
        setTxType(type);
        setSelectedSubCat(null);

        const newCategories = type === 'income' ? incomeCategories : outcomeCategories;
        const newQuickCodes = type === 'income' ? QUICK_CATEGORY_INCOME_CODES : QUICK_CATEGORY_OUTCOME_CODES;

        const defaultCat = newCategories.find(c => c.code.toLowerCase() === newQuickCodes[0].toLowerCase()) || newCategories[0];

        if (type === 'income') {
            setSelectedIncomeCategory(defaultCat);
        } else {
            setSelectedOutcomeCategory(defaultCat);
        }
        setSelectedSubCat(null);
    };
    
    const handleCurrencyChange = (currencyCode: string) => {
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
        setSelectedCurrency(currencies.find((c) => c.name === currencyCode) || currencies[0]);
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(',', '.');
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountStr(val);
        }
    };

    const handleCategorySelect = (categoryCode: string, subCategoryCode?: string | null) => {
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();

        const catObj = currentCategories.find(c => c.code.toLowerCase() === categoryCode.toLowerCase()) || null;

        if (txType === 'income') {
            setSelectedIncomeCategory(catObj);
        } else {
            setSelectedOutcomeCategory(catObj);
        }

        if (subCategoryCode && catObj) {
            const subs = catObj.subCategories || [];
            const subObj = subs.find(s => s.code.toLowerCase() === subCategoryCode.toLowerCase()) || null;
            setSelectedSubCat(subObj);
        } else {
            setSelectedSubCat(catObj?.subCategories?.[0] || null);
        }
    };

    const handleSaveTransaction = async () => {
        const numericAmount = parseFloat(amountStr);
        if (!numericAmount || numericAmount <= 0) return;

        setSaveStatus('saving');
        setStatusMessage('Saving... It can take some time');

        try {
            const { success, error } = await financeApi.saveTransaction({
                isOutcome: txType === 'expense',
                date: toDateOnlyString(date),
                amount: numericAmount,
                currency: selectedCurrency.name,
                category: activeCategory?.code || '',
                subCategory: selectedSubCat?.code,
                shop: shop,
                description: note,
            });

            if (error || !success) {
                window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
                window.Telegram?.WebApp?.showAlert?.(error || `Couldn't save the transaction.`);

                setSaveStatus('error');
                setStatusMessage(error || 'Error, not saved');
                setTimeout(() => setSaveStatus('idle'), 3 * ONE_SECOND);
                return;
            }

            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

            const detailsArray = [shop.trim(), note.trim()].filter(Boolean);
            const detailsText = detailsArray.length > 0 ? ` (${detailsArray.join(', ')})` : '';
            const formattedAmount = `${selectedCurrency.symbol}${formatCurrencyValue(parseFloat(amountStr), selectedCurrency.format)}`;

            setSaveStatus('saved');
            setStatusMessage(`Saved: ${formattedAmount}${detailsText}`);

            setAmountStr('');
            setShop('');
            setNote('');
            setSelectedSubCat(null);
            setSelectedOutcomeCategory(null);
            setSelectedIncomeCategory(null);

            setTimeout(() => setSaveStatus('idle'), 3 * ONE_SECOND);
        } catch (error) {
            console.error('Error:', error);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');

            setSaveStatus('error');
            setStatusMessage('Error, not saved');

            setTimeout(() => setSaveStatus('idle'), 3 * ONE_SECOND);
        }
    };

    const saveButtonActive = (): boolean => {
        const num = parseFloat(amountStr);
        return activeCategory !== null && !isNaN(num) && num > 0 && saveStatus === 'idle';
    };

    const activeQuickCodes = txType === 'income'
        ? QUICK_CATEGORY_INCOME_CODES
        : QUICK_CATEGORY_OUTCOME_CODES;

    const quickCategories = activeQuickCodes
        .map(code => currentCategories.find(c => c.code.toLowerCase() === code.toLowerCase()))
        .filter((cat): cat is Category => Boolean(cat));

    const inputStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '14px 16px',
        border: 'none',
        borderRadius: 16,
        outline: 'none',
        background: theme.colors.surface,
        color: theme.colors.textPrimary,
        fontSize: 15,
    };

    const tileStyle = (selected: boolean): React.CSSProperties => ({
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '0 12px',
        border: 'none',
        borderRadius: 16,
        background: selected ? theme.colors.primary : theme.colors.surface,
        color: selected ? theme.colors.onPrimary : theme.colors.textPrimary,
        fontWeight: selected ? 700 : 500,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    });

    const sectionLabelStyle: React.CSSProperties = { fontSize: 13, color: theme.colors.textSecondary };

    return (
        <div style={{ ...appStyles.tabContent, gap: '16px', paddingBottom: '24px' }}>

            {/* Manual / Receipt */}
            <SegmentedControl
                options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'receipt', label: 'Receipt' },
                ]}
                selectedValue={inputMethod}
                onChange={setInputMethod}
            />

            {inputMethod === 'receipt' ? (
                <ReceiptTab categories={outcomeCategories} currencies={currencies} />
            ) : (
                <>
                    {/* Outcome / Income */}
                    <SegmentedControl
                        options={[
                            { value: 'expense', label: 'Outcome' },
                            { value: 'income', label: 'Income' },
                        ]}
                        selectedValue={txType}
                        onChange={handleTxTypeChange}
                    />

                    {/* Amount, currency, date */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={amountStr}
                                onChange={handleAmountChange}
                                placeholder="0"
                                autoFocus
                                style={{
                                    fontSize: '44px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.02em',
                                    fontVariantNumeric: 'tabular-nums',
                                    color: theme.colors.textPrimary,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    textAlign: 'right',
                                    width: `${Math.max(1, amountStr.length || 1) * 28}px`,
                                    maxWidth: '70%',
                                }}
                            />

                            <select
                                value={selectedCurrency.name}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.primary,
                                    border: 'none',
                                    borderRadius: theme.colors.radiusPill,
                                    padding: '8px 14px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {currencies?.map((c) => (
                                    <option key={c.name} value={c.name}>
                                        {c.symbol || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <CustomDatePicker selectedDate={date} onChange={setDate} />
                    </div>

                    {/* Category & Subcategory */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <span style={sectionLabelStyle}>Category</span>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                            {quickCategories.map((cat) => (
                                <button
                                    key={cat.code}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.code)}
                                    style={tileStyle(activeCategory?.code === cat.code)}
                                >
                                    {cat.icon && <span style={{ fontSize: '16px', flexShrink: 0 }}>{cat.icon}</span>}
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                                </button>
                            ))}

                            {(() => {
                                const isQuickSelected = quickCategories.some(c => c.code === activeCategory?.code);
                                const isCustomSelected = activeCategory && !isQuickSelected;

                                return (
                                    <div style={{ ...tileStyle(Boolean(isCustomSelected)), padding: 0 }}>
                                        <CategorySwitcherModal
                                            label=""
                                            categories={currentCategories}
                                            selectedCategoryCode={isCustomSelected ? activeCategory.code : null}
                                            selectedSubCategoryCode={isCustomSelected ? (selectedSubCat?.code || null) : null}
                                            enableSubCategorySelection={false}
                                            onSelectCategory={handleCategorySelect}
                                            textColor={isCustomSelected ? theme.colors.onPrimary : theme.colors.textPrimary}
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        {activeCategory?.subCategories && activeCategory.subCategories.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px', width: '100%' }}>
                                <span style={sectionLabelStyle}>Subcategory</span>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', width: '100%' }}>
                                    {activeCategory.subCategories.map((sub) => {
                                        const isSubSelected = selectedSubCat?.code === sub.code;
                                        return (
                                            <button
                                                key={sub.code}
                                                type="button"
                                                onClick={() => {
                                                    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                                                    setSelectedSubCat(sub);
                                                }}
                                                style={{
                                                    ...chipStyle(isSubSelected),
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    padding: '8px',
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: isSubSelected ? theme.colors.onPrimary : theme.colors.textSecondary,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {sub.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text inputs */}
                    {txType === 'expense' && (
                        <input
                            type="text"
                            placeholder="Shop / Place (e.g. Yerevan-city)"
                            value={shop}
                            onChange={e => setShop(e.target.value)}
                            style={inputStyle}
                        />
                    )}

                    <input
                        type="text"
                        placeholder={
                            txType === 'expense'
                                ? 'Note / Description (e.g. cat food)'
                                : 'Note / Description (e.g. salary for August)'
                        }
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        style={inputStyle}
                    />

                    <Button disabled={!saveButtonActive()} onClick={handleSaveTransaction}>
                        {amountStr && parseFloat(amountStr) > 0
                            ? `Save ${amountStr} ${selectedCurrency.symbol || selectedCurrency.name}`
                            : 'Enter Amount'}
                    </Button>
                </>
            )}

            {saveStatus !== 'idle' && <StatusModal status={saveStatus} statusMessage={statusMessage} />}
        </div>
    );
};
