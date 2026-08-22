<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { isMobileDevice, storeUrlForDevice } from '@/utils/appStores';

const STORAGE_KEY = 'mticket_app_dialog_dismissed_at';
const DISMISS_DAYS = 7;

const route = useRoute();
const visible = ref(false);

let showTimer = null;

const wasRecentlyDismissed = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const dismissedAt = Number(raw);
        if (!Number.isFinite(dismissedAt)) return false;
        return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
};

const rememberDismiss = () => {
    try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
        /* ignore quota / private mode */
    }
};

const close = () => {
    visible.value = false;
};

const goToStore = () => {
    rememberDismiss();
    window.location.href = storeUrlForDevice();
};

const onDialogHide = () => {
    if (route.name === 'homepage') rememberDismiss();
};

const shouldShow = () => route.name === 'homepage' && isMobileDevice() && !wasRecentlyDismissed();

const schedule = () => {
    if (showTimer) {
        window.clearTimeout(showTimer);
        showTimer = null;
    }

    if (!shouldShow()) {
        visible.value = false;
        return;
    }

    showTimer = window.setTimeout(() => {
        visible.value = true;
    }, 800);
};

watch(() => route.name, schedule);

onMounted(schedule);

onBeforeUnmount(() => {
    if (showTimer) window.clearTimeout(showTimer);
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :dismissableMask="true"
        :draggable="false"
        :pt="{
            root: { class: 'app-install-dialog' },
            header: { class: 'hidden' },
            content: { class: 'app-install-dialog__content' }
        }"
        @hide="onDialogHide"
    >
        <div class="app-install">
            <img class="app-install__icon" src="/demo/images/logo2.png" alt="Mticket" width="72" height="72" />
            <h2>Melhor na app</h2>
            <p>
                Instala a Mticket para uma experiência mais rápida e guarda os teus bilhetes no telemóvel, prontos
                para entrar no evento.
            </p>
            <ul>
                <li><i class="pi pi-ticket" /> Bilhetes sempre à mão</li>
                <li><i class="pi pi-bell" /> Avisos dos teus eventos</li>
            </ul>
            <Button
                label="Ir à loja"
                icon="pi pi-download"
                class="w-full app-install__store"
                @click="goToStore"
            />
            <button type="button" class="app-install__stay" @click="close">Continuar no site</button>
        </div>
    </Dialog>
</template>

<style>
.app-install-dialog {
    width: min(22.5rem, calc(100vw - 1.75rem)) !important;
    max-width: 22.5rem;
    border-radius: 1.25rem !important;
    overflow: hidden;
}

.app-install-dialog__content {
    padding: 0 !important;
}
</style>

<style scoped>
.app-install {
    padding: 1.5rem 1.25rem 1.15rem;
    text-align: center;
}

.app-install__icon {
    width: 4.5rem;
    height: 4.5rem;
    object-fit: contain;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.18);
}

.app-install h2 {
    margin: 0.9rem 0 0.45rem;
    color: #0f172a;
    font-size: 1.35rem;
    font-weight: 700;
}

.app-install p {
    margin: 0 0 1rem;
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.5;
}

.app-install ul {
    list-style: none;
    margin: 0 0 1.25rem;
    padding: 0;
    text-align: left;
}

.app-install li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.45rem;
    color: #334155;
    font-size: 0.9rem;
    font-weight: 500;
}

.app-install li i {
    color: #2563eb;
    font-size: 0.95rem;
}

.app-install__store {
    border: 0;
    border-radius: 999px;
    background: #2563eb;
}

.app-install__stay {
    display: block;
    width: 100%;
    margin-top: 0.65rem;
    padding: 0.55rem;
    border: 0;
    background: transparent;
    color: #64748b;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
}
</style>
