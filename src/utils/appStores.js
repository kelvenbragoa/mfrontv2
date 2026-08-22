export const ANDROID_PACKAGE = 'mz.co.mticket.client';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const APP_STORE_URL = 'https://apps.apple.com/mz/app/mticket/id6801146792';

export const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const isIOSDevice = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const isAndroidDevice = () => /Android/i.test(navigator.userAgent);

export const isSafariIOS = () => {
    const ua = navigator.userAgent;
    if (!isIOSDevice()) return false;
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser/i.test(ua);
    return /WebKit/i.test(ua) && !otherBrowser;
};

export const storeUrlForDevice = () => (isIOSDevice() ? APP_STORE_URL : PLAY_STORE_URL);
