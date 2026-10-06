<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import moment from 'moment';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import BatchDigitalTicket from '@/components/ticket/BatchDigitalTicket.vue';
import { useTicketPdf } from '@/composables/useTicketPdf';

const props = defineProps({
    invite: { type: Object, required: true }
});

const emit = defineEmits(['batch-created', 'batch-returned']);

const toast = useToast();
const { captureTicketEl, buildLayoutPdf } = useTicketPdf();
const batches = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isReturning = ref(false);
const loadingPdfKey = ref(null);
const pdfProgress = ref('');
const printItem = ref(null);
const printStage = ref(null);

const displayCreate = ref(false);
const displayReturn = ref(false);
const returningBatch = ref(null);

const form = ref(emptyForm());
const returnQty = ref(1);
const MAX_QTY = 500;

function emptyForm() {
    return {
        name: '',
        qty: 1
    };
}

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '—');

const loadBatches = async () => {
    if (!props.invite?.id) return;
    isLoading.value = true;
    try {
        const { data } = await axios.get(`${baseURL}/promotor-invites/${props.invite.id}/batches`);
        batches.value = data.batches || [];
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível carregar os lotes de convites.',
            life: 3500
        });
    } finally {
        isLoading.value = false;
    }
};

const openCreate = () => {
    form.value = emptyForm();
    form.value.name = props.invite?.name || '';
    form.value.qty = 1;
    displayCreate.value = true;
};

const closeCreate = () => {
    displayCreate.value = false;
    form.value = emptyForm();
};

const createBatch = async () => {
    const name = String(form.value.name || '').trim();
    if (!name) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Indica o nome do convite.', life: 3000 });
        return;
    }
    const qty = Number(form.value.qty);
    if (!qty || qty < 1 || qty > MAX_QTY) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: `Indica entre 1 e ${MAX_QTY} convites.`,
            life: 3000
        });
        return;
    }

    isSaving.value = true;
    try {
        const { data } = await axios.post(
            `${baseURL}/promotor-invites/${props.invite.id}/batches`,
            { name, qty },
            { timeout: 180000 }
        );
        if (data.batch) {
            batches.value.unshift(data.batch);
        }
        emit('batch-created', data.batch);
        toast.add({
            severity: 'success',
            summary: 'Lote gerado',
            detail: `${qty} convites gerados com o nome “${name}”.`,
            life: 3500
        });
        closeCreate();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível gerar o lote.',
            life: 4000
        });
    } finally {
        isSaving.value = false;
    }
};

const openReturn = (batch) => {
    returningBatch.value = batch;
    returnQty.value = Number(batch.unused) || 1;
    displayReturn.value = true;
};

const closeReturn = () => {
    displayReturn.value = false;
    returningBatch.value = null;
};

const confirmReturn = async () => {
    const batch = returningBatch.value;
    if (!batch) return;
    const qty = Number(returnQty.value);
    if (!qty || qty < 1 || qty > Number(batch.unused)) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: `Indica entre 1 e ${batch.unused} convites por usar.`,
            life: 3000
        });
        return;
    }

    isReturning.value = true;
    try {
        const { data } = await axios.post(
            `${baseURL}/promotor-invites/${props.invite.id}/batches/${batch.id}/return`,
            { qty }
        );
        const idx = batches.value.findIndex((item) => item.id === batch.id);
        if (idx >= 0 && data.batch) {
            batches.value.splice(idx, 1, data.batch);
        }
        emit('batch-returned', data.batch);
        toast.add({
            severity: 'success',
            summary: 'Devolvidos',
            detail: `${data.returned} convite(s) deixam de funcionar na entrada.`,
            life: 3500
        });
        closeReturn();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível devolver os convites.',
            life: 4000
        });
    } finally {
        isReturning.value = false;
    }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const qrValue = (detail) =>
    detail?.qrcode ||
    JSON.stringify({
        s: detail.status,
        i: detail.id,
        ie: detail.event_id
    });

const downloadPdf = async (batch, layout) => {
    if (!batch.unused) {
        toast.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Este lote não tem convites válidos para imprimir.',
            life: 3000
        });
        return;
    }

    loadingPdfKey.value = `${batch.id}-${layout}`;
    pdfProgress.value = 'A carregar convites…';
    try {
        const { data } = await axios.get(
            `${baseURL}/promotor-invites/${props.invite.id}/batches/${batch.id}/invites`
        );
        const units = data.invites || [];
        if (!units.length) {
            throw new Error('Este lote não tem convites válidos para imprimir.');
        }

        const canvases = [];
        const scale = 2;

        for (let i = 0; i < units.length; i++) {
            pdfProgress.value = `A gerar ${i + 1} / ${units.length}`;
            printItem.value = {
                event: data.event,
                inviteName: data.invite?.name || props.invite?.name,
                buyerName: units[i].name || data.buyer_name,
                batchNumber: data.batch_id ?? batch.id,
                detail: units[i]
            };
            await nextTick();
            await wait(60);

            const ticketEl = printStage.value?.querySelector('.ticket');
            if (!ticketEl) {
                throw new Error('Não foi possível desenhar o convite.');
            }
            const canvas = await captureTicketEl(ticketEl, scale);
            canvases.push({
                data: canvas.toDataURL('image/jpeg', 0.88),
                width: canvas.width,
                height: canvas.height
            });
        }

        const pdf = buildLayoutPdf(canvases, layout, scale);
        if (!pdf) {
            throw new Error('Não foi possível gerar o PDF.');
        }
        pdf.save(`convite-lote-${batch.id}-${layout}.pdf`);
        toast.add({
            severity: 'success',
            summary: layout === 'boca' ? 'PDF BOCA descarregado' : 'PDF A4 descarregado',
            life: 2500
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.message || error?.response?.data?.message || 'Não foi possível gerar o PDF.',
            life: 4000
        });
    } finally {
        printItem.value = null;
        pdfProgress.value = '';
        loadingPdfKey.value = null;
    }
};

watch(
    () => props.invite?.id,
    () => {
        batches.value = [];
        loadBatches();
    }
);

onMounted(loadBatches);

defineExpose({ loadBatches });
</script>

<template>
    <div class="card mb-3">
        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
                <h5 class="m-0">Lotes físicos</h5>
                <p class="text-600 mt-1 mb-0">
                    Gera convites para impressão. O layout é o mesmo dos bilhetes (A4 recortar / BOCA).
                </p>
            </div>
            <Button label="Gerar lote" icon="pi pi-ticket" @click="openCreate" />
        </div>
        <p v-if="pdfProgress" class="text-600 mt-0 mb-3">{{ pdfProgress }}</p>

        <div v-if="isLoading" class="text-center py-4">
            <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="8" />
        </div>

        <div v-else-if="batches.length === 0" class="empty-batches">
            <i class="pi pi-ticket text-3xl text-400 mb-2" />
            <p class="text-600 m-0">Ainda sem lotes neste tipo de convite.</p>
        </div>

        <div v-else class="batch-list">
            <div v-for="batch in batches" :key="batch.id" class="batch-row">
                <div class="batch-row__main">
                    <div class="flex flex-wrap align-items-center gap-2 mb-1">
                        <strong class="text-900">{{ batch.name }}</strong>
                        <Tag value="LOTE" />
                    </div>
                    <small class="text-600">
                        {{ formatDateTime(batch.created_at) }} · gerados {{ batch.issued }}
                    </small>
                    <div class="batch-stats mt-2">
                        <span>Usados {{ batch.used }}</span>
                        <span>Por usar {{ batch.unused }}</span>
                        <span>Devolvidos {{ batch.returned }}</span>
                    </div>
                </div>
                <div class="batch-row__actions">
                    <Button
                        label="A4 recortar"
                        icon="pi pi-print"
                        size="small"
                        :loading="loadingPdfKey === `${batch.id}-a4`"
                        :disabled="!batch.unused || !!loadingPdfKey"
                        title="Folha A4 vertical, 4 convites de lote"
                        @click="downloadPdf(batch, 'a4')"
                    />
                    <Button
                        label="BOCA"
                        icon="pi pi-download"
                        outlined
                        size="small"
                        :loading="loadingPdfKey === `${batch.id}-boca`"
                        :disabled="!batch.unused || !!loadingPdfKey"
                        title="Um convite de lote por página"
                        @click="downloadPdf(batch, 'boca')"
                    />
                    <Button
                        label="Devolver"
                        icon="pi pi-replay"
                        outlined
                        severity="warning"
                        size="small"
                        :disabled="!batch.unused"
                        @click="openReturn(batch)"
                    />
                </div>
            </div>
        </div>
    </div>

    <div ref="printStage" class="batch-print-stage" aria-hidden="true">
        <BatchDigitalTicket
            v-if="printItem"
            :event="printItem.event"
            :code="printItem.detail.invite_number || `#0${printItem.detail.id}`"
            :qr-value="qrValue(printItem.detail)"
            :type-name="printItem.inviteName"
            :buyer-name="printItem.buyerName"
            :price="'Convite'"
            :batch-number="printItem.batchNumber"
        />
    </div>

    <Dialog
        v-model:visible="displayCreate"
        modal
        header="Gerar lote de convites"
        :style="{ width: 'min(520px, 95vw)' }"
        @hide="closeCreate"
    >
        <p class="text-600 mt-0 mb-3">
            Cada convite impresso terá o nome indicado abaixo (igual aos lotes de bilhetes).
        </p>

        <div class="field">
            <label for="invite_batch_name">Nome no convite <span class="required">*</span></label>
            <InputText
                id="invite_batch_name"
                v-model="form.name"
                class="w-full"
                placeholder="Ex: Convidado VIP / Imprensa"
            />
        </div>

        <div class="field mb-0">
            <label for="invite_batch_qty">Quantidade <span class="required">*</span></label>
            <InputNumber
                id="invite_batch_qty"
                v-model="form.qty"
                class="w-full"
                :min="1"
                :max="MAX_QTY"
                showButtons
                placeholder="1 a 500"
            />
            <small class="text-600">Máximo {{ MAX_QTY }} convites por lote.</small>
        </div>

        <template #footer>
            <Button label="Cancelar" text :disabled="isSaving" @click="closeCreate" />
            <Button label="Gerar lote" icon="pi pi-check" :loading="isSaving" @click="createBatch" />
        </template>
    </Dialog>

    <Dialog
        v-model:visible="displayReturn"
        modal
        header="Devolver não usados"
        :style="{ width: 'min(460px, 95vw)' }"
        @hide="closeReturn"
    >
        <p v-if="returningBatch" class="text-600 mt-0">
            {{ returningBatch.name }} tem <strong>{{ returningBatch.unused }}</strong> convites por usar.
            Devolvidos deixam de funcionar na entrada.
        </p>
        <div class="field mb-0">
            <label for="invite_return_qty">Quantidade a devolver</label>
            <InputNumber
                id="invite_return_qty"
                v-model="returnQty"
                class="w-full"
                :min="1"
                :max="returningBatch?.unused || 1"
                showButtons
            />
        </div>
        <template #footer>
            <Button label="Cancelar" text :disabled="isReturning" @click="closeReturn" />
            <Button
                label="Devolver"
                icon="pi pi-replay"
                severity="warning"
                :loading="isReturning"
                @click="confirmReturn"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.required {
    color: #e24c4c;
}

.empty-batches {
    border: 1px dashed var(--surface-border);
    border-radius: 12px;
    padding: 2rem 1rem;
    text-align: center;
}

.batch-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.batch-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    justify-content: space-between;
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    background: var(--surface-ground);
}

.batch-row__main {
    min-width: 0;
    flex: 1;
}

.batch-row__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.batch-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

@media (max-width: 640px) {
    .batch-row {
        flex-direction: column;
    }
}

.batch-print-stage {
    position: fixed;
    left: 0;
    top: 0;
    width: 980px;
    opacity: 0.01;
    pointer-events: none;
    z-index: -1;
}
</style>
