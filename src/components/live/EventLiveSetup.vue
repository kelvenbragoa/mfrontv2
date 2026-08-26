<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/ApiConstant';
import EventLivePlayer from '@/components/live/EventLivePlayer.vue';

const props = defineProps({
    eventId: {
        type: [String, Number],
        required: true
    }
});

const toast = useToast();
const live = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isPreviewing = ref(false);
const playbackUrl = ref('');
const disableDialog = ref(false);
const revealKey = ref(false);
let pollTimer = null;

const statusMeta = {
    idle: { label: 'Aguardar transmissão', severity: 'warning' },
    active: { label: 'Ao vivo', severity: 'danger' },
    disabled: { label: 'Desactivada', severity: 'secondary' }
};

const currentStatus = computed(() => statusMeta[live.value?.status] || statusMeta.idle);
const isDisabled = computed(() => live.value?.status === 'disabled');
const maskedKey = computed(() => {
    const key = live.value?.stream_key || '';
    if (!key || revealKey.value) return key;
    return `${key.slice(0, 4)}${'•'.repeat(Math.max(key.length - 8, 4))}${key.slice(-4)}`;
});

const loadLive = async () => {
    try {
        const response = await axios.get(`${baseURL}/promotor-eventos/${props.eventId}/live`);
        live.value = response.data.live;
    } catch (error) {
        if (error?.response?.status === 404) {
            live.value = null;
        }
    } finally {
        isLoading.value = false;
    }
};

const createLive = async () => {
    isSaving.value = true;
    const wasDisabled = isDisabled.value;

    try {
        const response = await axios.post(`${baseURL}/promotor-eventos/${props.eventId}/live`);
        live.value = response.data.live;
        toast.add({
            severity: 'success',
            summary: wasDisabled ? 'Live reactivada' : 'Live criada',
            detail: response.data.message,
            life: 4000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível criar a live.',
            life: 5000
        });
    } finally {
        isSaving.value = false;
    }
};

const copyValue = async (value, label) => {
    try {
        await navigator.clipboard.writeText(value);
        toast.add({ severity: 'success', summary: 'Copiado', detail: `${label} copiado.`, life: 2000 });
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar.', life: 3000 });
    }
};

const startPreview = async () => {
    isPreviewing.value = true;

    try {
        const response = await axios.get(`${baseURL}/promotor-eventos/${props.eventId}/live/playback`);
        playbackUrl.value = response.data.url;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível carregar o preview.',
            life: 4000
        });
        isPreviewing.value = false;
    }
};

const confirmDisable = async () => {
    isSaving.value = true;

    try {
        const response = await axios.delete(`${baseURL}/promotor-eventos/${props.eventId}/live`);
        live.value = response.data.live;
        playbackUrl.value = '';
        isPreviewing.value = false;
        disableDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Live desactivada',
            detail: response.data.message,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível desactivar a live.',
            life: 4000
        });
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    loadLive();
    pollTimer = setInterval(() => {
        if (live.value && live.value.status !== 'disabled') {
            loadLive();
        }
    }, 15000);
});

onBeforeUnmount(() => {
    if (pollTimer) {
        clearInterval(pollTimer);
    }
});
</script>

<template>
    <div class="card">
        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="flex align-items-center gap-2">
                <h5 class="m-0">Live stream</h5>
                <Tag v-if="live" :value="currentStatus.label" :severity="currentStatus.severity" />
            </div>
            <Button icon="pi pi-refresh" text rounded :loading="isLoading" @click="loadLive" />
        </div>

        <div v-if="isLoading">
            <Skeleton height="6rem" />
        </div>

        <div v-else-if="!live" class="live-empty">
            <i class="pi pi-video text-3xl text-primary mb-3" />
            <p class="text-600 mb-3">Cria uma live para este evento. Depois cola o servidor e a stream key no OBS.</p>
            <Button label="Criar live" icon="pi pi-plus" :loading="isSaving" @click="createLive" />
        </div>

        <div v-else>
            <Message v-if="isDisabled" severity="warn" :closable="false" class="mb-3">
                Esta live está desactivada. Reactiva para voltar a transmitir com as mesmas credenciais.
            </Message>

            <div class="live-fields">
                <div>
                    <span class="live-label">Servidor RTMP (OBS)</span>
                    <div class="live-copy">
                        <code>{{ live.rtmp_url }}</code>
                        <Button icon="pi pi-copy" text rounded v-tooltip.top="'Copiar'" @click="copyValue(live.rtmp_url, 'Servidor')" />
                    </div>
                </div>
                <div>
                    <span class="live-label">Stream key</span>
                    <div class="live-copy">
                        <code>{{ maskedKey }}</code>
                        <Button
                            :icon="revealKey ? 'pi pi-eye-slash' : 'pi pi-eye'"
                            text
                            rounded
                            v-tooltip.top="revealKey ? 'Ocultar' : 'Mostrar'"
                            @click="revealKey = !revealKey"
                        />
                        <Button icon="pi pi-copy" text rounded v-tooltip.top="'Copiar'" @click="copyValue(live.stream_key, 'Stream key')" />
                    </div>
                </div>
            </div>

            <p class="text-600 text-sm mt-3 mb-3">
                No OBS: Definições → Stream → Serviço Customizado. Cola o servidor e a stream key. Quando começares a transmitir, o estado passa a
                <strong>Ao vivo</strong>.
            </p>

            <div class="flex flex-wrap gap-2">
                <Button v-if="isDisabled" label="Reactivar live" icon="pi pi-replay" :loading="isSaving" @click="createLive" />
                <Button v-else label="Pré-visualizar" icon="pi pi-play" outlined :loading="isPreviewing && !playbackUrl" @click="startPreview" />
                <Button v-if="!isDisabled" label="Desactivar" icon="pi pi-ban" severity="danger" outlined @click="disableDialog = true" />
            </div>

            <div v-if="playbackUrl" class="mt-4">
                <EventLivePlayer :src="playbackUrl" />
                <p v-if="live.status !== 'active'" class="text-500 text-sm mt-2 mb-0">
                    Se o ecrã estiver preto, a transmissão ainda não começou no OBS.
                </p>
            </div>
        </div>

        <Dialog v-model:visible="disableDialog" header="Desactivar live" :style="{ width: '26rem' }" :modal="true" :draggable="false">
            <div class="flex align-items-start gap-3">
                <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mt-1" />
                <span class="line-height-3">A live deixa de aceitar transmissão no OBS. Podes reactivar mais tarde com a mesma stream key.</span>
            </div>
            <template #footer>
                <Button label="Voltar" text :disabled="isSaving" @click="disableDialog = false" />
                <Button label="Desactivar" icon="pi pi-ban" severity="danger" :loading="isSaving" @click="confirmDisable" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.live-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem 1rem;
}

.live-fields {
    display: grid;
    gap: 1rem;
}

.live-label {
    display: block;
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
}

.live-copy {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.55rem 0.75rem;
    background: var(--surface-ground);
    border-radius: 0.65rem;
    border: 1px solid var(--surface-border);
}

.live-copy code {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
}
</style>
