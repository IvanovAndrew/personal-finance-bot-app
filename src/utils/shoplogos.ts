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
import ardshinkbankLogo from '../assets/shops/ardshinbank.svg';
import chgkLogo from '../assets/shops/chgk.svg';
import coffeehouseLogo from '../assets/shops/coffeehouse.svg';
import dodoLogo from '../assets/shops/dodo.svg';
import fixpriceLogo from '../assets/shops/fixprice.svg';
import hafhafLogo from '../assets/shops/hafhaf.svg';
import inecobankLogo from '../assets/shops/inecobank.svg';
import lentaLogo from '../assets/shops/lenta.svg';
import onexLogo from '../assets/shops/onex.svg';
import ovioLogo from '../assets/shops/ovio.svg';
import ozonLogo from '../assets/shops/ozon.svg';
import perekrestokLogo from '../assets/shops/perekrestok.svg';
import pyaterochkaLogo from '../assets/shops/pyaterochka.svg';
import royalcaninLogo from '../assets/shops/royalcanin.svg';
import rtcleaningLogo from '../assets/shops/rtcleaning.svg';
import semishagoffLogo from '../assets/shops/semishagoff.svg';
import sixtysecondsLogo from '../assets/shops/sixtyseconds.svg';
import sorrisoLogo from '../assets/shops/sorriso.svg';
import tbankLogo from '../assets/shops/tbank.svg';
import telcellLogo from '../assets/shops/telcell.svg';
import ucomLogo from '../assets/shops/ucom.svg';
import vkusnoitochkaLogo from '../assets/shops/vkusnoitochka.svg';
import vsedomaLogo from '../assets/shops/vsedoma.svg';
import wildberriesLogo from '../assets/shops/wildberries.svg';
import yandexeatsLogo from '../assets/shops/yandexeats.svg';
import yandexgoLogo from '../assets/shops/yandexgo.svg';
import yerevanCityLogo from '../assets/shops/yerevancity.svg';
import yerevanSwimLogo from '../assets/shops/yerevanswim.svg';
import zoovetLogo from '../assets/shops/zoovet.svg';
import zovqLogo from '../assets/shops/zovq.svg';


export interface ShopMeta {
    type: 'svg-path' | 'image';
    src: string;
    hexColor?: string;
}

export const normalizeShopName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^a-zа-я0-9]/g, '');
};

const RAW_SHOPS_REGISTRY: Record<string, ShopMeta> = {
    
    "60секунд": { type: 'image', src: sixtysecondsLogo },
    ardshinbank: { type: 'image', src: ardshinkbankLogo },
    coffeehouse: { type: 'image', src: coffeehouseLogo },
    dodo: { type: 'image', src: dodoLogo },
    fixprice: { type: 'image', src: fixpriceLogo },
    hafhaf: { type: 'image', src: hafhafLogo },
    inecobank: { type: 'image', src: inecobankLogo },
    onex: { type: 'image', src: onexLogo },
    ovio: { type: 'image', src: ovioLogo },
    ozon: { type: 'image', src: ozonLogo },
    озон: { type: 'image', src: ozonLogo },
    royalcanin: { type: 'image', src: royalcaninLogo },
    rtcleaning: { type: 'image', src: rtcleaningLogo },
    sorriso: { type: 'image', src: sorrisoLogo },
    tbank: { type: 'image', src: tbankLogo },
    telcell: { type: 'image', src: telcellLogo },
    ucom: { type: 'image', src: ucomLogo },
    wildberries: { type: 'image', src: wildberriesLogo },
    yandexeats: { type: 'image', src: yandexeatsLogo },
    yandexgo: { type: 'image', src: yandexgoLogo },
    yerevancity: { type: 'image', src: yerevanCityLogo },
    yerevanswim: { type: 'image', src: yerevanSwimLogo },
    
    zoovet: { type: 'image', src: zoovetLogo },
    zoovetam: { type: 'image', src: zoovetLogo },
    zovq: { type: 'image', src: zovqLogo },
    вкусноиточка: { type: 'image', src: vkusnoitochkaLogo },
    вседома: { type: 'image', src: vsedomaLogo },
    еревансити: { type: 'image', src: yerevanCityLogo },
    лента: { type: 'image', src: lentaLogo },
    перекрёсток: { type: 'image', src: perekrestokLogo },
    пятёрочка: { type: 'image', src: pyaterochkaLogo },
    семишагофф: { type: 'image', src: semishagoffLogo },
    тбанк: { type: 'image', src: tbankLogo },
    чгк: { type: 'image', src: chgkLogo },

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

const SHOPS_REGISTRY: Record<string, ShopMeta> = Object.fromEntries(
    Object.entries(RAW_SHOPS_REGISTRY).map(([key, value]) => [normalizeShopName(key), value])
);

export const getShopMeta = (shopName?: string | null): ShopMeta | null => {
    if (!shopName) return null;
    const key = normalizeShopName(shopName);
    return SHOPS_REGISTRY[key] || null;
};