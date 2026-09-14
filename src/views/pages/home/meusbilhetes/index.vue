<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import DigitalTicket from '@/components/ticket/DigitalTicket.vue';
import { useTicketPdf } from '@/composables/useTicketPdf';
import { useShopReceiptPdf, receiptErrorMessage } from '@/composables/useShopReceiptPdf';
import QrcodeVue from 'qrcode.vue';

const router = useRouter();
const toast = useToast();

const isLoadingDiv = ref(true);
const isLoadingTickets = ref(false);
const isAuthenticated = ref(false);
const searchQuery = ref('');
const selectedStatus = ref(null);
const tickets = ref({ data: [] });
const summary = ref({ total: 0, upcoming: 0, used: 0, expired: 0 });
const brokenImages = ref(new Set());
const rowsPerPage = ref(12);
const first = ref(0);

const showTicketDialog = ref(false);
const selectedTicket = ref(null);
const captureTicket = ref(null);
const downloadingId = ref(null);
const { isDownloading, downloadTicketElements } = useTicketPdf();
const { downloadingId: receiptDownloadingId, downloadMyReceipt } = useShopReceiptPdf();

const activeSection = ref('tickets');
const receipts = ref({ data: [] });
const receiptSummary = ref({ total: 0, pending: 0, picked_up: 0 });
const receiptSearch = ref('');
const receiptStatus = ref(null);
const isLoadingReceipts = ref(false);
const receiptsLoaded = ref(false);
const receiptFirst = ref(0);
const showReceiptDialog = ref(false);
const selectedReceipt = ref(null);

const receiptStatusOptions = [
    { label: 'Por levantar', value: 'pending' },
    { label: 'Levantados', value: 'picked_up' }
];

const statusOptions = [
    { label: 'Próximos', value: 'upcoming' },
    { label: 'Usados', value: 'used' },
    { label: 'Expirados', value: 'expired' }
];

const ticketsList = computed(() => tickets.value?.data || []);
const hasTickets = computed(() => ticketsList.value.length > 0);
const hasActiveFilters = computed(() => !!(searchQuery.value?.trim() || selectedStatus.value));
const showPagination = computed(() => (tickets.value?.last_page || 0) > 1);
const receiptsList = computed(() => receipts.value?.data || []);
const hasReceipts = computed(() => receiptsList.value.length > 0);
const hasReceiptFilters = computed(() => !!(receiptSearch.value?.trim() || receiptStatus.value));
const showReceiptPagination = computed(() => (receipts.value?.last_page || 0) > 1);

const isTicketUsed = (ticket) => Number(ticket?.status) === 0 || Boolean(ticket?.verified_at);

const resolveStatus = (ticket) => {
    if (isTicketUsed(ticket)) {
        return { label: 'Usado', severity: 'info', key: 'used' };
    }
    if (ticket.event?.end_date && moment().isAfter(moment(ticket.event.end_date).endOf('day'))) {
        return { label: 'Expirado', severity: 'danger', key: 'expired' };
    }
    return { label: 'Válido', severity: 'success', key: 'upcoming' };
};

const eventLocation = (event) => {
    if (!event) return 'Local a anunciar';
    const city = event.city?.name;
    const province = event.province?.name;
    if (city && province) return `${city}, ${province}`;
    return event.address || province || 'Local a anunciar';
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('pt-MZ')} MT`;

const markBrokenImage = (id) => {
    brokenImages.value = new Set([...brokenImages.value, id]);
};

const imageSrc = (event) => {
    if (!event?.image || brokenImages.value.has(event.id)) {
        return '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + event.image;
};

const ticketNumber = (ticket) => ticket?.ticket_number || `#0${ticket?.id ?? ''}`;

const isLiveTicket = (ticket) => Boolean(ticket?.ticket?.is_live);

const paymentReference = (ticket) => ticket?.sell?.transaction?.reference || '';

const qrValue = (ticket) =>
    ticket?.qrcode ||
    JSON.stringify({
        s: ticket.status,
        i: ticket.id,
        ie: ticket.event_id || ticket.event?.id
    });

const openTicket = (ticket) => {
    selectedTicket.value = ticket;
    showTicketDialog.value = true;
};

const ticketBuyerName = (ticket) => {
    if (ticket?.sell?.name) return ticket.sell.name;
    try {
        return JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Cliente';
    } catch {
        return 'Cliente';
    }
};

const ticketStatusKey = (ticket) => {
    const key = resolveStatus(ticket).key;
    if (key === 'used' || key === 'expired') return key;
    return 'valid';
};

const downloadPhysicalTicket = async (ticket) => {
    if (!ticket || isLiveTicket(ticket)) return;
    downloadingId.value = ticket.id;
    captureTicket.value = ticket;
    try {
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const el = document.querySelector('#ticket-pdf-source .ticket');
        if (!el) throw new Error('ticket element missing');
        await downloadTicketElements([el], ticket.event?.name || ticketNumber(ticket));
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível baixar o bilhete',
            detail: 'Tenta novamente dentro de momentos.',
            life: 4000
        });
    } finally {
        captureTicket.value = null;
        downloadingId.value = null;
    }
};

const receiptItemsLabel = (order) => {
    const qty = (order?.details || []).reduce((sum, line) => sum + Number(line.qtd || 0), 0);
    return `${qty} ${qty === 1 ? 'artigo' : 'artigos'}`;
};

const receiptStatusMeta = (order) => {
    if (order?.picked_up_at) {
        return { label: 'Levantado', severity: 'info' };
    }
    return { label: 'Por levantar', severity: 'success' };
};

const openReceipt = (order) => {
    selectedReceipt.value = order;
    showReceiptDialog.value = true;
};

const downloadReceipt = async (order) => {
    if (!order?.id) return;
    try {
        await downloadMyReceipt(order);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Recibo',
            detail: await receiptErrorMessage(error),
            life: 4000
        });
    }
};

const getReceipts = async (page = 1) => {
    if (!isAuthenticated.value) {
        return;
    }

    isLoadingReceipts.value = true;
    receiptFirst.value = (page - 1) * rowsPerPage.value;
    const params = { page, per_page: rowsPerPage.value };
    if (receiptSearch.value?.trim()) {
        params.search = receiptSearch.value.trim();
    }
    if (receiptStatus.value) {
        params.status = receiptStatus.value;
    }

    try {
        const response = await axios.get(`${baseURL}/meus-recibos`, { params });
        receipts.value = response.data.orders || { data: [] };
        receiptSummary.value = response.data.summary || { total: 0, pending: 0, picked_up: 0 };
        receiptsLoaded.value = true;
    } catch (error) {
        if (error?.response?.status === 401) {
            isAuthenticated.value = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar os recibos',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoadingReceipts.value = false;
    }
};

const getData = async (page = 1) => {
    if (!isAuthenticated.value) {
        isLoadingDiv.value = false;
        return;
    }

    if (!isLoadingDiv.value) {
        isLoadingTickets.value = true;
    }

    first.value = (page - 1) * rowsPerPage.value;

    const params = { page, per_page: rowsPerPage.value };
    if (searchQuery.value?.trim()) {
        params.search = searchQuery.value.trim();
    }
    if (selectedStatus.value) {
        params.status = selectedStatus.value;
    }

    try {
        const response = await axios.get(`${baseURL}/meus-bilhetes`, { params });
        tickets.value = response.data.tickets || { data: [] };
        summary.value = response.data.summary || { total: 0, upcoming: 0, used: 0, expired: 0 };
    } catch (error) {
        if (error?.response?.status === 401) {
            isAuthenticated.value = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar os bilhetes',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoadingDiv.value = false;
        isLoadingTickets.value = false;
    }
};

const onPage = (event) => {
    rowsPerPage.value = event.rows;
    first.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getData(page);
};

const onReceiptPage = (event) => {
    rowsPerPage.value = event.rows;
    receiptFirst.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getReceipts(page);
};

const debouncedSearch = debounce(() => {
    getData(1);
}, 400);

const debouncedReceiptSearch = debounce(() => {
    getReceipts(1);
}, 400);

watch([searchQuery, selectedStatus], () => {
    if (!isLoadingDiv.value && isAuthenticated.value && activeSection.value === 'tickets') {
        debouncedSearch();
    }
});

watch([receiptSearch, receiptStatus], () => {
    if (isAuthenticated.value && activeSection.value === 'receipts') {
        debouncedReceiptSearch();
    }
});

watch(activeSection, (section) => {
    if (section === 'receipts' && isAuthenticated.value && !receiptsLoaded.value) {
        getReceipts(1);
    }
});

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = null;
};

const clearReceiptFilters = () => {
    receiptSearch.value = '';
    receiptStatus.value = null;
};

const goToLogin = () => {
    router.push('/login');
};

onMounted(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    isAuthenticated.value = !!(user && token);
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="tickets-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="10rem" class="mb-4 border-round-xl" />
        <div class="grid">
            <div v-for="n in 4" :key="'sk-' + n" class="col-12 md:col-6">
                <Skeleton height="10rem" class="border-round-xl mb-3" />
            </div>
        </div>
    </div>

    <div v-else class="tickets-page">
        <section class="tickets-hero">
            <div class="tickets-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="tickets-hero__eyebrow">MTICKET</p>
                <h1 class="tickets-hero__title">Meus bilhetes</h1>
                <p class="tickets-hero__subtitle">Consulta os QR Codes, os recibos da loja e o histórico das tuas compras.</p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div v-if="!isAuthenticated" class="empty-block">
                <h2 class="text-900 mt-0 mb-2">Inicia sessão para ver as tuas compras</h2>
                <p class="text-600 mb-3">Os bilhetes e os recibos da loja comprados com a tua conta aparecem aqui.</p>
                <div class="flex flex-wrap justify-content-center gap-2">
                    <Button label="Login" class="p-button-rounded border-none font-medium text-white bg-blue-500" @click="goToLogin" />
                    <router-link to="/register">
                        <Button label="Criar conta" class="p-button-rounded p-button-outlined" />
                    </router-link>
                </div>
            </div>

            <template v-else>
                <div class="section-tabs mb-4">
                    <button type="button" class="section-tab" :class="{ 'section-tab--active': activeSection === 'tickets' }" @click="activeSection = 'tickets'">
                        Bilhetes
                    </button>
                    <button type="button" class="section-tab" :class="{ 'section-tab--active': activeSection === 'receipts' }" @click="activeSection = 'receipts'">
                        Recibos da loja
                    </button>
                </div>

                <template v-if="activeSection === 'tickets'">
                <div class="summary-grid mb-4">
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ summary.total }}</span>
                        <span class="summary-chip__label">Total</span>
                    </div>
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ summary.upcoming }}</span>
                        <span class="summary-chip__label">Válidos</span>
                    </div>
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ summary.used }}</span>
                        <span class="summary-chip__label">Usados</span>
                    </div>
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ summary.expired }}</span>
                        <span class="summary-chip__label">Expirados</span>
                    </div>
                </div>

                <div class="flex flex-column md:flex-row md:align-items-end md:justify-content-between gap-3 mb-4">
                    <div>
                        <h2 class="text-900 font-normal mb-2">Histórico</h2>
                        <span class="text-600 text-xl">Filtra por nome do evento ou estado</span>
                    </div>
                    <div class="tickets-filters">
                        <IconField iconPosition="left" class="w-full md:w-18rem">
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="searchQuery" placeholder="Pesquisar evento ou nº do bilhete..." class="w-full" />
                        </IconField>
                        <Dropdown
                            v-model="selectedStatus"
                            :options="statusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Estado"
                            showClear
                            class="w-full md:w-12rem"
                        />
                    </div>
                </div>

                <div v-if="isLoadingTickets" class="grid">
                    <div v-for="n in 2" :key="'load-' + n" class="col-12 md:col-6">
                        <Skeleton height="10rem" class="border-round-xl" />
                    </div>
                </div>

                <div v-else-if="hasTickets" class="grid">
                    <div v-for="ticket in ticketsList" :key="ticket.id" class="col-12 md:col-6">
                        <article class="ticket-card">
                            <img
                                :src="imageSrc(ticket.event)"
                                :alt="ticket.event?.name"
                                class="ticket-card__image"
                                @error="markBrokenImage(ticket.event?.id)"
                            />
                            <div class="ticket-card__body">
                                <div class="ticket-card__meta">
                                    <span v-if="isLiveTicket(ticket)">Acesso live</span>
                                    <span v-else>{{ ticketNumber(ticket) }}</span>
                                    <Tag
                                        v-if="isLiveTicket(ticket)"
                                        value="Live online"
                                        severity="danger"
                                    />
                                    <Tag
                                        v-else
                                        :value="resolveStatus(ticket).label"
                                        :severity="resolveStatus(ticket).severity"
                                    />
                                </div>
                                <h3 class="ticket-card__title">{{ ticket.event?.name || 'Evento' }}</h3>
                                <p class="ticket-card__line">
                                    <i class="pi pi-ticket mr-2" />
                                    {{ ticket.ticket?.name || 'Bilhete' }}
                                    <span v-if="ticket.sell?.price"> · {{ formatMoney(ticket.sell.price) }}</span>
                                </p>
                                <p v-if="isLiveTicket(ticket) && paymentReference(ticket)" class="ticket-card__line">
                                    <i class="pi pi-hashtag mr-2" />
                                    Ref. {{ paymentReference(ticket) }}
                                </p>
                                <p class="ticket-card__line">
                                    <i class="pi pi-calendar mr-2" />
                                    <span v-if="ticket.event?.start_date">
                                        {{ moment(ticket.event.start_date).format('LL') }}
                                        <span v-if="ticket.event.start_time">
                                            · {{ moment(ticket.event.start_time, 'HH:mm:ss').format('HH:mm') }}
                                        </span>
                                    </span>
                                    <span v-else>—</span>
                                </p>
                                <p class="ticket-card__line mb-3">
                                    <i class="pi pi-video mr-2" v-if="isLiveTicket(ticket)" />
                                    <i class="pi pi-map-marker mr-2" v-else />
                                    {{ isLiveTicket(ticket) ? 'Transmissão live — sem entrada no recinto' : eventLocation(ticket.event) }}
                                </p>
                                <div class="ticket-card__actions">
                                    <Button
                                        v-if="!isLiveTicket(ticket)"
                                        label="Ver QR"
                                        icon="pi pi-qrcode"
                                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                                        @click="openTicket(ticket)"
                                    />
                                    <Button
                                        v-else
                                        label="Ver acesso"
                                        icon="pi pi-video"
                                        class="p-button-rounded p-button-outlined"
                                        @click="openTicket(ticket)"
                                    />
                                    <Button
                                        v-if="!isLiveTicket(ticket)"
                                        label="Baixar"
                                        icon="pi pi-download"
                                        class="p-button-rounded p-button-outlined"
                                        :loading="downloadingId === ticket.id"
                                        :disabled="isDownloading"
                                        @click="downloadPhysicalTicket(ticket)"
                                    />
                                    <router-link v-if="ticket.event?.slug" :to="'/eventos/' + ticket.event.slug">
                                        <Button label="Evento" class="p-button-rounded p-button-outlined" />
                                    </router-link>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                <div v-else class="empty-block">
                    <h3 class="text-900 mt-0 mb-2">
                        {{ hasActiveFilters ? 'Nenhum bilhete encontrado' : 'Ainda não tens bilhetes' }}
                    </h3>
                    <p class="text-600 mb-3">
                        {{
                            hasActiveFilters
                                ? 'Ajusta a pesquisa ou limpa os filtros para ver mais resultados.'
                                : 'Explora eventos e compra o teu primeiro bilhete na Mticket.'
                        }}
                    </p>
                    <Button
                        v-if="hasActiveFilters"
                        label="Limpar filtros"
                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                        @click="clearFilters"
                    />
                    <router-link v-else to="/eventos">
                        <Button label="Ver eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
                    </router-link>
                </div>

                <div v-if="showPagination && !isLoadingTickets" class="pagination-wrap mt-5">
                    <Paginator
                        :rows="rowsPerPage"
                        :first="first"
                        :totalRecords="tickets.total || 0"
                        :rowsPerPageOptions="[9, 12, 24]"
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} bilhetes"
                        @page="onPage"
                    />
                </div>
                </template>

                <template v-else>
                <div class="summary-grid summary-grid--receipts mb-4">
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ receiptSummary.total }}</span>
                        <span class="summary-chip__label">Total</span>
                    </div>
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ receiptSummary.pending }}</span>
                        <span class="summary-chip__label">Por levantar</span>
                    </div>
                    <div class="summary-chip">
                        <span class="summary-chip__value">{{ receiptSummary.picked_up }}</span>
                        <span class="summary-chip__label">Levantados</span>
                    </div>
                </div>

                <div class="flex flex-column md:flex-row md:align-items-end md:justify-content-between gap-3 mb-4">
                    <div>
                        <h2 class="text-900 font-normal mb-2">Recibos da loja</h2>
                        <span class="text-600 text-xl">Compras feitas com a tua conta, para levantar no evento</span>
                    </div>
                    <div class="tickets-filters">
                        <IconField iconPosition="left" class="w-full md:w-18rem">
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="receiptSearch" placeholder="Pesquisar evento ou código..." class="w-full" />
                        </IconField>
                        <Dropdown
                            v-model="receiptStatus"
                            :options="receiptStatusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Estado"
                            showClear
                            class="w-full md:w-12rem"
                        />
                    </div>
                </div>

                <div v-if="isLoadingReceipts" class="grid">
                    <div v-for="n in 2" :key="'rload-' + n" class="col-12 md:col-6">
                        <Skeleton height="10rem" class="border-round-xl" />
                    </div>
                </div>

                <div v-else-if="hasReceipts" class="grid">
                    <div v-for="order in receiptsList" :key="'receipt-' + order.id" class="col-12 md:col-6">
                        <article class="ticket-card">
                            <img
                                :src="imageSrc(order.event)"
                                :alt="order.event?.name"
                                class="ticket-card__image"
                                @error="markBrokenImage(order.event?.id)"
                            />
                            <div class="ticket-card__body">
                                <div class="ticket-card__meta">
                                    <span>{{ order.qrcode }}</span>
                                    <Tag :value="receiptStatusMeta(order).label" :severity="receiptStatusMeta(order).severity" />
                                </div>
                                <h3 class="ticket-card__title">{{ order.event?.name || 'Evento' }}</h3>
                                <p class="ticket-card__line">
                                    <i class="pi pi-shopping-bag mr-2" />
                                    {{ receiptItemsLabel(order) }}
                                    <span> · {{ formatMoney(order.total) }}</span>
                                </p>
                                <p v-if="order.transaction?.reference" class="ticket-card__line">
                                    <i class="pi pi-hashtag mr-2" />
                                    Ref. {{ order.transaction.reference }}
                                </p>
                                <p class="ticket-card__line">
                                    <i class="pi pi-calendar mr-2" />
                                    <span v-if="order.event?.start_date">
                                        {{ moment(order.event.start_date).format('LL') }}
                                    </span>
                                    <span v-else-if="order.created_at">{{ moment(order.created_at).format('LL') }}</span>
                                    <span v-else>—</span>
                                </p>
                                <p class="ticket-card__line mb-3">
                                    <i class="pi pi-map-marker mr-2" />
                                    {{ eventLocation(order.event) }}
                                </p>
                                <div class="ticket-card__actions">
                                    <Button
                                        label="Ver QR"
                                        icon="pi pi-qrcode"
                                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                                        @click="openReceipt(order)"
                                    />
                                    <Button
                                        label="Baixar recibo"
                                        icon="pi pi-download"
                                        class="p-button-rounded p-button-outlined"
                                        :loading="receiptDownloadingId === order.id"
                                        @click="downloadReceipt(order)"
                                    />
                                    <router-link v-if="order.event?.slug" :to="'/eventos/' + order.event.slug">
                                        <Button label="Evento" class="p-button-rounded p-button-outlined" />
                                    </router-link>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                <div v-else class="empty-block">
                    <h3 class="text-900 mt-0 mb-2">
                        {{ hasReceiptFilters ? 'Nenhum recibo encontrado' : 'Ainda não tens recibos da loja' }}
                    </h3>
                    <p class="text-600 mb-3">
                        {{
                            hasReceiptFilters
                                ? 'Ajusta a pesquisa ou limpa os filtros para ver mais resultados.'
                                : 'As compras da loja feitas com a tua conta aparecem aqui, com o PDF de levantamento.'
                        }}
                    </p>
                    <Button
                        v-if="hasReceiptFilters"
                        label="Limpar filtros"
                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                        @click="clearReceiptFilters"
                    />
                    <router-link v-else to="/eventos">
                        <Button label="Ver eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
                    </router-link>
                </div>

                <div v-if="showReceiptPagination && !isLoadingReceipts" class="pagination-wrap mt-5">
                    <Paginator
                        :rows="rowsPerPage"
                        :first="receiptFirst"
                        :totalRecords="receipts.total || 0"
                        :rowsPerPageOptions="[9, 12, 24]"
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} recibos"
                        @page="onReceiptPage"
                    />
                </div>
                </template>
            </template>
        </section>
    </div>

    <Dialog
        v-model:visible="showTicketDialog"
        modal
        :header="selectedTicket?.event?.name || 'Bilhete'"
        :style="{ width: 'min(96vw, 1040px)' }"
        :breakpoints="{ '960px': '96vw' }"
    >
        <div v-if="selectedTicket" class="qr-dialog">
            <template v-if="isLiveTicket(selectedTicket)">
                <Tag value="Live online" severity="danger" class="mb-3" />
                <div class="live-dialog">
                    <i class="pi pi-video live-dialog__icon" />
                    <p class="qr-dialog__id">Acesso à transmissão live</p>
                    <p class="qr-dialog__type">{{ selectedTicket.ticket?.name }}</p>
                    <p v-if="paymentReference(selectedTicket)" class="live-dialog__ref">
                        Referência: {{ paymentReference(selectedTicket) }}
                    </p>
                    <p class="qr-dialog__meta">
                        <span v-if="selectedTicket.event?.start_date">
                            {{ moment(selectedTicket.event.start_date).format('LL') }}
                        </span>
                    </p>
                </div>
                <Message severity="warn" :closable="false" class="w-full mt-3">
                    Este acesso não tem QR Code e não é válido na entrada do evento.
                </Message>
            </template>
            <template v-else>
                <div class="dialog-ticket">
                    <DigitalTicket
                        :event="selectedTicket.event"
                        :code="ticketNumber(selectedTicket)"
                        :qr-value="qrValue(selectedTicket)"
                        :type-name="selectedTicket.ticket?.name"
                        :buyer-name="ticketBuyerName(selectedTicket)"
                        :price="selectedTicket.sell?.price"
                        :status="ticketStatusKey(selectedTicket)"
                    />
                </div>
                <div class="flex justify-content-end mt-3">
                    <Button
                        label="Baixar PDF"
                        icon="pi pi-download"
                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                        :loading="downloadingId === selectedTicket.id"
                        :disabled="isDownloading"
                        @click="downloadPhysicalTicket(selectedTicket)"
                    />
                </div>
            </template>
        </div>
    </Dialog>

    <Dialog
        v-model:visible="showReceiptDialog"
        modal
        :header="selectedReceipt?.event?.name || 'Recibo da loja'"
        :style="{ width: 'min(96vw, 640px)' }"
        :breakpoints="{ '960px': '96vw' }"
    >
        <div v-if="selectedReceipt" class="qr-dialog">
            <Tag :value="receiptStatusMeta(selectedReceipt).label" :severity="receiptStatusMeta(selectedReceipt).severity" class="mb-3" />
            <div class="qr-wrap">
                <qrcode-vue :value="selectedReceipt.qrcode" :size="180" level="H" render-as="svg" />
                <div class="qr-code">{{ selectedReceipt.qrcode }}</div>
            </div>
            <div class="receipt-lines">
                <div v-for="line in selectedReceipt.details" :key="line.id" class="receipt-line">
                    <span>{{ line.qtd }}× {{ line.product_name }}</span>
                    <strong>{{ formatMoney(line.total) }}</strong>
                </div>
                <div class="receipt-line receipt-line--total">
                    <span>Total</span>
                    <strong>{{ formatMoney(selectedReceipt.total) }}</strong>
                </div>
            </div>
            <p v-if="selectedReceipt.transaction?.reference" class="qr-dialog__meta mt-2 mb-0">
                Referência M-Pesa: {{ selectedReceipt.transaction.reference }}
            </p>
            <Message severity="info" :closable="false" class="w-full mt-3">
                Mostra este QR no evento. Podes também baixar o PDF ou fazer um screenshot.
            </Message>
            <div class="flex justify-content-end mt-3">
                <Button
                    label="Baixar recibo PDF"
                    icon="pi pi-download"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    :loading="receiptDownloadingId === selectedReceipt.id"
                    @click="downloadReceipt(selectedReceipt)"
                />
            </div>
        </div>
    </Dialog>

    <div v-if="captureTicket" id="ticket-pdf-source" class="ticket-pdf-source" aria-hidden="true">
        <DigitalTicket
            :event="captureTicket.event"
            :code="ticketNumber(captureTicket)"
            :qr-value="qrValue(captureTicket)"
            :type-name="captureTicket.ticket?.name"
            :buyer-name="ticketBuyerName(captureTicket)"
            :price="captureTicket.sell?.price"
            :status="ticketStatusKey(captureTicket)"
        />
    </div>
</template>

<style scoped>
.tickets-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.6s ease-out;
}

.tickets-hero__content {
    padding-top: 2.75rem;
    padding-bottom: 2.5rem;
}

.tickets-hero__eyebrow {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.tickets-hero__title {
    margin: 0 0 0.6rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
}

.tickets-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    max-width: 36rem;
}

.section-tabs {
    display: inline-flex;
    padding: 0.3rem;
    border: 1px solid var(--surface-border);
    border-radius: 999px;
    background: var(--surface-0);
    gap: 0.2rem;
}

.section-tab {
    border: 0;
    background: transparent;
    color: #64748b;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 0.55rem 1.1rem;
    border-radius: 999px;
    cursor: pointer;
}

.section-tab--active {
    background: #2563eb;
    color: #fff;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
}

.summary-grid--receipts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-chip {
    border: 1px solid var(--surface-border);
    border-radius: 0.9rem;
    padding: 0.9rem 1rem;
    background: var(--surface-0);
}

.summary-chip__value {
    display: block;
    font-size: 1.4rem;
    font-weight: 800;
    color: #2563eb;
}

.summary-chip__label {
    color: #64748b;
    font-size: 0.9rem;
}

.tickets-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    max-width: 34rem;
}

.ticket-card {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    overflow: hidden;
    background: var(--surface-0);
    height: 100%;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.ticket-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(15, 40, 80, 0.1);
}

.ticket-card__image {
    width: 100%;
    height: 100%;
    min-height: 11rem;
    object-fit: cover;
    background: #e8eef7;
}

.ticket-card__body {
    padding: 1rem 1rem 1rem 0;
}

.ticket-card__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    color: #64748b;
    font-size: 0.9rem;
}

.ticket-card__title {
    margin: 0 0 0.55rem;
    font-size: 1.15rem;
    color: #0f172a;
    line-height: 1.3;
}

.ticket-card__line {
    margin: 0 0 0.35rem;
    color: #475569;
    font-size: 0.95rem;
}

.ticket-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.empty-block {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
}

.qr-dialog {
    text-align: center;
}

.dialog-ticket {
    text-align: left;
    padding: 0.75rem;
    background: #eaf3f9;
    border-radius: 1.25rem;
}

.ticket-pdf-source {
    position: fixed;
    left: 0;
    top: 0;
    width: 980px;
    z-index: -1;
    pointer-events: none;
}

.qr-dialog__code {
    display: inline-flex;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
    background: #fff;
}

.qr-dialog__id {
    margin: 1rem 0 0.25rem;
    font-weight: 700;
    color: #0f172a;
}

.qr-dialog__type {
    margin: 0 0 0.35rem;
    color: #2563eb;
    font-weight: 600;
}

.qr-dialog__meta {
    margin: 0;
    color: #64748b;
}

.live-dialog {
    padding: 0.5rem 0 0.25rem;
}

.live-dialog__icon {
    font-size: 2.4rem;
    color: #dc2626;
}

.live-dialog__ref {
    margin: 0.65rem 0 0.35rem;
    font-weight: 700;
    color: #2563eb;
    letter-spacing: 0.03em;
}

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .summary-grid,
    .summary-grid--receipts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ticket-card {
        grid-template-columns: 1fr;
    }

    .ticket-card__image {
        min-height: 10rem;
        max-height: 12rem;
    }

    .ticket-card__body {
        padding: 0 1rem 1rem;
    }
}

.pagination-wrap {
    display: flex;
    justify-content: center;
}

.pagination-wrap :deep(.p-paginator) {
    background: transparent;
    border: none;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.qr-wrap {
    text-align: center;
    padding: 0.5rem 0 1rem;
}

.qr-code {
    margin-top: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #0f172a;
}

.receipt-lines {
    text-align: left;
    margin-top: 0.5rem;
}

.receipt-line {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--surface-border);
    color: #0f172a;
}

.receipt-line--total {
    border-bottom: 0;
    font-size: 1.05rem;
}

.receipt-line--total strong {
    color: #2563eb;
}
</style>
