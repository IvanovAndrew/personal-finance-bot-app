import React from "react";
import {statusModalStyles, theme} from "../App.styles.ts";
import {CheckCircle2, Loader2, XCircle} from "lucide-react";

export type StatusModalType = 'loading' | 'saving' | 'success' | 'saved' | 'error';

interface StatusModalProps {
    status: StatusModalType;
    statusMessage: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({ status, statusMessage }) => {

    const isLoading = status === 'loading' || status === 'saving';
    const isSuccess = status === 'success' || status === 'saved';
    const isError = status === 'error';
    
    return (
        <div style={statusModalStyles.overlay}>
            <div style={statusModalStyles.card}>
                {isLoading && (
                    <Loader2
                        size={40}
                        color={theme.colors.textSecondary}
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                )}
                {isSuccess && (
                    <CheckCircle2 size={40} color={theme.colors.success} />
                )}
                {isError && (
                    <XCircle size={40} color={theme.colors.danger} />
                )}
                <span style={statusModalStyles.text}>{statusMessage}</span>
            </div>
        </div>);
}