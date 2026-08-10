import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {commonStyles, theme} from '../App.styles';
import {Calendar} from "lucide-react";

interface CustomDatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    showMonthPicker?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onChange, showMonthPicker = false }) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && onChange(date)}
                dateFormat={showMonthPicker ? 'MMMM yyyy' : 'dd.MM.yyyy'}
                showMonthYearPicker={showMonthPicker}
                popperPlacement="bottom-start"
                customInput={
                    <button
                        type="button"
                        style={{
                            ...commonStyles.inputControl,
                            justifyContent: 'flex-start',
                            gap: '8px',
                            width: '100%',
                        }}
                    >
                        <Calendar size={15} color={theme.colors.primary} style={{ flexShrink: 0 }} />
                        <span style={{
                            color: theme.colors.textPrimary,
                            fontSize: '13px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {selectedDate.toLocaleDateString('en-US',
                                showMonthPicker
                                    ? { month: 'long', year: 'numeric' }
                                    : { month: 'long', day: 'numeric', year: 'numeric' }
                            )}
                        </span>
                    </button>
                }
            />
        </div>
    );
};