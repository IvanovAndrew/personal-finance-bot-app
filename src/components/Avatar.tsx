import type { FC, ReactNode } from "react";

interface AvatarProps {
    name: string;
    color: string;
    /** Emoji or icon. Falls back to the first letter of `name`. */
    icon?: ReactNode;
    size?: number;
    /** Override the default tinted background (`color` at ~18 % alpha, needs a hex colour). */
    background?: string;
}

export const Avatar: FC<AvatarProps> = ({ name, color, icon, size = 40, background }) => (
    <div
        style={{
            width: size,
            height: size,
            flex: `0 0 ${size}px`,
            borderRadius: "50%",
            background: background ?? `${color}2E`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: icon ? Math.round(size * 0.45) : 16,
            fontWeight: 700,
        }}
    >
        {icon ?? (Array.from(name.trim())[0] ?? "?").toUpperCase()}
    </div>
);
