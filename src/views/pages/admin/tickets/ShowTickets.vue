<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import DigitalTicket from '@/components/ticket/DigitalTicket.vue';
import { useTicketPdf } from '@/composables/useTicketPdf';

const router = useRouter();
const toast = useToast();

const ticketId = router.currentRoute.value.params.id;

const isLoading = ref(true);
const loadError = ref(null);
const data = ref(null);
const resendDialog = ref(false);
const isResending = ref(false);
const resendForm = ref({
    email: '',
    mobile: ''
});

const { isDownloading, downloadTicketsBySelector, buildPdfBlobFromElements } = useTicketPdf();

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

const event = computed(() => data.value?.event ?? null);

const isValid = computed(() => Number(data.value?.status) === 1 && !data.value?.verified_at);

const isLiveTicket = computed(() => Boolean(data.value?.ticket?.is_live));

const statusTag = computed(() => {
    if (isLiveTicket.value) return { label: 'Live online', severity: 'danger' };
    if (!isValid.value) return { label: 'Validado à entrada', severity: 'secondary' };
    if (event.value?.end_date && moment().isAfter(moment(event.value.end_date).endOf('day'))) {
        return { label: 'Expirado', severity: 'warn' };
    }
    return { label: 'Por usar', severity: 'success' };
});

const ticketStatusKey = computed(() => {
    if (!data.value) return 'valid';
    if (Number(data.value.status) === 0 || data.value.verified_at) return 'used';
    if (event.value?.end_date && moment().isAfter(moment(event.value.end_date).endOf('day'))) return 'expired';
    return 'valid';
});

const ticketNumber = computed(() => data.value?.ticket_number || (data.value ? `#0${data.value.id}` : ''));

const qrValue = computed(() => {
    if (!data.value) return '';
    return data.value.qrcode || JSON.stringify({
        s: data.value.status,
        i: data.value.id,
        ie: data.value.event_id
    });
});

const ticketPrice = computed(() => data.value?.ticket?.price ?? data.value?.sell?.price ?? 0);

const copyReference = async () => {
    const reference = data.value?.sell?.transaction?.reference;
    if (!reference) return;

    try {
        await navigator.clipboard.writeText(reference);
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Referência copiada.', life: 2000 });
    } catch {
        toast.add({ severity: 'warn', summary: 'Não foi possível copiar', detail: reference, life: 4000 });
    }
};

const downloadTicket = async () => {
    try {
        await downloadTicketsBySelector('#admin-digital-ticket .ticket', event.value?.name || ticketNumber.value);
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível gerar o PDF.',
            life: 4000
        });
    }
};

const openResendDialog = () => {
    resendForm.value = {
        email: data.value?.email || data.value?.sell?.email || '',
        mobile: data.value?.mobile || data.value?.sell?.mobile || ''
    };
    resendDialog.value = true;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const submitResend = async () => {
    const email = resendForm.value.email?.trim();
    if (!email) {
        toast.add({ severity: 'warn', summary: 'Email obrigatório', detail: 'Indica o email do cliente.', life: 3000 });
        return;
    }

    isResending.value = true;
    try {
        const form = new FormData();
        form.append('email', email);
        form.append('mobile', resendForm.value.mobile?.trim() || '');

        if (!isLiveTicket.value) {
            await nextTick();
            await wait(200);
            const ticketEls = document.querySelectorAll('#admin-digital-ticket .ticket');
            const blob = await buildPdfBlobFromElements(ticketEls);
            if (!blob) {
                toast.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível gerar o PDF do bilhete.',
                    life: 4000
                });
                return;
            }
            form.append('pdf', blob, 'ticket.pdf');
        }

        const response = await axios.post(`${baseURL}/admin-tickets/${ticketId}/resend`, form);
        if (response.data.ticket) {
            data.value = response.data.ticket;
        } else {
            data.value.email = email;
            data.value.mobile = resendForm.value.mobile?.trim() || data.value.mobile;
        }

        resendDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Bilhete reenviado',
            detail: isLiveTicket.value
                ? 'O acesso foi enviado para o email indicado.'
                : 'O bilhete foi enviado para o email indicado.',
            life: 4000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível reenviar',
            detail: error?.response?.data?.message || 'Tenta novamente dentro de momentos.',
            life: 5000
        });
    } finally {
        isResending.value = false;
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

                <h4 class="mt-0 mb-1 text-900">{{ data.ticket_number || `Bilhete #${data.id}` }}</h4>
                <p class="text-600 mt-0 mb-4">
                    Emitido a {{ formatDateTime(data.created_at) }}
                </p>

                <div class="detail-grid">
                    <div>
                        <span class="detail-label">Nº do bilhete</span>
                        <span class="detail-value">{{ ticketNumber }}</span>
                    </div>
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
                        <span class="detail-value">{{ formatCurrency(ticketPrice) }}</span>
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

                <Message v-if="!isValid && !isLiveTicket" severity="info" :closable="false" class="mt-4">
                    Este bilhete já foi validado à entrada e não pode ser reutilizado.
                </Message>

                <div class="flex flex-wrap gap-2 mt-4">
                    <Button
                        v-if="!isLiveTicket"
                        label="Baixar PDF"
                        icon="pi pi-download"
                        outlined
                        :loading="isDownloading"
                        :disabled="isDownloading || isResending"
                        @click="downloadTicket"
                    />
                    <Button
                        label="Reenviar bilhete"
                        icon="pi pi-send"
                        class="border-none font-medium text-white bg-blue-500"
                        @click="openResendDialog"
                    />
                </div>
            </div>

            <div class="card">
                <h5 class="mt-0 mb-4">Bilhete</h5>

                <div v-if="isLiveTicket">
                    <Message severity="warn" :closable="false">
                        Este acesso é só para a live online. Não tem QR Code e não é válido na entrada.
                    </Message>
                </div>
                <div v-else id="admin-digital-ticket" class="admin-ticket-preview">
                    <div class="ticket-wrapper">
                        <DigitalTicket
                            :event="event"
                            :code="ticketNumber"
                            :qr-value="qrValue"
                            :type-name="data.ticket?.name"
                            :buyer-name="data.name"
                            :price="ticketPrice"
                            :status="ticketStatusKey"
                        />
                    </div>
                </div>
            </div>
        </template>

        <Dialog
            v-model:visible="resendDialog"
            header="Reenviar bilhete"
            :style="{ width: '28rem' }"
            :modal="true"
            :draggable="false"
        >
            <p class="text-600 mt-0 mb-3">
                Corrige o email ou o telemóvel se o cliente os escreveu mal. Gravamos os novos dados e reenviamos o bilhete.
            </p>
            <div class="field">
                <label for="resend-email">Email</label>
                <InputText id="resend-email" v-model="resendForm.email" type="email" class="w-full" />
            </div>
            <div class="field">
                <label for="resend-mobile">Telemóvel</label>
                <InputText id="resend-mobile" v-model="resendForm.mobile" class="w-full" />
                <small class="text-500">Se estiver preenchido, também tentamos enviar por WhatsApp.</small>
            </div>
            <template #footer>
                <Button label="Cancelar" text :disabled="isResending" @click="resendDialog = false" />
                <Button
                    label="Reenviar"
                    icon="pi pi-send"
                    :loading="isResending"
                    :disabled="isResending"
                    @click="submitResend"
                />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
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

.admin-ticket-preview {
    overflow-x: auto;
    padding: 1rem 0.75rem;
    background: #eaf3f9;
    border-radius: 1.25rem;
}

.ticket-wrapper {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
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
