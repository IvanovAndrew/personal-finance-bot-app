import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {datePickerStyles, theme} from '../App.styles';
import {CalendarIcon} from "lucide-react";

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
                customInput={<button type="button" style={datePickerStyles.triggerBtn}>
                    <CalendarIcon size={13} color={theme.colors.primary} />
                    <span>{selectedDate.toLocaleDateString('en-US',
                        showMonthPicker
                            ? { month: 'long', year: 'numeric' }
                            : { month: 'long', day: 'numeric', year: 'numeric' }
                    )}</span>
                </button>}
            />
        </div>
    );
};