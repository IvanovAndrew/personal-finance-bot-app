import React from "react";
import {CustomDatePicker} from "../CustomDatePicker.tsx";
import { commonStyles } from '../../App.styles';

interface YerevanCityGridProps {
    date: Date,
    setDate: (date: Date) => void,
    
    barcode: string,
    setBarcode: (barcode: string) => void,
}

export const YerevanCityGrid: React.FC<YerevanCityGridProps> = ({ date, setDate, barcode, setBarcode }) => {
    return <div style={commonStyles.card}>
        <div style={commonStyles.cardTitle}>Yerevan city receipt</div>
        <p style={commonStyles.cardSub}>Specify the date and barcode from the cash register receipt</p>

        <div style={commonStyles.inputGroup}>
            <label style={commonStyles.label}>Date</label>
            <CustomDatePicker selectedDate={date} onChange={setDate}/>
        </div>

        <div style={commonStyles.inputGroup}>
            <label style={commonStyles.label}>Barcode</label>
            <input
                type="text"
                inputMode="text"
                placeholder="Example: LN0123456789"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                style={commonStyles.input}
            />
        </div>
    </div>;
}