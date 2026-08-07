import React from 'react';
import { appStyles } from '../App.styles';

interface NumpadProps {
    onInput: (val: string) => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

export const Numpad: React.FC<NumpadProps> = ({ onInput }) => {
    return (
        <div style={appStyles.numpadGrid}>
            {KEYS.map(key => (
                <button
                    key={key}
                    type={'button'}
                    onClick={() => onInput(key)}
                    style={appStyles.numpadBtn}
                >
                    {key === 'backspace' ? '⌫' : key}
                </button>
            ))}
        </div>
    );
};