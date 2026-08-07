import React from 'react';
import { PlusCircle, Receipt, PieChart as PieChartIcon } from 'lucide-react';
import type {TabType} from '../types/finance';
import { appStyles } from '../App.styles';

interface NavigationBarProps {
    activeTab: TabType;
    onChangeTab: (tab: TabType) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onChangeTab }) => {
    return (
        <div style={appStyles.bottomBarContainer}>
            <div style={appStyles.bottomNav}>
                <button
                    onClick={() => onChangeTab('add')}
                    style={{ ...appStyles.navTab, ...(activeTab === 'add' ? appStyles.navTabActive : {}) }}
                >
                    <PlusCircle size={20} />
                    <span>Enter</span>
                </button>
                <button
                    onClick={() => onChangeTab('receipt')}
                    style={{ ...appStyles.navTab, ...(activeTab === 'receipt' ? appStyles.navTabActive : {}) }}
                >
                    <Receipt size={20} />
                    <span>Receipt</span>
                </button>
                <button
                    onClick={() => onChangeTab('analytics')}
                    style={{ ...appStyles.navTab, ...(activeTab === 'analytics' ? appStyles.navTabActive : {}) }}
                >
                    <PieChartIcon size={20} />
                    <span>Analytics</span>
                </button>
            </div>
        </div>
    );
};