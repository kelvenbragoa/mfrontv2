<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const retriviedData = ref({ data: [] });
const provinces = ref([]);
const statuses = ref([]);
const summary = ref({ total: 0, approved: 0, pending: 0, review: 0, canceled: 0 });
const brokenImages = ref(new Set());

const searchQuery = ref('');
const statusFilter = ref(null);
const provinceFilter = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(20);
const first = ref(0);

const displayConfirmation = ref(false);
const loadingButtonDelete = ref(false);
const dataIdBeingDeleted = ref(null);

const statusMeta = {
    1: { label: 'Cancelado', severity: 'danger' },
    2: { label: 'Aprovado', severity: 'success' },
    3: { label: 'Pendente', severity: 'warning' },
    4: { label: 'Em revisão', severity: 'info' }
};

const getData = async (page = 1, { silent = false } = {}) => {
    currentPage.value = page;
    first.value = (page - 1) * rowsPerPage.value;

    if (silent) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const response = await axios.get(`${baseURL}/promotor-eventos`, {
            params: {
                page,
                per_page: rowsPerPage.value,
                query: searchQuery.value?.trim() || null,
                status_id: statusFilter.value,
                province_id: provinceFilter.value
            }
        });

        retriviedData.value = response.data.event || { data: [] };
        provinces.value = response.data.provinces ?? [];
        statuses.value = response.data.statuses ?? [];
        summary.value = response.data.summary ?? summary.value;
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;

        if (status === 403) {
            loadError.value = 'Não tens permissão para gerir eventos.';
        } else if (status === 401) {
            loadError.value = 'A sessão expirou. Inicia sessão novamente.';
        } else {
            loadError.value = 'Não foi possível carregar os eventos. Tenta novamente.';
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const onPage = (event) => {
    rowsPerPage.value = event.rows;
    first.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getData(page, { silent: true });
};

const debouncedSearch = debounce(() => getData(1, { silent: true }), 350);

watch(searchQuery, () => {
    if (!isLoading.value) debouncedSearch();
});
watch([statusFilter, provinceFilter], () => {
    if (!isLoading.value) getData(1, { silent: true });
});

const hasActiveFilters = computed(
    () => !!searchQuery.value?.trim() || statusFilter.value !== null || provinceFilter.value !== null
);

const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = null;
    provinceFilter.value = null;
};

const filterByStatus = (statusId) => {
    statusFilter.value = statusFilter.value === statusId ? null : statusId;
};

const summaryCards = computed(() => [
    { key: 'total', label: 'Total', value: summary.value.total, statusId: null, tone: 'neutral' },
    { key: 'approved', label: 'Aprovados', value: summary.value.approved, statusId: 2, tone: 'green' },
    { key: 'pending', label: 'Pendentes', value: summary.value.pending, statusId: 3, tone: 'orange' },
    { key: 'canceled', label: 'Cancelados', value: summary.value.canceled, statusId: 1, tone: 'red' }
]);

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');

const eventDates = (event) => {
    const start = formatDate(event.start_date);
    if (!event.end_date || event.end_date === event.start_date) return start;
    return `${start} - ${formatDate(event.end_date)}`;
};

const eventLocation = (event) => [event.city?.name, event.province?.name].filter(Boolean).join(', ') || event.address || '--';

const imageSrc = (event) => {
    if (!event.image || brokenImages.value.has(event.id)) return '/demo/images/mticket.jpg';
    return storageURL + event.image;
};

const markBrokenImage = (id) => {
    brokenImages.value = new Set(brokenImages.value).add(id);
};

const canDelete = (event) => [3, 4].includes(Number(event.status_id));

const closeConfirmation = () => {
    displayConfirmation.value = false;
    dataIdBeingDeleted.value = null;
};

const confirmDeletion = (id) => {
    dataIdBeingDeleted.value = id;
    displayConfirmation.value = true;
};

const deleteData = async () => {
    loadingButtonDelete.value = true;

    try {
        await axios.delete(`${baseURL}/promotor-eventos/${dataIdBeingDeleted.value}`);
        closeConfirmation();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Evento eliminado.', life: 3000 });
        await getData(currentPage.value, { silent: true });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível eliminar',
            detail: error?.response?.data?.message || 'Tenta novamente.',
            life: 4000
        });
    } finally {
        loadingButtonDelete.value = false;
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="promotor-events">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Os meus eventos</h4>
                <span class="text-600">Cria, acompanha e gere os teus eventos</span>
            </div>
            <div class="flex align-items-center gap-2">
                <Button
                    icon="pi pi-refresh"
                    label="Atualizar"
                    outlined
                    :loading="isRefreshing"
                    @click="getData(currentPage, { silent: true })"
                />
                <router-link to="/promotor/eventos/create">
                    <Button icon="pi pi-plus" label="Criar evento" />
                </router-link>
            </div>
        </div>

        <div class="grid">
            <div v-for="card in summaryCards" :key="card.key" class="col-6 xl:col-3">
                <button
                    type="button"
                    class="summary-card"
                    :class="{ 'summary-card--active': statusFilter === card.statusId && card.statusId !== null }"
                    @click="card.statusId === null ? clearFilters() : filterByStatus(card.statusId)"
                >
                    <span class="text-500 text-sm">{{ card.label }}</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(card.value) }}</span>
                    <span class="summary-card__bar" :class="`summary-card__bar--${card.tone}`" />
                </button>
            </div>
        </div>

        <div class="card">
            <div class="filter-bar">
                <IconField iconPosition="left" class="filter-bar__search">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Procurar por nome ou endereço..." class="w-full" />
                </IconField>

                <Dropdown
                    v-model="statusFilter"
                    :options="statuses"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Todos os estados"
                    showClear
                    class="filter-bar__select"
                />

                <Dropdown
                    v-model="provinceFilter"
                    :options="provinces"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Todas as províncias"
                    showClear
                    filter
                    class="filter-bar__select"
                />

                <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
            </div>

            <div v-if="isLoading" class="mt-4">
                <Skeleton v-for="n in 6" :key="`row-${n}`" height="3.5rem" class="mb-2" />
            </div>

            <div v-else-if="loadError" class="empty-state">
                <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
                <h5 class="text-900 mb-2">Não foi possível carregar</h5>
                <p class="text-600 mb-4">{{ loadError }}</p>
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>

            <template v-else>
                <p class="text-600 mt-3 mb-3">
                    {{ formatNumber(retriviedData.total || 0) }}
                    {{ (retriviedData.total || 0) === 1 ? 'evento encontrado' : 'eventos encontrados' }}
                </p>

                <DataTable
                    v-if="retriviedData.data && retriviedData.data.length"
                    :value="retriviedData.data"
                    lazy
                    paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="retriviedData.total || 0"
                    :rowsPerPageOptions="[10, 20, 50]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} eventos"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    tableStyle="min-width: 62rem"
                    :loading="isRefreshing"
                    @page="onPage"
                >
                    <Column header="Evento" style="min-width: 18rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-3">
                                <img
                                    :src="imageSrc(slotProps.data)"
                                    :alt="slotProps.data.name"
                                    class="event-thumb"
                                    @error="markBrokenImage(slotProps.data.id)"
                                />
                                <div class="flex flex-column" style="min-width: 0">
                                    <router-link :to="`/promotor/eventos/${slotProps.data.id}`" class="event-name">
                                        {{ slotProps.data.name }}
                                    </router-link>
                                    <span class="text-500 text-sm">
                                        {{ slotProps.data.category?.name || 'Sem categoria' }}
                                        <template v-if="slotProps.data.type?.name"> · {{ slotProps.data.type.name }}</template>
                                    </span>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column header="Local">
                        <template #body="slotProps">
                            {{ eventLocation(slotProps.data) }}
                        </template>
                    </Column>

                    <Column header="Datas">
                        <template #body="slotProps">
                            {{ eventDates(slotProps.data) }}
                        </template>
                    </Column>

                    <Column header="Bilhetes">
                        <template #body="slotProps">
                            {{ formatNumber(slotProps.data.tickets_sold) }}
                        </template>
                    </Column>

                    <Column header="Receita">
                        <template #body="slotProps">
                            <span class="text-900 font-medium">{{ formatCurrency(slotProps.data.revenue) }}</span>
                        </template>
                    </Column>

                    <Column header="Estado">
                        <template #body="slotProps">
                            <Tag
                                :severity="statusMeta[slotProps.data.status_id]?.severity ?? 'info'"
                                :value="slotProps.data.status?.name || statusMeta[slotProps.data.status_id]?.label || 'Sem estado'"
                            />
                        </template>
                    </Column>

                    <Column header="Ações" style="width: 12rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center gap-1">
                                <router-link :to="`/promotor/eventos/${slotProps.data.id}`">
                                    <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver detalhes'" />
                                </router-link>
                                <router-link :to="`/promotor/eventos/${slotProps.data.id}/edit`">
                                    <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                </router-link>
                                <router-link :to="`/promotor/eventos/${slotProps.data.id}/dashboard`">
                                    <Button icon="pi pi-chart-bar" text rounded severity="secondary" v-tooltip.top="'Dashboard'" />
                                </router-link>
                                <Button
                                    v-if="canDelete(slotProps.data)"
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    severity="danger"
                                    v-tooltip.top="'Eliminar'"
                                    @click="confirmDeletion(slotProps.data.id)"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <div v-else class="empty-state">
                    <i class="pi pi-inbox text-4xl text-400 mb-3" />
                    <h5 class="text-900 mb-2">Nenhum evento encontrado</h5>
                    <p class="text-600 mb-4">
                        {{
                            hasActiveFilters
                                ? 'Nenhum evento corresponde aos filtros aplicados.'
                                : 'Ainda não criaste nenhum evento.'
                        }}
                    </p>
                    <Button
                        v-if="hasActiveFilters"
                        label="Limpar filtros"
                        icon="pi pi-times"
                        outlined
                        @click="clearFilters"
                    />
                    <router-link v-else to="/promotor/eventos/create">
                        <Button label="Criar primeiro evento" icon="pi pi-plus" />
                    </router-link>
                </div>
            </template>
        </div>

        <Dialog
            v-model:visible="displayConfirmation"
            header="Confirmar eliminação"
            :style="{ width: '28rem' }"
            :modal="true"
            :draggable="false"
        >
            <div class="flex align-items-start gap-3">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mt-1" />
                <span class="line-height-3">Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.</span>
            </div>
            <template #footer>
                <Button label="Voltar" text @click="closeConfirmation" :disabled="loadingButtonDelete" />
                <Button label="Eliminar" severity="danger" :loading="loadingButtonDelete" @click="deleteData" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.summary-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    width: 100%;
    padding: 1.1rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 12px;
    background: var(--surface-card);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
}

.summary-card--active {
    border-color: var(--primary-color);
}

.summary-card__bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.summary-card__bar--neutral {
    background: #94a3b8;
}

.summary-card__bar--green {
    background: #16a34a;
}

.summary-card__bar--orange {
    background: #ea580c;
}

.summary-card__bar--red {
    background: #dc2626;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.filter-bar__search {
    flex: 1 1 18rem;
    min-width: 14rem;
}

.filter-bar__select {
    min-width: 12rem;
}

.event-thumb {
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    object-fit: cover;
    flex-shrink: 0;
}

.event-name {
    color: var(--text-color);
    font-weight: 600;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.event-name:hover {
    color: var(--primary-color);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

@media (max-width: 767px) {
    .filter-bar__select {
        flex: 1 1 100%;
    }
}
</style>
