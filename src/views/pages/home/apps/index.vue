<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';

const isLoading = ref(true);
const loadError = ref(null);
const apps = ref([]);

const qrUrl = (downloadUrl) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(downloadUrl)}`;

const formatBytes = (bytes) => {
    const value = Number(bytes) || 0;
    if (!value) return '';
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const getData = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${baseURL}/apps`);
        apps.value = response.data.apps ?? [];
        loadError.value = null;
    } catch {
        loadError.value = 'Não foi possível carregar as aplicações.';
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="apps-page">
        <section class="apps-hero">
            <div class="apps-hero__veil" />
            <div class="apps-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="apps-hero__eyebrow">Apps da equipa</p>
                <h1 class="apps-hero__title">Mticket Bar e Check-in</h1>
                <p class="apps-hero__subtitle">
                    Instala nestes telemóveis Android da porta e do bar. O app do público continua na Play Store e na
                    App Store.
                </p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-6">
            <div v-if="isLoading" class="apps-grid">
                <div v-for="n in 2" :key="n" class="apps-card">
                    <Skeleton height="16rem" />
                </div>
            </div>

            <div v-else-if="loadError" class="apps-empty">
                <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
                <h3>{{ loadError }}</h3>
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData" />
            </div>

            <div v-else class="apps-grid">
                <article v-for="app in apps" :key="app.slug" class="apps-card">
                    <div class="apps-card__icon">
                        <i :class="app.slug === 'mticket-bar' ? 'pi pi-shop' : 'pi pi-qrcode'" />
                    </div>
                    <h2>{{ app.name }}</h2>
                    <p>{{ app.description }}</p>

                    <template v-if="app.latest_release?.download_url">
                        <p class="apps-card__version">
                            Versão {{ app.latest_release.version_name }}
                            <span v-if="app.latest_release.file_size"> · {{ formatBytes(app.latest_release.file_size) }}</span>
                        </p>
                        <p v-if="app.latest_release.changelog" class="apps-card__notes">
                            {{ app.latest_release.changelog }}
                        </p>
                        <a
                            class="apps-card__download"
                            :href="app.latest_release.download_url"
                            target="_blank"
                            rel="noopener"
                        >
                            Descarregar APK Android
                        </a>
                        <div class="apps-card__qr">
                            <img :src="qrUrl(app.latest_release.download_url)" :alt="`QR ${app.name}`" />
                            <span>Lê o código no telemóvel</span>
                        </div>
                    </template>
                    <p v-else class="apps-card__empty">Ainda não há uma versão publicada.</p>
                </article>
            </div>

            <p class="apps-hint">
                No Android, permite instalar apps desta origem nas definições. Android apenas — iOS não instala APK.
            </p>
        </section>
    </div>
</template>

<style scoped>
.apps-hero {
    position: relative;
    padding: 4.5rem 0 3.5rem;
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
}

.apps-hero__veil {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.16), transparent 45%);
}

.apps-hero__content {
    position: relative;
}

.apps-hero__eyebrow {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.apps-hero__title {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.6rem);
    font-weight: 700;
}

.apps-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.92);
    font-size: 1.1rem;
    line-height: 1.55;
    max-width: 40rem;
}

.apps-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
}

.apps-card {
    padding: 1.5rem;
    border-radius: 1rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.apps-card__icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.85rem;
    background: #eff6ff;
    color: #2563eb;
    font-size: 1.4rem;
    margin-bottom: 1rem;
}

.apps-card h2 {
    margin: 0 0 0.4rem;
    color: #0f172a;
}

.apps-card p {
    margin: 0 0 1rem;
    color: #64748b;
    line-height: 1.5;
}

.apps-card__version {
    font-weight: 600;
    color: #0f172a !important;
}

.apps-card__notes {
    font-size: 0.95rem;
}

.apps-card__download {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0 1.25rem;
    border-radius: 0.7rem;
    background: #2563eb;
    color: #fff;
    font-weight: 600;
    text-decoration: none;
}

.apps-card__qr {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
}

.apps-card__qr img {
    width: 140px;
    height: 140px;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.apps-card__qr span,
.apps-hint {
    color: #64748b;
    font-size: 0.9rem;
}

.apps-hint {
    margin-top: 2rem;
}

.apps-empty {
    text-align: center;
    padding: 3rem 1rem;
}

.apps-card__empty {
    font-weight: 500;
    color: #0f172a !important;
}

@media (max-width: 767px) {
    .apps-grid {
        grid-template-columns: 1fr;
    }
}
</style>
