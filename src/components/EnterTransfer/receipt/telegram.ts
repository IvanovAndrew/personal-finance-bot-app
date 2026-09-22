// Thin wrapper around the Telegram WebApp bridge: one place that knows `window.Telegram?.WebApp` can be absent
// (dev in a plain browser) or the method can be missing on an old client. Also makes these calls mockable in tests.

export const haptic = {
    success: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success"),
    warning: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("warning"),
    error: () => window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error"),
    selection: () => window.Telegram?.WebApp?.HapticFeedback?.selectionChanged(),
};

export const showAlert = (message: string): void => window.Telegram?.WebApp?.showAlert?.(message);
