import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const statusMeta = {
    1: { label: 'Cancelado', severity: 'danger' },
    2: { label: 'Aprovado', severity: 'success' },
    3: { label: 'Pendente', severity: 'warning' },
    4: { label: 'Em revisão', severity: 'info' }
};

export function useEventDashboard({ eventId, scope = 'promotor' }) {
    const router = useRouter();
    const toast = useToast();

    const basePath = scope === 'admin' ? `/admin/eventos/${eventId}` : `/promotor/eventos/${eventId}`;
    const dashboardPath = `${basePath}/dashboard`;

    const isLoading = ref(true);
    const isRefreshing = ref(false);
    const loadError = ref(null);
    const dashboard = ref(null);
    const searchQuery = ref('');
    const activeTab = ref(0);
    const brokenImage = ref(false);
    const loadingPdfProducts = ref(false);
    const loadingPdfTickets = ref(false);

    const getData = async ({ silent = false } = {}) => {
        if (silent) isRefreshing.value = true;
        else isLoading.value = true;
        loadError.value = null;

        try {
            const response = await axios.get(`${baseURL}/promotor-dashboard/${eventId}`);
            dashboard.value = response.data;
        } catch (error) {
            const status = error?.response?.status;
            let message;

            if (status === 404) message = 'Evento não encontrado.';
            else if (status === 403) message = 'Não tens permissão para ver este dashboard.';
            else if (status === 401) message = 'A sessão expirou. Inicia sessão novamente.';
            else message = 'Não foi possível carregar o dashboard. Tenta novamente.';

            if (dashboard.value) toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
            else loadError.value = message;
        } finally {
            isLoading.value = false;
            isRefreshing.value = false;
        }
    };

    const goBack = () => router.push(basePath);

    const formatCurrency = (value) =>
        `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

    const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);
    const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');

    const eventData = computed(() => dashboard.value?.event ?? null);

    const eventImage = computed(() => {
        if (!eventData.value?.image || brokenImage.value) return '/demo/images/mticket.jpg';
        return storageURL + eventData.value.image;
    });

    const currentStatus = computed(() => {
        if (!eventData.value) return null;
        return {
            label: eventData.value.status?.name || statusMeta[eventData.value.status_id]?.label || 'Sem estado',
            severity: statusMeta[eventData.value.status_id]?.severity ?? 'info'
        };
    });

    const ticketRevenue = computed(() =>
        (eventData.value?.tickets || []).reduce(
            (sum, ticket) => sum + (ticket.sells || []).reduce((inner, sell) => inner + Number(sell.total || 0), 0),
            0
        )
    );

    const ticketsSold = computed(() =>
        (eventData.value?.tickets || []).reduce(
            (sum, ticket) => sum + (ticket.sells || []).reduce((inner, sell) => inner + Number(sell.qty || 0), 0),
            0
        )
    );

    const barRevenue = computed(() => Number(dashboard.value?.totalamount || 0));

    const invitesSent = computed(() =>
        (eventData.value?.invites || []).reduce((sum, invite) => sum + (invite.customers?.length || 0), 0)
    );

    const kpis = computed(() => [
        { key: 'ticket-revenue', label: 'Receita bilhetes', value: formatCurrency(ticketRevenue.value), icon: 'pi pi-wallet', tone: 'blue' },
        { key: 'tickets-sold', label: 'Bilhetes vendidos', value: formatNumber(ticketsSold.value), icon: 'pi pi-ticket', tone: 'green' },
        { key: 'bar-revenue', label: 'Receita bar', value: formatCurrency(barRevenue.value), icon: 'pi pi-shopping-bag', tone: 'purple' },
        { key: 'invites', label: 'Convites enviados', value: formatNumber(invitesSent.value), icon: 'pi pi-envelope', tone: 'orange' }
    ]);

    const summaryCards = computed(() => [
        { key: 'tickets', label: 'Tipos de bilhete', value: dashboard.value?.tickets ?? 0, icon: 'pi pi-ticket', tone: 'blue', to: `${dashboardPath}/bilhetes` },
        { key: 'packages', label: 'Pacotes', value: dashboard.value?.packages ?? 0, icon: 'pi pi-box', tone: 'green', to: `${dashboardPath}/pacotes` },
        { key: 'invites', label: 'Convites', value: dashboard.value?.invites ?? 0, icon: 'pi pi-envelope', tone: 'orange', to: `${dashboardPath}/convites` },
        { key: 'lineups', label: 'Line-up', value: dashboard.value?.lineups ?? 0, icon: 'pi pi-users', tone: 'purple', to: `${dashboardPath}/lineups` },
        { key: 'bars', label: 'Bares', value: dashboard.value?.bars ?? 0, icon: 'pi pi-building', tone: 'cyan', to: basePath },
        { key: 'products', label: 'Produtos', value: dashboard.value?.products ?? 0, icon: 'pi pi-tag', tone: 'indigo', to: basePath },
        { key: 'protocols', label: 'Protocolos', value: dashboard.value?.protocols ?? 0, icon: 'pi pi-id-card', tone: 'slate', to: basePath },
        { key: 'barmans', label: 'Barmans', value: dashboard.value?.barmans ?? 0, icon: 'pi pi-user', tone: 'rose', to: basePath }
    ]);

    const matchesSearch = (value) => {
        const query = searchQuery.value?.trim().toLowerCase();
        if (!query) return true;
        return String(value ?? '').toLowerCase().includes(query);
    };

    const filteredTickets = computed(() =>
        (eventData.value?.tickets || []).filter((row) => matchesSearch(row.name) || matchesSearch(row.description))
    );

    const filteredProducts = computed(() =>
        (eventData.value?.products || []).filter((row) => matchesSearch(row.name) || matchesSearch(row.barstore?.name))
    );

    const filteredInvites = computed(() =>
        (eventData.value?.invites || []).filter((row) => matchesSearch(row.name) || matchesSearch(row.description))
    );

    const filteredBars = computed(() =>
        (eventData.value?.barstores || []).filter((row) => matchesSearch(row.name))
    );

    const productSoldQty = (product) => (product.sells || []).reduce((sum, item) => sum + Number(item.qtd || 0), 0);
    const productSoldValue = (product) => productSoldQty(product) * Number(product.sell_price || 0);
    const productInitialStock = (product) => Number(product.qtd || 0) + productSoldQty(product);
    const barSoldQty = (bar) => (bar.sells || []).reduce((sum, item) => sum + Number(item.qtd || 0), 0);
    const barSoldValue = (bar) => (bar.sells || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
    const ticketSoldQty = (ticket) => (ticket.sells || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);

    const hasActiveFilters = computed(() => !!searchQuery.value?.trim());
    const clearFilters = () => { searchQuery.value = ''; };

    const downloadPDF = async (type) => {
        const isProducts = type === 'products';
        const loadingRef = isProducts ? loadingPdfProducts : loadingPdfTickets;
        loadingRef.value = true;

        try {
            const response = await axios.get(`${baseURL}/download-report/${eventId}/${isProducts ? 'products' : 'tickets'}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${isProducts ? 'barreport' : 'ticketreport'}${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({ severity: 'success', summary: 'Relatório descarregado', life: 3000 });
        } catch {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível descarregar o relatório.', life: 4000 });
        } finally {
            loadingRef.value = false;
        }
    };

    return {
        basePath,
        dashboardPath,
        isLoading,
        isRefreshing,
        loadError,
        dashboard,
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
    };
}
