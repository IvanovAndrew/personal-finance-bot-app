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
import aeroflotLogo from '../assets/shops/aeroflot.svg';
import alphavetLogo from '../assets/shops/alphavet.jpg';
import alphastomLogo from '../assets/shops/alphastom.jpg';
import ardshinkbankLogo from '../assets/shops/ardshinbank.svg';
import asteriaLogo from '../assets/shops/asteria.svg';
import avitoLogo from '../assets/shops/avito.svg';
import auchanLogo from '../assets/shops/auchan.svg';
import burgerKingLogo from '../assets/shops/burgerking.svg';
import chgkLogo from '../assets/shops/chgk.png';
import coffeehouseLogo from '../assets/shops/coffeehouse.svg';
import ddxLogo from '../assets/shops/ddx.svg';
import dixiLogo from '../assets/shops/dixy.svg';
import dnsLogo from '../assets/shops/dns.svg';
import dodoLogo from '../assets/shops/dodo.svg';
import eightyEightLogo from '../assets/shops/88.jpg';
import equusLogo from '../assets/shops/equus.jpg';
import falafelLogo from '../assets/shops/falafel.png';
import fixpriceLogo from '../assets/shops/fixprice.svg';
import fnsLogo from '../assets/shops/fns.svg';
import fourchettebuffetLogo from '../assets/shops/fourchettebuffet.jpg';
import galaLogo from '../assets/shops/gala.jpg';
import gammaclinicsLogo from '../assets/shops/gammaclinics.svg';
import gazpromLogo from '../assets/shops/gazprom.svg';
import grandcandyLogo from '../assets/shops/grandcandy.jpg';
import gosuslugiLogo from '../assets/shops/gosuslugi.svg';
import hafhafLogo from '../assets/shops/hafhaf.png';
import inecobankLogo from '../assets/shops/inecobank.svg';
import kaizerLogo from '../assets/shops/kaizer.jpg';
import lahtaclinicLogo from '../assets/shops/lahtaclinic.png';
import lentaLogo from '../assets/shops/lenta.svg';
import leovetLogo from '../assets/shops/leovet.jpg';
import letualLogo from '../assets/shops/letual.svg';
import magnitLogo from '../assets/shops/magnit.svg';
import masterclassLogo from '../assets/shops/masterclass.jpg';
import microsoftLogo from '../assets/shops/microsoft.svg';
import minisoLogo from '../assets/shops/miniso.png';
import nemoLogo from '../assets/shops/nemo.jpg';
import onexLogo from '../assets/shops/onex.svg';
import ostLogo from '../assets/shops/ost.jpg';
import ovioLogo from '../assets/shops/ovio.svg';
import ozonLogo from '../assets/shops/ozon.svg';
import phoboLogo from '../assets/shops/phobo.jpg';
import perekrestokLogo from '../assets/shops/perekrestok.svg';
import petersburgpharmaciesLogo from '../assets/shops/petersburgpharmacies.jpg';
import pyaterochkaLogo from '../assets/shops/pyaterochka.svg';
import raupoolLogo from '../assets/shops/raupool.jpg';
import royalcaninLogo from '../assets/shops/royalcanin.svg';
import rtcleaningLogo from '../assets/shops/rtcleaning.svg';
import sasLogo from '../assets/shops/sas.svg';
import sasfoodcourtLogo from '../assets/shops/sasfoodcourt.svg';
import semishagoffLogo from '../assets/shops/semishagoff.svg';
import sixtysecondsLogo from '../assets/shops/sixtyseconds.svg';
import sorrisoLogo from '../assets/shops/sorriso.jpg';
import spbMetroLogo from '../assets/shops/spbmetro.svg';
import sushilabLogo from '../assets/shops/sushilab.jpg';
import sushiwhiteLogo from '../assets/shops/sushiwhite.png';
import tbankLogo from '../assets/shops/tbank.svg';
import telcellLogo from '../assets/shops/telcell.svg';
import tinsuranceLogo from '../assets/shops/tinsurance.svg';
import tsiranLogo from '../assets/shops/tsiran.jpg';
import ucomLogo from '../assets/shops/ucom.svg';
import utairLogo from '../assets/shops/utair.svg';
import vkusnoitochkaLogo from '../assets/shops/vkusnoitochka.svg';
import vmvetclinicLogo from '../assets/shops/vmvetclinic.jpg';
import volchekLogo from '../assets/shops/vochek.png';
import vsedomaLogo from '../assets/shops/vsedoma.svg';
import veoliaLogo from '../assets/shops/veolia.jpg';
import wildberriesLogo from '../assets/shops/wildberries.svg';
import yandexeatsLogo from '../assets/shops/yandexeats.svg';
import yandexgoLogo from '../assets/shops/yandexgo.svg';
import yandexTaxiLogo from '../assets/shops/yandextaxi.svg';
import yerevanCityLogo from '../assets/shops/yerevancity.svg';
import yerevanSwimLogo from '../assets/shops/yerevanswim.svg';
import yotaLogo from '../assets/shops/yota.svg';
import yunyanLogo from '../assets/shops/yunyan.jpg';
import zaraLogo from '../assets/shops/zara.svg';
import zoovetLogo from '../assets/shops/zoovet.svg';
import zovqLogo from '../assets/shops/zovq.svg';


export interface ShopMeta {
    type: 'svg-path' | 'image';
    src: string;
    hexColor?: string;
    hasOwnBackground?: boolean;
}

export const normalizeShopName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^a-zа-я0-9]/g, '');
};

// thanks to https://trace-logos.ru/en/logos/

const RAW_SHOPS_REGISTRY: Record<string, ShopMeta> = {
    
    "60секунд": { type: 'image', src: sixtysecondsLogo },
    "88": { type: 'image', src: eightyEightLogo },
    aeroflot: { type: 'image', src: aeroflotLogo },
    alphastom: { type: 'image', src: alphastomLogo },
    alphavet: { type: 'image', src: alphavetLogo },
    ardshinbank: { type: 'image', src: ardshinkbankLogo },
    asteria: { type: 'image', src: asteriaLogo },
    avito: { type: 'image', src: avitoLogo },
    auchan: { type: 'image', src: auchanLogo, hasOwnBackground: true },
    burgerKing: { type: 'image', src: burgerKingLogo },
    coffeehouse: { type: 'image', src: coffeehouseLogo },
    ddx: { type: 'image', src: ddxLogo },
    dixi: { type: 'image', src: dixiLogo },
    dns: { type: 'image', src: dnsLogo },
    dodo: { type: 'image', src: dodoLogo },
    equus: { type: 'image', src: equusLogo },
    falafel: { type: 'image', src: falafelLogo, hasOwnBackground: true },
    fixprice: { type: 'image', src: fixpriceLogo },
    fourchette: { type: 'image', src: fourchettebuffetLogo },
    fourchettebuffet: { type: 'image', src: fourchettebuffetLogo },
    gala: { type: 'image', src: galaLogo },
    gamma: { type: 'image', src: gammaclinicsLogo },
    gammaclinics: { type: 'image', src: gammaclinicsLogo },
    gazprom: { type: 'image', src: gazpromLogo },
    grandcandy: { type: 'image', src: grandcandyLogo },
    hafhaf: { type: 'image', src: hafhafLogo },
    inecobank: { type: 'image', src: inecobankLogo },
    kaizer: { type: 'image', src: kaizerLogo },
    leovet: { type: 'image', src: leovetLogo, hasOwnBackground: true },
    masterclass: { type: 'image', src: masterclassLogo, hasOwnBackground: true },
    microsoft: { type: 'image', src: microsoftLogo, hasOwnBackground: true },
    miniso: { type: 'image', src: minisoLogo },
    nemo: { type: 'image', src: nemoLogo },
    onex: { type: 'image', src: onexLogo },
    ost: { type: 'image', src: ostLogo },
    ovio: { type: 'image', src: ovioLogo },
    ozon: { type: 'image', src: ozonLogo, hasOwnBackground: true },
    озон: { type: 'image', src: ozonLogo, hasOwnBackground: true },
    pho: { type: 'image', src: phoboLogo },
    phobo: { type: 'image', src: phoboLogo },
    raupool: { type: 'image', src: raupoolLogo },
    royalcanin: { type: 'image', src: royalcaninLogo },
    rtcleaning: { type: 'image', src: rtcleaningLogo },
    sas: { type: 'image', src: sasLogo },
    sasfoodcourt: { type: 'image', src: sasfoodcourtLogo },
    sorriso: { type: 'image', src: sorrisoLogo },
    sushilab: { type: 'image', src: sushilabLogo },
    sushiwhite: { type: 'image', src: sushiwhiteLogo },
    tbank: { type: 'image', src: tbankLogo, hasOwnBackground: true },
    telcell: { type: 'image', src: telcellLogo },
    tinsurance: { type: 'image', src: tinsuranceLogo },
    tsiran: { type: 'image', src: tsiranLogo },
    ucom: { type: 'image', src: ucomLogo },
    utair: { type: 'image', src: utairLogo },
    veolia: { type: 'image', src: veoliaLogo },
    veoliajur: { type: 'image', src: veoliaLogo },
    vmvetclinic: { type: 'image', src: vmvetclinicLogo },
    vmsvetclinic: { type: 'image', src: vmvetclinicLogo },
    wildberries: { type: 'image', src: wildberriesLogo, hasOwnBackground: true },
    yandexeats: { type: 'image', src: yandexeatsLogo },
    yandexgo: { type: 'image', src: yandexgoLogo, hasOwnBackground: true },
    yandextaxi: { type: 'image', src: yandexTaxiLogo, hasOwnBackground: true },
    yerevancity: { type: 'image', src: yerevanCityLogo },
    yerevanswim: { type: 'image', src: yerevanSwimLogo },
    yota: { type: 'image', src: yotaLogo },
    yunyan: { type: 'image', src: yunyanLogo, hasOwnBackground: true },
    
    zara: { type: 'image', src: zaraLogo },
    zoovet: { type: 'image', src: zoovetLogo },
    zoovetam: { type: 'image', src: zoovetLogo },
    zovq: { type: 'image', src: zovqLogo },
    авито: { type: 'image', src: avitoLogo },
    ашан: { type: 'image', src: auchanLogo },
    аэрофлот: { type: 'image', src: aeroflotLogo },
    булочнаявольчека: { type: 'image', src: volchekLogo, hasOwnBackground: true },
    вкусноиточка: { type: 'image', src: vkusnoitochkaLogo },
    вседома: { type: 'image', src: vsedomaLogo },
    газпром: { type: 'image', src: gazpromLogo },
    госуслуги: { type: 'image', src: gosuslugiLogo },
    дикси: { type: 'image', src: dixiLogo, hasOwnBackground: true },
    еревансити: { type: 'image', src: yerevanCityLogo },
    клиникавахе: { type: 'image', src: vmvetclinicLogo },
    лахтаклиник: { type: 'image', src: lahtaclinicLogo },
    лента: { type: 'image', src: lentaLogo, hasOwnBackground: true },
    летуаль: { type: 'image', src: letualLogo },
    магнит: { type: 'image', src: magnitLogo },
    метрополитен: { type: 'image', src: spbMetroLogo },
    метроcанктпетербурга: { type: 'image', src: spbMetroLogo },
    перекрёсток: { type: 'image', src: perekrestokLogo },
    петербургскиеаптеки: { type: 'image', src: petersburgpharmaciesLogo },
    пятёрочка: { type: 'image', src: pyaterochkaLogo, hasOwnBackground: true },
    семишагофф: { type: 'image', src: semishagoffLogo },
    тбанк: { type: 'image', src: tbankLogo },
    фалафельная: { type: 'image', src: falafelLogo },
    фнс: { type: 'image', src: fnsLogo },
    циран: { type: 'image', src: tsiranLogo },
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