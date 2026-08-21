<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const STORAGE_KEY = 'mticket_app_banner_dismissed';
const ANDROID_PACKAGE = 'mz.co.mticket.client';
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const APP_STORE_URL = 'https://apps.apple.com/mz/app/mticket/id6801146792';

const visible = ref(false);
const opening = ref(false);

let fallbackTimer = null;
let cancelOpen = false;

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

const isAndroid = () => /Android/i.test(navigator.userAgent);

const isSafariIOS = () => {
    const ua = navigator.userAgent;
    if (!isIOS()) return false;
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser/i.test(ua);
    return /WebKit/i.test(ua) && !otherBrowser;
};

const wasDismissed = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

const dismiss = () => {
    visible.value = false;
    try {
        localStorage.setItem(STORAGE_KEY, '1');
    } catch {
        /* ignore quota / private mode */
    }
};

const storeUrl = () => (isIOS() ? APP_STORE_URL : PLAY_STORE_URL);

const markOpened = () => {
    cancelOpen = true;
};

const clearOpenListeners = () => {
    document.removeEventListener('visibilitychange', markOpened);
    window.removeEventListener('pagehide', markOpened);
    window.removeEventListener('blur', markOpened);
};

const goToStore = () => {
    if (cancelOpen || document.hidden) return;
    window.location.href = storeUrl();
};

const openAppOrStore = () => {
    if (opening.value) return;

    opening.value = true;
    cancelOpen = false;

    document.addEventListener('visibilitychange', markOpened);
    window.addEventListener('pagehide', markOpened);
    window.addEventListener('blur', markOpened);

    fallbackTimer = window.setTimeout(() => {
        clearOpenListeners();
        goToStore();
        opening.value = false;
    }, 1200);

    if (isAndroid()) {
        const fallback = encodeURIComponent(PLAY_STORE_URL);
        window.location.href =
            `intent://#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
        return;
    }

    window.location.href = APP_STORE_URL;
};

onMounted(() => {
    if (!isMobile() || wasDismissed() || isSafariIOS()) return;
    visible.value = true;
});

onBeforeUnmount(() => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    clearOpenListeners();
});
</script>

<template>
    <div v-if="visible" class="app-banner-root">
        <div class="app-banner-spacer" aria-hidden="true" />
        <div class="app-banner" role="banner">
            <button type="button" class="app-banner__close" aria-label="Fechar" @click="dismiss">
                <i class="pi pi-times" />
            </button>

            <img class="app-banner__icon" src="/demo/images/logo.svg" alt="" width="40" height="40" />

            <div class="app-banner__copy">
                <strong>Mticket</strong>
                <span>Bilhetes e eventos</span>
            </div>

            <button type="button" class="app-banner__cta" :disabled="opening" @click="openAppOrStore">
                {{ opening ? 'A abrir...' : 'Abrir' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.app-banner-spacer {
    height: 3.5rem;
}

.app-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    height: 3.5rem;
    padding: 0 0.65rem 0 0.35rem;
    background: #f4f4f5;
    border-bottom: 1px solid #e4e4e7;
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

.app-banner__close {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: #71717a;
    cursor: pointer;
}

.app-banner__icon {
    flex: 0 0 auto;
    width: 2.35rem;
    height: 2.35rem;
    object-fit: contain;
    border-radius: 0.55rem;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08);
}

.app-banner__copy {
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.app-banner__copy strong {
    color: #18181b;
    font-size: 0.92rem;
    font-weight: 700;
}

.app-banner__copy span {
    overflow: hidden;
    color: #71717a;
    font-size: 0.72rem;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.app-banner__cta {
    flex: 0 0 auto;
    height: 1.85rem;
    padding: 0 0.85rem;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    cursor: pointer;
}

.app-banner__cta:disabled {
    opacity: 0.7;
    cursor: wait;
}

@media (min-width: 992px) {
    .app-banner-root {
        display: none;
    }
}
</style>
