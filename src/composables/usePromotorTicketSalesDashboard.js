import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const CHART_PALETTE = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#e11d48', '#64748b', '#ca8a04'];

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

export function usePromotorTicketSalesDashboard({ eventId, resource, title, issuedLabel, dashboardPath }) {
    const router = useRouter();
    const toast = useToast();
    const backPath = dashboardPath ?? `/promotor/eventos/${eventId}/dashboard`;

    const isLoading = ref(true);
    const isRefreshing = ref(false);
    const loadError = ref(null);
    const data = ref(null);
    const searchQuery = ref('');
    const ticketFilter = ref(null);
    const loadingPdf = ref(false);
    const loadingExcel = ref(false);

    const issuedRows = ref([]);
    const issuedTotal = ref(0);
    const issuedLoading = ref(false);
    const issuedPage = ref({ first: 0, rows: 20, sortField: null, sortOrder: null });
    let issuedRequestId = 0;
    let searchTimer = null;

    const formatCurrency = (value) =>
        `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

    const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

    const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

    const goBack = () => router.push(backPath);

    const fetchIssued = async () => {
        const requestId = ++issuedRequestId;
        const { first, rows, sortField, sortOrder } = issuedPage.value;
        issuedLoading.value = true;

        try {
            const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}/vendas`, {
                params: {
                    page: Math.floor(first / rows) + 1,
                    per_page: rows,
                    search: searchQuery.value?.trim() || undefined,
                    ticket_id: ticketFilter.value || undefined,
                    sort_field: sortField || undefined,
                    sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
                }
            });
            if (requestId !== issuedRequestId) return;
            issuedRows.value = response.data.data;
            issuedTotal.value = response.data.total;
        } catch {
            if (requestId !== issuedRequestId) return;
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as vendas.', life: 4000 });
        } finally {
            if (requestId === issuedRequestId) issuedLoading.value = false;
        }
    };

    const onIssuedPage = (event) => {
        issuedPage.value = { ...issuedPage.value, first: event.first, rows: event.rows };
        fetchIssued();
    };

    const onIssuedSort = (event) => {
        issuedPage.value = { ...issuedPage.value, first: 0, sortField: event.sortField, sortOrder: event.sortOrder };
        fetchIssued();
    };

    const reloadIssuedFromStart = () => {
        issuedPage.value = { ...issuedPage.value, first: 0 };
        fetchIssued();
    };

    watch(ticketFilter, reloadIssuedFromStart);

    watch(searchQuery, () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(reloadIssuedFromStart, 400);
    });

    const getData = async ({ silent = false } = {}) => {
        if (silent) {
            isRefreshing.value = true;
        } else {
            isLoading.value = true;
        }
        loadError.value = null;

        fetchIssued();

        try {
            const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}/${resource}`);
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

        return [
            {
                key: 'total',
                label: 'Total vendido',
                qty: formatNumber(data.value.allsells_total),
                value: formatCurrency(data.value.allsells_value),
                icon: 'pi pi-wallet',
                tone: 'blue'
            },
            {
                key: 'today',
                label: 'Hoje',
                qty: formatNumber(data.value.allsells_total_today),
                value: formatCurrency(data.value.allsells_value_today),
                icon: 'pi pi-calendar',
                tone: 'green'
            },
            {
                key: 'week',
                label: 'Esta semana',
                qty: formatNumber(data.value.allsells_total_week),
                value: formatCurrency(data.value.allsells_value_week),
                icon: 'pi pi-chart-line',
                tone: 'purple'
            },
            {
                key: 'month',
                label: 'Este mês',
                qty: formatNumber(data.value.allsells_total_month),
                value: formatCurrency(data.value.allsells_value_month),
                icon: 'pi pi-chart-bar',
                tone: 'orange'
            }
        ];
    });

    const ticketOptions = computed(() =>
        (data.value?.ticket_report || []).map((item) => ({ label: item.name, value: item.id }))
    );

    const filteredReports = computed(() => {
        let rows = data.value?.ticket_report || [];
        if (ticketFilter.value) {
            rows = rows.filter((row) => row.id === ticketFilter.value);
        }
        return rows;
    });

    const hasActiveFilters = computed(() => !!searchQuery.value?.trim() || !!ticketFilter.value);

    const clearFilters = () => {
        searchQuery.value = '';
        ticketFilter.value = null;
    };

    const buildChartData = (key, labels) => {
        const reports = filteredReports.value;
        if (!reports.length) return null;

        return {
            labels,
            datasets: reports.map((report, index) => ({
                label: report.name,
                data: report[key] || [],
                backgroundColor: `${CHART_PALETTE[index % CHART_PALETTE.length]}99`,
                borderColor: CHART_PALETTE[index % CHART_PALETTE.length],
                borderWidth: 1,
                borderRadius: 4
            }))
        };
    };

    const chartDataDay = computed(() =>
        buildChartData(
            'dataTicketDay',
            Array.from({ length: 31 }, (_, index) => String(index + 1))
        )
    );

    const chartDataMonth = computed(() =>
        buildChartData('dataTicketMonth', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'])
    );

    const hasChartData = computed(() => {
        const reports = filteredReports.value;
        return reports.some((report) => (report.dataTicketDay || []).some((v) => Number(v) > 0) || (report.dataTicketMonth || []).some((v) => Number(v) > 0));
    });

    const customerLabel = (row) =>
        Number(row.user_id) === 0 ? 'MTicket — venda física' : [row.name, row.mobile].filter(Boolean).join(' · ') || 'Cliente';

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
        downloadFile({ loading: loadingPdf, path: 'tickets', file: `ticketreport${eventId}.pdf`, errorDetail: 'Não foi possível descarregar o PDF.' });

    const downloadExcel = () =>
        downloadFile({ loading: loadingExcel, path: 'tickets/sales', file: `vendas-bilhetes-${eventId}.xlsx`, errorDetail: 'Não foi possível descarregar o Excel.' });

    return {
        title,
        issuedLabel,
        isLoading,
        isRefreshing,
        loadError,
        data,
        searchQuery,
        ticketFilter,
        loadingPdf,
        loadingExcel,
        kpis,
        ticketOptions,
        filteredReports,
        issuedRows,
        issuedTotal,
        issuedLoading,
        issuedPage,
        onIssuedPage,
        onIssuedSort,
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
        downloadPdf,
        downloadExcel
    };
}
