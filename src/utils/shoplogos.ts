import {
    siAliexpress,
    siBoosty,
    siGooglehome,
    siHandm,
    siIcloud,
    siIkea,
    siKfc,
    siMcdonalds,
    siPatreon,
    siSpotify,
    siTelegram,
    siUniqlo,
} from 'simple-icons';

// SVG for local brands (not in simple-icons)
import fixpriceLogo from '../assets/shops/fixprice.svg';
import lentaLogo from '../assets/shops/lenta.svg';
import royalcaninLogo from '../assets/shops/royalcanin.svg';
import sixtyseconds from '../assets/shops/sixtyseconds.svg';
import telcellLogo from '../assets/shops/telcell.svg';
import wildberriesLogo from '../assets/shops/wildberries.svg';
import yerevanCityLogo from '../assets/shops/yerevan-city.svg';
import zoovetLogo from '../assets/shops/zoovet.svg';


export interface ShopMeta {
    type: 'svg-path' | 'image';
    src: string;
    hexColor?: string;
}

export const normalizeShopName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
};

const SHOPS_REGISTRY: Record<string, ShopMeta> = {
    
    "60секунд": { type: 'image', src: sixtyseconds },
    fixprice: { type: 'image', src: fixpriceLogo },
    zoovet: { type: 'image', src: zoovetLogo },
    royalcanin: { type: 'image', src: royalcaninLogo },
    telcell: { type: 'image', src: telcellLogo },
    wildberries: { type: 'image', src: wildberriesLogo },
    yerevancity: { type: 'image', src: yerevanCityLogo },
    еревансити: { type: 'image', src: yerevanCityLogo },
    лента: { type: 'image', src: lentaLogo },

    // global brands from simple-icons
    aliexpress: { type: 'svg-path', src: siAliexpress.path, hexColor: `#${siAliexpress.hex}` },
    boosty: { type: 'svg-path', src: siBoosty.path, hexColor: `#${siBoosty.hex}` },
    googlehome: { type: 'svg-path', src: siGooglehome.path, hexColor: `#${siGooglehome.hex}` },
    handm: { type: 'svg-path', src: siHandm.path, hexColor: `#${siHandm.hex}` },
    icloud: { type: 'svg-path', src: siIcloud.path, hexColor: `#${siIcloud.hex}` },
    ikea: { type: 'svg-path', src: siIkea.path, hexColor: `#${siIkea.hex}` },
    kfc: { type: 'svg-path', src: siKfc.path, hexColor: `#${siKfc.hex}` },
    mcdonalds: { type: 'svg-path', src: siMcdonalds.path, hexColor: `#${siMcdonalds.hex}` },
    patreon: { type: 'svg-path', src: siPatreon.path, hexColor: `#${siPatreon.hex}` },
    spotify: { type: 'svg-path', src: siSpotify.path, hexColor: `#${siSpotify.hex}` },
    telegram: { type: 'svg-path', src: siTelegram.path, hexColor: `#${siTelegram.hex}` },
    uniqlo: { type: 'svg-path', src: siUniqlo.path, hexColor: `#${siUniqlo.hex}` },
};

export const getShopMeta = (shopName?: string | null): ShopMeta | null => {
    if (!shopName) return null;
    const key = normalizeShopName(shopName);
    return SHOPS_REGISTRY[key] || null;
};