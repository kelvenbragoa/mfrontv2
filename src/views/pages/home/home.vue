<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const toast = useToast();
const isLoadingDiv = ref(true);
const isLoadingEvents = ref(false);
const searchQuery = ref('');
const selectedProvince = ref(null);
const brokenImages = ref(new Set());
const rowsPerPage = ref(9);
const first = ref(0);

const retriviedData = ref({
    categories: [],
    provinces: [],
    events: { data: [] }
});

const carouselResponsiveOptions = ref([
    { breakpoint: '1024px', numVisible: 4, numScroll: 2 },
    { breakpoint: '768px', numVisible: 3, numScroll: 2 },
    { breakpoint: '560px', numVisible: 2, numScroll: 1 }
]);

const heroEvent = computed(() => retriviedData.value.events?.data?.[0] || null);

const heroBackground = computed(() => {
    if (!heroEvent.value?.image || brokenImages.value.has(`event-${heroEvent.value.id}`)) {
        return null;
    }
    return storageURL + heroEvent.value.image;
});

const eventsList = computed(() => retriviedData.value.events?.data || []);
const hasEvents = computed(() => eventsList.value.length > 0);
const hasCategories = computed(() => (retriviedData.value.categories || []).length > 0);
const showPagination = computed(() => (retriviedData.value.events?.last_page || 0) > 1);

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

const imageSrc = (item, type = 'event') => {
    const key = `${type}-${item?.id}`;
    if (!item?.image || brokenImages.value.has(key)) {
        return '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + item.image;
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
        const response = await axios.get(`${baseURL}/homepage`, { params });
        retriviedData.value = {
            categories: response.data.categories || [],
            provinces: response.data.provinces || [],
            events: response.data.events || { data: [] }
        };
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível carregar a página',
            detail: 'Tenta novamente dentro de momentos.',
            life: 4000
        });
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

const clearFilters = () => {
    searchQuery.value = '';
    selectedProvince.value = null;
};

const scrollToEvents = () => {
    document.querySelector('#eventos-populares')?.scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="home-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="22rem" class="mb-5 border-round-xl" />
        <div class="flex gap-3 mb-5 overflow-hidden">
            <Skeleton v-for="n in 5" :key="'cat-' + n" shape="circle" size="8rem" />
        </div>
        <div class="grid">
            <div v-for="n in 6" :key="'card-' + n" class="col-12 md:col-6 xl:col-4">
                <Skeleton height="18rem" class="border-round-xl mb-3" />
                <Skeleton width="60%" height="1.25rem" class="mb-2" />
                <Skeleton width="40%" height="1rem" />
            </div>
        </div>
    </div>

    <div v-else class="home-page">
        <section class="home-hero" :style="heroBackground ? { '--hero-image': `url('${heroBackground}')` } : null">
            <div class="home-hero__veil" />
            <div class="home-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="home-hero__brand">MTICKET</p>
                <h1 class="home-hero__title">Bilhetes para o que importa</h1>
                <p class="home-hero__subtitle">Descobre shows, teatros e experiências em Moçambique — e garante o teu lugar.</p>
                <div class="home-hero__actions">
                    <Button label="Explorar eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" @click="scrollToEvents" />
                    <router-link to="/ser-promotor">
                        <Button label="Ser promotor" class="p-button-rounded p-button-outlined border-none font-medium text-white home-hero__ghost" />
                    </router-link>
                </div>
            </div>
        </section>

        <section id="categorias" class="py-4 px-4 lg:px-8 mt-4 mx-0 lg:mx-8">
            <div class="col-12 text-left mb-4 px-0">
                <h2 class="text-900 font-normal mb-2">Descubra o que fazer</h2>
                <span class="text-600 text-xl">Escolhe uma categoria e começa a explorar</span>
            </div>

            <div v-if="hasCategories">
                <Carousel :value="retriviedData.categories" :numVisible="5" :numScroll="3" :responsiveOptions="carouselResponsiveOptions">
                    <template #item="slotProps">
                        <router-link :to="'/categorias/' + slotProps.data.id" class="category-card">
                            <img
                                :src="imageSrc(slotProps.data, 'category')"
                                :alt="slotProps.data.name"
                                class="category-card__image"
                                @error="markBrokenImage(`category-${slotProps.data.id}`)"
                            />
                            <p class="category-card__name">{{ slotProps.data.name }}</p>
                        </router-link>
                    </template>
                </Carousel>
            </div>
            <div v-else class="empty-block">
                <p class="text-600 m-0">Ainda não há categorias disponíveis.</p>
            </div>
        </section>

        <section id="eventos-populares" class="py-4 px-4 lg:px-8 mt-2 mx-0 lg:mx-8">
            <div class="flex flex-column md:flex-row md:align-items-end md:justify-content-between gap-3 mb-4">
                <div>
                    <h2 class="text-900 font-normal mb-2">Eventos populares</h2>
                    <span class="text-600 text-xl">Os próximos destaques à venda</span>
                </div>
                <div class="home-filters">
                    <IconField iconPosition="left" class="w-full md:w-20rem">
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
                                :src="imageSrc(event, 'event')"
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
                <p class="text-600 mb-3">Ajusta a pesquisa ou limpa os filtros para ver mais resultados.</p>
                <Button label="Limpar filtros" class="p-button-rounded border-none font-medium text-white bg-blue-500" @click="clearFilters" />
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

        <section id="ser-promotor" class="px-4 lg:px-8 mx-0 lg:mx-8 mb-6">
            <div class="promoter-cta">
                <div>
                    <h3 class="text-900 mt-0 mb-2">Queres ser um promotor?</h3>
                    <p class="text-700 text-xl mt-0 mb-0" style="max-width: 40rem">
                        Entra com a tua conta Mticket e cria eventos com bilheteira, check-in e relatórios.
                    </p>
                </div>
                <router-link to="/ser-promotor">
                    <Button label="Seja um promotor" class="p-button-rounded border-none font-medium text-white bg-blue-500 white-space-nowrap" />
                </router-link>
            </div>
        </section>
    </div>
</template>

<style scoped>
.home-hero {
    position: relative;
    min-height: min(72vh, 34rem);
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background-color: #0b3d91;
    background-image: var(--hero-image, linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%));
    background-size: cover;
    background-position: center;
    animation: hero-fade 0.7s ease-out;
}

.home-hero__veil {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(180deg, rgba(8, 28, 68, 0.35) 0%, rgba(8, 28, 68, 0.78) 100%),
        linear-gradient(90deg, rgba(8, 28, 68, 0.55) 0%, rgba(8, 28, 68, 0.15) 70%);
}

.home-hero__content {
    position: relative;
    z-index: 1;
    width: 100%;
    padding-top: 5rem;
    padding-bottom: 3.5rem;
}

.home-hero__brand {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1;
    animation: rise-in 0.65s ease-out both;
}

.home-hero__title {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 500;
    max-width: 18ch;
    animation: rise-in 0.75s ease-out 0.08s both;
}

.home-hero__subtitle {
    margin: 0 0 1.75rem;
    color: rgba(255, 255, 255, 0.88);
    font-size: 1.125rem;
    line-height: 1.5;
    max-width: 36rem;
    animation: rise-in 0.75s ease-out 0.16s both;
}

.home-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    animation: rise-in 0.75s ease-out 0.24s both;
}

.home-hero__ghost {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.65) !important;
}

.home-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    max-width: 36rem;
}

.category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    padding: 0.75rem;
    transition: transform 0.25s ease;
}

.category-card:hover {
    transform: translateY(-4px);
}

.category-card__image {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(15, 40, 80, 0.12);
}

.category-card__name {
    margin: 0.85rem 0 0;
    text-align: center;
    color: #1f2937;
    font-weight: 600;
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

.promoter-cta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1.25rem;
    border-radius: 1.25rem;
    padding: 2rem;
    background:
        linear-gradient(0deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)),
        radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%);
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
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .home-hero {
        min-height: 24rem;
    }

    .category-card__image {
        width: 110px;
        height: 110px;
    }

    .promoter-cta {
        padding: 1.5rem;
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
