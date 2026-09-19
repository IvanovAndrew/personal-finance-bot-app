import type {FC} from "react";

export const Avatar: FC<{ name: string; color: string }> = ({ name, color }) => (
    <div
        style={{
            width: 40,
            height: 40,
            flex: "0 0 40px",
            borderRadius: "50%",
            background: `${color}2E`, // ~18% alpha
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
        }}
    >
        {(Array.from(name.trim())[0] ?? "?").toUpperCase()}
    </div>
);