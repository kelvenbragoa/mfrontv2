<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePromotorTicketSalesDashboard } from '@/composables/usePromotorTicketSalesDashboard';

const props = defineProps({
    resource: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    issuedLabel: { type: String, default: 'Vendas emitidas' },
    showPdf: { type: Boolean, default: false },
    dashboardPath: { type: String, default: '' }
});

const router = useRouter();
const eventId = router.currentRoute.value.params.id;

const {
    isLoading,
    isRefreshing,
    loadError,
    searchQuery,
    ticketFilter,
    loadingPdf,
    kpis,
    ticketOptions,
    filteredReports,
    filteredIssued,
    hasActiveFilters,
    chartDataDay,
    chartDataMonth,
    chartOptions,
    hasChartData,
    formatCurrency,
    formatNumber,
    formatDateTime,
    customerLabel,
    goBack,
    getData,
    clearFilters,
    downloadPdf
} = usePromotorTicketSalesDashboard({
    eventId,
    resource: props.resource,
    title: props.title,
    issuedLabel: props.issuedLabel,
    dashboardPath: props.dashboardPath || undefined
});

const detailVisible = ref(false);
const selectedSale = ref(null);

const openSaleDetail = (sale) => {
    selectedSale.value = sale;
    detailVisible.value = true;
};

const closeSaleDetail = () => {
    detailVisible.value = false;
    selectedSale.value = null;
};

const saleDetails = computed(() => selectedSale.value?.selldetails || selectedSale.value?.sell_details || []);

const fieldLabelMap = computed(() => {
    const fields = selectedSale.value?.ticket?.form_fields || selectedSale.value?.ticket?.formFields || [];
    const map = {};
    fields.forEach((field) => {
        map[field.field_key] = field.label || field.field_key;
    });
    return map;
});

const hasAnyAnswers = (sale) => {
    const details = sale?.selldetails || sale?.sell_details || [];
    return details.some((detail) => detail.form_answers && Object.keys(detail.form_answers).length > 0);
};

const formatAnswerValue = (value) => {
    if (value === true || value === 1 || value === '1') return 'Sim';
    if (value === false || value === 0 || value === '0') return 'Não';
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
};

const answerEntries = (detail) => {
    const answers = detail?.form_answers;
    if (!answers || typeof answers !== 'object') return [];
    return Object.entries(answers).map(([key, value]) => ({
        key,
        label: fieldLabelMap.value[key] || key,
        value: formatAnswerValue(value)
    }));
};

onMounted(() => getData());
</script>

<template>
    <div class="sales-dashboard">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button label="Voltar ao dashboard" icon="pi pi-angle-left" text class="mb-2 p-0" @click="goBack" />
                <h4 class="m-0 text-900">{{ title }}</h4>
                <span class="text-600">{{ subtitle || 'Acompanha vendas, gráficos e emissões do evento.' }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
                <Button
                    v-if="showPdf"
                    icon="pi pi-file-pdf"
                    label="PDF"
                    outlined
                    :loading="loadingPdf"
                    @click="downloadPdf"
                />
            </div>
        </div>

        <div v-if="isLoading" class="grid">
            <div v-for="n in 4" :key="`sk-${n}`" class="col-12 md:col-6 xl:col-3">
                <div class="card mb-0"><Skeleton height="5rem" /></div>
            </div>
            <div class="col-12"><div class="card"><Skeleton height="16rem" /></div></div>
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
                <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0 h-full kpi-card">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">{{ kpi.label }}</span>
                            <span class="kpi-icon" :class="`kpi-icon--${kpi.tone}`"><i :class="kpi.icon" /></span>
                        </div>
                        <div class="text-900 font-medium text-xl mb-1">{{ kpi.qty }}</div>
                        <div class="text-600 text-sm">{{ kpi.value }}</div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="filter-bar mb-3">
                    <IconField iconPosition="left" class="filter-bar__search">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Procurar vendas..." class="w-full" />
                    </IconField>
                    <Dropdown
                        v-model="ticketFilter"
                        :options="ticketOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Todos os tipos"
                        showClear
                        class="filter-bar__select"
                    />
                    <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
                </div>

                <div v-if="filteredReports.length" class="grid mb-3">
                    <div v-for="report in filteredReports" :key="report.name" class="col-12 md:col-6 xl:col-4">
                        <div class="report-card">
                            <h6 class="mt-0 mb-3 text-900">{{ report.name }}</h6>
                            <div class="report-grid">
                                <div><span class="report-label">Total</span><strong>{{ formatNumber(report.total) }}</strong><span class="text-500 text-sm">{{ formatCurrency(report.value) }}</span></div>
                                <div><span class="report-label">Hoje</span><strong>{{ formatNumber(report.total_today) }}</strong><span class="text-500 text-sm">{{ formatCurrency(report.value_today) }}</span></div>
                                <div><span class="report-label">Semana</span><strong>{{ formatNumber(report.total_week) }}</strong><span class="text-500 text-sm">{{ formatCurrency(report.value_week) }}</span></div>
                                <div><span class="report-label">Mês</span><strong>{{ formatNumber(report.total_month) }}</strong><span class="text-500 text-sm">{{ formatCurrency(report.value_month) }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-else class="tab-empty">Sem tipos registados para filtrar.</p>
            </div>

            <div class="grid mt-1">
                <div class="col-12 xl:col-6">
                    <div class="card h-full">
                        <h5 class="mt-0 mb-3">Vendas diárias (mês atual)</h5>
                        <div v-if="hasChartData" style="height: 18rem">
                            <Chart type="bar" :data="chartDataDay" :options="chartOptions" class="h-full" />
                        </div>
                        <div v-else class="tab-empty"><p class="text-600 m-0">Sem vendas neste período.</p></div>
                    </div>
                </div>
                <div class="col-12 xl:col-6">
                    <div class="card h-full">
                        <h5 class="mt-0 mb-3">Vendas mensais (ano atual)</h5>
                        <div v-if="hasChartData" style="height: 18rem">
                            <Chart type="bar" :data="chartDataMonth" :options="chartOptions" class="h-full" />
                        </div>
                        <div v-else class="tab-empty"><p class="text-600 m-0">Sem vendas neste período.</p></div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <h5 class="m-0">{{ issuedLabel }}</h5>
                    <span class="text-600 text-sm">{{ formatNumber(filteredIssued.length) }} registos</span>
                </div>

                <DataTable
                    v-if="filteredIssued.length"
                    :value="filteredIssued"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    :loading="isRefreshing"
                >
                    <Column header="Tipo">
                        <template #body="slotProps">{{ slotProps.data.ticket?.name || '--' }}</template>
                    </Column>
                    <Column field="qty" header="Qtd" sortable />
                    <Column header="Total" sortable>
                        <template #body="slotProps">
                            <span class="text-900 font-medium">{{ formatCurrency(slotProps.data.total) }}</span>
                        </template>
                    </Column>
                    <Column header="Cliente">
                        <template #body="slotProps">{{ customerLabel(slotProps.data) }}</template>
                    </Column>
                    <Column header="Data" sortable>
                        <template #body="slotProps">{{ formatDateTime(slotProps.data.created_at) }}</template>
                    </Column>
                    <Column header="Formulário" style="width: 8rem">
                        <template #body="slotProps">
                            <Button
                                v-if="hasAnyAnswers(slotProps.data)"
                                label="Ver"
                                icon="pi pi-eye"
                                size="small"
                                text
                                @click="openSaleDetail(slotProps.data)"
                            />
                            <span v-else class="text-500 text-sm">—</span>
                        </template>
                    </Column>
                </DataTable>
                <p v-else class="tab-empty">
                    {{ hasActiveFilters ? 'Nenhuma venda corresponde aos filtros.' : 'Ainda não há vendas registadas.' }}
                </p>
            </div>
        </template>

        <Dialog
            v-model:visible="detailVisible"
            modal
            header="Respostas do formulário"
            :style="{ width: 'min(640px, 95vw)' }"
            @hide="closeSaleDetail"
        >
            <div v-if="selectedSale" class="sale-detail">
                <div class="sale-detail__meta mb-3">
                    <p class="mb-1"><strong>Bilhete:</strong> {{ selectedSale.ticket?.name || '—' }}</p>
                    <p class="mb-1"><strong>Cliente:</strong> {{ customerLabel(selectedSale) }}</p>
                    <p class="mb-1"><strong>Email:</strong> {{ selectedSale.email || '—' }}</p>
                    <p class="mb-1"><strong>Telemóvel:</strong> {{ selectedSale.mobile || '—' }}</p>
                    <p class="mb-0"><strong>Data:</strong> {{ formatDateTime(selectedSale.created_at) }}</p>
                </div>

                <div v-if="saleDetails.length" class="participant-list">
                    <div
                        v-for="(detail, index) in saleDetails"
                        :key="detail.id || index"
                        class="participant-block"
                    >
                        <h6 class="mt-0 mb-2">Participante {{ index + 1 }}</h6>
                        <div v-if="answerEntries(detail).length" class="answer-grid">
                            <div v-for="entry in answerEntries(detail)" :key="entry.key" class="answer-row">
                                <span class="answer-label">{{ entry.label }}</span>
                                <strong class="answer-value">{{ entry.value }}</strong>
                            </div>
                        </div>
                        <p v-else class="text-500 m-0 text-sm">Sem respostas para este bilhete.</p>
                    </div>
                </div>
                <p v-else class="text-500 m-0">Não há detalhes de bilhetes nesta venda.</p>
            </div>

            <template #footer>
                <Button label="Fechar" @click="closeSaleDetail" />
            </template>
        </Dialog>
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

.kpi-icon--blue { background: #dbeafe; color: #2563eb; }
.kpi-icon--green { background: #dcfce7; color: #16a34a; }
.kpi-icon--purple { background: #ede9fe; color: #7c3aed; }
.kpi-icon--orange { background: #ffedd5; color: #ea580c; }

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.filter-bar__search { flex: 1 1 18rem; min-width: 14rem; }
.filter-bar__select { min-width: 12rem; }

.report-card {
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    height: 100%;
    background: var(--surface-50, #f8fafc);
}

.report-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.report-grid > div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.report-label {
    color: #64748b;
    font-size: 0.8rem;
}

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

.sale-detail__meta {
    background: var(--surface-50, #f8fafc);
    border-radius: 10px;
    padding: 0.85rem 1rem;
}

.participant-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.participant-block {
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    padding: 0.85rem 1rem;
}

.answer-grid {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.answer-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
}

.answer-label {
    color: #64748b;
}

.answer-value {
    text-align: right;
    color: #0f172a;
    white-space: pre-wrap;
}

@media (max-width: 767px) {
    .filter-bar__select { flex: 1 1 100%; }
}
</style>
