<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { getCurrentPromotorSlug, getMainSiteUrl } from '@/utils/promotorHost';

const route = useRoute();
const toast = useToast();

const promotorSlug = computed(
    () => route.params.slug || route.meta.promotorSlug || getCurrentPromotorSlug() || null
);

const isLoading = ref(true);
const isLoadingEvents = ref(false);
const notFound = ref(false);
const searchQuery = ref('');
const brokenImages = ref(new Set());
const rowsPerPage = ref(12);
const first = ref(0);

const promotor = ref(null);
const events = ref({ data: [] });

const eventsList = computed(() => events.value?.data || []);
const hasEvents = computed(() => eventsList.value.length > 0);
const showPagination = computed(() => (events.value?.last_page || 0) > 1);

const displayName = computed(() => promotor.value?.company_name || promotor.value?.name || 'Promotor');

const initials = computed(() => {
    const name = displayName.value.trim();
    if (!name) return 'P';
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
});

const DEFAULT_BANNER = '/demo/images/logo2.png';

const bannerSrc = computed(() => {
    if (!promotor.value?.banner || brokenImages.value.has('banner')) {
        return DEFAULT_BANNER;
    }
    return storageURL + promotor.value.banner;
});

const avatarSrc = computed(() => {
    if (!promotor.value?.image || brokenImages.value.has('avatar')) {
        return null;
    }
    return storageURL + promotor.value.image;
});

const getValue = (eventdate) => (moment().isSameOrBefore(moment(eventdate)) ? 'À venda' : 'Encerrado');
const getSeverity = (eventdate) => (moment().isSameOrBefore(moment(eventdate)) ? 'success' : 'danger');

const formatPrice = (event) => {
    const price = event.tickets_min_price;
    if (price === null || price === undefined || Number(price) <= 0) {
        return 'Grátis / Ver bilhetes';
    }
    return `A partir de ${Number(price).toLocaleString('pt-MZ')} MT`;
};

const eventLocation = (event) => {
    const city = event.city?.name;
    const province = event.province?.name;
    if (city && province) return `${city}, ${province}`;
    return event.address || province || 'Local a anunciar';
};

const markBrokenImage = (key) => {
    brokenImages.value = new Set([...brokenImages.value, key]);
};

const imageSrc = (event) => {
    const key = `event-${event?.id}`;
    if (!event?.image || brokenImages.value.has(key)) {
        return '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + event.image;
};

const getData = async (page = 1) => {
    const slug = promotorSlug.value;
    if (!slug) {
        notFound.value = true;
        isLoading.value = false;
        return;
    }

    if (!isLoading.value) {
        isLoadingEvents.value = true;
    }

    first.value = (page - 1) * rowsPerPage.value;

    const params = { page, per_page: rowsPerPage.value };
    if (searchQuery.value?.trim()) {
        params.search = searchQuery.value.trim();
    }

    try {
        const response = await axios.get(`${baseURL}/promotores/${slug}`, { params });
        promotor.value = response.data.promotor;
        events.value = response.data.events || { data: [] };
        notFound.value = false;
    } catch (error) {
        if (error?.response?.status === 404) {
            notFound.value = true;
            promotor.value = null;
            events.value = { data: [] };
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar a página',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoading.value = false;
        isLoadingEvents.value = false;
    }
};

const onPage = (event) => {
    rowsPerPage.value = event.rows;
    first.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getData(page);
};

const debouncedSearch = debounce(() => {
    getData(1);
}, 400);

watch(searchQuery, () => {
    if (!isLoading.value && !notFound.value) {
        debouncedSearch();
    }
});

watch(promotorSlug, () => {
    isLoading.value = true;
    brokenImages.value = new Set();
    searchQuery.value = '';
    getData(1);
});

onMounted(() => getData(1));
</script>

<template>
    <div v-if="isLoading" class="promotor-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="14rem" class="mb-4 border-round-xl" />
        <div class="flex align-items-end gap-3 mb-5" style="margin-top: -3rem">
            <Skeleton shape="circle" size="6rem" />
            <div class="flex-1">
                <Skeleton width="40%" height="1.75rem" class="mb-2" />
                <Skeleton width="60%" height="1rem" />
            </div>
        </div>
        <div class="grid">
            <div v-for="n in 6" :key="'skel-' + n" class="col-12 md:col-6 xl:col-4">
                <Skeleton height="18rem" class="border-round-xl mb-3" />
                <Skeleton width="60%" height="1.25rem" class="mb-2" />
                <Skeleton width="40%" height="1rem" />
            </div>
        </div>
    </div>

    <div v-else-if="notFound" class="promotor-page px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <i class="pi pi-user text-4xl text-blue-500 mb-3" />
            <h3 class="text-900 mt-0 mb-2">Promotor não encontrado</h3>
            <p class="text-600 mb-3">Este link não corresponde a nenhuma página de promotor.</p>
            <a :href="getMainSiteUrl('/eventos')">
                <Button label="Ver todos os eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </a>
        </div>
    </div>

    <div v-else class="promotor-page">
        <section class="promotor-hero">
            <div
                class="promotor-hero__banner"
                :class="{ 'promotor-hero__banner--default': !promotor?.banner || brokenImages.has('banner') }"
                :style="{ backgroundImage: `url(${bannerSrc})` }"
            >
                <img
                    :src="bannerSrc"
                    alt=""
                    class="promotor-hero__banner-img"
                    @error="promotor?.banner && markBrokenImage('banner')"
                />
            </div>

            <div class="promotor-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <div class="promotor-identity">
                    <div class="promotor-avatar">
                        <img
                            v-if="avatarSrc"
                            :src="avatarSrc"
                            :alt="displayName"
                            @error="markBrokenImage('avatar')"
                        />
                        <span v-else>{{ initials }}</span>
                    </div>
                    <div class="promotor-identity__text">
                        <p class="promotor-eyebrow">Promotor</p>
                        <h1 class="promotor-title">{{ displayName }}</h1>
                        <p v-if="promotor?.company_location" class="promotor-location">
                            <i class="pi pi-map-marker mr-1" />
                            {{ promotor.company_location }}
                        </p>
                        <p v-if="promotor?.description" class="promotor-bio">{{ promotor.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-4 px-4 lg:px-8 mt-2 mx-0 lg:mx-8">
            <div class="flex flex-column lg:flex-row lg:align-items-end lg:justify-content-between gap-3 mb-4">
                <div>
                    <h2 class="text-900 font-normal mb-2">Eventos</h2>
                    <span class="text-600 text-xl">Navega e compra bilhetes deste promotor</span>
                </div>
                <IconField iconPosition="left" class="w-full md:w-18rem">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Pesquisar eventos..." class="w-full" />
                </IconField>
            </div>

            <div v-if="isLoadingEvents" class="grid">
                <div v-for="n in 3" :key="'loading-' + n" class="col-12 md:col-6 xl:col-4">
                    <Skeleton height="16rem" class="border-round-xl mb-3" />
                    <Skeleton width="70%" height="1.25rem" class="mb-2" />
                    <Skeleton width="45%" height="1rem" />
                </div>
            </div>

            <div v-else-if="hasEvents" class="grid">
                <div class="col-12 md:col-6 xl:col-4" v-for="event in eventsList" :key="event.id">
                    <router-link :to="'/eventos/' + event.slug" class="event-card">
                        <div class="event-card__media">
                            <img
                                :src="imageSrc(event)"
                                :alt="event.name"
                                class="event-card__image"
                                @error="markBrokenImage(`event-${event.id}`)"
                            />
                        </div>
                        <div class="event-card__body">
                            <div class="event-card__meta">
                                <span>{{ event.type?.name || 'Evento' }}</span>
                                <Tag :value="getValue(event.end_date)" :severity="getSeverity(event.end_date)" />
                            </div>
                            <h3 class="event-card__title">{{ event.name }}</h3>
                            <p class="event-card__location">
                                <i class="pi pi-map-marker mr-1" />
                                {{ eventLocation(event) }}
                            </p>
                            <div class="event-card__footer">
                                <div>
                                    <div class="event-card__date">{{ moment(event.start_date).format('LL') }}</div>
                                    <div class="event-card__price">{{ formatPrice(event) }}</div>
                                </div>
                                <Button icon="pi pi-eye" severity="secondary" outlined aria-label="Ver evento" />
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>

            <div v-else class="empty-block">
                <h3 class="text-900 mt-0 mb-2">Sem eventos publicados</h3>
                <p class="text-600 mb-0">
                    {{ searchQuery ? 'Nenhum evento corresponde à pesquisa.' : 'Este promotor ainda não tem eventos à venda.' }}
                </p>
            </div>

            <div v-if="showPagination && !isLoadingEvents" class="pagination-wrap mt-5">
                <Paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="events.total || 0"
                    :rowsPerPageOptions="[9, 12, 24]"
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} eventos"
                    @page="onPage"
                />
            </div>
        </section>
    </div>
</template>

<style scoped>
.promotor-hero {
    position: relative;
}

.promotor-hero__banner {
    position: relative;
    height: clamp(10rem, 28vw, 16rem);
    overflow: hidden;
    background: #000;
    background-size: cover;
    background-position: center;
}

.promotor-hero__banner--default {
    background-size: contain;
    background-repeat: no-repeat;
    background-color: #000;
}

.promotor-hero__banner-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
}

.promotor-hero__banner--default .promotor-hero__banner-img {
    object-fit: contain;
}

.promotor-hero__content {
    position: relative;
    margin-top: -3.5rem;
    padding-bottom: 1.5rem;
}

.promotor-identity {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1.25rem;
}

.promotor-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 7rem;
    height: 7rem;
    border-radius: 999px;
    overflow: hidden;
    border: 4px solid #fff;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    font-weight: 700;
    font-size: 1.75rem;
    box-shadow: 0 10px 30px rgba(15, 40, 80, 0.18);
    flex-shrink: 0;
}

.promotor-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.promotor-identity__text {
    flex: 1;
    min-width: 12rem;
    padding-bottom: 0.35rem;
}

.promotor-eyebrow {
    margin: 0 0 0.25rem;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.promotor-title {
    margin: 0 0 0.35rem;
    color: #0f172a;
    font-size: clamp(1.6rem, 3.5vw, 2.35rem);
    font-weight: 700;
    line-height: 1.15;
}

.promotor-location {
    margin: 0 0 0.65rem;
    color: #475569;
}

.promotor-bio {
    margin: 0;
    max-width: 42rem;
    color: #334155;
    line-height: 1.55;
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
    font-size: 0.95rem;
}

.event-card__title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    line-height: 1.3;
    color: #0f172a;
}

.event-card__location {
    margin: 0 0 1rem;
    color: #475569;
    font-size: 0.95rem;
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

.pagination-wrap {
    display: flex;
    justify-content: center;
}

.pagination-wrap :deep(.p-paginator) {
    background: transparent;
    border: none;
    flex-wrap: wrap;
    gap: 0.5rem;
}
</style>
