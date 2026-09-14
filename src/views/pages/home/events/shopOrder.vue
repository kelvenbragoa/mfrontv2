<script setup>
import { computed, onMounted, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { useShopReceiptPdf, receiptErrorMessage } from '@/composables/useShopReceiptPdf';

const toast = useToast();
const { downloadingId, downloadGuestReceipt } = useShopReceiptPdf();

const isLoadingDiv = ref(true);
const hasOrder = ref(false);
const order = ref(null);
const isLoggedIn = ref(false);

const event = computed(() => order.value?.event || null);
const details = computed(() => order.value?.details || []);
const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MT`;

const locationLabel = computed(() => {
    if (!event.value) return 'Evento';
    return [event.value.address, event.value.city?.name, event.value.province?.name].filter(Boolean).join(', ') || 'Evento';
});

const downloadReceipt = async () => {
    if (!order.value?.id || !order.value?.qrcode) return;
    try {
        await downloadGuestReceipt(order.value);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Recibo',
            detail: await receiptErrorMessage(error),
            life: 4000
        });
    }
};

onMounted(() => {
    try {
        isLoggedIn.value = !!(JSON.parse(localStorage.getItem('user')) && localStorage.getItem('token'));
        const stored = JSON.parse(localStorage.getItem('shop-order'));
        if (stored?.id && stored?.qrcode) {
            order.value = stored;
            hasOrder.value = true;
        }
    } catch {
        hasOrder.value = false;
    } finally {
        isLoadingDiv.value = false;
    }
});
</script>

<template>
    <div v-if="isLoadingDiv" class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="16rem" class="border-round-xl" />
    </div>

    <div v-else-if="!hasOrder" class="px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Sem encomenda da loja</h2>
            <p class="text-600 mb-3">Não encontrámos uma compra recente desta sessão.</p>
            <router-link to="/eventos">
                <Button label="Ver eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </router-link>
        </div>
    </div>

    <div v-else class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <div class="grid">
            <div class="col-12 lg:col-4">
                <aside class="summary-card">
                    <Tag value="Pago" severity="success" class="mb-3" />
                    <h2 class="detail-title">Levantamento</h2>
                    <p class="detail-text">Mostra este QR no evento de {{ event?.name }}.</p>
                    <div class="qr-wrap">
                        <qrcode-vue :value="order.qrcode" :size="180" level="H" render-as="svg" />
                        <div class="qr-code">{{ order.qrcode }}</div>
                    </div>
                    <p class="summary-contact mb-1"><i class="pi pi-user mr-2" />{{ order.name }}</p>
                    <p class="summary-contact mb-1"><i class="pi pi-envelope mr-2" />{{ order.email }}</p>
                    <p class="summary-contact"><i class="pi pi-mobile mr-2" />{{ order.mobile }}</p>
                    <Divider />
                    <p class="summary-contact mb-0">
                        <i class="pi pi-map-marker mr-2" />{{ locationLabel }}
                    </p>
                    <p v-if="event?.start_date" class="summary-contact mt-2 mb-0">
                        <i class="pi pi-calendar mr-2" />{{ moment(event.start_date).format('LL') }}
                    </p>
                    <Button
                        label="Baixar recibo PDF"
                        icon="pi pi-download"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 mt-3"
                        :loading="downloadingId === order.id"
                        @click="downloadReceipt"
                    />
                    <router-link v-if="isLoggedIn" to="/meusbilhetes" class="w-full block mt-2">
                        <Button label="Ver nos meus recibos" class="w-full p-button-rounded p-button-outlined" />
                    </router-link>
                    <router-link v-if="event?.slug" :to="'/eventos/' + event.slug" class="w-full block mt-2">
                        <Button label="Voltar ao evento" class="w-full p-button-rounded p-button-outlined" />
                    </router-link>
                </aside>
            </div>
            <div class="col-12 lg:col-8">
                <div class="detail-panel">
                    <h2 class="detail-title">A tua encomenda</h2>
                    <div v-for="line in details" :key="line.id" class="line">
                        <div>
                            <div class="line__name">{{ line.product_name }}</div>
                            <div class="line__meta">{{ line.qtd }} × {{ formatMoney(line.price) }}</div>
                        </div>
                        <strong>{{ formatMoney(line.total) }}</strong>
                    </div>
                    <Divider />
                    <div class="line line--total">
                        <span>Total</span>
                        <strong>{{ formatMoney(order.total) }}</strong>
                    </div>
                    <p v-if="order.transaction?.reference" class="text-600 mt-3 mb-0">
                        Referência M-Pesa: {{ order.transaction.reference }}
                    </p>
                    <Message severity="info" :closable="false" class="w-full mt-3 mb-0">
                        Guarda o PDF, o email ou um screenshot. Sem este código não levantas a encomenda.
                    </Message>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.detail-panel, .summary-card {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem;
    background: var(--surface-0);
}
.summary-card { box-shadow: 0 10px 28px rgba(15, 40, 80, 0.08); }
.detail-title { margin: 0 0 0.5rem; font-size: 1.35rem; color: #0f172a; font-weight: 600; }
.detail-text { margin: 0 0 1rem; color: #64748b; line-height: 1.5; }
.qr-wrap { text-align: center; padding: 1rem 0 1.25rem; }
.qr-code { margin-top: 0.75rem; font-weight: 800; letter-spacing: 0.18em; color: #0f172a; }
.summary-contact { margin: 0; color: #475569; }
.line { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px solid var(--surface-border); color: #0f172a; }
.line__name { font-weight: 700; }
.line__meta { color: #64748b; font-size: 0.9rem; }
.line--total { border-bottom: 0; font-size: 1.15rem; }
.line--total strong { color: #2563eb; }
.empty-block { border: 1px dashed var(--surface-border); border-radius: 1rem; padding: 2.5rem 1.5rem; text-align: center; background: var(--surface-50, #f8fafc); }
</style>
