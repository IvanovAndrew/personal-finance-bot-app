import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CategorySwitcherModal } from '../CategorySwitcherModal.tsx';
import { commonStyles, appStyles } from '../../App.styles';
import type { Category, Currency, SubCategory, TransactionType } from "../../types/finance.ts";
import { financeApi } from "../../services/api.ts";
import { toDateOnlyString } from "../../utils/dateformatter.ts";
import { CustomDatePicker } from "../CustomDatePicker.tsx";
import { StatusModal } from "../StatusModal.tsx";
import { QUICK_CATEGORY_OUTCOME_CODES } from '../../constants/categories';
import { QUICK_CATEGORY_INCOME_CODES } from '../../constants/categories';
import {formatCurrencyValue} from "../../utils/numberformatter.ts";
import {ONE_SECOND} from "../../constants/time.ts";

interface EnterOutcomeTabProps {
    incomeCategories: Category[];
    outcomeCategories: Category[];
    currencies: Currency[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const EnterTransactionTab: React.FC<EnterOutcomeTabProps> = ({
                                                                        incomeCategories,
                                                                        outcomeCategories,
                                                                        currencies
                                                                    }) => {
    const [txType, setTxType] = useState<TransactionType>('expense');
    const [amountStr, setAmountStr] = useState<string>('');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [shop, setShop] = useState<string>('');
    const [note, setNote] = useState<string>('');

    const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<Category | null>(null);
    const [selectedOutcomeCategory, setSelectedOutcomeCategory] = useState<Category | null>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<SubCategory | null>(null);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');

    if (!currencies.length || (!incomeCategories.length && !outcomeCategories.length)) {
        return <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Loading transaction data...</div>;
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

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(',', '.');
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
            // Если выбрали категорию через чип на главном экране — сбрасываем или ставим 1-ю подкатегорию
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
                return;
            }

            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

            const detailsArray = [shop.trim(), note.trim()].filter(Boolean);
            const detailsText = detailsArray.length > 0 ? ` (${detailsArray.join(', ')})` : '';
            const formattedAmount = `${selectedCurrency.symbol}${formatCurrencyValue(parseFloat(amountStr))}`;
            
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

    return (
        <div style={{ ...appStyles.tabContent, gap: '16px', paddingBottom: '24px' }}>
            {/* 1. Toggle Income / Expense */}
            <div style={appStyles.typeToggleGroup}>
                <button
                    onClick={() => handleTxTypeChange('expense')}
                    style={{
                        ...appStyles.typeBtn,
                        ...(txType === 'expense' ? appStyles.typeBtnExpenseActive : {}),
                    }}
                >
                    <ArrowUpRight size={16} /> Outcome
                </button>
                <button
                    onClick={() => handleTxTypeChange('income')}
                    style={{
                        ...appStyles.typeBtn,
                        ...(txType === 'income' ? appStyles.typeBtnIncomeActive : {}),
                    }}
                >
                    <ArrowDownLeft size={16} /> Income
                </button>
            </div>

            {/* 2. Amount Input & Currency / Date */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 12px',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', width: '100%' }}>
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
                            color: '#FFFFFF',
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
                        onChange={(e) => setSelectedCurrency(currencies.find((c) => c.name === e.target.value) || currencies[0])}
                        style={{
                            backgroundColor: '#2C2C2E',
                            color: '#00E5FF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            fontSize: '18px',
                            fontWeight: '600',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {currencies?.map((c) => (
                            <option key={c.name} value={c.name}>
                                {c.symbol || c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ opacity: 0.85, fontSize: '14px' }}>
                    <CustomDatePicker selectedDate={date} onChange={setDate} />
                </div>
            </div>

            {/* 3. Category & Subcategory Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
    <span style={{ fontSize: '12px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        CATEGORY
    </span>

                {/* Grid 2x2: 3 быстрые категории + Статичная/Умная More */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    width: '100%'
                }}>
                    {/* Первые 3 категории */}
                    {quickCategories.map((cat) => {
                        const isSelected = activeCategory?.code === cat.code;
                        return (
                            <button
                                key={cat.code}
                                onClick={() => handleCategorySelect(cat.code)}
                                style={{
                                    height: '46px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '0 12px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: isSelected ? '#00E5FF' : '#1C1C1E',
                                    color: isSelected ? '#000000' : '#FFFFFF',
                                    fontWeight: isSelected ? '700' : '500',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {cat.icon && <span style={{ fontSize: '16px', flexShrink: 0 }}>{cat.icon}</span>}
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                            </button>
                        );
                    })}

                    {/* 4-я ячейка: Кнопка "More" */}
                    {(() => {
                        // Проверяем, выбрана ли категория, которая НЕ входит в топ-3 популярных
                        const isQuickSelected = quickCategories.some(c => c.code === activeCategory?.code);
                        const isCustomSelected = activeCategory && !isQuickSelected;

                        return (
                            <div style={{
                                height: '46px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '12px',
                                backgroundColor: isCustomSelected ? '#00E5FF' : '#1C1C1E',
                                overflow: 'hidden',
                                transition: 'all 0.15s ease'
                            }}>
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                                    <CategorySwitcherModal
                                        label=""
                                        categories={currentCategories}
                                        // Передаем категорию в модалку только если она выбрана НЕ из топ-3
                                        selectedCategoryCode={isCustomSelected ? activeCategory.code : null}
                                        selectedSubCategoryCode={isCustomSelected ? (selectedSubCat?.code || null) : null}
                                        enableSubCategorySelection={false}
                                        onSelectCategory={handleCategorySelect}
                                        textColor={isCustomSelected ? '#000000' : '#FFFFFF'}
                                    />
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Ряд подкатегорий (Flex Wrap - с переносом) */}
                {activeCategory?.subCategories && activeCategory.subCategories.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', width: '100%' }}>
        <span style={{ fontSize: '11px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            SUBCATEGORY
        </span>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', // Равномерные ячейки, которые не раздуваются от жирного текста
                            gap: '8px',
                            width: '100%'
                        }}>
                            {activeCategory.subCategories.map((sub) => {
                                const isSubSelected = selectedSubCat?.code === sub.code;
                                return (
                                    <button
                                        key={sub.code}
                                        onClick={() => {
                                            window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                                            setSelectedSubCat(sub);
                                        }}
                                        style={{
                                            height: '36px',
                                            padding: '0 8px',
                                            borderRadius: '10px',
                                            // Всегда 1px border, чтобы геометрия не менялась
                                            border: isSubSelected ? '1px solid #00E5FF' : '1px solid #2C2C2E',
                                            backgroundColor: isSubSelected ? 'rgba(0, 229, 255, 0.15)' : '#1C1C1E',
                                            color: isSubSelected ? '#00E5FF' : '#8E8E93',
                                            // Толщина шрифта постоянная — 500, чтобы ширина текста не скакала
                                            fontWeight: '500',
                                            fontSize: '12.5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
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

            {/* 4. Text Inputs Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <input
                    type="text"
                    placeholder="Shop / Place (e.g. Yerevan-city)"
                    value={shop}
                    onChange={e => setShop(e.target.value)}
                    style={{
                        ...commonStyles.input,
                        backgroundColor: '#1C1C1E',
                        border: '1px solid #2C2C2E',
                        borderRadius: '12px',
                        padding: '14px',
                        fontSize: '15px'
                    }}
                />

                <input
                    type="text"
                    placeholder="Note / Description (e.g. cat food)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{
                        ...commonStyles.input,
                        backgroundColor: '#1C1C1E',
                        border: '1px solid #2C2C2E',
                        borderRadius: '12px',
                        padding: '14px',
                        fontSize: '15px'
                    }}
                />
            </div>

            {/* 5. Primary Save Button */}
            <button
                onClick={handleSaveTransaction}
                style={{
                    ...commonStyles.primaryBtn,
                    marginTop: '8px',
                    padding: '16px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '700',
                    opacity: saveButtonActive() ? 1 : 0.35,
                    cursor: saveButtonActive() ? 'pointer' : 'not-allowed',
                    transition: 'opacity 0.2s ease',
                }}
                disabled={!saveButtonActive()}
            >
                {amountStr && parseFloat(amountStr) > 0
                    ? `Save ${amountStr} ${selectedCurrency.symbol || selectedCurrency.name}`
                    : 'Enter Amount'}
            </button>

            {saveStatus !== 'idle' && <StatusModal status={saveStatus} statusMessage={statusMessage} />}
        </div>
    );
};