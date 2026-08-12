<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const route = useRoute();
const toast = useToast();

const isLoadingDiv = ref(true);
const isLoadingEvents = ref(false);
const notFound = ref(false);
const searchQuery = ref('');
const selectedProvince = ref(null);
const brokenImages = ref(new Set());
const rowsPerPage = ref(12);
const first = ref(0);

const retriviedData = ref({
    category: null,
    provinces: [],
    events: { data: [] }
});

const category = computed(() => retriviedData.value.category);
const eventsList = computed(() => retriviedData.value.events?.data || []);
const hasEvents = computed(() => eventsList.value.length > 0);
const hasActiveFilters = computed(() => !!(searchQuery.value?.trim() || selectedProvince.value));
const showPagination = computed(() => (retriviedData.value.events?.last_page || 0) > 1);

const categoryBackground = computed(() => {
    if (!category.value?.image || brokenImages.value.has(`category-${category.value.id}`)) {
        return null;
    }
    return storageURL + category.value.image;
});

const getValue = (eventdate) => {
    return moment().isSameOrBefore(moment(eventdate)) ? 'À venda' : 'Encerrado';
};

const getSeverity = (eventdate) => {
    return moment().isSameOrBefore(moment(eventdate)) ? 'success' : 'danger';
};

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
    if (!isLoadingDiv.value) {
        isLoadingEvents.value = true;
    }

    first.value = (page - 1) * rowsPerPage.value;

    const params = { page, per_page: rowsPerPage.value };
    if (searchQuery.value?.trim()) {
        params.search = searchQuery.value.trim();
    }
    if (selectedProvince.value) {
        params.province_id = selectedProvince.value;
    }

    try {
        const response = await axios.get(`${baseURL}/categories/${route.params.id}`, { params });
        retriviedData.value = {
            category: response.data.category || null,
            provinces: response.data.provinces || [],
            events: response.data.events || { data: [] }
        };
    } catch (error) {
        if (error?.response?.status === 404) {
            notFound.value = true;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar a categoria',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoadingDiv.value = false;
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

watch([searchQuery, selectedProvince], () => {
    if (!isLoadingDiv.value) {
        debouncedSearch();
    }
});

watch(
    () => route.params.id,
    () => {
        searchQuery.value = '';
        selectedProvince.value = null;
        notFound.value = false;
        isLoadingDiv.value = true;
        getData(1);
    }
);

const clearFilters = () => {
    searchQuery.value = '';
    selectedProvince.value = null;
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="category-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="10rem" class="mb-5 border-round-xl" />
        <div class="grid">
            <div v-for="n in 6" :key="'card-' + n" class="col-12 md:col-6 xl:col-4">
                <Skeleton height="18rem" class="border-round-xl mb-3" />
                <Skeleton width="60%" height="1.25rem" class="mb-2" />
                <Skeleton width="40%" height="1rem" />
            </div>
        </div>
    </div>

    <div v-else-if="notFound" class="category-page px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Categoria não encontrada</h2>
            <p class="text-600 mb-3">Esta categoria pode ter sido removida ou o link está incorreto.</p>
            <router-link to="/eventos">
                <Button label="Ver todos os eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </router-link>
        </div>
    </div>

    <div v-else class="category-page">
        <section class="category-hero" :style="categoryBackground ? { '--hero-image': `url('${categoryBackground}')` } : null">
            <div class="category-hero__veil" />
            <div class="category-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <router-link to="/eventos" class="category-hero__back">
                    <i class="pi pi-arrow-left mr-2" />
                    Eventos
                </router-link>
                <p class="category-hero__eyebrow">Categoria</p>
                <h1 class="category-hero__title">{{ category?.name || 'Eventos' }}</h1>
                <p class="category-hero__subtitle">Explora os eventos desta categoria em todo o país.</p>
            </div>
        </section>

        <section class="py-4 px-4 lg:px-8 mt-2 mx-0 lg:mx-8">
            <div class="flex flex-column lg:flex-row lg:align-items-end lg:justify-content-between gap-3 mb-4">
                <div>
                    <h2 class="text-900 font-normal mb-2">Em destaque</h2>
                    <span class="text-600 text-xl">Filtra por nome ou província</span>
                </div>
                <div class="category-filters">
                    <IconField iconPosition="left" class="w-full md:w-18rem">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Pesquisar eventos..." class="w-full" />
                    </IconField>
                    <Dropdown
                        v-model="selectedProvince"
                        :options="retriviedData.provinces"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Província"
                        showClear
                        class="w-full md:w-14rem"
                    />
                </div>
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
                                <span>{{ event.user?.company_name }}</span>
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
                                <div class="flex align-items-center gap-2">
                                    <Tag v-if="event.type?.name" :value="event.type.name" severity="info" />
                                    <Button icon="pi pi-eye" severity="secondary" outlined aria-label="Ver evento" />
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>

            <div v-else class="empty-block">
                <h3 class="text-900 mt-0 mb-2">Nenhum evento encontrado</h3>
                <p class="text-600 mb-3">
                    {{
                        hasActiveFilters
                            ? 'Ajusta a pesquisa ou limpa os filtros para ver mais resultados.'
                            : 'Ainda não há eventos publicados nesta categoria.'
                    }}
                </p>
                <Button
                    v-if="hasActiveFilters"
                    label="Limpar filtros"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    @click="clearFilters"
                />
                <router-link v-else to="/eventos">
                    <Button label="Ver todos os eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
                </router-link>
            </div>

            <div v-if="showPagination && !isLoadingEvents" class="pagination-wrap mt-5">
                <Paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="retriviedData.events.total || 0"
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
.category-hero {
    position: relative;
    overflow: hidden;
    background-color: #0b3d91;
    background-image: var(--hero-image, linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%));
    background-size: cover;
    background-position: center;
    animation: hero-fade 0.6s ease-out;
}

.category-hero__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(8, 28, 68, 0.4) 0%, rgba(8, 28, 68, 0.82) 100%);
}

.category-hero__content {
    position: relative;
    z-index: 1;
    padding-top: 2.75rem;
    padding-bottom: 2.5rem;
}

.category-hero__back {
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 0.85rem;
}

.category-hero__eyebrow {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: rise-in 0.6s ease-out both;
}

.category-hero__title {
    margin: 0 0 0.6rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
    animation: rise-in 0.65s ease-out 0.06s both;
}

.category-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 1.1rem;
    max-width: 36rem;
    animation: rise-in 0.65s ease-out 0.12s both;
}

.category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    max-width: 34rem;
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
