import React from 'react';
import { theme } from '../App.styles';
import { getShopMeta } from '../utils/shoplogos';

interface ShopAvatarProps {
    shopName?: string | null;
    size?: number; // По умолчанию 32px
}

export const ShopAvatar: React.FC<ShopAvatarProps> = ({ shopName, size = 32 }) => {
    const meta = getShopMeta(shopName);

    const imageContainerStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        padding: '3px', // Небольшой отступ, чтобы картинка не липла к краям
        boxSizing: 'border-box',
    };

    // Контейнер для SVG-векторных иконок (Spotify, Microsoft и т.д.)
    const svgContainerStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        backgroundColor: meta?.hexColor ? `${meta.hexColor}20` : theme.colors.bgElement,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

    // 1. Картинка магазина (PNG/SVG файл из папки assets)
    if (meta?.type === 'image') {
        return (
            <div style={imageContainerStyle}>
                <img
                    src={meta.src}
                    alt={shopName || 'Shop'}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </div>
        );
    }

    // 2. Векторный SVG из simple-icons
    if (meta?.type === 'svg-path') {
        return (
            <div style={svgContainerStyle}>
                <svg
                    viewBox="0 0 24 24"
                    width={size * 0.55}
                    height={size * 0.55}
                    fill={meta.hexColor || theme.colors.textPrimary}
                >
                    <path d={meta.src} />
                </svg>
            </div>
        );
    }

    // 3. Fallback (если логотипа нет)
    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '8px',
                backgroundColor: theme.colors.bgCard,
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
      <span style={{ fontSize: `${size * 0.4}px`, fontWeight: '700', color: theme.colors.textSecondary }}>
        {shopName ? shopName.trim().slice(0, 2).toUpperCase() : '?'}
      </span>
        </div>
    );
};