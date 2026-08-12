<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEventDashboard } from '@/composables/useEventDashboard';

const props = defineProps({
    scope: {
        type: String,
        default: 'promotor',
        validator: (value) => ['admin', 'promotor'].includes(value)
    }
});

const router = useRouter();
const eventId = router.currentRoute.value.params.id;

const {
    basePath,
    dashboardPath,
    isLoading,
    isRefreshing,
    loadError,
    searchQuery,
    activeTab,
    brokenImage,
    loadingPdfProducts,
    loadingPdfTickets,
    eventData,
    eventImage,
    currentStatus,
    barRevenue,
    kpis,
    summaryCards,
    filteredTickets,
    filteredProducts,
    filteredInvites,
    filteredBars,
    hasActiveFilters,
    formatCurrency,
    formatNumber,
    formatDate,
    productSoldQty,
    productSoldValue,
    productInitialStock,
    barSoldQty,
    barSoldValue,
    ticketSoldQty,
    goBack,
    getData,
    clearFilters,
    downloadPDF
} = useEventDashboard({ eventId, scope: props.scope });

onMounted(() => getData());
</script>

<template>
    <div class="event-dashboard">
        <div v-if="isLoading" class="grid">
            <div class="col-12">
                <Skeleton height="7rem" class="mb-3 border-round-xl" />
            </div>
            <div v-for="n in 4" :key="`kpi-sk-${n}`" class="col-12 md:col-6 xl:col-3">
                <div class="card mb-0">
                    <Skeleton width="6rem" height="0.9rem" class="mb-3" />
                    <Skeleton width="8rem" height="1.75rem" />
                </div>
            </div>
            <div class="col-12">
                <div class="card">
                    <Skeleton width="10rem" height="1.2rem" class="mb-4" />
                    <Skeleton v-for="n in 5" :key="`row-sk-${n}`" height="2.75rem" class="mb-2" />
                </div>
            </div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Dashboard indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <div class="flex gap-2">
                <Button label="Voltar" icon="pi pi-angle-left" outlined @click="goBack" />
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>
        </div>

        <template v-else>
            <div class="card mb-4">
                <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <Button label="Voltar ao evento" icon="pi pi-angle-left" text class="p-0" @click="goBack" />
                    <div class="flex flex-wrap gap-2">
                        <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
                        <router-link :to="`${basePath}/edit`">
                            <Button label="Editar evento" icon="pi pi-pencil" outlined />
                        </router-link>
                    </div>
                </div>

                <div class="event-header">
                    <img :src="eventImage" :alt="eventData?.name" class="event-header__image" @error="brokenImage = true" />
                    <div class="event-header__content">
                        <div class="flex flex-wrap align-items-center gap-2 mb-2">
                            <Tag v-if="currentStatus" :severity="currentStatus.severity" :value="currentStatus.label" />
                            <span class="text-500">{{ eventData?.category?.name || 'Sem categoria' }}</span>
                        </div>
                        <h4 class="mt-0 mb-2 text-900">{{ eventData?.name || 'Evento' }}</h4>
                        <div class="event-meta">
                            <span><i class="pi pi-calendar mr-2" />{{ formatDate(eventData?.start_date) }}</span>
                            <span v-if="eventData?.end_date"><i class="pi pi-clock mr-2" />até {{ formatDate(eventData?.end_date) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0 h-full kpi-card">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">{{ kpi.label }}</span>
                            <span class="kpi-icon" :class="`kpi-icon--${kpi.tone}`"><i :class="kpi.icon" /></span>
                        </div>
                        <div class="text-900 font-medium text-2xl">{{ kpi.value }}</div>
                    </div>
                </div>
            </div>

            <div class="grid mt-1">
                <div v-for="card in summaryCards" :key="card.key" class="col-6 md:col-4 xl:col-3">
                    <router-link :to="card.to" class="summary-link">
                        <div class="summary-card">
                            <div class="flex justify-content-between align-items-start">
                                <div>
                                    <span class="text-500 text-sm">{{ card.label }}</span>
                                    <span class="text-900 font-medium text-xl block mt-1">{{ formatNumber(card.value) }}</span>
                                </div>
                                <span class="summary-icon" :class="`summary-icon--${card.tone}`"><i :class="card.icon" /></span>
                            </div>
                            <span class="summary-card__hint">Ver detalhes <i class="pi pi-arrow-right text-xs ml-1" /></span>
                            <span class="summary-card__bar" :class="`summary-card__bar--${card.tone}`" />
                        </div>
                    </router-link>
                </div>
            </div>

            <div class="card mt-3">
                <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                        <h5 class="m-0">Relatórios e vendas</h5>
                        <span class="text-600 text-sm">Filtra e consulta os dados do evento</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Button label="PDF bilhetes" icon="pi pi-file-pdf" outlined size="small" :loading="loadingPdfTickets" @click="downloadPDF('tickets')" />
                        <Button label="PDF produtos" icon="pi pi-file-pdf" outlined size="small" :loading="loadingPdfProducts" @click="downloadPDF('products')" />
                    </div>
                </div>

                <div class="filter-bar mb-3">
                    <IconField iconPosition="left" class="filter-bar__search">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Procurar nas tabelas..." class="w-full" />
                    </IconField>
                    <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
                </div>

                <TabView v-model:activeIndex="activeTab">
                    <TabPanel header="Bilhetes">
                        <div class="tab-toolbar">
                            <router-link :to="`${dashboardPath}/bilhetes`">
                                <Button label="Dashboard bilhetes" icon="pi pi-chart-bar" size="small" outlined />
                            </router-link>
                        </div>

                        <DataTable v-if="filteredTickets.length" :value="filteredTickets" responsiveLayout="scroll" class="p-datatable-sm" :loading="isRefreshing">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Preço" sortable>
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.price) }}</template>
                            </Column>
                            <Column field="max_qtd" header="Qtd. máxima" sortable />
                            <Column header="Vendidos" sortable>
                                <template #body="slotProps">{{ formatNumber(ticketSoldQty(slotProps.data)) }}</template>
                            </Column>
                            <Column header="Início">
                                <template #body="slotProps">{{ formatDate(slotProps.data.start_date) }}</template>
                            </Column>
                            <Column header="Fim">
                                <template #body="slotProps">{{ formatDate(slotProps.data.end_date) }}</template>
                            </Column>
                            <Column field="description" header="Descrição" />
                        </DataTable>
                        <p v-else class="tab-empty">{{ hasActiveFilters ? 'Nenhum bilhete corresponde à pesquisa.' : 'Sem bilhetes registados.' }}</p>
                    </TabPanel>

                    <TabPanel header="Produtos">
                        <div class="tab-toolbar">
                            <span class="text-600 text-sm">Receita bar: <strong>{{ formatCurrency(barRevenue) }}</strong></span>
                        </div>

                        <DataTable v-if="filteredProducts.length" :value="filteredProducts" responsiveLayout="scroll" class="p-datatable-sm" :loading="isRefreshing">
                            <Column field="name" header="Nome" sortable />
                            <Column field="barstore.name" header="Bar" sortable />
                            <Column header="Stock inicial" sortable>
                                <template #body="slotProps">{{ formatNumber(productInitialStock(slotProps.data)) }}</template>
                            </Column>
                            <Column field="qtd" header="Stock atual" sortable />
                            <Column header="Preço venda" sortable>
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.sell_price) }}</template>
                            </Column>
                            <Column header="Preço compra" sortable>
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.buy_price) }}</template>
                            </Column>
                            <Column header="Qtd. vendida" sortable>
                                <template #body="slotProps">{{ formatNumber(productSoldQty(slotProps.data)) }}</template>
                            </Column>
                            <Column header="Valor vendas" sortable>
                                <template #body="slotProps"><span class="text-900 font-medium">{{ formatCurrency(productSoldValue(slotProps.data)) }}</span></template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">{{ hasActiveFilters ? 'Nenhum produto corresponde à pesquisa.' : 'Sem produtos registados.' }}</p>
                    </TabPanel>

                    <TabPanel header="Convites">
                        <div class="tab-toolbar">
                            <router-link :to="`${dashboardPath}/convites`">
                                <Button label="Dashboard convites" icon="pi pi-chart-bar" size="small" outlined />
                            </router-link>
                        </div>

                        <DataTable v-if="filteredInvites.length" :value="filteredInvites" responsiveLayout="scroll" class="p-datatable-sm" :loading="isRefreshing">
                            <Column field="name" header="Nome" sortable />
                            <Column field="description" header="Descrição" />
                            <Column header="Convidados" sortable>
                                <template #body="slotProps">{{ formatNumber(slotProps.data.customers?.length || 0) }}</template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">{{ hasActiveFilters ? 'Nenhum convite corresponde à pesquisa.' : 'Sem convites registados.' }}</p>
                    </TabPanel>

                    <TabPanel header="Bares">
                        <DataTable v-if="filteredBars.length" :value="filteredBars" responsiveLayout="scroll" class="p-datatable-sm" :loading="isRefreshing">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Qtd. vendida" sortable>
                                <template #body="slotProps">{{ formatNumber(barSoldQty(slotProps.data)) }}</template>
                            </Column>
                            <Column header="Valor vendas" sortable>
                                <template #body="slotProps"><span class="text-900 font-medium">{{ formatCurrency(barSoldValue(slotProps.data)) }}</span></template>
                            </Column>
                            <Column header="Produtos">
                                <template #body="slotProps">{{ formatNumber(slotProps.data.products?.length || 0) }}</template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">{{ hasActiveFilters ? 'Nenhum bar corresponde à pesquisa.' : 'Sem bares registados.' }}</p>
                    </TabPanel>
                </TabView>
            </div>
        </template>
    </div>
</template>

<style scoped>
.event-header {
    display: flex;
    gap: 1.5rem;
}

.event-header__image {
    width: 10rem;
    height: 7rem;
    border-radius: 0.85rem;
    object-fit: cover;
    flex-shrink: 0;
}

.event-header__content {
    flex: 1;
    min-width: 0;
}

.event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    color: #64748b;
}

.kpi-icon,
.summary-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.65rem;
}

.kpi-icon--blue, .summary-icon--blue { background: #dbeafe; color: #2563eb; }
.kpi-icon--green, .summary-icon--green { background: #dcfce7; color: #16a34a; }
.kpi-icon--purple, .summary-icon--purple { background: #ede9fe; color: #7c3aed; }
.kpi-icon--orange, .summary-icon--orange { background: #ffedd5; color: #ea580c; }
.summary-icon--cyan { background: #cffafe; color: #0891b2; }
.summary-icon--indigo { background: #e0e7ff; color: #4f46e5; }
.summary-icon--slate { background: #e2e8f0; color: #475569; }
.summary-icon--rose { background: #ffe4e6; color: #e11d48; }

.summary-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
}

.summary-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
    padding: 1.1rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 12px;
    background: var(--surface-card);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-link:hover .summary-card {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}

.summary-card__hint {
    color: var(--primary-color);
    font-size: 0.85rem;
    font-weight: 500;
}

.summary-card__bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.summary-card__bar--blue { background: #2563eb; }
.summary-card__bar--green { background: #16a34a; }
.summary-card__bar--orange { background: #ea580c; }
.summary-card__bar--purple { background: #7c3aed; }
.summary-card__bar--cyan { background: #0891b2; }
.summary-card__bar--indigo { background: #4f46e5; }
.summary-card__bar--slate { background: #64748b; }
.summary-card__bar--rose { background: #e11d48; }

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

.tab-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.tab-empty {
    text-align: center;
    color: #64748b;
    padding: 2.5rem 1rem;
    margin: 0;
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
    .event-header {
        flex-direction: column;
    }

    .event-header__image {
        width: 100%;
        height: 10rem;
    }
}
</style>
