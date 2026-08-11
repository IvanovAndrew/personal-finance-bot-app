import React, { useState, useEffect } from 'react';
import type {Category, Currency, TabType} from './types/finance';
import { NavigationBar } from './components/NavigationBar';
import { ReceiptTab } from './components/EnterTransfer/ReceiptTab';
import { appStyles, theme } from './App.styles';
import {EnterTransactionTab} from "./components/EnterTransfer/EnterTransactionTab.tsx";
import {AnalyticsTab} from "./components/Analytics/AnalyticsTab.tsx";
import { financeApi } from './services/api';
import { cacheService } from './utils/cache';

const CACHE_KEYS = {
    CATEGORIES_INCOME: 'app_categories_cache_income',
    CATEGORIES_OUTCOME: 'app_categories_cache_outcome',
    CURRENCIES: 'app_currencies_cache',
};

export const App: React.FC = () => {

    useEffect(() => {
        financeApi.health().then((isHealthy) => {
            if (!isHealthy) {
                console.error('API is not healthy');
            }
        });
    }, []);
    
    const [activeTab, setActiveTab] = useState<TabType>('add');
    
    const [incomeCategories, setIncomeCategories] = useState<Category[]>(() => {
      return cacheService.get<Category[]>(CACHE_KEYS.CATEGORIES_INCOME) || [];
    });

    const [outcomeCategories, setOutcomeCategories] = useState<Category[]>(() => {
        return cacheService.get<Category[]>(CACHE_KEYS.CATEGORIES_OUTCOME) || [];
    });
    
    const [currencies, setCurrencies] = useState<Currency[]>(() => {
      return cacheService.get<Currency[]>(CACHE_KEYS.CURRENCIES) || [];
    });

    const [isLoading, setIsLoading] = useState<boolean>(() => {
        const hasIncomeCache = !!cacheService.get(CACHE_KEYS.CATEGORIES_INCOME) && !cacheService.isExpired(CACHE_KEYS.CATEGORIES_INCOME);
        const hasOutcomeCache = !!cacheService.get(CACHE_KEYS.CATEGORIES_OUTCOME) && !cacheService.isExpired(CACHE_KEYS.CATEGORIES_OUTCOME);
        const hasCurrenciesCache = !!cacheService.get(CACHE_KEYS.CURRENCIES) && !cacheService.isExpired(CACHE_KEYS.CURRENCIES);
    
        return !(hasIncomeCache && hasOutcomeCache && hasCurrenciesCache);
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor?.('#0A0A0C');
        }

        const loadData = async () => {
            try {
                const [fetchedIncome, fetchedOutcome, fetchedCurrencies] = await Promise.all([
                    financeApi.getCategories(false),
                    financeApi.getCategories(true),
                    financeApi.getCurrencies(),
                ]);
                setIncomeCategories(fetchedIncome);
                cacheService.set(CACHE_KEYS.CATEGORIES_INCOME, fetchedIncome);
                setOutcomeCategories(fetchedOutcome);
                cacheService.set(CACHE_KEYS.CATEGORIES_OUTCOME, fetchedOutcome);
                setCurrencies(fetchedCurrencies);
                cacheService.set(CACHE_KEYS.CURRENCIES, fetchedCurrencies);
            } catch (error) {
                console.error(`Couldn't load API:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div style={{
                ...appStyles.appContainer,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: theme.colors.textSecondary
            }}>
                <span>Loading...</span>
            </div>
        );
    }

  return (
    <div style={appStyles.appContainer}>
      <div style={appStyles.content}>
        {activeTab === 'add' && <EnterTransactionTab incomeCategories={incomeCategories} outcomeCategories={outcomeCategories} currencies={currencies} />}
        {activeTab === 'receipt' && <ReceiptTab />}
        {activeTab === 'analytics' && <AnalyticsTab outcomeCategories={outcomeCategories} currencies={currencies} />}
      </div>

      <NavigationBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;