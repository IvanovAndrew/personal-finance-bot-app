import React, { useEffect,useState } from 'react';

import { appStyles, theme } from './App.styles';
import { AnalyticsTab } from "./components/Analytics/AnalyticsTab.tsx";
import { EnterTransactionTab } from "./components/EnterTransfer/EnterTransactionTab.tsx";
import { NavigationBar } from './components/NavigationBar';
import { financeApi } from './services/api';
import type { Category, Currency, TabType } from './types/finance';
import { cacheService } from './utils/cache';

const CACHE_KEYS = {
    CATEGORIES_INCOME: 'app_categories_cache_income',
    CATEGORIES_OUTCOME: 'app_categories_cache_outcome',
    CURRENCIES: 'app_currencies_cache',
};

type ServerState = 'sleeping' | 'failed' | 'working';

export const App: React.FC = () => {

    const [serverState, setServerState] = useState<ServerState>('sleeping');
    const [failedServices, setFailedServices] = useState<string[]>([]);

    useEffect(() => {
        // AbortController to cancel the request if the component unmounts
        const controller = new AbortController();

        financeApi.health(controller.signal)
            .then((healthMap) => {
                // Filter out services that returned 'false'
                const failedServices = Object.entries(healthMap)
                    .filter(([_, isHealthy]) => !isHealthy)
                    .map(([serviceName]) => serviceName);

                // Update UI state based on failed services presence
                if (failedServices.length > 0) {
                    console.error('Unavailable services:', failedServices.join(', '));
                    setFailedServices(failedServices);
                    setServerState('failed');
                } else {
                    console.log('All services are operational');
                    setServerState('working');
                }
            })
            .catch((err) => {
                // Ignore manual request cancellations, handle network/server errors
                if (err.name !== 'AbortError') {
                    console.error('Health check request failed:', err);
                    setServerState('failed');
                }
            });

        // Cleanup: abort HTTP request on unmount
        return () => controller.abort();
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

            {/* Server waking up banner */}
            {serverState === 'sleeping' && (
                <div style={appStyles.serverWakingBannerStyle}>
                    <div>⚡ The server is waking up...</div>
                    <div>Requests may take longer than usual.</div>
                </div>
            )}

            {/* Server failed banner with failed services list */}
            {serverState === 'failed' && (
                <div style={appStyles.serverWakingBannerStyle}>
                    <div>⚡ The server has issues...</div>

                    {failedServices.length > 0 ? (
                        <div style={{ marginTop: '4px', fontSize: '0.9em' }}>
                            <span>Unavailable services: </span>
                            <strong>{failedServices.join(', ')}</strong>
                        </div>
                    ) : (
                        <div>Admins are already notified.</div>
                    )}
                </div>
            )}

            <div style={appStyles.content}>
                {activeTab === 'add' && (
                    <EnterTransactionTab
                        incomeCategories={incomeCategories}
                        outcomeCategories={outcomeCategories}
                        currencies={currencies}
                    />
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsTab
                        outcomeCategories={outcomeCategories}
                        incomeCategories={incomeCategories}
                        currencies={currencies}
                    />
                )}
            </div>

            <NavigationBar activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>
    );
};

export default App;