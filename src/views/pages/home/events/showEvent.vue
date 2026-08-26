<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useHead } from '@vueuse/head';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { getPromotorPublicUrl, openPromotorPage, shouldUseSubdomainUrls, getCurrentPromotorSlug, getEventPublicUrl, getMainSiteUrl, getMainSiteOrigin } from '@/utils/promotorHost';
import EventLiveWatch from '@/components/live/EventLiveWatch.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const useSubdomainLinks = shouldUseSubdomainUrls();
const hostPromotorSlug = getCurrentPromotorSlug();

const isLoadingDiv = ref(true);
const notFound = ref(false);
const event = ref(null);
const recommended = ref([]);
const brokenImages = ref(new Set());

const isOnSale = computed(() => {
    if (!event.value?.end_date) return false;
    return moment().isSameOrBefore(moment(event.value.end_date));
});

const statusLabel = computed(() => (isOnSale.value ? 'À venda' : 'Encerrado'));
const statusSeverity = computed(() => (isOnSale.value ? 'success' : 'danger'));

const minPrice = computed(() => {
    const tickets = event.value?.tickets || [];
    if (!tickets.length) return null;
    return Math.min(...tickets.map((t) => Number(t.price) || 0));
});

const formattedMinPrice = computed(() => {
    if (minPrice.value === null) return 'Ver bilhetes';
    if (minPrice.value <= 0) return 'Grátis';
    return `A partir de ${Number(minPrice.value).toLocaleString('pt-MZ')} MT`;
});

const locationLabel = computed(() => {
    if (!event.value) return '';
    const city = event.value.city?.name;
    const province = event.value.province?.name;
    if (city && province) return `${city}, ${province}`;
    return event.value.address || province || 'Local a anunciar';
});

const promoterName = computed(() => {
    return event.value?.user?.company_name || event.value?.user?.name || 'Promotor';
});

const promoterSlug = computed(() => event.value?.user?.slug || null);
const promoterPageUrl = computed(() => getPromotorPublicUrl(promoterSlug.value));
const goToPromoter = () => openPromotorPage(promoterSlug.value, router);

const likesCount = computed(() => event.value?.like?.length || 0);
const ticketsCount = computed(() => event.value?.tickets?.length || 0);
const hasLineups = computed(() => (event.value?.lineups || []).length > 0);
const hasRecommended = computed(() => recommended.value.length > 0);
const liveStatus = ref(null);
const isLiveActive = computed(() => liveStatus.value?.status === 'active' || liveStatus.value?.active === true);

const onLiveStatus = (status) => {
    liveStatus.value = status;
};

const heroBackground = computed(() => {
    if (!event.value?.image || brokenImages.value.has(`event-${event.value.id}`)) {
        return null;
    }
    return storageURL + event.value.image;
});

const markBrokenImage = (key) => {
    brokenImages.value = new Set([...brokenImages.value, key]);
};

const imageSrc = (item, type = 'event') => {
    const key = `${type}-${item?.id}`;
    if (!item?.image || brokenImages.value.has(key)) {
        return '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + item.image;
};

const formatPrice = (item) => {
    const price = item.tickets_min_price ?? item.price;
    if (price === null || price === undefined || Number(price) <= 0) {
        return 'Grátis / Ver bilhetes';
    }
    return `A partir de ${Number(price).toLocaleString('pt-MZ')} MT`;
};

const eventLocation = (item) => {
    const city = item.city?.name;
    const province = item.province?.name;
    if (city && province) return `${city}, ${province}`;
    return item.address || province || 'Local a anunciar';
};

const getValue = (eventdate) => {
    return moment().isSameOrBefore(moment(eventdate)) ? 'À venda' : 'Encerrado';
};

const getSeverity = (eventdate) => {
    return moment().isSameOrBefore(moment(eventdate)) ? 'success' : 'danger';
};

const formatTicketPrice = (price) => `${Number(price || 0).toLocaleString('pt-MZ')} MT`;

const metaTitle = computed(() => (event.value?.name ? `${event.value.name} | Mticket` : 'Mticket'));

const metaDescription = computed(() => {
    if (!event.value) return 'Compra bilhetes para os melhores eventos em Moçambique na Mticket.';

    const raw = (event.value.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (raw) return raw.length > 200 ? `${raw.slice(0, 197)}...` : raw;

    const when = event.value.start_date ? moment(event.value.start_date).format('DD/MM/YYYY [às] HH:mm') : '';
    return [when, locationLabel.value].filter(Boolean).join(' • ') || 'Compra o teu bilhete na Mticket.';
});

const metaImage = computed(() => {
    if (event.value?.image) return storageURL + event.value.image;
    return `${getMainSiteOrigin()}/demo/images/logo2.png`;
});

const metaUrl = computed(() => (typeof window === 'undefined' ? '' : window.location.href.split('?')[0]));

useHead({
    title: metaTitle,
    meta: computed(() => [
        { name: 'description', content: metaDescription.value },
        { property: 'og:site_name', content: 'Mticket' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: metaTitle.value },
        { property: 'og:description', content: metaDescription.value },
        { property: 'og:image', content: metaImage.value },
        { property: 'og:url', content: metaUrl.value },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: metaTitle.value },
        { name: 'twitter:description', content: metaDescription.value },
        { name: 'twitter:image', content: metaImage.value }
    ]),
    link: computed(() => (metaUrl.value ? [{ rel: 'canonical', href: metaUrl.value }] : []))
});

const getData = async () => {
    isLoadingDiv.value = true;
    notFound.value = false;
    event.value = null;
    recommended.value = [];

    try {
        const response = await axios.get(`${baseURL}/eventos/${route.params.id}`);
        const loaded = response.data.events;

        // On a promoter subdomain, only keep that promoter's events here.
        if (hostPromotorSlug && loaded?.user?.slug && loaded.user.slug !== hostPromotorSlug) {
            window.location.href = getMainSiteUrl(`/eventos/${loaded.slug || route.params.id}`);
            return;
        }

        event.value = loaded;
        recommended.value = response.data.recommended || response.data.event_recomended || [];
    } catch (error) {
        if (error?.response?.status === 404) {
            notFound.value = true;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar o evento',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoadingDiv.value = false;
    }
};

onMounted(getData);
watch(() => route.params.id, getData);
</script>

<template>
    <div v-if="isLoadingDiv" class="event-show px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="20rem" class="mb-4 border-round-xl" />
        <div class="grid">
            <div class="col-12 lg:col-8">
                <Skeleton height="2rem" width="70%" class="mb-3" />
                <Skeleton height="12rem" class="mb-3" />
                <Skeleton height="8rem" />
            </div>
            <div class="col-12 lg:col-4">
                <Skeleton height="18rem" class="border-round-xl" />
            </div>
        </div>
    </div>

    <div v-else-if="notFound" class="event-show px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Evento não encontrado</h2>
            <p class="text-600 mb-3">Este evento pode ter sido removido ou o link está incorreto.</p>
            <router-link v-if="!hostPromotorSlug" to="/eventos">
                <Button label="Ver todos os eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </router-link>
            <a v-else :href="getMainSiteUrl('/eventos')">
                <Button label="Ver todos os eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </a>
        </div>
    </div>

    <div v-else-if="event" class="event-show">
        <section class="event-hero" :style="heroBackground ? { '--hero-image': `url('${heroBackground}')` } : null">
            <div class="event-hero__veil" />
            <div class="event-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <router-link v-if="hostPromotorSlug" to="/" class="event-hero__back">
                    <i class="pi pi-arrow-left mr-2" />
                    Voltar ao promotor
                </router-link>
                <router-link v-else to="/eventos" class="event-hero__back">
                    <i class="pi pi-arrow-left mr-2" />
                    Eventos
                </router-link>
                <div class="flex align-items-center gap-2 mb-3 flex-wrap">
                    <Tag v-if="isLiveActive" value="Ao vivo" severity="danger" />
                    <Tag v-if="event.type?.name" :value="event.type.name" severity="info" />
                    <Tag :value="statusLabel" :severity="statusSeverity" />
                    <Tag v-if="event.category?.name" :value="event.category.name" />
                </div>
                <h1 class="event-hero__title">{{ event.name }}</h1>
                <p class="event-hero__meta">
                    <span><i class="pi pi-calendar mr-2" />{{ moment(event.start_date).format('LL') }} · {{ event.start_time?.slice(0, 5) }}</span>
                    <span><i class="pi pi-map-marker mr-2" />{{ locationLabel }}</span>
                </p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="grid">
                <div class="col-12 lg:col-8">
                    <div class="detail-panel mb-4">
                        <img
                            :src="imageSrc(event)"
                            :alt="event.name"
                            class="detail-panel__image"
                            @error="markBrokenImage(`event-${event.id}`)"
                        />
                        <div class="detail-panel__stats">
                            <span><strong>{{ likesCount }}</strong> gostos</span>
                            <span><strong>{{ ticketsCount }}</strong> tipos de bilhete</span>
                            <a
                                v-if="promoterPageUrl && useSubdomainLinks"
                                :href="promoterPageUrl"
                                class="promoter-link"
                            >
                                {{ promoterName }}
                            </a>
                            <a
                                v-else-if="promoterPageUrl"
                                href="#"
                                class="promoter-link"
                                @click.prevent="goToPromoter"
                            >
                                {{ promoterName }}
                            </a>
                            <span v-else>{{ promoterName }}</span>
                        </div>
                    </div>

                    <div class="detail-panel mb-4">
                        <h2 class="detail-title">Sobre o evento</h2>
                        <p class="detail-text">{{ event.description || 'Sem descrição disponível.' }}</p>

                        <Divider />

                        <h3 class="detail-subtitle">Local</h3>
                        <p class="detail-text mb-2">
                            <i class="pi pi-map-marker mr-2" />
                            {{ event.address }} · {{ locationLabel }}
                        </p>

                        <h3 class="detail-subtitle">Promotor</h3>
                        <p class="detail-text mb-1">
                            <a
                                v-if="promoterPageUrl && useSubdomainLinks"
                                :href="promoterPageUrl"
                                class="promoter-link"
                            >
                                {{ promoterName }}
                            </a>
                            <a
                                v-else-if="promoterPageUrl"
                                href="#"
                                class="promoter-link"
                                @click.prevent="goToPromoter"
                            >
                                {{ promoterName }}
                            </a>
                            <template v-else>{{ promoterName }}</template>
                        </p>
                        <p v-if="promoterPageUrl" class="mb-3">
                            <a v-if="useSubdomainLinks" :href="promoterPageUrl">
                                <Button label="Ver página do promotor" icon="pi pi-external-link" text class="px-0" />
                            </a>
                            <Button
                                v-else
                                label="Ver página do promotor"
                                icon="pi pi-external-link"
                                text
                                class="px-0"
                                @click="goToPromoter"
                            />
                        </p>
                        <p v-if="event.user?.email || event.email" class="detail-text mb-1">
                            <i class="pi pi-envelope mr-2" />
                            {{ event.email || event.user?.email }}
                        </p>
                        <p v-if="event.phone || event.user?.mobile" class="detail-text mb-0">
                            <i class="pi pi-mobile mr-2" />
                            {{ event.phone || event.user?.mobile }}
                        </p>
                    </div>

                    <EventLiveWatch
                        :event-id="event.slug || event.id"
                        :checkout-path="'/checkout/' + event.slug + '/evento'"
                        @status="onLiveStatus"
                    />

                    <div class="detail-panel mb-4">
                        <h2 class="detail-title">Bilhetes</h2>
                        <div v-if="ticketsCount" class="ticket-list">
                            <div v-for="ticket in event.tickets" :key="ticket.id" class="ticket-row">
                                <div>
                                    <div class="ticket-row__name">{{ ticket.name }}</div>
                                    <div v-if="ticket.description" class="ticket-row__desc">{{ ticket.description }}</div>
                                </div>
                                <div class="ticket-row__price">{{ formatTicketPrice(ticket.price) }}</div>
                            </div>
                        </div>
                        <p v-else class="detail-text mb-0">Ainda não há bilhetes publicados para este evento.</p>
                    </div>

                    <div v-if="hasLineups" class="detail-panel mb-4">
                        <h2 class="detail-title">Line-up</h2>
                        <div class="lineup-list">
                            <div v-for="lineup in event.lineups" :key="lineup.id" class="lineup-row">
                                <div>
                                    <div class="ticket-row__name">{{ lineup.name }}</div>
                                    <div v-if="lineup.description" class="ticket-row__desc">{{ lineup.description }}</div>
                                </div>
                                <div class="ticket-row__price">
                                    {{ lineup.start_time?.slice(0, 5) }}
                                    <span v-if="lineup.end_time"> – {{ lineup.end_time.slice(0, 5) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-panel mb-4">
                        <h2 class="detail-title">Dúvidas frequentes</h2>
                        <Panel header="Em caso de cancelamento do evento?" :toggleable="true" :collapsed="true" class="mb-2">
                            <p class="line-height-3 m-0">Em caso de cancelamento, o promotor informa sobre a próxima data ou o reembolso.</p>
                        </Panel>
                        <Panel header="Os ingressos não adquiridos na Mticket são válidos?" :toggleable="true" :collapsed="true" class="mb-2">
                            <p class="line-height-3 m-0">Só são aceites ingressos adquiridos através da plataforma Mticket.</p>
                        </Panel>
                        <Panel header="Como funciona o scan na entrada?" :toggleable="true" :collapsed="true">
                            <p class="line-height-3 m-0">Após a compra, recebes um QR Code para apresentar na portaria.</p>
                        </Panel>
                    </div>
                </div>

                <div class="col-12 lg:col-4">
                    <aside class="buy-card">
                        <div class="buy-card__price">{{ formattedMinPrice }}</div>
                        <p class="buy-card__date">
                            <i class="pi pi-calendar mr-2" />
                            {{ moment(event.start_date).format('LL') }}
                            <span v-if="event.start_time"> · {{ event.start_time.slice(0, 5) }}</span>
                        </p>
                        <p class="buy-card__location">
                            <i class="pi pi-map-marker mr-2" />
                            {{ locationLabel }}
                        </p>
                        <p class="buy-card__tickets">
                            <i class="pi pi-ticket mr-2" />
                            {{ ticketsCount }} {{ ticketsCount === 1 ? 'tipo de bilhete' : 'tipos de bilhete' }}
                        </p>
                        <Tag :value="statusLabel" :severity="statusSeverity" class="mb-3" />
                        <Tag v-if="isLiveActive" value="Ao vivo" severity="danger" class="mb-3 ml-2" />

                        <router-link v-if="isOnSale" :to="'/checkout/' + event.slug + '/evento'" class="w-full">
                            <Button label="Comprar bilhetes" class="w-full p-button-rounded border-none font-medium text-white bg-blue-500" />
                        </router-link>
                        <Button v-else label="Vendas encerradas" class="w-full p-button-rounded" disabled />

                        <router-link v-if="hostPromotorSlug" to="/" class="w-full mt-2 block">
                            <Button label="Voltar ao promotor" class="w-full p-button-rounded p-button-outlined" />
                        </router-link>
                        <router-link v-else to="/eventos" class="w-full mt-2 block">
                            <Button label="Ver mais eventos" class="w-full p-button-rounded p-button-outlined" />
                        </router-link>
                    </aside>
                </div>
            </div>
        </section>

        <section v-if="hasRecommended" class="px-4 lg:px-8 mx-0 lg:mx-8 pb-6">
            <h2 class="text-900 font-normal mb-2">Também podes gostar</h2>
            <p class="text-600 text-xl mt-0 mb-4">Outros eventos disponíveis na Mticket</p>

            <div class="grid">
                <div class="col-12 md:col-6 xl:col-3" v-for="item in recommended" :key="item.id">
                    <a :href="getEventPublicUrl(item.slug, item.user?.slug)" class="event-card">
                        <div class="event-card__media">
                            <img
                                :src="imageSrc(item)"
                                :alt="item.name"
                                class="event-card__image"
                                @error="markBrokenImage(`event-${item.id}`)"
                            />
                        </div>
                        <div class="event-card__body">
                            <div class="event-card__meta">
                                <span
                                    v-if="item.user?.slug"
                                    class="promoter-link"
                                    @click.prevent.stop="openPromotorPage(item.user.slug, router)"
                                >
                                    {{ item.user?.company_name || item.user?.name }}
                                </span>
                                <span v-else>{{ item.user?.company_name || item.user?.name }}</span>
                                <Tag :value="getValue(item.end_date)" :severity="getSeverity(item.end_date)" />
                            </div>
                            <h3 class="event-card__title">{{ item.name }}</h3>
                            <p class="event-card__location">
                                <i class="pi pi-map-marker mr-1" />
                                {{ eventLocation(item) }}
                            </p>
                            <div class="event-card__footer">
                                <div>
                                    <div class="event-card__date">{{ moment(item.start_date).format('LL') }}</div>
                                    <div class="event-card__price">{{ formatPrice(item) }}</div>
                                </div>
                                <Tag v-if="item.type?.name" :value="item.type.name" severity="info" />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.event-hero {
    position: relative;
    min-height: 18rem;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background-color: #0b3d91;
    background-image: var(--hero-image, linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%));
    background-size: cover;
    background-position: center;
    animation: hero-fade 0.6s ease-out;
}

.event-hero__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(8, 28, 68, 0.35) 0%, rgba(8, 28, 68, 0.82) 100%);
}

.event-hero__content {
    position: relative;
    z-index: 1;
    width: 100%;
    padding-top: 3.5rem;
    padding-bottom: 2.25rem;
}

.event-hero__back {
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    margin-bottom: 1rem;
    font-weight: 600;
}

.event-hero__title {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    max-width: 20ch;
    line-height: 1.15;
    animation: rise-in 0.65s ease-out both;
}

.event-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.05rem;
}

.detail-panel {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem;
    background: var(--surface-0);
}

.detail-panel__image {
    width: 100%;
    max-height: 28rem;
    object-fit: cover;
    border-radius: 0.85rem;
    background: #e8eef7;
}

.detail-panel__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    margin-top: 1rem;
    color: #64748b;
}

.detail-title {
    margin: 0 0 0.75rem;
    font-size: 1.35rem;
    color: #0f172a;
    font-weight: 600;
}

.detail-subtitle {
    margin: 0 0 0.4rem;
    font-size: 1.05rem;
    color: #0f172a;
    font-weight: 600;
}

.detail-text {
    margin: 0 0 1rem;
    color: #475569;
    line-height: 1.6;
    white-space: pre-wrap;
}

.promoter-link {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
}

.promoter-link:hover {
    text-decoration: underline;
}

.ticket-list,
.lineup-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.ticket-row,
.lineup-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 0.75rem;
    background: #f8fafc;
    border: 1px solid var(--surface-border);
}

.ticket-row__name {
    font-weight: 700;
    color: #0f172a;
}

.ticket-row__desc {
    margin-top: 0.2rem;
    color: #64748b;
    font-size: 0.95rem;
}

.ticket-row__price {
    font-weight: 700;
    color: #2563eb;
    white-space: nowrap;
}

.buy-card {
    position: sticky;
    top: 1.25rem;
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.35rem;
    background: var(--surface-0);
    box-shadow: 0 10px 28px rgba(15, 40, 80, 0.08);
}

.buy-card__price {
    font-size: 1.5rem;
    font-weight: 800;
    color: #2563eb;
    margin-bottom: 0.85rem;
}

.buy-card__date,
.buy-card__location,
.buy-card__tickets {
    margin: 0 0 0.65rem;
    color: #475569;
}

.event-card {
    display: block;
    text-decoration: none;
    color: inherit;
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    overflow: hidden;
    background: var(--surface-0);
    height: 100%;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.event-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(15, 40, 80, 0.1);
}

.event-card__media {
    overflow: hidden;
    aspect-ratio: 16 / 10;
    background: #e8eef7;
}

.event-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease;
}

.event-card:hover .event-card__image {
    transform: scale(1.05);
}

.event-card__body {
    padding: 1rem 1.1rem 1.15rem;
}

.event-card__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
}

.event-card__title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    line-height: 1.3;
    color: #0f172a;
}

.event-card__location {
    margin: 0 0 1rem;
    color: #475569;
    font-size: 0.9rem;
}

.event-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 0.75rem;
}

.event-card__date {
    font-weight: 600;
    color: #1e293b;
}

.event-card__price {
    margin-top: 0.25rem;
    color: #2563eb;
    font-weight: 700;
}

.empty-block {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
}

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 991px) {
    .buy-card {
        position: static;
    }
}
</style>
