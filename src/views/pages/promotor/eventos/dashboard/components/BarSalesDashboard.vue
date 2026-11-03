<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBarSalesDashboard } from '@/composables/useBarSalesDashboard';

const props = defineProps({
    dashboardPath: { type: String, default: '' }
});

const eventId = useRouter().currentRoute.value.params.id;

const {
    isLoading,
    isRefreshing,
    loadError,
    data,
    searchQuery,
    barFilter,
    barmanFilter,
    methodFilter,
    loadingPdf,
    loadingExcel,
    kpis,
    methodBreakdown,
    statusBreakdown,
    barOptions,
    barmanOptions,
    methodOptions,
    filteredBars,
    filteredProducts,
    filteredBarmen,
    salesRows,
    salesTotal,
    salesLoading,
    salesPage,
    onSalesPage,
    onSalesSort,
    hasActiveFilters,
    chartDataDay,
    chartDataMonth,
    chartOptions,
    hasDailyData,
    hasMonthlyData,
    formatCurrency,
    formatNumber,
    formatDateTime,
    methodLabel,
    saleItemsLabel,
    goBack,
    getData,
    clearFilters,
    downloadPdf,
    downloadExcel
} = useBarSalesDashboard({ eventId, dashboardPath: props.dashboardPath || undefined });

onMounted(() => getData());
</script>

<template>
    <div class="bar-dashboard">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button label="Voltar ao dashboard" icon="pi pi-angle-left" text class="mb-2 p-0" @click="goBack" />
                <h4 class="m-0 text-900">Dashboard do bar</h4>
                <span class="text-600">Receita, pagamentos, produtos e desempenho dos barmans.</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
                <Button icon="pi pi-file-pdf" label="PDF produtos" outlined :loading="loadingPdf" @click="downloadPdf" />
                <Button icon="pi pi-file-excel" label="Excel vendas" outlined :loading="loadingExcel" @click="downloadExcel" />
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
                    <div class="card mb-0 h-full">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">{{ kpi.label }}</span>
                            <span class="kpi-icon" :class="`kpi-icon--${kpi.tone}`"><i :class="kpi.icon" /></span>
                        </div>
                        <div class="text-900 font-medium text-xl mb-1">{{ kpi.value }}</div>
                        <div class="text-600 text-sm">{{ kpi.detail }}</div>
                    </div>
                </div>
            </div>

            <Message v-if="data?.without_items?.orders" severity="warn" :closable="false" class="mt-3">
                {{ formatNumber(data.without_items.orders) }} vendas ({{ formatCurrency(data.without_items.value) }}) foram cobradas sem produtos registados. Entram na receita, mas não nos totais por produto.
            </Message>

            <div class="grid mt-1">
                <div class="col-12 lg:col-7">
                    <div class="card h-full mb-0">
                        <h5 class="mt-0 mb-3">Formas de pagamento</h5>
                        <div v-if="methodBreakdown.length" class="breakdown">
                            <div v-for="row in methodBreakdown" :key="row.method" class="breakdown__row">
                                <div class="flex justify-content-between align-items-baseline gap-2 mb-1">
                                    <span class="text-900 font-medium">{{ row.label }}</span>
                                    <span class="text-900 font-medium white-space-nowrap">{{ formatCurrency(row.value) }}</span>
                                </div>
                                <div class="breakdown__track"><span :style="{ width: `${row.percent}%`, background: row.color }" /></div>
                                <div class="flex justify-content-between text-500 text-sm mt-1">
                                    <span>{{ formatNumber(row.orders) }} vendas</span>
                                    <span>{{ String(row.percent).replace('.', ',') }}%</span>
                                </div>
                            </div>
                        </div>
                        <p v-else class="tab-empty">Ainda não há vendas registadas.</p>
                    </div>
                </div>
                <div class="col-12 lg:col-5">
                    <div class="card h-full mb-0">
                        <h5 class="mt-0 mb-3">Estado dos pedidos</h5>
                        <div class="breakdown">
                            <div v-for="row in statusBreakdown" :key="row.key" class="breakdown__row">
                                <div class="flex justify-content-between align-items-baseline gap-2 mb-1">
                                    <span class="text-900 font-medium">{{ row.label }}</span>
                                    <span class="text-900 font-medium">{{ formatNumber(row.orders) }}</span>
                                </div>
                                <div class="breakdown__track"><span :style="{ width: `${row.percent}%`, background: row.color }" /></div>
                                <div class="flex justify-content-between text-500 text-sm mt-1">
                                    <span>{{ row.hint }}</span>
                                    <span class="white-space-nowrap">{{ formatCurrency(row.value) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="filter-bar mb-3">
                    <IconField iconPosition="left" class="filter-bar__search">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Procurar por nº, produto ou barman..." class="w-full" />
                    </IconField>
                    <Dropdown v-model="barFilter" :options="barOptions" optionLabel="label" optionValue="value" placeholder="Todos os bares" showClear class="filter-bar__select" />
                    <Dropdown v-model="barmanFilter" :options="barmanOptions" optionLabel="label" optionValue="value" placeholder="Todos os barmans" showClear filter class="filter-bar__select" />
                    <Dropdown v-model="methodFilter" :options="methodOptions" optionLabel="label" optionValue="value" placeholder="Todos os pagamentos" showClear class="filter-bar__select" />
                    <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
                </div>

                <div v-if="filteredBars.length" class="grid">
                    <div v-for="bar in filteredBars" :key="bar.id" class="col-12 md:col-6 xl:col-4">
                        <div class="report-card">
                            <div class="flex justify-content-between align-items-baseline mb-3">
                                <h6 class="m-0 text-900">{{ bar.name }}</h6>
                                <span class="text-500 text-sm">{{ formatNumber(bar.orders) }} vendas</span>
                            </div>
                            <div class="report-grid">
                                <div><span class="report-label">Total</span><strong>{{ formatCurrency(bar.value) }}</strong><span class="text-500 text-sm">{{ formatNumber(bar.items) }} itens</span></div>
                                <div><span class="report-label">Hoje</span><strong>{{ formatCurrency(bar.value_today) }}</strong><span class="text-500 text-sm">{{ formatNumber(bar.items_today) }} itens</span></div>
                                <div><span class="report-label">Semana</span><strong>{{ formatCurrency(bar.value_week) }}</strong><span class="text-500 text-sm">{{ formatNumber(bar.items_week) }} itens</span></div>
                                <div><span class="report-label">Mês</span><strong>{{ formatCurrency(bar.value_month) }}</strong><span class="text-500 text-sm">{{ formatNumber(bar.items_month) }} itens</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-else class="tab-empty">Sem bares registados.</p>
            </div>

            <div class="grid mt-1">
                <div class="col-12 xl:col-6">
                    <div class="card h-full">
                        <h5 class="mt-0 mb-3">Receita diária (mês atual)</h5>
                        <div v-if="hasDailyData" style="height: 18rem">
                            <Chart type="bar" :data="chartDataDay" :options="chartOptions" class="h-full" />
                        </div>
                        <div v-else class="tab-empty"><p class="text-600 m-0">Sem vendas neste período.</p></div>
                    </div>
                </div>
                <div class="col-12 xl:col-6">
                    <div class="card h-full">
                        <h5 class="mt-0 mb-3">Receita mensal (ano atual)</h5>
                        <div v-if="hasMonthlyData" style="height: 18rem">
                            <Chart type="bar" :data="chartDataMonth" :options="chartOptions" class="h-full" />
                        </div>
                        <div v-else class="tab-empty"><p class="text-600 m-0">Sem vendas neste período.</p></div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <TabView>
                    <TabPanel header="Vendas">
                        <div class="flex justify-content-end mb-2">
                            <span class="text-600 text-sm">{{ formatNumber(salesTotal) }} registos</span>
                        </div>
                        <DataTable
                            v-if="salesTotal || salesLoading"
                            :value="salesRows"
                            lazy
                            paginator
                            :rows="salesPage.rows"
                            :first="salesPage.first"
                            :totalRecords="salesTotal"
                            :rowsPerPageOptions="[10, 20, 50, 100]"
                            :sortField="salesPage.sortField"
                            :sortOrder="salesPage.sortOrder"
                            responsiveLayout="scroll"
                            class="p-datatable-sm"
                            :loading="salesLoading"
                            @page="onSalesPage"
                            @sort="onSalesSort"
                        >
                            <Column field="id" header="Nº" />
                            <Column field="created_at" header="Data" sortable>
                                <template #body="slotProps"><span class="white-space-nowrap">{{ formatDateTime(slotProps.data.created_at) }}</span></template>
                            </Column>
                            <Column header="Bar">
                                <template #body="slotProps">{{ slotProps.data.barstore?.name || '--' }}</template>
                            </Column>
                            <Column header="Barman">
                                <template #body="slotProps">{{ slotProps.data.user?.name || '--' }}</template>
                            </Column>
                            <Column header="Produtos" style="min-width: 16rem">
                                <template #body="slotProps"><span class="text-700">{{ saleItemsLabel(slotProps.data) }}</span></template>
                            </Column>
                            <Column header="Pagamento">
                                <template #body="slotProps">{{ methodLabel(slotProps.data.method) }}</template>
                            </Column>
                            <Column header="Estado">
                                <template #body="slotProps">
                                    <Tag v-if="Number(slotProps.data.status) === 0" severity="success" value="Entregue" />
                                    <Tag v-else severity="warning" value="Por levantar" />
                                </template>
                            </Column>
                            <Column field="total" header="Total" sortable>
                                <template #body="slotProps"><span class="text-900 font-medium white-space-nowrap">{{ formatCurrency(slotProps.data.total) }}</span></template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">{{ hasActiveFilters ? 'Nenhuma venda corresponde aos filtros.' : 'Ainda não há vendas registadas.' }}</p>
                    </TabPanel>

                    <TabPanel header="Produtos">
                        <DataTable v-if="filteredProducts.length" :value="filteredProducts" paginator :rows="20" :rowsPerPageOptions="[20, 50, 100]" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Produto" sortable />
                            <Column field="bar" header="Bar" sortable />
                            <Column field="sell_price" header="Preço" sortable>
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.sell_price) }}</template>
                            </Column>
                            <Column field="sold_qtd" header="Qtd. vendida" sortable>
                                <template #body="slotProps">{{ formatNumber(slotProps.data.sold_qtd) }}</template>
                            </Column>
                            <Column field="stock" header="Stock atual" sortable>
                                <template #body="slotProps">{{ formatNumber(slotProps.data.stock) }}</template>
                            </Column>
                            <Column field="sold_value" header="Receita" sortable>
                                <template #body="slotProps"><span class="text-900 font-medium white-space-nowrap">{{ formatCurrency(slotProps.data.sold_value) }}</span></template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem produtos registados.</p>
                    </TabPanel>

                    <TabPanel header="Barmans">
                        <DataTable v-if="filteredBarmen.length" :value="filteredBarmen" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Barman" sortable />
                            <Column field="bar" header="Bar" sortable />
                            <Column field="orders" header="Vendas" sortable>
                                <template #body="slotProps">{{ formatNumber(slotProps.data.orders) }}</template>
                            </Column>
                            <Column field="cash" header="Dinheiro" sortable>
                                <template #body="slotProps"><span class="white-space-nowrap">{{ formatCurrency(slotProps.data.cash) }}</span></template>
                            </Column>
                            <Column field="electronic" header="Cartão / móvel" sortable>
                                <template #body="slotProps"><span class="white-space-nowrap">{{ formatCurrency(slotProps.data.electronic) }}</span></template>
                            </Column>
                            <Column field="cashless" header="Cashless" sortable>
                                <template #body="slotProps"><span class="white-space-nowrap">{{ formatCurrency(slotProps.data.cashless) }}</span></template>
                            </Column>
                            <Column field="value" header="Total" sortable>
                                <template #body="slotProps"><span class="text-900 font-medium white-space-nowrap">{{ formatCurrency(slotProps.data.value) }}</span></template>
                            </Column>
                            <Column field="pending" header="Por levantar" sortable>
                                <template #body="slotProps">{{ formatNumber(slotProps.data.pending) }}</template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem barmans registados.</p>
                    </TabPanel>
                </TabView>
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

.kpi-icon--blue { background: #dbeafe; color: #2563eb; }
.kpi-icon--green { background: #dcfce7; color: #16a34a; }
.kpi-icon--purple { background: #ede9fe; color: #7c3aed; }
.kpi-icon--orange { background: #ffedd5; color: #ea580c; }

.breakdown {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.breakdown__track {
    height: 0.5rem;
    border-radius: 999px;
    background: var(--surface-200, #e2e8f0);
    overflow: hidden;
}

.breakdown__track > span {
    display: block;
    height: 100%;
    border-radius: 999px;
}

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

@media (max-width: 767px) {
    .filter-bar__select { flex: 1 1 100%; }
}
</style>
