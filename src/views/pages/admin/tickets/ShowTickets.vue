<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import QrcodeVue from 'qrcode.vue';

const router = useRouter();
const toast = useToast();

const ticketId = router.currentRoute.value.params.id;

const isLoading = ref(true);
const loadError = ref(null);
const data = ref(null);

const getData = async () => {
    isLoading.value = true;

    try {
        const response = await axios.get(`${baseURL}/admin-tickets/${ticketId}`);

        if (!response.data.ticket) {
            loadError.value = 'Bilhete não encontrado.';
            return;
        }

        data.value = response.data.ticket;
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;

        if (status === 404) {
            loadError.value = 'Bilhete não encontrado.';
        } else if (status === 403) {
            loadError.value = 'Não tens permissão para ver este bilhete.';
        } else {
            loadError.value = 'Não foi possível carregar o bilhete. Tenta novamente.';
        }
    } finally {
        isLoading.value = false;
    }
};

const goBack = () => router.back();

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

const formatTime = (value) => (value ? moment(value, 'HH:mm:ss').format('HH:mm') : '--');

const event = computed(() => data.value?.event ?? null);

const isValid = computed(() => Number(data.value?.status) === 1);

const statusTag = computed(() =>
    isValid.value ? { label: 'Por usar', severity: 'success' } : { label: 'Validado à entrada', severity: 'secondary' }
);

const qrValue = computed(() => {
    if (!data.value) return '';
    return JSON.stringify({ s: data.value.status, i: data.value.id, ie: data.value.event_id });
});

const eventImage = computed(() => (event.value?.image ? `${storageURL}${event.value.image}` : '/demo/images/mticket.jpg'));

const copyReference = async () => {
    const reference = data.value?.sell?.transaction?.reference;
    if (!reference) return;

    try {
        await navigator.clipboard.writeText(reference);
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Referência copiada.', life: 2000 });
    } catch (error) {
        toast.add({ severity: 'warn', summary: 'Não foi possível copiar', detail: reference, life: 4000 });
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="admin-ticket-show">
        <div v-if="isLoading" class="card">
            <Skeleton width="10rem" height="1.5rem" class="mb-4" />
            <Skeleton height="8rem" class="mb-3" />
            <Skeleton height="16rem" />
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Não foi possível abrir o bilhete</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <div class="flex gap-2">
                <Button label="Voltar" icon="pi pi-angle-left" outlined @click="goBack" />
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>
        </div>

        <template v-else>
            <div class="card">
                <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                    <Button label="Voltar" icon="pi pi-angle-left" text @click="goBack" />
                    <Tag :severity="statusTag.severity" :value="statusTag.label" />
                </div>

                <h4 class="mt-0 mb-1 text-900">Bilhete #{{ data.id }}</h4>
                <p class="text-600 mt-0 mb-4">
                    Emitido a {{ formatDateTime(data.created_at) }}
                </p>

                <div class="detail-grid">
                    <div>
                        <span class="detail-label">Evento</span>
                        <router-link v-if="event" :to="`/admin/eventos/${event.id}`" class="detail-value text-primary no-underline">
                            {{ event.name }}
                        </router-link>
                        <span v-else class="detail-value">Evento indisponível</span>
                    </div>
                    <div>
                        <span class="detail-label">Tipo de bilhete</span>
                        <span class="detail-value">{{ data.ticket?.name || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Valor</span>
                        <span class="detail-value">{{ formatCurrency(data.ticket?.price ?? data.sell?.price) }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Data do evento</span>
                        <span class="detail-value">{{ event ? formatDate(event.start_date) : '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Comprador</span>
                        <span class="detail-value">{{ data.name || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Email</span>
                        <span class="detail-value">{{ data.email || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Telefone</span>
                        <span class="detail-value">{{ data.mobile || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Referência da transação</span>
                        <span class="detail-value flex align-items-center gap-2">
                            {{ data.sell?.transaction?.reference || '--' }}
                            <Button
                                v-if="data.sell?.transaction?.reference"
                                icon="pi pi-copy"
                                text
                                rounded
                                size="small"
                                severity="secondary"
                                v-tooltip.top="'Copiar referência'"
                                @click="copyReference"
                            />
                        </span>
                    </div>
                </div>

                <Message v-if="!isValid" severity="info" :closable="false" class="mt-4">
                    Este bilhete já foi validado à entrada e não pode ser reutilizado.
                </Message>
            </div>

            <div class="card">
                <h5 class="mt-0 mb-4">Bilhete</h5>

                <div class="ticket-wrapper">
                    <div class="ticket">
                        <div class="left">
                            <div class="image" :style="{ backgroundImage: `url(${eventImage})` }">
                                <p class="admit-one">
                                    <span>Mticket</span>
                                    <span>Mticket</span>
                                    <span>Mticket</span>
                                </p>
                                <div class="ticket-number">
                                    <p>#0{{ data.id }}</p>
                                </div>
                            </div>
                            <div class="ticket-info">
                                <p class="date">
                                    <span>{{ event ? moment(event.start_date).format('dddd') : '--' }}</span>
                                    <span class="day-month">
                                        {{ event ? moment(event.start_date).format('D') : '--' }} -
                                        {{ event ? moment(event.start_date).format('MM') : '--' }}
                                    </span>
                                    <span>{{ event ? moment(event.start_date).format('YYYY') : '--' }}</span>
                                </p>
                                <div class="show-name">
                                    <h1>{{ event?.name || 'Evento' }}</h1>
                                    <br />
                                    <h2>{{ data.name }}</h2>
                                    <h2>{{ data.ticket?.name }}</h2>
                                    <div class="cardticket">
                                        <p>{{ data.ticket?.description }}</p>
                                    </div>
                                </div>
                                <div class="time">
                                    <p>{{ formatTime(event?.start_time) }}</p>
                                </div>
                                <p class="location">
                                    <span>{{ event?.address || '--' }}</span>
                                    <span class="separator"> </span>
                                    <span>{{ event?.province?.name ? `${event.province.name}, Moçambique` : 'Moçambique' }}</span>
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
                                    <h1>{{ event?.name || 'Evento' }}</h1>
                                </div>
                                <div class="time">
                                    <p>{{ formatTime(event?.start_time) }} até {{ formatTime(event?.end_time) }}</p>
                                </div>
                                <div class="barcode">
                                    <qrcode-vue :value="qrValue" :size="100" level="H" render-as="svg" />
                                </div>
                                <p class="ticket-number">#0{{ data.id }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Staatliches&display=swap');

.detail-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.25rem;
}

.detail-label {
    display: block;
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}

.detail-value {
    color: var(--text-color);
    font-weight: 500;
    word-break: break-word;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

.ticket-wrapper {
    overflow-x: auto;
    padding-bottom: 0.5rem;
}

.ticket {
    margin: auto;
    display: flex;
    width: max-content;
    background: white;
    color: black;
    font-family: 'Staatliches', cursive;
    font-size: 14px;
    letter-spacing: 0.1em;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
}

.left {
    display: flex;
}

.image {
    height: 250px;
    width: 250px;
    background-size: cover;
    background-position: center;
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

.date .day-month {
    color: #d83565;
    font-size: 20px;
}

.show-name {
    font-size: 20px;
    font-family: 'Open Sans', cursive;
    color: #d83565;
}

.show-name h1 {
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: black;
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

.location .separator {
    font-size: 20px;
}

.right {
    width: 180px;
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
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: space-between;
    align-items: center;
    max-width: 50ch;
}

.cardticket p {
    color: black;
}

@media (max-width: 991px) {
    .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 575px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }
}
</style>
