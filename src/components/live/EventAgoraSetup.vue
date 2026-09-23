<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { closeTracks, createCameraAndMic, createLiveClient, mediaErrorMessage } from '@/service/agora';
import AgoraStage from '@/components/live/agora/AgoraStage.vue';
import LiveChat from '@/components/live/LiveChat.vue';
import { getEcho } from '@/service/realtime';

const props = defineProps({
    eventId: {
        type: [String, Number],
        required: true
    }
});

const emit = defineEmits(['changed']);

const toast = useToast();
const apiBase = computed(() => `${baseURL}/promotor-eventos/${props.eventId}/live-agora`);

const live = ref(null);
const pending = ref([]);
const accepted = ref([]);
const hostUid = ref(1);
const isLoading = ref(true);
const isSaving = ref(false);
const maxGuests = ref(1);
const disableDialog = ref(false);
const busyGuestId = ref(null);

const inStudio = ref(false);
const isJoining = ref(false);
const micOn = ref(true);
const camOn = ref(true);
const localTracks = shallowRef([]);
const remoteUsers = shallowRef([]);

let client = null;
let pollTimer = null;
let heartbeatTimer = null;

const statusMeta = {
    idle: { label: 'Fora do ar', severity: 'warning' },
    active: { label: 'Ao vivo', severity: 'danger' },
    disabled: { label: 'Desactivada', severity: 'secondary' }
};

const guestOptions = [
    { label: '1 convidado', value: 1 },
    { label: '2 convidados', value: 2 },
    { label: '3 convidados', value: 3 }
];

const currentStatus = computed(() => statusMeta[live.value?.status] || statusMeta.idle);
const isDisabled = computed(() => live.value?.status === 'disabled');
const canAcceptMore = computed(() => accepted.value.length < (live.value?.max_guests || 1));

const guestNameByUid = computed(() => {
    const map = {};
    accepted.value.forEach((guest) => {
        map[guest.uid] = guest.user?.name || 'Convidado';
    });
    return map;
});

const stageTiles = computed(() => {
    const tiles = [];
    if (inStudio.value) {
        tiles.push({
            key: 'local',
            track: camOn.value ? localTracks.value[1] : null,
            label: 'Tu (anfitrião)',
            mirror: true
        });
    }
    remoteUsers.value.forEach((user) => {
        tiles.push({
            key: `remote-${user.uid}`,
            track: user.videoTrack || null,
            label: guestNameByUid.value[user.uid] || 'Convidado'
        });
    });
    return tiles;
});

const avatarUrl = (user) => {
    if (!user?.image) return null;
    return String(user.image).startsWith('http') ? user.image : `${storageURL}${user.image}`;
};

const initials = (name) =>
    String(name || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

let hostChannel = null;

const subscribeHostChannel = async (eventId) => {
    if (!eventId || hostChannel) return;
    hostChannel = `live-host.${eventId}`;
    try {
        const echo = await getEcho();
        echo.private(hostChannel).listen('.guests.changed', () => {
            if (inStudio.value) sendHeartbeat();
            else load();
        });
    } catch {
        hostChannel = null;
    }
};

const applyPayload = (data) => {
    const previousPending = pending.value.length;
    live.value = data.live;
    subscribeHostChannel(data.live?.event_id);
    hostUid.value = data.host_uid || 1;
    pending.value = data.guests?.pending || [];
    accepted.value = data.guests?.accepted || [];
    if (data.live?.max_guests) {
        maxGuests.value = data.live.max_guests;
    }
    if (inStudio.value && pending.value.length > previousPending) {
        toast.add({ severity: 'info', summary: 'Novo pedido', detail: 'Alguém pediu para participar na live.', life: 3000 });
    }
};

const errorToast = (error, fallback) => {
    toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || fallback,
        life: 5000
    });
};

const load = async () => {
    try {
        const response = await axios.get(apiBase.value);
        applyPayload(response.data);
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
    try {
        const response = await axios.post(apiBase.value, { max_guests: maxGuests.value });
        applyPayload(response.data);
        emit('changed', response.data.live);
        toast.add({ severity: 'success', summary: 'Live interativa', detail: response.data.message, life: 4000 });
    } catch (error) {
        errorToast(error, 'Não foi possível criar a live interativa.');
    } finally {
        isSaving.value = false;
    }
};

const updateMaxGuests = async (value) => {
    try {
        const response = await axios.put(apiBase.value, { max_guests: value });
        applyPayload(response.data);
    } catch (error) {
        errorToast(error, 'Não foi possível actualizar o limite de convidados.');
    }
};

const refreshRemoteUsers = () => {
    remoteUsers.value = client ? client.remoteUsers.filter((user) => user.hasVideo || user.hasAudio) : [];
};

const bindClientEvents = () => {
    client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
            user.audioTrack?.play();
        }
        refreshRemoteUsers();
    });
    client.on('user-unpublished', refreshRemoteUsers);
    client.on('user-left', refreshRemoteUsers);
    client.on('token-privilege-will-expire', async () => {
        try {
            const response = await axios.post(`${apiBase.value}/host-token`);
            await client.renewToken(response.data.credentials.token);
        } catch {
            // the next heartbeat surfaces connection problems
        }
    });
};

const sendHeartbeat = async () => {
    try {
        const response = await axios.post(`${apiBase.value}/heartbeat`);
        applyPayload(response.data);
    } catch {
        // transient network error, retried on next tick
    }
};

const enterStudio = async () => {
    isJoining.value = true;
    try {
        const tokenResponse = await axios.post(`${apiBase.value}/host-token`);
        const credentials = tokenResponse.data.credentials;

        let tracks;
        try {
            tracks = await createCameraAndMic();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Câmara', detail: mediaErrorMessage(error), life: 6000 });
            return;
        }

        client = await createLiveClient();
        bindClientEvents();
        await client.setClientRole('host');
        await client.join(credentials.app_id, credentials.channel, credentials.token, credentials.uid);
        await client.publish(tracks);

        localTracks.value = tracks;
        micOn.value = true;
        camOn.value = true;
        inStudio.value = true;

        const startResponse = await axios.post(`${apiBase.value}/start`);
        applyPayload(startResponse.data);
        emit('changed', startResponse.data.live);

        clearInterval(pollTimer);
        heartbeatTimer = setInterval(sendHeartbeat, 5000);
        toast.add({ severity: 'success', summary: 'Ao vivo', detail: 'Estás a transmitir. Quem tem bilhete de live já te pode ver.', life: 4000 });
    } catch (error) {
        await releaseMedia();
        errorToast(error, 'Não foi possível entrar no estúdio.');
    } finally {
        isJoining.value = false;
    }
};

const releaseMedia = async () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    closeTracks(localTracks.value);
    localTracks.value = [];
    if (client) {
        try {
            await client.leave();
        } catch {
            // already left
        }
        client.removeAllListeners();
        client = null;
    }
    remoteUsers.value = [];
    inStudio.value = false;
};

const leaveStudio = async () => {
    isSaving.value = true;
    await releaseMedia();
    try {
        const response = await axios.post(`${apiBase.value}/stop`);
        applyPayload(response.data);
        emit('changed', response.data.live);
    } catch (error) {
        errorToast(error, 'Não foi possível terminar a live.');
    } finally {
        isSaving.value = false;
        startPolling();
    }
};

const toggleMic = async () => {
    const mic = localTracks.value[0];
    if (!mic) return;
    micOn.value = !micOn.value;
    await mic.setMuted(!micOn.value);
};

const toggleCam = async () => {
    const cam = localTracks.value[1];
    if (!cam) return;
    camOn.value = !camOn.value;
    await cam.setMuted(!camOn.value);
};

const guestAction = async (guest, action) => {
    busyGuestId.value = guest.id;
    try {
        const response = await axios.post(`${apiBase.value}/guests/${guest.id}/${action}`);
        applyPayload(response.data);
    } catch (error) {
        errorToast(error, 'Não foi possível actualizar o pedido.');
    } finally {
        busyGuestId.value = null;
    }
};

const confirmDisable = async () => {
    isSaving.value = true;
    try {
        if (inStudio.value) {
            await releaseMedia();
        }
        const response = await axios.delete(apiBase.value);
        applyPayload(response.data);
        emit('changed', response.data.live);
        disableDialog.value = false;
        toast.add({ severity: 'success', summary: 'Live desactivada', detail: response.data.message, life: 3000 });
    } catch (error) {
        errorToast(error, 'Não foi possível desactivar a live.');
    } finally {
        isSaving.value = false;
    }
};

const startPolling = () => {
    clearInterval(pollTimer);
    pollTimer = setInterval(() => {
        if (live.value && !inStudio.value && !isDisabled.value) {
            load();
        }
    }, 15000);
};

onMounted(() => {
    load();
    startPolling();
});

onBeforeUnmount(() => {
    clearInterval(pollTimer);
    if (hostChannel) {
        getEcho()
            .then((echo) => echo.leave(hostChannel))
            .catch(() => {});
    }
    if (inStudio.value) {
        releaseMedia();
        axios.post(`${apiBase.value}/stop`).catch(() => {});
    }
});
</script>

<template>
    <div class="card">
        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="flex align-items-center gap-2">
                <h5 class="m-0">Live interativa</h5>
                <Tag v-if="live" :value="currentStatus.label" :severity="currentStatus.severity" />
            </div>
            <Button v-if="!inStudio" icon="pi pi-refresh" text rounded :loading="isLoading" @click="load" />
        </div>

        <div v-if="isLoading">
            <Skeleton height="6rem" />
        </div>

        <div v-else-if="!live" class="live-empty">
            <i class="pi pi-users text-3xl text-primary mb-3" />
            <p class="text-600 mb-3">
                Transmite com a câmara directamente do navegador, com baixa latência. Quem estiver a assistir pode pedir para entrar na live e tu aceitas.
            </p>
            <div class="flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
                <span class="text-600 text-sm">Convidados em simultâneo:</span>
                <Dropdown v-model="maxGuests" :options="guestOptions" option-label="label" option-value="value" class="w-12rem" />
            </div>
            <Button label="Criar live interativa" icon="pi pi-plus" :loading="isSaving" @click="createLive" />
        </div>

        <div v-else>
            <Message v-if="isDisabled" severity="warn" :closable="false" class="mb-3">
                Esta live interativa está desactivada. Reactiva para voltar a transmitir.
            </Message>

            <div v-if="isDisabled" class="flex flex-wrap gap-2">
                <Button label="Reactivar live" icon="pi pi-replay" :loading="isSaving" @click="createLive" />
            </div>

            <template v-else>
                <div class="grid">
                    <div class="col-12 lg:col-8">
                        <AgoraStage
                            v-if="inStudio"
                            :tiles="stageTiles"
                            empty-text="A ligar a câmara…"
                        />
                        <div v-else class="studio-offline">
                            <i class="pi pi-video text-4xl mb-3" />
                            <p class="m-0 mb-3 text-center">Entra no estúdio para começares a transmitir com a tua câmara.</p>
                            <Button
                                label="Entrar no estúdio e começar"
                                icon="pi pi-circle-fill"
                                class="p-button-rounded"
                                severity="danger"
                                :loading="isJoining"
                                @click="enterStudio"
                            />
                        </div>

                        <div v-if="inStudio" class="flex flex-wrap gap-2 mt-3">
                            <Button
                                :icon="micOn ? 'pi pi-microphone' : 'pi pi-volume-off'"
                                :label="micOn ? 'Microfone' : 'Sem som'"
                                :outlined="micOn"
                                :severity="micOn ? 'secondary' : 'warning'"
                                @click="toggleMic"
                            />
                            <Button
                                :icon="camOn ? 'pi pi-video' : 'pi pi-eye-slash'"
                                :label="camOn ? 'Câmara' : 'Câmara desligada'"
                                :outlined="camOn"
                                :severity="camOn ? 'secondary' : 'warning'"
                                @click="toggleCam"
                            />
                            <Button label="Terminar live" icon="pi pi-stop-circle" severity="danger" :loading="isSaving" @click="leaveStudio" />
                        </div>
                    </div>

                    <div class="col-12 lg:col-4">
                        <div class="guest-panel">
                            <div class="flex align-items-center justify-content-between mb-2">
                                <span class="font-semibold">Pedidos para participar</span>
                                <Badge :value="pending.length" :severity="pending.length ? 'danger' : 'secondary'" />
                            </div>

                            <p v-if="!pending.length" class="text-500 text-sm m-0 mb-3">
                                {{ live.active ? 'Ainda ninguém pediu para entrar.' : 'Os pedidos aparecem quando estiveres ao vivo.' }}
                            </p>

                            <div v-for="guest in pending" :key="guest.id" class="guest-row">
                                <Avatar
                                    :image="avatarUrl(guest.user) || undefined"
                                    :label="avatarUrl(guest.user) ? undefined : initials(guest.user?.name)"
                                    shape="circle"
                                />
                                <span class="guest-name">{{ guest.user?.name || 'Participante' }}</span>
                                <Button
                                    icon="pi pi-check"
                                    rounded
                                    text
                                    severity="success"
                                    v-tooltip.top="canAcceptMore ? 'Aceitar' : 'Limite de convidados atingido'"
                                    :disabled="!canAcceptMore"
                                    :loading="busyGuestId === guest.id"
                                    @click="guestAction(guest, 'accept')"
                                />
                                <Button icon="pi pi-times" rounded text severity="danger" v-tooltip.top="'Recusar'" @click="guestAction(guest, 'reject')" />
                            </div>

                            <div class="flex align-items-center justify-content-between mt-3 mb-2">
                                <span class="font-semibold">Em directo contigo</span>
                                <span class="text-500 text-sm">{{ accepted.length }}/{{ live.max_guests }}</span>
                            </div>

                            <p v-if="!accepted.length" class="text-500 text-sm m-0">Nenhum convidado em directo.</p>

                            <div v-for="guest in accepted" :key="guest.id" class="guest-row">
                                <Avatar
                                    :image="avatarUrl(guest.user) || undefined"
                                    :label="avatarUrl(guest.user) ? undefined : initials(guest.user?.name)"
                                    shape="circle"
                                />
                                <span class="guest-name">{{ guest.user?.name || 'Convidado' }}</span>
                                <Button
                                    label="Remover"
                                    size="small"
                                    text
                                    severity="danger"
                                    :loading="busyGuestId === guest.id"
                                    @click="guestAction(guest, 'remove')"
                                />
                            </div>

                            <div class="mt-4">
                                <span class="text-500 text-sm block mb-1">Convidados em simultâneo</span>
                                <Dropdown
                                    v-model="maxGuests"
                                    :options="guestOptions"
                                    option-label="label"
                                    option-value="value"
                                    class="w-full"
                                    @change="updateMaxGuests($event.value)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-3">
                    <LiveChat :event-ref="live.event_id" height="18rem" />
                </div>

                <div v-if="!inStudio" class="flex flex-wrap gap-2 mt-3">
                    <Button label="Desactivar live interativa" icon="pi pi-ban" severity="danger" outlined @click="disableDialog = true" />
                </div>
            </template>
        </div>

        <Dialog v-model:visible="disableDialog" header="Desactivar live interativa" :style="{ width: '26rem' }" :modal="true" :draggable="false">
            <div class="flex align-items-start gap-3">
                <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mt-1" />
                <span class="line-height-3">Os espectadores deixam de poder entrar e os pedidos pendentes são recusados. Podes reactivar mais tarde.</span>
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

.studio-offline {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;
    border-radius: 1rem;
    background: #0f172a;
    color: #cbd5e1;
    padding: 1.5rem;
}

.guest-panel {
    border: 1px solid var(--surface-border);
    border-radius: 0.85rem;
    padding: 1rem;
    background: var(--surface-ground);
    height: 100%;
}

.guest-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--surface-border);
}

.guest-row:last-child {
    border-bottom: none;
}

.guest-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
