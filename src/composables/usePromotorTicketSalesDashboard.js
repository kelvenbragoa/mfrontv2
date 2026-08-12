import { computed, ref } from 'vue';
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

    const formatCurrency = (value) =>
        `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

    const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

    const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

    const goBack = () => router.push(backPath);

    const getData = async ({ silent = false } = {}) => {
        if (silent) {
            isRefreshing.value = true;
        } else {
            isLoading.value = true;
        }
        loadError.value = null;

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
        (data.value?.ticket_report || []).map((item) => ({ label: item.name, value: item.name }))
    );

    const filteredReports = computed(() => {
        let rows = data.value?.ticket_report || [];
        if (ticketFilter.value) {
            rows = rows.filter((row) => row.name === ticketFilter.value);
        }
        return rows;
    });

    const matchesSearch = (row) => {
        const query = searchQuery.value?.trim().toLowerCase();
        if (!query) return true;

        const ticketName = row.ticket?.name || '';
        const customer = row.user_id == 0 ? 'mticket venda fisica' : `${row.name || ''} ${row.mobile || ''} ${row.email || ''}`;

        return [ticketName, customer, String(row.qty || ''), String(row.total || '')].some((part) =>
            String(part).toLowerCase().includes(query)
        );
    };

    const filteredIssued = computed(() => {
        let rows = data.value?.tickets_issued || [];
        if (ticketFilter.value) {
            rows = rows.filter((row) => row.ticket?.name === ticketFilter.value);
        }
        return rows.filter(matchesSearch);
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

    const downloadPdf = async () => {
        loadingPdf.value = true;

        try {
            const response = await axios.get(`${baseURL}/download-report/${eventId}/tickets`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ticketreport${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({ severity: 'success', summary: 'Relatório descarregado', life: 3000 });
        } catch {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível descarregar o PDF.', life: 4000 });
        } finally {
            loadingPdf.value = false;
        }
    };

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
    };
}
