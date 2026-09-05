import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { datePickerStyles, theme } from '../App.styles';
import { Calendar } from "lucide-react";
import {EARLIEST_DATA_DATE} from "../constants/data.ts";

interface CustomDatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    showMonthPicker?: boolean;
    maxDate?: Date;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onChange, showMonthPicker = false, maxDate = new Date() }) => {
    return (
        <div style={{ position: 'relative', width: '100%', zIndex: 1000 }}>
            <style>{datePickerStyles.popupThemeCss as string}</style>

            <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && onChange(date)}
                dateFormat={showMonthPicker ? 'MMMM yyyy' : 'dd.MM.yyyy'}
                minDate={EARLIEST_DATA_DATE}
                maxDate={maxDate}
                showMonthYearPicker={showMonthPicker}
                popperPlacement="bottom-start"
                customInput={
                    <button
                        type="button"
                        style={datePickerStyles.triggerBtn as React.CSSProperties}
                    >
                        <Calendar
                            size={15}
                            color={theme.colors.primary}
                            style={datePickerStyles.calendarIcon as React.CSSProperties}
                        />
                        <span style={datePickerStyles.dateText as React.CSSProperties}>
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