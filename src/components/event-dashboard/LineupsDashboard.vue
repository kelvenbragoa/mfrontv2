<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const props = defineProps({
    dashboardPath: { type: String, default: '' }
});

const router = useRouter();
const toast = useToast();
const eventId = router.currentRoute.value.params.id;
const backPath = props.dashboardPath || `/promotor/eventos/${eventId}/dashboard`;

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const lineups = ref([]);
const searchQuery = ref('');

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);
const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');
const formatTime = (value) => (value ? moment(value, 'HH:mm:ss').format('HH:mm') : '--');
const dateTime = (date, time) => `${formatDate(date)}${time ? ` · ${formatTime(time)}` : ''}`;

const goBack = () => router.push(backPath);

const getData = async ({ silent = false } = {}) => {
    if (silent) isRefreshing.value = true;
    else isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}/lineups`);
        lineups.value = response.data.lineups || [];
    } catch (error) {
        const status = error?.response?.status;
        const message =
            status === 404 ? 'Evento não encontrado.' :
            status === 403 ? 'Não tens permissão para ver este relatório.' :
            status === 401 ? 'A sessão expirou.' :
            'Não foi possível carregar o line-up.';

        if (lineups.value.length) toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
        else loadError.value = message;
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const filteredRows = computed(() => {
    const query = searchQuery.value?.trim().toLowerCase();
    if (!query) return lineups.value;

    return lineups.value.filter((row) =>
        [row.name, row.description].some((part) => String(part ?? '').toLowerCase().includes(query))
    );
});

const hasActiveFilters = computed(() => !!searchQuery.value?.trim());
const clearFilters = () => { searchQuery.value = ''; };

onMounted(() => getData());
</script>

<template>
    <div class="sub-dashboard">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button label="Voltar ao dashboard" icon="pi pi-angle-left" text class="mb-2 p-0" @click="goBack" />
                <h4 class="m-0 text-900">Dashboard de line-up</h4>
                <span class="text-600">Artistas e horários programados para o evento.</span>
            </div>
            <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
        </div>

        <div v-if="isLoading" class="grid">
            <div class="col-12 md:col-4"><div class="card mb-0"><Skeleton height="5rem" /></div></div>
            <div class="col-12"><div class="card"><Skeleton height="14rem" /></div></div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Relatório indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <div class="flex gap-2">
                <Button label="Voltar" outlined icon="pi pi-angle-left" @click="goBack" />
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>
        </div>

        <template v-else>
            <div class="grid">
                <div class="col-12 md:col-4">
                    <div class="card mb-0 h-full kpi-card">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">Artistas no line-up</span>
                            <span class="kpi-icon kpi-icon--purple"><i class="pi pi-users" /></span>
                        </div>
                        <div class="text-900 font-medium text-2xl">{{ formatNumber(lineups.length) }}</div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="filter-bar mb-3">
                    <IconField iconPosition="left" class="filter-bar__search">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Procurar artistas..." class="w-full" />
                    </IconField>
                    <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
                </div>

                <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <h5 class="m-0">Programação</h5>
                    <span class="text-600 text-sm">{{ formatNumber(filteredRows.length) }} registos</span>
                </div>

                <DataTable
                    v-if="filteredRows.length"
                    :value="filteredRows"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    :loading="isRefreshing"
                >
                    <Column field="name" header="Artista" sortable />
                    <Column field="description" header="Descrição" />
                    <Column header="Início" sortable>
                        <template #body="slotProps">{{ dateTime(slotProps.data.start_date, slotProps.data.start_time) }}</template>
                    </Column>
                    <Column header="Fim" sortable>
                        <template #body="slotProps">{{ dateTime(slotProps.data.end_date, slotProps.data.end_time) }}</template>
                    </Column>
                </DataTable>
                <p v-else class="tab-empty">
                    {{ hasActiveFilters ? 'Nenhum artista corresponde à pesquisa.' : 'Ainda não há artistas no line-up.' }}
                </p>
            </div>
        </template>
    </div>
</template>

<style scoped>
.kpi-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.65rem;
}

.kpi-icon--purple { background: #ede9fe; color: #7c3aed; }

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.filter-bar__search { flex: 1 1 18rem; min-width: 14rem; }

.tab-empty, .empty-state {
    text-align: center;
    padding: 2.5rem 1rem;
    color: #64748b;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
