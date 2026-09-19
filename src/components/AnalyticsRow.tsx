import type { FC } from "react";

import { NBSP, terms } from "../constants/strings.ts";
import type { Currency } from "../types/finance.ts";
import { Amount } from "./Amount.tsx";
import { Avatar } from "./Avatar.tsx";
import { ListRow } from "./ListRow.tsx";

const formatShare = (share: number): string => {
    if (share <= 0) return `0${NBSP}%`;
    if (share < 0.01) return terms.lessThanOne;
    return `${Math.round(share * 100)}${NBSP}%`;
};

export interface AnalyticsRowProps {
    name: string;
    color: string;
    share: number;
    total: number;
    currency: Currency;
    /** Emoji shown in the avatar instead of the first letter. */
    icon?: string;
    /** When omitted the row is not tappable and has no chevron. */
    onClick?: () => void;
}

export const AnalyticsRow: FC<AnalyticsRowProps> = ({ name, color, share, total, currency, icon, onClick }) => (
    <ListRow
        avatar={<Avatar name={name} color={color} icon={icon} />}
        title={name}
        subtitle={formatShare(share)}
        right={<Amount value={total} currency={currency} size={15} />}
        onClick={onClick}
    />
);
