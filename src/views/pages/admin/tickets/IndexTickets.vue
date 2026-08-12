<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const retriviedData = ref({ data: [] });
const summary = ref({ total: 0, valid: 0, used: 0 });
const searchQuery = ref('');
const statusFilter = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(20);
const first = ref(0);

const statusOptions = [
    { label: 'Válidos', value: 1 },
    { label: 'Usados', value: 0 }
];

const getData = async (page = 1, { silent = false } = {}) => {
    currentPage.value = page;
    first.value = (page - 1) * rowsPerPage.value;

    if (silent) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const response = await axios.get(`${baseURL}/admin-tickets`, {
            params: {
                page,
                per_page: rowsPerPage.value,
                query: searchQuery.value || null,
                status: statusFilter.value
            }
        });

        retriviedData.value = response.data.tickets;
        summary.value = response.data.summary ?? summary.value;
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;

        if (status === 403) {
            loadError.value = 'Não tens permissão para ver os bilhetes.';
        } else if (status === 401) {
            loadError.value = 'A sessão expirou. Inicia sessão novamente.';
        } else {
            loadError.value = 'Não foi possível carregar os bilhetes. Tenta novamente.';
        }

        if (silent) {
            toast.add({ severity: 'error', summary: 'Erro', detail: loadError.value, life: 4000 });
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
watch(searchQuery, () => debouncedSearch());
watch(statusFilter, () => getData(1, { silent: true }));

const hasActiveFilters = computed(() => !!searchQuery.value || statusFilter.value !== null);

const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = null;
};

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

const ticketPrice = (row) => row.ticket?.price ?? row.sell?.price ?? 0;

const hasRows = computed(() => !!retriviedData.value.data?.length);

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="admin-tickets">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Bilhetes emitidos</h4>
                <span class="text-600">Todos os bilhetes vendidos na plataforma e o respetivo estado de entrada</span>
            </div>
            <Button
                icon="pi pi-refresh"
                label="Atualizar"
                outlined
                :loading="isRefreshing"
                @click="getData(currentPage, { silent: true })"
            />
        </div>

        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Total emitidos</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(summary.total) }}</span>
                </div>
            </div>
            <div class="col-6 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Por usar</span>
                    <span class="text-green-600 font-medium text-2xl">{{ formatNumber(summary.valid) }}</span>
                </div>
            </div>
            <div class="col-6 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Já validados</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(summary.used) }}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="filter-bar">
                <IconField iconPosition="left" class="filter-bar__search">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Procurar por nº, evento, nome, email ou telemóvel..." class="w-full" />
                </IconField>

                <Dropdown
                    v-model="statusFilter"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Todos os estados"
                    showClear
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
                    {{ (retriviedData.total || 0) === 1 ? 'bilhete encontrado' : 'bilhetes encontrados' }}
                </p>

                <DataTable
                    v-if="hasRows"
                    :value="retriviedData.data"
                    lazy
                    paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="retriviedData.total || 0"
                    :rowsPerPageOptions="[10, 20, 50]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} bilhetes"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    tableStyle="min-width: 60rem"
                    @page="onPage"
                >
                    <Column header="Nº">
                        <template #body="slotProps">
                            <span class="font-medium text-900">#{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column header="Evento">
                        <template #body="slotProps">
                            <router-link
                                v-if="slotProps.data.event"
                                :to="`/admin/eventos/${slotProps.data.event.id}`"
                                class="text-primary no-underline"
                            >
                                {{ slotProps.data.event.name }}
                            </router-link>
                            <span v-else class="text-500">Evento indisponível</span>
                        </template>
                    </Column>

                    <Column header="Bilhete">
                        <template #body="slotProps">
                            {{ slotProps.data.ticket?.name || '--' }}
                        </template>
                    </Column>

                    <Column header="Valor">
                        <template #body="slotProps">
                            {{ formatCurrency(ticketPrice(slotProps.data)) }}
                        </template>
                    </Column>

                    <Column header="Comprador">
                        <template #body="slotProps">
                            <div class="flex flex-column">
                                <span class="text-900">{{ slotProps.data.name || 'Sem nome' }}</span>
                                <span class="text-500 text-sm">{{ slotProps.data.email || slotProps.data.mobile || '--' }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Estado">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.status == 1" severity="success" value="Por usar" />
                            <Tag v-else severity="secondary" value="Validado" />
                        </template>
                    </Column>

                    <Column header="Transação">
                        <template #body="slotProps">
                            {{ slotProps.data.sell?.transaction?.reference || '--' }}
                        </template>
                    </Column>

                    <Column header="Emitido em">
                        <template #body="slotProps">
                            {{ formatDateTime(slotProps.data.created_at) }}
                        </template>
                    </Column>

                    <Column header="Ações" style="width: 6rem">
                        <template #body="slotProps">
                            <router-link :to="`/admin/tickets/${slotProps.data.id}`">
                                <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver bilhete'" />
                            </router-link>
                        </template>
                    </Column>
                </DataTable>

                <div v-else class="empty-state">
                    <i class="pi pi-ticket text-4xl text-400 mb-3" />
                    <h5 class="text-900 mb-2">Nenhum bilhete encontrado</h5>
                    <p class="text-600 mb-4">
                        {{ hasActiveFilters ? 'Nenhum bilhete corresponde aos filtros aplicados.' : 'Ainda não há bilhetes emitidos.' }}
                    </p>
                    <Button v-if="hasActiveFilters" label="Limpar filtros" icon="pi pi-times" outlined @click="clearFilters" />
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.filter-bar__search {
    flex: 1 1 20rem;
    min-width: 14rem;
}

.filter-bar__select {
    min-width: 12rem;
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
