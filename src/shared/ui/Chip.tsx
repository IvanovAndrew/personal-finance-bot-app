import type { FC, ReactNode } from "react";

import { chipStyle } from "./ui.ts";

interface ChipProps {
    children: ReactNode;
    onClick?: () => void;
    active?: boolean;
    leading?: ReactNode;
    trailing?: ReactNode;
    ariaLabel?: string;
}

export const Chip: FC<ChipProps> = ({ children, onClick, active = false, leading, trailing, ariaLabel }) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel} aria-pressed={active} style={chipStyle(active)}>
        {leading}
        {children}
        {trailing}
    </button>
);
