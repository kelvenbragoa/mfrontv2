<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
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

const statusOptions = [
    { label: 'Próximos', value: 'upcoming' },
    { label: 'Usados', value: 'used' },
    { label: 'Expirados', value: 'expired' }
];

const ticketsList = computed(() => tickets.value?.data || []);
const hasTickets = computed(() => ticketsList.value.length > 0);
const hasActiveFilters = computed(() => !!(searchQuery.value?.trim() || selectedStatus.value));
const showPagination = computed(() => (tickets.value?.last_page || 0) > 1);

const resolveStatus = (ticket) => {
    if (Number(ticket.status) === 1) {
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

const qrValue = (ticket) =>
    JSON.stringify({
        s: ticket.status,
        i: ticket.id,
        ie: ticket.event_id || ticket.event?.id
    });

const openTicket = (ticket) => {
    selectedTicket.value = ticket;
    showTicketDialog.value = true;
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

const debouncedSearch = debounce(() => {
    getData(1);
}, 400);

watch([searchQuery, selectedStatus], () => {
    if (!isLoadingDiv.value && isAuthenticated.value) {
        debouncedSearch();
    }
});

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = null;
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
                <p class="tickets-hero__subtitle">Consulta, apresenta o QR Code e gere o histórico das tuas compras.</p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div v-if="!isAuthenticated" class="empty-block">
                <h2 class="text-900 mt-0 mb-2">Inicia sessão para ver os teus bilhetes</h2>
                <p class="text-600 mb-3">Os bilhetes comprados com a tua conta aparecem aqui.</p>
                <div class="flex flex-wrap justify-content-center gap-2">
                    <Button label="Login" class="p-button-rounded border-none font-medium text-white bg-blue-500" @click="goToLogin" />
                    <router-link to="/register">
                        <Button label="Criar conta" class="p-button-rounded p-button-outlined" />
                    </router-link>
                </div>
            </div>

            <template v-else>
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
                            <InputText v-model="searchQuery" placeholder="Pesquisar evento..." class="w-full" />
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
                                    <span>#0{{ ticket.id }}</span>
                                    <Tag :value="resolveStatus(ticket).label" :severity="resolveStatus(ticket).severity" />
                                </div>
                                <h3 class="ticket-card__title">{{ ticket.event?.name || 'Evento' }}</h3>
                                <p class="ticket-card__line">
                                    <i class="pi pi-ticket mr-2" />
                                    {{ ticket.ticket?.name || 'Bilhete' }}
                                    <span v-if="ticket.sell?.price"> · {{ formatMoney(ticket.sell.price) }}</span>
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
                                    <i class="pi pi-map-marker mr-2" />
                                    {{ eventLocation(ticket.event) }}
                                </p>
                                <div class="ticket-card__actions">
                                    <Button
                                        label="Ver QR"
                                        icon="pi pi-qrcode"
                                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                                        @click="openTicket(ticket)"
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
        </section>
    </div>

    <Dialog
        v-model:visible="showTicketDialog"
        modal
        :header="selectedTicket?.event?.name || 'Bilhete'"
        :style="{ width: 'min(92vw, 28rem)' }"
        :breakpoints="{ '960px': '90vw' }"
    >
        <div v-if="selectedTicket" class="qr-dialog">
            <Tag :value="resolveStatus(selectedTicket).label" :severity="resolveStatus(selectedTicket).severity" class="mb-3" />
            <div class="qr-dialog__code">
                <qrcode-vue :value="qrValue(selectedTicket)" :size="180" level="H" render-as="svg" />
            </div>
            <p class="qr-dialog__id">Bilhete #0{{ selectedTicket.id }}</p>
            <p class="qr-dialog__type">{{ selectedTicket.ticket?.name }}</p>
            <p class="qr-dialog__meta">
                <span v-if="selectedTicket.event?.start_date">
                    {{ moment(selectedTicket.event.start_date).format('LL') }}
                </span>
                <span v-if="selectedTicket.event"> · {{ eventLocation(selectedTicket.event) }}</span>
            </p>
            <Message
                v-if="resolveStatus(selectedTicket).key === 'upcoming'"
                severity="info"
                :closable="false"
                class="w-full mt-3"
            >
                Apresenta este QR Code na entrada do evento.
            </Message>
            <Message v-else severity="warn" :closable="false" class="w-full mt-3">
                Este bilhete já não está válido para entrada.
            </Message>
        </div>
    </Dialog>
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

.summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
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

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .summary-grid {
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
</style>
