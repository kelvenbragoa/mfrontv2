import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const CHART_PALETTE = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#e11d48', '#64748b', '#ca8a04'];

const METHODS = {
    dinheiro: { label: 'Dinheiro', color: '#16a34a' },
    cartao: { label: 'Cartão', color: '#2563eb' },
    mpesa: { label: 'M-Pesa', color: '#e11d48' },
    emola: { label: 'e-Mola', color: '#ea580c' },
    cashless: { label: 'Cashless', color: '#7c3aed' }
};

const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
    },
    scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 15, autoSkip: true } },
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            ticks: { callback: (value) => new Intl.NumberFormat('pt-PT').format(value) }
        }
    }
};

export function useBarSalesDashboard({ eventId, dashboardPath }) {
    const router = useRouter();
    const toast = useToast();
    const backPath = dashboardPath ?? `/promotor/eventos/${eventId}/dashboard`;

    const isLoading = ref(true);
    const isRefreshing = ref(false);
    const loadError = ref(null);
    const data = ref(null);
    const searchQuery = ref('');
    const barFilter = ref(null);
    const barmanFilter = ref(null);
    const methodFilter = ref(null);
    const loadingPdf = ref(false);
    const loadingExcel = ref(false);

    const salesRows = ref([]);
    const salesTotal = ref(0);
    const salesLoading = ref(false);
    const salesPage = ref({ first: 0, rows: 20, sortField: null, sortOrder: null });
    let salesRequestId = 0;
    let searchTimer = null;

    const formatCurrency = (value) =>
        `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

    const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

    const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

    const methodLabel = (method) => METHODS[method]?.label || method || '--';

    const goBack = () => router.push(backPath);

    const fetchSales = async () => {
        const requestId = ++salesRequestId;
        const { first, rows, sortField, sortOrder } = salesPage.value;
        salesLoading.value = true;

        try {
            const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}/bar/vendas`, {
                params: {
                    page: Math.floor(first / rows) + 1,
                    per_page: rows,
                    search: searchQuery.value?.trim() || undefined,
                    bar_store_id: barFilter.value || undefined,
                    barman_id: barmanFilter.value || undefined,
                    method: methodFilter.value || undefined,
                    sort_field: sortField || undefined,
                    sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
                }
            });
            if (requestId !== salesRequestId) return;
            salesRows.value = response.data.data;
            salesTotal.value = response.data.total;
        } catch {
            if (requestId !== salesRequestId) return;
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as vendas do bar.', life: 4000 });
        } finally {
            if (requestId === salesRequestId) salesLoading.value = false;
        }
    };

    const onSalesPage = (event) => {
        salesPage.value = { ...salesPage.value, first: event.first, rows: event.rows };
        fetchSales();
    };

    const onSalesSort = (event) => {
        salesPage.value = { ...salesPage.value, first: 0, sortField: event.sortField, sortOrder: event.sortOrder };
        fetchSales();
    };

    const reloadSalesFromStart = () => {
        salesPage.value = { ...salesPage.value, first: 0 };
        fetchSales();
    };

    const getData = async ({ silent = false } = {}) => {
        if (silent) {
            isRefreshing.value = true;
        } else {
            isLoading.value = true;
        }
        loadError.value = null;

        fetchSales();

        try {
            const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}/bar`);
            data.value = response.data;
        } catch (error) {
            const status = error?.response?.status;
            let message;

            if (status === 404) {
                message = 'Evento não encontrado.';
            } else if (status === 403) {
                message = 'Não tens permissão para ver este relatório.';
            } else if (status === 401) {
                message = 'A sessão expirou. Inicia sessão novamente.';
            } else {
                message = 'Não foi possível carregar o relatório. Tenta novamente.';
            }

            if (data.value) {
                toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
            } else {
                loadError.value = message;
            }
        } finally {
            isLoading.value = false;
            isRefreshing.value = false;
        }
    };

    const kpis = computed(() => {
        if (!data.value) return [];

        const periods = [
            { key: '', label: 'Total vendido', icon: 'pi pi-wallet', tone: 'blue' },
            { key: '_today', label: 'Hoje', icon: 'pi pi-calendar', tone: 'green' },
            { key: '_week', label: 'Esta semana', icon: 'pi pi-chart-line', tone: 'purple' },
            { key: '_month', label: 'Este mês', icon: 'pi pi-chart-bar', tone: 'orange' }
        ];

        return periods.map(({ key, ...rest }) => ({
            key: key || 'total',
            ...rest,
            value: formatCurrency(data.value[`value${key}`]),
            detail: `${formatNumber(data.value[`orders${key}`])} vendas · ${formatNumber(data.value[`items${key}`])} itens`
        }));
    });

    const methodBreakdown = computed(() => {
        const rows = data.value?.by_method || [];
        const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);

        return rows.map((row) => ({
            ...row,
            label: methodLabel(row.method),
            color: METHODS[row.method]?.color || '#64748b',
            percent: total > 0 ? Math.round((Number(row.value) / total) * 1000) / 10 : 0
        }));
    });

    const statusBreakdown = computed(() => {
        if (!data.value) return [];
        const delivered = data.value.delivered;
        const pending = data.value.pending;
        const total = delivered.orders + pending.orders;
        const percent = (orders) => (total > 0 ? Math.round((orders / total) * 1000) / 10 : 0);

        return [
            { key: 'delivered', label: 'Entregues', hint: 'Recibo verificado no bar', color: '#16a34a', ...delivered, percent: percent(delivered.orders) },
            { key: 'pending', label: 'Por levantar', hint: 'Pago, recibo ainda não verificado', color: '#ea580c', ...pending, percent: percent(pending.orders) }
        ];
    });

    const barOptions = computed(() => (data.value?.bars || []).map((bar) => ({ label: bar.name, value: bar.id })));

    const barmanOptions = computed(() =>
        (data.value?.barmen || [])
            .filter((barman) => !barFilter.value || barman.bar_store_id === barFilter.value)
            .map((barman) => ({ label: barman.name, value: barman.id }))
    );

    const methodOptions = Object.entries(METHODS).map(([value, { label }]) => ({ label, value }));

    watch(barFilter, () => {
        if (barmanFilter.value && !barmanOptions.value.some((option) => option.value === barmanFilter.value)) {
            barmanFilter.value = null;
        }
        reloadSalesFromStart();
    });

    watch([barmanFilter, methodFilter], reloadSalesFromStart);

    watch(searchQuery, () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(reloadSalesFromStart, 400);
    });

    const filteredBars = computed(() => (data.value?.bars || []).filter((bar) => !barFilter.value || bar.id === barFilter.value));

    const filteredProducts = computed(() => (data.value?.products || []).filter((product) => !barFilter.value || product.bar_store_id === barFilter.value));

    const filteredBarmen = computed(() => (data.value?.barmen || []).filter((barman) => !barFilter.value || barman.bar_store_id === barFilter.value));

    const hasActiveFilters = computed(() => !!searchQuery.value?.trim() || !!barFilter.value || !!barmanFilter.value || !!methodFilter.value);

    const clearFilters = () => {
        searchQuery.value = '';
        barFilter.value = null;
        barmanFilter.value = null;
        methodFilter.value = null;
    };

    const buildChartData = (key, labels) => {
        const bars = filteredBars.value;
        if (!bars.length) return null;

        return {
            labels,
            datasets: bars.map((bar, index) => ({
                label: bar.name,
                data: bar[key] || [],
                backgroundColor: `${CHART_PALETTE[index % CHART_PALETTE.length]}99`,
                borderColor: CHART_PALETTE[index % CHART_PALETTE.length],
                borderWidth: 1,
                borderRadius: 4
            }))
        };
    };

    const chartDataDay = computed(() =>
        buildChartData(
            'dataDay',
            Array.from({ length: 31 }, (_, index) => String(index + 1))
        )
    );

    const chartDataMonth = computed(() => buildChartData('dataMonth', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']));

    const hasDailyData = computed(() => filteredBars.value.some((bar) => (bar.dataDay || []).some((v) => Number(v) > 0)));
    const hasMonthlyData = computed(() => filteredBars.value.some((bar) => (bar.dataMonth || []).some((v) => Number(v) > 0)));

    const saleItemsLabel = (sale) =>
        (sale.selldetails || []).map((detail) => `${detail.qtd}× ${detail.product?.name || 'Produto removido'}`).join(', ') || 'Sem produtos registados';

    const downloadFile = async ({ loading, path, file, errorDetail }) => {
        loading.value = true;

        try {
            const response = await axios.get(`${baseURL}/download-report/${eventId}/${path}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({ severity: 'success', summary: 'Relatório descarregado', life: 3000 });
        } catch {
            toast.add({ severity: 'error', summary: 'Erro', detail: errorDetail, life: 4000 });
        } finally {
            loading.value = false;
        }
    };

    const downloadPdf = () =>
        downloadFile({ loading: loadingPdf, path: 'products', file: `barreport${eventId}.pdf`, errorDetail: 'Não foi possível descarregar o PDF.' });

    const downloadExcel = () =>
        downloadFile({ loading: loadingExcel, path: 'bar/sales', file: `vendas-bar-${eventId}.xlsx`, errorDetail: 'Não foi possível descarregar o Excel.' });

    return {
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
    };
}
