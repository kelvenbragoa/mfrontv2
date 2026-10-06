<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import DigitalTicket from '@/components/ticket/DigitalTicket.vue';
import { useTicketPdf } from '@/composables/useTicketPdf';

const router = useRouter();
const toast = useToast();
const { isDownloading, downloadTicketsBySelector } = useTicketPdf();

const isLoadingDiv = ref(true);
const retriviedData = ref(null);

const inviteNumber = computed(
    () => retriviedData.value?.invite_number || `#0${retriviedData.value?.id ?? ''}`
);

const inviteQrValue = computed(() => {
    const invite = retriviedData.value;
    if (!invite) return '';
    return (
        invite.qrcode ||
        JSON.stringify({
            s: invite.status,
            i: invite.id,
            ie: invite.event_id
        })
    );
});

const ticketStatusKey = computed(() => {
    const status = Number(retriviedData.value?.status);
    if (status === 0) return 'used';
    if (status === 2) return 'cancelled';
    return 'valid';
});

const statusLabel = computed(() => {
    const status = Number(retriviedData.value?.status);
    if (status === 0) return 'Usado';
    if (status === 2) return 'Devolvido';
    if (status === 1) return 'Válido';
    return '—';
});

const statusSeverity = computed(() => {
    const status = Number(retriviedData.value?.status);
    if (status === 0) return 'danger';
    if (status === 2) return 'warning';
    if (status === 1) return 'success';
    return 'secondary';
});

function goBackUsingBack() {
    router?.back();
}

const downloadInvite = async () => {
    try {
        await downloadTicketsBySelector(
            '#invite-digital-ticket .ticket',
            retriviedData.value?.event?.name || inviteNumber.value
        );
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Convite descarregado com sucesso.',
            life: 2500
        });
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível gerar o PDF.',
            life: 4000
        });
    }
};

const getData = () => {
    axios
        .get(`${baseURL}/promotor-customers/${router.currentRoute.value.params.idcliente}`)
        .then((response) => {
            retriviedData.value = response.data.customer;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: error?.response?.data?.message || 'Não foi possível carregar o convite.',
                life: 3000
            });
            goBackUsingBack();
        });
};

onMounted(getData);
</script>

<template>
    <div class="card" v-if="!isLoadingDiv && retriviedData">
        <div class="col-12">
            <div class="card-w-title flex flex-wrap align-items-center gap-2 mb-3">
                <Button label="Voltar" icon="pi pi-angle-left" class="mr-2 mb-2" @click="goBackUsingBack" />
                <Button
                    label="Baixar PDF"
                    icon="pi pi-download"
                    class="mr-2 mb-2"
                    outlined
                    :loading="isDownloading"
                    :disabled="isDownloading || Number(retriviedData.status) === 2"
                    @click="downloadInvite"
                />
            </div>

            <p class="mt-0 mb-2">Detalhes do convite</p>
            <p><strong>Nº: </strong>{{ inviteNumber }}</p>
            <p><strong>Evento: </strong>{{ retriviedData.event?.name }}</p>
            <p><strong>Tipo: </strong>{{ retriviedData.invite?.name }}</p>
            <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
            <p class="mb-0">
                <strong>Estado: </strong>
                <Tag :value="statusLabel" :severity="statusSeverity" />
            </p>

            <hr />

            <div class="card mt-3 mb-0">
                <h5 class="mt-0 mb-4">Convite</h5>
                <div id="invite-digital-ticket" class="invite-ticket-preview">
                    <div class="ticket-wrapper">
                        <DigitalTicket
                            :event="retriviedData.event"
                            :code="inviteNumber"
                            :qr-value="inviteQrValue"
                            :type-name="retriviedData.invite?.name || 'Convite'"
                            :buyer-name="retriviedData.name"
                            :price="'Convite'"
                            :status="ticketStatusKey"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner
            style="width: 50px; height: 50px"
            strokeWidth="8"
            fill="var(--surface-ground)"
            animationDuration=".5s"
            aria-label="Custom ProgressSpinner"
        />
        <p>Por Favor Aguarde...</p>
    </div>
</template>

<style scoped>
.invite-ticket-preview {
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
</style>
