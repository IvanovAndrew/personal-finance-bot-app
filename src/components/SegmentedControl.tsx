import {Calendar, Layers, LayoutDashboard, PieChart} from 'lucide-react';
import React from 'react';

import { receiptStyles } from '../App.styles';

export type ViewMode = 'summary' | 'days' | 'months' | 'categories' | 'subcategories';

interface AnalyticsSegmentedControlProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export const AnalyticsSegmentedControl: React.FC<AnalyticsSegmentedControlProps> = ({ value, onChange }) => {
    const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
        { id: 'summary', label: 'Summary', icon: <LayoutDashboard size={12} /> },
        { id: 'days', label: 'Daily', icon: <Calendar size={12} /> },
        { id: 'months', label: 'Monthly', icon: <Calendar size={12} /> },
        { id: 'categories', label: 'Cats', icon: <PieChart size={12} /> },
        { id: 'subcategories', label: 'Subs', icon: <Layers size={12} /> },
    ];

    return (
        <div style={{
            ...receiptStyles.mainTabs,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '2px',
            padding: '2px',
            boxSizing: 'border-box',
            width: '100%',
            marginBottom: '12px',
        }}>
            {tabs.map((tab) => {
                const isActive = value === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        style={{
                            ...receiptStyles.mainTabBtn,
                            ...(isActive ? receiptStyles.mainTabActive : {}),
                            padding: '6px 2px',
                            fontSize: '11px',
                            gap: '3px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};