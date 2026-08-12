<script setup>
import { computed, onMounted, ref } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const dashboard = ref(null);
const selectedRange = ref(30);
const brokenImages = ref(new Set());

const rangeOptions = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '90 dias', value: 90 },
    { label: '12 meses', value: 365 }
];

const statusMeta = {
    1: { label: 'Cancelado', severity: 'danger' },
    2: { label: 'Aprovado', severity: 'success' },
    3: { label: 'Pendente', severity: 'warning' },
    4: { label: 'Em revisão', severity: 'info' }
};

const getData = async ({ silent = false } = {}) => {
    if (silent) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-dashboard`, {
            params: { range: selectedRange.value }
        });
        dashboard.value = response.data;
    } catch (error) {
        const status = error?.response?.status;
        let message;

        if (status === 401) {
            message = 'A sessão expirou. Inicia sessão novamente.';
        } else if (status === 403) {
            message = 'Não tens permissão para ver este painel.';
        } else {
            message = 'Não foi possível carregar o painel. Verifica a ligação e tenta novamente.';
        }

        if (dashboard.value) {
            toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
        } else {
            loadError.value = message;
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const changeRange = (value) => {
    if (selectedRange.value === value) return;
    selectedRange.value = value;
    getData({ silent: true });
};

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

const imageSrc = (image, key) => {
    if (!image || brokenImages.value.has(key)) return '/demo/images/mticket.jpg';
    return storageURL + image;
};

const markBrokenImage = (key) => {
    brokenImages.value = new Set(brokenImages.value).add(key);
};

const rangeLabel = computed(() => rangeOptions.find((option) => option.value === selectedRange.value)?.label ?? '');

const kpis = computed(() => {
    const data = dashboard.value?.kpis;
    if (!data) return [];

    return [
        {
            key: 'revenue',
            label: 'Receita',
            value: formatCurrency(data.revenue.value),
            change: data.revenue.change,
            icon: 'pi pi-wallet',
            tone: 'blue'
        },
        {
            key: 'tickets',
            label: 'Bilhetes vendidos',
            value: formatNumber(data.tickets.value),
            change: data.tickets.change,
            icon: 'pi pi-ticket',
            tone: 'green'
        },
        {
            key: 'orders',
            label: 'Encomendas',
            value: formatNumber(data.orders.value),
            change: data.orders.change,
            icon: 'pi pi-shopping-bag',
            tone: 'purple'
        },
        {
            key: 'active_events',
            label: 'Eventos ativos',
            value: formatNumber(data.active_events.value),
            change: data.active_events.change,
            icon: 'pi pi-calendar',
            tone: 'orange'
        }
    ];
});

const changeInfo = (change) => {
    if (change === null || change === undefined) {
        return { text: 'Sem base de comparação', icon: 'pi pi-minus', tone: 'neutral' };
    }
    if (change > 0) {
        return { text: `+${change}%`, icon: 'pi pi-arrow-up-right', tone: 'up' };
    }
    if (change < 0) {
        return { text: `${change}%`, icon: 'pi pi-arrow-down-right', tone: 'down' };
    }
    return { text: '0%', icon: 'pi pi-minus', tone: 'neutral' };
};

const chartData = computed(() => {
    const chart = dashboard.value?.chart;
    if (!chart) return null;

    return {
        labels: chart.labels,
        datasets: [
            {
                type: 'bar',
                label: 'Bilhetes',
                data: chart.tickets,
                backgroundColor: 'rgba(148, 163, 184, 0.35)',
                borderRadius: 4,
                yAxisID: 'tickets',
                order: 2
            },
            {
                type: 'line',
                label: 'Receita (MT)',
                data: chart.revenue,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.35,
                fill: true,
                yAxisID: 'revenue',
                order: 1
            }
        ]
    };
});

const chartOptions = {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
    },
    scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 12, autoSkip: true } },
        revenue: {
            position: 'left',
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            ticks: { callback: (value) => new Intl.NumberFormat('pt-PT').format(value) }
        },
        tickets: {
            position: 'right',
            beginAtZero: true,
            grid: { display: false },
            ticks: { precision: 0 }
        }
    }
};

const hasChartData = computed(() => {
    const chart = dashboard.value?.chart;
    if (!chart) return false;
    return chart.revenue.some((value) => value > 0) || chart.tickets.some((value) => value > 0);
});

const eventsByStatus = computed(() => {
    const rows = dashboard.value?.events_by_status ?? [];
    const total = rows.reduce((sum, row) => sum + row.total, 0);

    return rows.map((row) => ({
        ...row,
        severity: statusMeta[row.status_id]?.severity ?? 'info',
        percentage: total > 0 ? Math.round((row.total / total) * 100) : 0
    }));
});

const totals = computed(() => dashboard.value?.totals ?? {});

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="promotor-dashboard">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Painel do promotor</h4>
                <span class="text-600">Visão geral dos teus eventos · últimos {{ rangeLabel.toLowerCase() }}</span>
            </div>
            <div class="flex align-items-center gap-2">
                <SelectButton
                    :modelValue="selectedRange"
                    :options="rangeOptions"
                    optionLabel="label"
                    optionValue="value"
                    :allowEmpty="false"
                    :disabled="isLoading || isRefreshing"
                    @update:modelValue="changeRange"
                />
                <Button
                    icon="pi pi-refresh"
                    rounded
                    outlined
                    :loading="isRefreshing"
                    aria-label="Atualizar"
                    @click="getData({ silent: true })"
                />
            </div>
        </div>

        <div v-if="isLoading" class="grid">
            <div v-for="n in 4" :key="`kpi-skeleton-${n}`" class="col-12 md:col-6 xl:col-3">
                <div class="card mb-0">
                    <Skeleton width="6rem" height="0.9rem" class="mb-3" />
                    <Skeleton width="8rem" height="1.75rem" class="mb-3" />
                    <Skeleton width="5rem" height="0.8rem" />
                </div>
            </div>
            <div class="col-12">
                <div class="card">
                    <Skeleton width="10rem" height="1.2rem" class="mb-4" />
                    <Skeleton height="18rem" />
                </div>
            </div>
        </div>

        <div v-else-if="loadError" class="card text-center py-6">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Painel indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
        </div>

        <template v-else>
            <div class="grid">
                <div v-for="kpi in kpis" :key="kpi.key" class="col-12 md:col-6 xl:col-3">
                    <div class="card mb-0 h-full">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">{{ kpi.label }}</span>
                            <span class="kpi-icon" :class="`kpi-icon--${kpi.tone}`">
                                <i :class="kpi.icon" />
                            </span>
                        </div>
                        <div class="text-900 font-medium text-2xl mb-2">{{ kpi.value }}</div>
                        <div class="kpi-trend" :class="`kpi-trend--${changeInfo(kpi.change).tone}`">
                            <i :class="changeInfo(kpi.change).icon" />
                            <span>{{ changeInfo(kpi.change).text }}</span>
                            <span class="text-500 font-normal ml-1">vs. período anterior</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="col-12 xl:col-8">
                    <div class="card h-full">
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                            <h5 class="m-0">Receita e bilhetes</h5>
                            <span class="text-500 text-sm">{{ rangeLabel }}</span>
                        </div>
                        <div v-if="hasChartData" style="height: 20rem">
                            <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full" />
                        </div>
                        <div v-else class="empty-state">
                            <i class="pi pi-chart-line text-3xl text-400 mb-2" />
                            <p class="text-600 m-0">Ainda não há vendas registadas neste período.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 xl:col-4">
                    <div class="card h-full">
                        <div class="flex align-items-center justify-content-between mb-4">
                            <h5 class="m-0">Eventos por estado</h5>
                            <router-link to="/promotor/eventos" class="text-primary text-sm no-underline">Ver todos</router-link>
                        </div>

                        <ul class="list-none p-0 m-0">
                            <li v-for="row in eventsByStatus" :key="row.status_id" class="status-row">
                                <div class="flex align-items-center justify-content-between mb-2">
                                    <Tag :severity="row.severity" :value="row.label" />
                                    <span class="text-900 font-medium">{{ formatNumber(row.total) }}</span>
                                </div>
                                <div class="status-bar">
                                    <div class="status-bar__fill" :style="{ width: `${row.percentage}%` }" />
                                </div>
                            </li>
                        </ul>

                        <div class="summary-split mt-4">
                            <div>
                                <span class="block text-500 text-sm">Total de eventos</span>
                                <span class="text-900 font-medium text-xl">{{ formatNumber(totals.events) }}</span>
                            </div>
                            <div>
                                <span class="block text-500 text-sm">Próximos</span>
                                <span class="text-900 font-medium text-xl">{{ formatNumber(totals.upcoming) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="col-12 md:col-6 xl:col-3">
                    <router-link to="/promotor/eventos" class="mini-card">
                        <div>
                            <span class="block text-500 text-sm mb-1">Eventos aprovados</span>
                            <span class="text-900 font-medium text-xl">{{ formatNumber(totals.events_approved) }}</span>
                        </div>
                        <i class="pi pi-check-circle text-green-500 text-xl" />
                    </router-link>
                </div>
                <div class="col-12 md:col-6 xl:col-3">
                    <router-link to="/promotor/eventos" class="mini-card">
                        <div>
                            <span class="block text-500 text-sm mb-1">À espera de aprovação</span>
                            <span class="text-900 font-medium text-xl">{{ formatNumber((totals.events_pending || 0) + (totals.events_review || 0)) }}</span>
                        </div>
                        <i class="pi pi-clock text-orange-500 text-xl" />
                    </router-link>
                </div>
                <div class="col-12 md:col-6 xl:col-3">
                    <div class="mini-card mini-card--static">
                        <div>
                            <span class="block text-500 text-sm mb-1">Bilhetes emitidos</span>
                            <span class="text-900 font-medium text-xl">{{ formatNumber(totals.tickets) }}</span>
                        </div>
                        <i class="pi pi-ticket text-blue-500 text-xl" />
                    </div>
                </div>
                <div class="col-12 md:col-6 xl:col-3">
                    <div class="mini-card mini-card--static">
                        <div>
                            <span class="block text-500 text-sm mb-1">Receita acumulada</span>
                            <span class="text-900 font-medium text-xl">{{ formatCurrency(totals.revenue) }}</span>
                        </div>
                        <i class="pi pi-chart-line text-purple-500 text-xl" />
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="col-12 xl:col-7">
                    <div class="card h-full">
                        <div class="flex align-items-center justify-content-between mb-4">
                            <h5 class="m-0">Eventos com mais receita</h5>
                            <span class="text-500 text-sm">{{ rangeLabel }}</span>
                        </div>

                        <ul v-if="dashboard.top_events?.length" class="list-none p-0 m-0">
                            <li v-for="item in dashboard.top_events" :key="item.event_id" class="top-event">
                                <img
                                    :src="imageSrc(item.image, `event-${item.event_id}`)"
                                    :alt="item.name"
                                    class="top-event__image"
                                    @error="markBrokenImage(`event-${item.event_id}`)"
                                />
                                <div class="top-event__info">
                                    <router-link :to="`/promotor/eventos/${item.event_id}`" class="top-event__name">
                                        {{ item.name }}
                                    </router-link>
                                    <span class="text-500 text-sm">{{ formatDate(item.start_date) }}</span>
                                </div>
                                <div class="top-event__numbers">
                                    <span class="text-900 font-medium">{{ formatCurrency(item.revenue) }}</span>
                                    <span class="text-500 text-sm">{{ formatNumber(item.tickets) }} bilhetes</span>
                                </div>
                            </li>
                        </ul>

                        <div v-else class="empty-state">
                            <i class="pi pi-inbox text-3xl text-400 mb-2" />
                            <p class="text-600 m-0">Nenhuma venda neste período.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 xl:col-5">
                    <div class="card h-full">
                        <div class="flex align-items-center justify-content-between mb-4">
                            <h5 class="m-0">Próximos eventos</h5>
                            <router-link to="/promotor/eventos/create" class="text-primary text-sm no-underline">Criar evento</router-link>
                        </div>

                        <ul v-if="dashboard.upcoming_events?.length" class="list-none p-0 m-0">
                            <li v-for="item in dashboard.upcoming_events" :key="item.id" class="pending-event">
                                <div class="pending-event__info">
                                    <router-link :to="`/promotor/eventos/${item.id}`" class="pending-event__name">
                                        {{ item.name }}
                                    </router-link>
                                    <span class="text-500 text-sm">{{ formatDate(item.start_date) }}</span>
                                </div>
                                <Tag severity="success" value="Aprovado" />
                            </li>
                        </ul>

                        <div v-else class="empty-state">
                            <i class="pi pi-calendar text-3xl text-400 mb-2" />
                            <p class="text-600 m-0">Não há eventos futuros aprovados.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="col-12">
                    <div class="card">
                        <div class="flex align-items-center justify-content-between mb-4">
                            <h5 class="m-0">Últimas compras</h5>
                            <router-link to="/promotor/eventos" class="text-primary text-sm no-underline">Ver eventos</router-link>
                        </div>

                        <DataTable
                            v-if="dashboard.recent_sells?.length"
                            :value="dashboard.recent_sells"
                            responsiveLayout="scroll"
                            class="p-datatable-sm"
                        >
                            <Column field="name" header="Cliente">
                                <template #body="slotProps">
                                    <div class="flex flex-column">
                                        <span class="text-900">{{ slotProps.data.name || 'Sem nome' }}</span>
                                        <span class="text-500 text-sm">{{ slotProps.data.email || slotProps.data.mobile || '--' }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="event_name" header="Evento">
                                <template #body="slotProps">
                                    <router-link :to="`/promotor/eventos/${slotProps.data.event_id}`" class="text-primary no-underline">
                                        {{ slotProps.data.event_name }}
                                    </router-link>
                                </template>
                            </Column>
                            <Column field="qty" header="Qtd" />
                            <Column field="total" header="Total">
                                <template #body="slotProps">
                                    <span class="text-900 font-medium">{{ formatCurrency(slotProps.data.total) }}</span>
                                </template>
                            </Column>
                            <Column field="created_at" header="Data">
                                <template #body="slotProps">
                                    {{ formatDateTime(slotProps.data.created_at) }}
                                </template>
                            </Column>
                        </DataTable>

                        <div v-else class="empty-state">
                            <i class="pi pi-shopping-bag text-3xl text-400 mb-2" />
                            <p class="text-600 m-0">Ainda não há compras registadas.</p>
                        </div>
                    </div>
                </div>
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

.kpi-icon--blue {
    background: #dbeafe;
    color: #2563eb;
}

.kpi-icon--green {
    background: #dcfce7;
    color: #16a34a;
}

.kpi-icon--purple {
    background: #ede9fe;
    color: #7c3aed;
}

.kpi-icon--orange {
    background: #ffedd5;
    color: #ea580c;
}

.kpi-trend {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 600;
}

.kpi-trend--up {
    color: #16a34a;
}

.kpi-trend--down {
    color: #dc2626;
}

.kpi-trend--neutral {
    color: #64748b;
}

.status-row + .status-row {
    margin-top: 1rem;
}

.status-bar {
    height: 6px;
    border-radius: 999px;
    background: var(--surface-200);
    overflow: hidden;
}

.status-bar__fill {
    height: 100%;
    border-radius: 999px;
    background: #2563eb;
    transition: width 0.3s ease;
}

.summary-split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
}

.mini-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 12px;
    background: var(--surface-card);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

a.mini-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}

.mini-card--static {
    cursor: default;
}

.top-event {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--surface-border);
}

.top-event:last-child {
    border-bottom: none;
}

.top-event__image {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.6rem;
    object-fit: cover;
    flex-shrink: 0;
}

.top-event__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
}

.top-event__name {
    color: var(--text-color);
    font-weight: 600;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.top-event__name:hover {
    color: var(--primary-color);
}

.top-event__numbers {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    flex-shrink: 0;
}

.pending-event {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--surface-border);
}

.pending-event:last-child {
    border-bottom: none;
}

.pending-event__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.pending-event__name {
    color: var(--text-color);
    font-weight: 600;
    text-decoration: none;
}

.pending-event__name:hover {
    color: var(--primary-color);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2.5rem 1rem;
}
</style>
