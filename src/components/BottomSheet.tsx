import { X } from "lucide-react";
import { type FC, type ReactNode, useEffect, useState } from "react";

import { theme } from "../App.styles.ts";
import { terms } from "../constants/strings.ts";

interface BottomSheetProps {
    title: ReactNode;
    onClose: () => void;
    children: ReactNode;
}

/** Modal anchored to the bottom edge: dim overlay, rounded top corners, drag handle, slide-up. */
export const BottomSheet: FC<BottomSheetProps> = ({ title, onClose, children }) => {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setShown(true));
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                background: shown ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)",
                transition: "background-color 0.25s ease",
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 480,
                    maxHeight: "88vh",
                    overflowY: "auto",
                    boxSizing: "border-box",
                    background: theme.colors.surface,
                    borderRadius: "24px 24px 0 0",
                    padding: "8px 16px",
                    paddingBottom: "max(24px, env(safe-area-inset-bottom))",
                    transform: shown ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.25s ease",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 4,
                        margin: "0 auto 12px",
                        borderRadius: 999,
                        background: theme.colors.textSecondary,
                        opacity: 0.4,
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 16,
                    }}
                >
                    <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.textPrimary, minWidth: 0 }}>
                        {title}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={terms.close}
                        style={{
                            width: 32,
                            height: 32,
                            flex: "0 0 32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            borderRadius: "50%",
                            background: theme.colors.surfacePressed,
                            color: theme.colors.textSecondary,
                            cursor: "pointer",
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
};