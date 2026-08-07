interface TelegramWebApp {
    initData: string;
    ready: () => void;
    expand: () => void;
    setHeaderColor?: (color: string) => void;
    showAlert: (message: string) => void;
    HapticFeedback: {
        notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
        selectionChanged: () => void;
    };
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

export {};