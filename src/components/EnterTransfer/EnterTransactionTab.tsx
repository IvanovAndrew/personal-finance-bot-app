import React, {useState} from "react";
import {ArrowUpRight, ArrowDownLeft} from 'lucide-react';
import { Numpad } from '../Numpad.tsx';
import { CategoryGrid } from '../CategoryGrid.tsx';
import { commonStyles, appStyles, amountInputStyles} from '../../App.styles';
import type {Category, Currency, SubCategory, TransactionType} from "../../types/finance.ts";
import {SubCategoryModal} from "../SubCategoryModal.tsx";
import {financeApi} from "../../services/api.ts";
import {toDateOnlyString} from "../../utils/dateformatter.ts";
import {CustomDatePicker} from "../CustomDatePicker.tsx";
import {StatusModal} from "../StatusModal.tsx";
import {CurrencyDropdown} from "../CurrencyDropdown.tsx";

interface EnterOutcomeTabProps {
    incomeCategories: Category[];
    outcomeCategories: Category[];
    currencies: Currency[];
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const EnterTransactionTab: React.FC<EnterOutcomeTabProps> = ({ incomeCategories, outcomeCategories, currencies }) => {
    
    const [txType, setTxType] = useState<TransactionType>('expense');
    const [amountStr, setAmountStr] = useState<string>('0');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [showCurrencyPicker, setShowCurrencyPicker] = useState<boolean>(false);
    const [shop, setShop] = useState<string>('');
    const [note, setNote] = useState<string>('');

    const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<Category | null>(null);
    const [selectedOutcomeCategory, setSelectedOutcomeCategory] = useState<Category | null>(null);
    const [selectedSubCat, setSelectedSubCat] = useState<SubCategory | null>(null);

    const [showSubModal, setShowSubModal] = useState<boolean>(false);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');

    if (!currencies.length || (!incomeCategories.length && !outcomeCategories.length)) {
        return <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Loading transaction data...</div>;
    }

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
                category: (txType === 'income' ? selectedIncomeCategory?.code : selectedOutcomeCategory?.code) || '',
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

            setSaveStatus('saved');
            setStatusMessage('Saved');
            
            setAmountStr('0');
            setNote('');
            setSelectedSubCat(null);

            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Error:', error);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');

            setSaveStatus('error');
            setStatusMessage('Error, not saved');

            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const handleNumpad = (val: string) => {
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
        if (val === 'backspace') {
            setAmountStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
        } else if (val === '.') {
            if (!amountStr.includes('.')) setAmountStr(prev => prev + '.');
        } else {
            if (amountStr === '0' && val !== '.') {
                setAmountStr(val);
            } else {
                setAmountStr(prev => prev + val);
            }
        }
    };
    
    const saveButtonActive = () : boolean => {
        return (txType == 'income' && selectedIncomeCategory !== null || txType == 'expense' && selectedOutcomeCategory !== null) && amountStr !== '0' && saveStatus === 'idle';
    } 
        

    const handleCategorySelect = (cat: Category | null) => {
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();

        if (txType === 'income') {
            setSelectedIncomeCategory(cat);
        } else {
            setSelectedOutcomeCategory(cat);
        }

        setSelectedSubCat(null);

        const subs = cat?.subCategories;
        
        if (subs && subs.length > 0) {
            setShowSubModal(true);
        }
    };

    return <div style={appStyles.tabContent}>

        <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
        
        <div style={appStyles.typeToggleGroup}>
            <button
                onClick={() => setTxType('expense')}
                style={{
                    ...appStyles.typeBtn,
                    ...(txType === 'expense' ? appStyles.typeBtnExpenseActive : {}),
                }}
            >
                <ArrowUpRight size={14}/> Outcome
            </button>
            <button
                onClick={() => setTxType('income')}
                style={{
                    ...appStyles.typeBtn,
                    ...(txType === 'income' ? appStyles.typeBtnIncomeActive : {}),
                }}
            >
                <ArrowDownLeft size={14}/> Income
            </button>
        </div>

        <div style={{ ...appStyles.heroCard, padding: '12px 16px' }}>
            <div style={commonStyles.rowBetween}>

                <div>
                    <label style={commonStyles.label}>Date</label>
                    <CustomDatePicker
                        selectedDate={date}
                        onChange={setDate}
                    />
                </div>

                {/* Amount + Currency Input Group */}
                <div>
                    <label style={commonStyles.label}>AMOUNT</label>
                    <div style={amountInputStyles.group}>
                        <input
                            type="number"
                            value={amountStr}
                            onChange={(e) => setAmountStr(e.target.value)}
                            placeholder="0"
                            style={amountInputStyles.input}
                        />

                        <select
                            value={selectedCurrency.name}
                            onChange={(e) => setSelectedCurrency(currencies.find((c) => c.name === e.target.value) || currencies[0])}
                            style={amountInputStyles.select}
                        >
                            {currencies?.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name} {c.symbol ? `(${c.symbol})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {showCurrencyPicker && <CurrencyDropdown currencies={currencies} setSelectedCurrency={setSelectedCurrency} setShowCurrencyPicker={setShowCurrencyPicker}/>}
        </div>

            

        {/* Categories */}
        <CategoryGrid
            categories={txType === 'income' ? incomeCategories : outcomeCategories}
            selectedCategory={txType === 'income' ? selectedIncomeCategory : selectedOutcomeCategory}
            selectedSubCat={selectedSubCat}
            onSelectCategory={handleCategorySelect}
        />

        {/* Subcategory Modal */}
        {showSubModal && 
            <SubCategoryModal
                category={txType === 'income' ? selectedIncomeCategory : selectedOutcomeCategory}
                selectedSubCat={selectedSubCat}
                onSelectSubCat={sub => {
                    setSelectedSubCat(sub);
                    setShowSubModal(false);
                }}
                onClose={() => setShowSubModal(false)}
            />
        }

        <input
            type="text"
            placeholder="Enter a shop name"
            value={shop}
            onChange={e => setShop(e.target.value)}
            style={commonStyles.input}
        />

        <input
            type="text"
            placeholder="Enter a comment..."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={commonStyles.input}
        />

        <Numpad onInput={handleNumpad}/>

        {/* Save Button */}
        <button 
            onClick={handleSaveTransaction}
            style={{
                ...commonStyles.primaryBtn,
                opacity: saveButtonActive() ? 1 : 0.4,
                cursor: saveButtonActive() ? 'pointer' : 'not-allowed',
            }} 
            disabled={!saveButtonActive()}>
            Save {amountStr} {selectedCurrency.symbol}
        </button>

        {saveStatus !== 'idle' && <StatusModal status={saveStatus} statusMessage={statusMessage}/>}
    </div>;
}