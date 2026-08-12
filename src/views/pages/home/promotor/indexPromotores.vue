<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { debounce } from 'lodash';

const toast = useToast();
const isLoading = ref(true);
const isLoadingList = ref(false);
const searchQuery = ref('');
const brokenImages = ref(new Set());
const rowsPerPage = ref(12);
const first = ref(0);
const promotores = ref({ data: [] });

const list = computed(() => promotores.value?.data || []);
const hasItems = computed(() => list.value.length > 0);
const showPagination = computed(() => (promotores.value?.last_page || 0) > 1);
const hasActiveFilters = computed(() => !!searchQuery.value?.trim());

const displayName = (item) => item.company_name || item.name || 'Promotor';

const initials = (item) => {
    const name = displayName(item).trim();
    if (!name) return 'P';
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
};

const markBrokenImage = (key) => {
    brokenImages.value = new Set([...brokenImages.value, key]);
};

const avatarSrc = (item) => {
    const key = `avatar-${item.id}`;
    if (!item?.image || brokenImages.value.has(key)) return null;
    return storageURL + item.image;
};

const DEFAULT_BANNER = '/demo/images/logo2.png';

const bannerSrc = (item) => {
    const key = `banner-${item.id}`;
    if (!item?.banner || brokenImages.value.has(key)) return DEFAULT_BANNER;
    return storageURL + item.banner;
};

const isDefaultBanner = (item) => {
    const key = `banner-${item.id}`;
    return !item?.banner || brokenImages.value.has(key);
};

const getData = async (page = 1) => {
    if (!isLoading.value) {
        isLoadingList.value = true;
    }

    first.value = (page - 1) * rowsPerPage.value;

    const params = { page, per_page: rowsPerPage.value };
    if (searchQuery.value?.trim()) {
        params.search = searchQuery.value.trim();
    }

    try {
        const response = await axios.get(`${baseURL}/promotores`, { params });
        promotores.value = response.data.promotores || { data: [] };
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível carregar os promotores',
            detail: 'Tenta novamente dentro de momentos.',
            life: 4000
        });
    } finally {
        isLoading.value = false;
        isLoadingList.value = false;
    }
};

const onPage = (event) => {
    rowsPerPage.value = event.rows;
    first.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getData(page);
};

const debouncedSearch = debounce(() => getData(1), 400);

watch(searchQuery, () => {
    if (!isLoading.value) debouncedSearch();
});

const clearFilters = () => {
    searchQuery.value = '';
};

onMounted(() => getData());
</script>

<template>
    <div v-if="isLoading" class="promotores-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="10rem" class="mb-5 border-round-xl" />
        <div class="grid">
            <div v-for="n in 6" :key="'skel-' + n" class="col-12 md:col-6 xl:col-4">
                <Skeleton height="14rem" class="border-round-xl" />
            </div>
        </div>
    </div>

    <div v-else class="promotores-page">
        <section class="promotores-hero">
            <div class="promotores-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="promotores-hero__eyebrow">MTICKET</p>
                <h1 class="promotores-hero__title">Promotores</h1>
                <p class="promotores-hero__subtitle">Descobre organizadores e explora os seus eventos.</p>
            </div>
        </section>

        <section class="py-4 px-4 lg:px-8 mt-2 mx-0 lg:mx-8">
            <div class="flex flex-column lg:flex-row lg:align-items-end lg:justify-content-between gap-3 mb-4">
                <div>
                    <h2 class="text-900 font-normal mb-2">Todos os promotores</h2>
                    <span class="text-600 text-xl">Pesquisa por nome ou localização</span>
                </div>
                <IconField iconPosition="left" class="w-full md:w-18rem">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Pesquisar promotores..." class="w-full" />
                </IconField>
            </div>

            <div v-if="isLoadingList" class="grid">
                <div v-for="n in 3" :key="'loading-' + n" class="col-12 md:col-6 xl:col-4">
                    <Skeleton height="14rem" class="border-round-xl" />
                </div>
            </div>

            <div v-else-if="hasItems" class="grid">
                <div v-for="item in list" :key="item.id" class="col-12 md:col-6 xl:col-4">
                    <router-link :to="`/p/${item.slug}`" class="promotor-card">
                        <div
                            class="promotor-card__banner"
                            :class="{ 'promotor-card__banner--default': isDefaultBanner(item) }"
                            :style="{ backgroundImage: `url(${bannerSrc(item)})` }"
                        >
                            <img
                                :src="bannerSrc(item)"
                                alt=""
                                class="promotor-card__banner-img"
                                @error="item?.banner && markBrokenImage(`banner-${item.id}`)"
                            />
                        </div>
                        <div class="promotor-card__body">
                            <div class="promotor-card__avatar">
                                <img
                                    v-if="avatarSrc(item)"
                                    :src="avatarSrc(item)"
                                    :alt="displayName(item)"
                                    @error="markBrokenImage(`avatar-${item.id}`)"
                                />
                                <span v-else>{{ initials(item) }}</span>
                            </div>
                            <div class="promotor-card__info">
                                <h3 class="promotor-card__title">{{ displayName(item) }}</h3>
                                <p v-if="item.company_location" class="promotor-card__location">
                                    <i class="pi pi-map-marker mr-1" />
                                    {{ item.company_location }}
                                </p>
                                <p class="promotor-card__meta">
                                    {{ item.events_count }} {{ item.events_count === 1 ? 'evento' : 'eventos' }}
                                </p>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>

            <div v-else class="empty-block">
                <h3 class="text-900 mt-0 mb-2">Nenhum promotor encontrado</h3>
                <p class="text-600 mb-3">
                    {{ hasActiveFilters ? 'Ajusta a pesquisa para ver mais resultados.' : 'Ainda não há promotores com eventos publicados.' }}
                </p>
                <Button
                    v-if="hasActiveFilters"
                    label="Limpar pesquisa"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    @click="clearFilters"
                />
            </div>

            <div v-if="showPagination && !isLoadingList" class="pagination-wrap mt-5">
                <Paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="promotores.total || 0"
                    :rowsPerPageOptions="[9, 12, 24]"
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} promotores"
                    @page="onPage"
                />
            </div>
        </section>
    </div>
</template>

<style scoped>
.promotores-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
}

.promotores-hero__content {
    padding-top: 2.75rem;
    padding-bottom: 2.5rem;
}

.promotores-hero__eyebrow {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.promotores-hero__title {
    margin: 0 0 0.6rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
}

.promotores-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 1.1rem;
    max-width: 36rem;
}

.promotor-card {
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

.promotor-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(15, 40, 80, 0.1);
}

.promotor-card__banner {
    height: 6.5rem;
    background-size: cover;
    background-position: center;
    background-color: #000;
    position: relative;
}

.promotor-card__banner--default {
    background-size: contain;
    background-repeat: no-repeat;
}

.promotor-card__banner-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
}

.promotor-card__body {
    display: flex;
    gap: 0.9rem;
    padding: 0 1rem 1.15rem;
    margin-top: -1.75rem;
    position: relative;
}

.promotor-card__avatar {
    width: 4.25rem;
    height: 4.25rem;
    border-radius: 999px;
    overflow: hidden;
    border: 3px solid #fff;
    background: #1d4ed8;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 8px 18px rgba(15, 40, 80, 0.15);
}

.promotor-card__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.promotor-card__info {
    padding-top: 2rem;
    min-width: 0;
}

.promotor-card__title {
    margin: 0 0 0.35rem;
    font-size: 1.15rem;
    color: #0f172a;
    line-height: 1.25;
}

.promotor-card__location,
.promotor-card__meta {
    margin: 0;
    color: #64748b;
    font-size: 0.92rem;
}

.promotor-card__location {
    margin-bottom: 0.25rem;
}

.promotor-card__meta {
    color: #2563eb;
    font-weight: 600;
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
