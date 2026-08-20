<script setup>
import { computed, onMounted, ref } from 'vue';
import { storageURL, styleURL } from '@/service/ApiConstant';
import moment from 'moment';
import QrcodeVue from 'qrcode.vue';
import { usePaperizer } from 'paperizer';

const isLoadingDiv = ref(true);
const hasOrder = ref(false);
const orders = ref([]);
const isDownloading = ref(false);

const primaryOrder = computed(() => orders.value?.[0] || null);
const event = computed(() => primaryOrder.value?.event || null);

const buyerName = computed(() => primaryOrder.value?.name || 'Cliente');
const buyerEmail = computed(() => primaryOrder.value?.email || '');
const buyerMobile = computed(() => primaryOrder.value?.mobile || '');

const totalTickets = computed(() => {
    return (orders.value || []).reduce((sum, order) => sum + (order.selldetails?.length || 0), 0);
});

const totalAmount = computed(() => {
    return (orders.value || []).reduce((sum, order) => sum + Number(order.total || order.price * order.qty || 0), 0);
});

const locationLabel = computed(() => {
    if (!event.value) return '';
    const province = event.value.province?.name;
    if (event.value.address && province) return `${event.value.address}, ${province}`;
    return event.value.address || province || 'Local a anunciar';
});

const formatMoney = (value) => `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MT`;

const ticketNumber = (detail) => detail?.ticket_number || `#0${detail?.id ?? ''}`;

const qrValue = (detail) =>
    detail?.qrcode ||
    JSON.stringify({
        s: detail.status,
        i: detail.id,
        ie: detail.event_id
    });

const { paperize } = usePaperizer('myticket', {
    styles: [`${styleURL}/ticket.css?v=20260808`],
    windowTitle: 'Bilhetes Mticket'
});

const downloadTickets = async () => {
    isDownloading.value = true;
    try {
        await paperize();
    } finally {
        isDownloading.value = false;
    }
};

const getData = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('order'));
        if (Array.isArray(stored) && stored.length > 0) {
            orders.value = stored;
            hasOrder.value = true;
        } else {
            hasOrder.value = false;
        }
    } catch {
        hasOrder.value = false;
    } finally {
        isLoadingDiv.value = false;
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="order-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="10rem" class="mb-4 border-round-xl" />
        <Skeleton height="16rem" class="border-round-xl" />
    </div>

    <div v-else-if="!hasOrder" class="order-page px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Nenhuma encomenda encontrada</h2>
            <p class="text-600 mb-3">Conclui uma compra para veres os bilhetes aqui, ou consulta o histórico na tua conta.</p>
            <div class="flex flex-wrap justify-content-center gap-2">
                <router-link to="/eventos">
                    <Button label="Ver eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
                </router-link>
                <router-link to="/meusbilhetes">
                    <Button label="Meus bilhetes" class="p-button-rounded p-button-outlined" />
                </router-link>
            </div>
        </div>
    </div>

    <div v-else class="order-page">
        <section class="order-hero">
            <div class="order-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <div class="order-hero__badge">
                    <i class="pi pi-check-circle" />
                    Compra confirmada
                </div>
                <h1 class="order-hero__title">Obrigado, {{ buyerName }}!</h1>
                <p class="order-hero__subtitle">
                    Os teus bilhetes estão prontos. Guarda o QR Code e apresenta-o na entrada.
                </p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="grid">
                <div class="col-12 lg:col-4">
                    <aside class="summary-card">
                        <h2 class="detail-title">Resumo da encomenda</h2>

                        <div v-if="event" class="event-summary">
                            <img
                                :src="storageURL + event.image"
                                :alt="event.name"
                                class="event-summary__image"
                            />
                            <div>
                                <h3 class="event-summary__name">{{ event.name }}</h3>
                                <p class="event-summary__meta">
                                    <i class="pi pi-calendar mr-2" />
                                    {{ moment(event.start_date).format('LL') }}
                                    <span v-if="event.start_time"> · {{ moment(event.start_time, 'HH:mm:ss').format('HH:mm') }}</span>
                                </p>
                                <p class="event-summary__meta mb-0">
                                    <i class="pi pi-map-marker mr-2" />
                                    {{ locationLabel }}
                                </p>
                            </div>
                        </div>

                        <Divider />

                        <div class="summary-line">
                            <span>Bilhetes</span>
                            <strong>{{ totalTickets }}</strong>
                        </div>
                        <div class="summary-line">
                            <span>Total pago</span>
                            <strong class="summary-line__price">{{ formatMoney(totalAmount) }}</strong>
                        </div>

                        <Divider />

                        <p class="summary-contact mb-1"><i class="pi pi-envelope mr-2" />{{ buyerEmail }}</p>
                        <p class="summary-contact"><i class="pi pi-mobile mr-2" />{{ buyerMobile }}</p>

                        <Message severity="info" :closable="false" class="w-full mb-3">
                            Também enviámos o bilhete por email e WhatsApp, quando disponíveis.
                        </Message>

                        <Button
                            :label="isDownloading ? 'A preparar PDF...' : 'Baixar bilhetes'"
                            icon="pi pi-download"
                            class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 mb-2"
                            :loading="isDownloading"
                            :disabled="isDownloading"
                            @click="downloadTickets"
                        />
                        <router-link to="/meusbilhetes" class="w-full block mb-2">
                            <Button label="Ir para meus bilhetes" class="w-full p-button-rounded p-button-outlined" />
                        </router-link>
                        <router-link to="/eventos" class="w-full block">
                            <Button label="Explorar mais eventos" class="w-full p-button-rounded p-button-text" />
                        </router-link>
                    </aside>
                </div>

                <div class="col-12 lg:col-8">
                    <div class="detail-panel">
                        <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2 mb-3">
                            <div>
                                <h2 class="detail-title mb-1">Os teus bilhetes</h2>
                                <p class="detail-text mb-0">Apresenta o QR Code na portaria. Cada código é único.</p>
                            </div>
                            <Button
                                label="Baixar"
                                icon="pi pi-download"
                                class="p-button-rounded border-none font-medium text-white bg-blue-500"
                                :loading="isDownloading"
                                :disabled="isDownloading"
                                @click="downloadTickets"
                            />
                        </div>

                        <div id="myticket" class="tickets-print">
                            <div v-for="item in orders" :key="item.id" class="order-group">
                                <p class="order-group__label">Encomenda #{{ item.id }} · {{ item.ticket?.name || item.name }}</p>

                                <div class="ticket" v-for="detail in item.selldetails" :key="detail.id">
                                    <div class="left">
                                        <div class="image" :style="`background-image: url(${storageURL}${item.event.image})`">
                                            <p class="admit-one">
                                                <span>Mticket</span>
                                                <span>Mticket</span>
                                                <span>Mticket</span>
                                            </p>
                                            <div class="ticket-number">
                                                <p>{{ ticketNumber(detail) }}</p>
                                            </div>
                                        </div>
                                        <div class="ticket-info">
                                            <p class="date">
                                                <span>{{ moment(item.event.start_date).format('dddd') }}</span>
                                                <span class="june-29">{{ moment(item.event.start_date).format('D') }} - {{ moment(item.event.start_date).format('MM') }}</span>
                                                <span>{{ moment(item.event.start_date).format('YYYY') }}</span>
                                            </p>
                                            <div class="show-name">
                                                <h1>{{ item.event.name }}</h1>
                                                <h2>{{ item.name }}</h2>
                                                <h2>{{ item.ticket?.name }}</h2>
                                                <div class="cardticket">
                                                    <p>{{ item.ticket?.description }}</p>
                                                </div>
                                            </div>
                                            <div class="time">
                                                <p>{{ moment(item.event.start_time, 'HH:mm:ss').format('HH:mm') }}</p>
                                            </div>
                                            <p class="location">
                                                <span>{{ item.event.address }}</span>
                                                <span class="separator"> </span>
                                                <span>{{ item.event.province?.name }}, Moçambique</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="right">
                                        <p class="admit-one">
                                            <span>Mticket</span>
                                            <span>Mticket</span>
                                            <span>Mticket</span>
                                        </p>
                                        <div class="right-info-container">
                                            <div class="show-name">
                                                <h1>{{ item.event.name }}</h1>
                                            </div>
                                            <div class="time">
                                                <p>
                                                    {{ moment(item.event.start_time, 'HH:mm:ss').format('HH:mm') }}
                                                    até
                                                    {{ moment(item.event.end_time, 'HH:mm:ss').format('HH:mm') }}
                                                </p>
                                            </div>
                                            <div class="barcode">
                                                <qrcode-vue :value="qrValue(detail)" :size="100" level="H" render-as="svg" />
                                            </div>
                                            <p class="ticket-number">{{ ticketNumber(detail) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Staatliches&display=swap');

.order-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.6s ease-out;
}

.order-hero__content {
    padding-top: 2.75rem;
    padding-bottom: 2.5rem;
}

.order-hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.85rem;
    color: #dbeafe;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.85rem;
    animation: rise-in 0.55s ease-out both;
}

.order-hero__title {
    margin: 0 0 0.65rem;
    color: #fff;
    font-size: clamp(1.7rem, 3.8vw, 2.6rem);
    font-weight: 700;
    line-height: 1.15;
    animation: rise-in 0.65s ease-out 0.06s both;
}

.order-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    max-width: 36rem;
    animation: rise-in 0.65s ease-out 0.12s both;
}

.detail-panel,
.summary-card {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem;
    background: var(--surface-0);
}

.summary-card {
    position: sticky;
    top: 1.25rem;
    box-shadow: 0 10px 28px rgba(15, 40, 80, 0.08);
}

.detail-title {
    margin: 0 0 0.75rem;
    font-size: 1.35rem;
    color: #0f172a;
    font-weight: 600;
}

.detail-text {
    color: #64748b;
    line-height: 1.5;
}

.event-summary {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    gap: 0.85rem;
    align-items: start;
}

.event-summary__image {
    width: 5.5rem;
    height: 5.5rem;
    object-fit: cover;
    border-radius: 0.75rem;
    background: #e8eef7;
}

.event-summary__name {
    margin: 0 0 0.4rem;
    font-size: 1.05rem;
    color: #0f172a;
}

.event-summary__meta,
.summary-contact {
    margin: 0 0 0.35rem;
    color: #64748b;
    font-size: 0.95rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.55rem;
    color: #475569;
}

.summary-line__price {
    color: #2563eb;
}

.empty-block {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
}

.order-group {
    margin-bottom: 1.25rem;
}

.order-group__label {
    margin: 0 0 0.75rem;
    color: #64748b;
    font-weight: 600;
}

.tickets-print {
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 991px) {
    .summary-card {
        position: static;
    }
}

/* Mesma proporção do ticket.css (ecrã = impressão) */
.ticket {
    width: max-content;
    max-width: 100%;
    height: 250px;
    margin: 0 auto 12px;
    display: flex;
    background: white;
    color: black;
    font-family: 'Staatliches', cursive;
    font-size: 14px;
    letter-spacing: 0.1em;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
    box-sizing: border-box;
    overflow: hidden;
}

.left {
    display: flex;
    height: 250px;
    flex: 1 1 auto;
}

.image {
    position: relative;
    height: 250px;
    width: 250px;
    flex: 0 0 250px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.85;
}

.admit-one {
    position: absolute;
    color: darkgray;
    height: 250px;
    padding: 0 10px;
    letter-spacing: 0.15em;
    display: flex;
    text-align: center;
    justify-content: space-around;
    writing-mode: vertical-rl;
    transform: rotate(-180deg);
}

.admit-one span:nth-child(2) {
    color: white;
    font-weight: 700;
}

.left .ticket-number {
    height: 250px;
    width: 250px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 5px;
}

.ticket-info {
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: space-between;
    align-items: center;
    height: 250px;
    box-sizing: border-box;
    min-width: 280px;
}

.date {
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    padding: 5px 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.date span {
    width: 100px;
}

.date span:first-child {
    text-align: left;
}

.date span:last-child {
    text-align: right;
}

.date .june-29 {
    color: #d83565;
    font-size: 20px;
}

.show-name {
    font-size: 20px;
    font-family: 'Open Sans', cursive;
    color: #d83565;
}

.show-name h1 {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: black;
    margin: 0;
}

.show-name h2 {
    margin: 0.35rem 0 0;
    font-size: 1rem;
}

.time {
    padding: 10px 0;
    color: black;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-weight: 700;
}

.left .time {
    font-size: 16px;
}

.location {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid gray;
}

.right {
    position: relative;
    width: 180px;
    flex: 0 0 180px;
    height: 250px;
    border-left: 1px dashed #404040;
}

.right .admit-one {
    color: darkgray;
}

.right .admit-one span:nth-child(2) {
    color: gray;
}

.right .right-info-container {
    height: 250px;
    padding: 10px 10px 10px 35px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.right .show-name h1 {
    font-size: 18px;
}

.barcode {
    height: 100px;
}

.right .ticket-number {
    color: gray;
}

.cardticket {
    align-items: center;
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: space-between;
    max-width: 50ch;
}

.cardticket p {
    color: black;
    margin: 0;
}
</style>
