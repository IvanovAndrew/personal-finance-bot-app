import { type FC, useState } from 'react';
import { getShopMeta } from '../utils/shoplogos.ts';

export const ShopLogo: FC<{ shopName: string }> = ({ shopName }) => {
    const [hasClearbitError, setHasClearbitError] = useState(false);
    const meta = getShopMeta(shopName);

    const logoContainerStyle: React.CSSProperties = {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '10px',
        flexShrink: 0,
        overflow: 'hidden',
        padding: '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', 
    };

    if (meta) {
        if (meta.type === 'svg-path') {
            return (
                <div style={logoContainerStyle}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={meta.hexColor || '#000000'}
                    >
                        <path d={meta.src} />
                    </svg>
                </div>
            );
        }

        if (meta.type === 'image') {
            return (
                <div style={logoContainerStyle}>
                    <img
                        src={meta.src}
                        alt={shopName}
                        style={{
                            width: '18px',
                            height: '18px',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            );
        }
    }

    const cleanName = shopName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!hasClearbitError && cleanName) {
        return (
            <div style={logoContainerStyle}>
                <img
                    src={`https://logo.clearbit.com/${cleanName}.com`}
                    alt={shopName}
                    onError={() => setHasClearbitError(true)}
                    style={{
                        width: '18px',
                        height: '18px',
                        objectFit: 'contain',
                    }}
                />
            </div>
        );
    }

    return (
        <span style={{ fontSize: '16px', marginRight: '10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
            🛍️
        </span>
    );
};