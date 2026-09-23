<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/ApiConstant';
import { closeTracks, createCameraAndMic, createLiveClient, loadAgora, mediaErrorMessage } from '@/service/agora';
import AgoraStage from '@/components/live/agora/AgoraStage.vue';
import LiveChat from '@/components/live/LiveChat.vue';
import { currentUserId, getEcho } from '@/service/realtime';

const props = defineProps({
    eventId: {
        type: [String, Number],
        required: true
    },
    checkoutPath: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['status']);

const route = useRoute();
const router = useRouter();
const toast = useToast();
const apiBase = computed(() => `${baseURL}/eventos/${props.eventId}/live-agora`);

const live = ref(null);
const isLoading = ref(true);
const isJoining = ref(false);
const isBusy = ref(false);
const joined = ref(false);
const role = ref('audience');
const guest = ref(null);
const hostUid = ref(1);
const watchError = ref('');
const needsAudioUnlock = ref(false);
const micOn = ref(true);
const camOn = ref(true);
const localTracks = shallowRef([]);
const remoteUsers = shallowRef([]);

let client = null;
let statusTimer = null;
let guestTimer = null;

const isActive = computed(() => live.value?.status === 'active');
const hasLive = computed(() => Boolean(live.value) && live.value.status !== 'disabled');
const isLoggedIn = computed(() => Boolean(localStorage.getItem('token')));
const guestStatus = computed(() => guest.value?.status || null);
const isOnStage = computed(() => role.value === 'guest');

const stageTiles = computed(() => {
    const users = [...remoteUsers.value].sort((a, b) => (a.uid === hostUid.value ? -1 : b.uid === hostUid.value ? 1 : 0));
    const tiles = users.map((user) => ({
        key: `remote-${user.uid}`,
        track: user.videoTrack || null,
        label: user.uid === hostUid.value ? 'Anfitrião' : 'Convidado'
    }));
    if (isOnStage.value) {
        tiles.push({
            key: 'local',
            track: camOn.value ? localTracks.value[1] : null,
            label: 'Tu',
            mirror: true
        });
    }
    return tiles;
});

const loadStatus = async () => {
    try {
        const response = await axios.get(apiBase.value);
        live.value = response.data.live;
        emit('status', live.value);
    } catch {
        live.value = null;
    } finally {
        isLoading.value = false;
    }
};

const goToLogin = () => {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
};

const handleRequestError = (error, fallback) => {
    const status = error?.response?.status;
    if (status === 401) {
        goToLogin();
    } else if (status === 403) {
        watchError.value = error?.response?.data?.message || 'Precisas de um bilhete de live para ver esta transmissão.';
    } else {
        toast.add({ severity: 'error', summary: 'Erro', detail: error?.response?.data?.message || fallback, life: 5000 });
    }
};

const refreshRemoteUsers = () => {
    remoteUsers.value = client ? client.remoteUsers.filter((user) => user.hasVideo || user.hasAudio) : [];
};

const renewToken = async () => {
    try {
        if (role.value === 'guest') {
            const response = await axios.get(`${apiBase.value}/guest`);
            const token = response.data.guest?.credentials?.token;
            if (token) await client.renewToken(token);
        } else {
            const response = await axios.get(`${apiBase.value}/join`);
            await client.renewToken(response.data.credentials.token);
        }
    } catch {
        // connection drops if renewal keeps failing; user can rejoin
    }
};

const createClient = async () => {
    const AgoraRTC = await loadAgora();
    AgoraRTC.onAutoplayFailed = () => {
        needsAudioUnlock.value = true;
    };
    client = await createLiveClient();
    client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
            user.audioTrack?.play();
        }
        refreshRemoteUsers();
    });
    client.on('user-unpublished', refreshRemoteUsers);
    client.on('user-left', refreshRemoteUsers);
    client.on('token-privilege-will-expire', renewToken);
};

const joinAsAudience = async () => {
    const response = await axios.get(`${apiBase.value}/join`);
    const credentials = response.data.credentials;
    hostUid.value = credentials.host_uid || 1;
    live.value = response.data.live;

    if (!client) await createClient();
    await client.setClientRole('audience');
    await client.join(credentials.app_id, credentials.channel, credentials.token, null);
    role.value = 'audience';
    return response.data.guest;
};

const startWatching = async () => {
    watchError.value = '';
    if (!isLoggedIn.value) {
        goToLogin();
        return;
    }

    isJoining.value = true;
    try {
        const currentGuest = await joinAsAudience();
        joined.value = true;
        guest.value = currentGuest;
        if (currentGuest) {
            await handleGuestUpdate(currentGuest);
            startGuestPolling();
        }
    } catch (error) {
        await leaveChannel();
        handleRequestError(error, 'Não foi possível entrar na live.');
    } finally {
        isJoining.value = false;
    }
};

const leaveChannel = async () => {
    closeTracks(localTracks.value);
    localTracks.value = [];
    if (client) {
        try {
            await client.leave();
        } catch {
            // already left
        }
    }
    remoteUsers.value = [];
};

const goOnStage = async (credentials) => {
    let tracks;
    try {
        tracks = await createCameraAndMic();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Câmara', detail: mediaErrorMessage(error), life: 6000 });
        await axios.delete(`${apiBase.value}/guest`).catch(() => {});
        guest.value = null;
        stopGuestPolling();
        return;
    }

    try {
        await client.leave();
        await client.setClientRole('host');
        await client.join(credentials.app_id, credentials.channel, credentials.token, credentials.uid);
        await client.publish(tracks);
        localTracks.value = tracks;
        micOn.value = true;
        camOn.value = true;
        role.value = 'guest';
        toast.add({ severity: 'success', summary: 'Estás na live', detail: 'O anfitrião aceitou o teu pedido.', life: 4000 });
    } catch (error) {
        closeTracks(tracks);
        toast.add({ severity: 'error', summary: 'Erro', detail: error?.message || 'Não foi possível entrar na live.', life: 5000 });
        await backToAudience(true);
    }
};

const backToAudience = async (notifyServer) => {
    if (notifyServer) {
        await axios.delete(`${apiBase.value}/guest`).catch(() => {});
    }
    await leaveChannel();
    role.value = 'audience';
    guest.value = null;
    stopGuestPolling();
    try {
        await joinAsAudience();
    } catch (error) {
        joined.value = false;
        handleRequestError(error, 'Não foi possível voltar à live.');
    }
};

const handleGuestUpdate = async (current) => {
    const previous = guestStatus.value;
    guest.value = current;
    const status = current?.status;

    if (status === 'accepted' && role.value === 'audience' && current.credentials) {
        await goOnStage(current.credentials);
        return;
    }

    if (role.value === 'guest' && status !== 'accepted') {
        toast.add({ severity: 'info', summary: 'Live', detail: 'Saíste do palco. Continuas a assistir.', life: 4000 });
        await backToAudience(false);
        return;
    }

    if (previous === 'pending' && status === 'rejected') {
        toast.add({ severity: 'warn', summary: 'Pedido recusado', detail: 'O anfitrião não aceitou o pedido desta vez.', life: 4000 });
    }

    if (!['pending', 'accepted'].includes(status)) {
        stopGuestPolling();
    }
};

const pollGuest = async () => {
    try {
        const response = await axios.get(`${apiBase.value}/guest`);
        await handleGuestUpdate(response.data.guest);
    } catch {
        // retried on next tick
    }
};

const startGuestPolling = () => {
    stopGuestPolling();
    guestTimer = setInterval(pollGuest, 6000);
};

const stopGuestPolling = () => {
    clearInterval(guestTimer);
    guestTimer = null;
};

const requestToJoin = async () => {
    isBusy.value = true;
    try {
        const response = await axios.post(`${apiBase.value}/guest`);
        guest.value = response.data.guest;
        startGuestPolling();
        toast.add({ severity: 'info', summary: 'Pedido enviado', detail: response.data.message, life: 3000 });
    } catch (error) {
        handleRequestError(error, 'Não foi possível enviar o pedido.');
    } finally {
        isBusy.value = false;
    }
};

const cancelRequest = async () => {
    isBusy.value = true;
    try {
        await axios.delete(`${apiBase.value}/guest`);
        guest.value = null;
        stopGuestPolling();
    } finally {
        isBusy.value = false;
    }
};

const leaveStage = async () => {
    isBusy.value = true;
    await backToAudience(true);
    isBusy.value = false;
};

const stopWatching = async () => {
    stopGuestPolling();
    if (['pending', 'accepted'].includes(guestStatus.value)) {
        axios.delete(`${apiBase.value}/guest`).catch(() => {});
    }
    await leaveChannel();
    if (client) {
        client.removeAllListeners();
        client = null;
    }
    guest.value = null;
    role.value = 'audience';
    joined.value = false;
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

const unlockAudio = () => {
    remoteUsers.value.forEach((user) => user.audioTrack?.play());
    needsAudioUnlock.value = false;
};

const onLiveStatusEvent = (status) => {
    live.value = { ...(live.value || {}), ...status };
    emit('status', live.value);
    if (['pending', 'accepted'].includes(guestStatus.value)) {
        pollGuest();
    }
};

let userChannel = null;

const subscribeUserChannel = async () => {
    const userId = currentUserId();
    if (!userId || userChannel) return;
    userChannel = `App.Models.User.${userId}`;
    try {
        const echo = await getEcho();
        echo.private(userChannel).listen('.guest.updated', () => {
            if (joined.value) pollGuest();
        });
    } catch {
        userChannel = null;
    }
};

onMounted(() => {
    loadStatus();
    statusTimer = setInterval(loadStatus, 10000);
    if (isLoggedIn.value) subscribeUserChannel();
});

onBeforeUnmount(async () => {
    clearInterval(statusTimer);
    if (joined.value) {
        stopWatching();
    }
    if (userChannel) {
        try {
            (await getEcho()).leave(userChannel);
        } catch {
            // socket already closed
        }
    }
});
</script>

<template>
    <div v-if="!isLoading && hasLive" class="detail-panel mb-4">
        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="flex align-items-center gap-2">
                <h2 class="detail-title m-0">Live interativa</h2>
                <Tag :value="isActive ? 'Ao vivo' : 'Aguarda o anfitrião'" :severity="isActive ? 'danger' : 'warning'" />
            </div>
            <Button v-if="joined" label="Sair" icon="pi pi-sign-out" text size="small" @click="stopWatching" />
        </div>

        <div v-if="joined" class="grid">
            <div class="col-12 lg:col-8">
            <AgoraStage :tiles="stageTiles" :empty-text="isActive ? 'A ligar ao anfitrião…' : 'A live ainda não começou. Fica por aqui.'" />

            <Message v-if="needsAudioUnlock" severity="info" :closable="false" class="mt-3">
                <div class="flex align-items-center justify-content-between gap-2 w-full">
                    <span>O navegador bloqueou o som.</span>
                    <Button label="Activar som" icon="pi pi-volume-up" size="small" @click="unlockAudio" />
                </div>
            </Message>

            <div class="flex flex-wrap align-items-center gap-2 mt-3">
                <template v-if="isOnStage">
                    <Button
                        :icon="micOn ? 'pi pi-microphone' : 'pi pi-volume-off'"
                        :outlined="micOn"
                        :severity="micOn ? 'secondary' : 'warning'"
                        v-tooltip.top="micOn ? 'Silenciar' : 'Ligar microfone'"
                        @click="toggleMic"
                    />
                    <Button
                        :icon="camOn ? 'pi pi-video' : 'pi pi-eye-slash'"
                        :outlined="camOn"
                        :severity="camOn ? 'secondary' : 'warning'"
                        v-tooltip.top="camOn ? 'Desligar câmara' : 'Ligar câmara'"
                        @click="toggleCam"
                    />
                    <Button label="Sair do palco" icon="pi pi-times" severity="danger" :loading="isBusy" @click="leaveStage" />
                </template>
                <template v-else-if="guestStatus === 'pending'">
                    <Tag icon="pi pi-clock" value="A aguardar que o anfitrião aceite…" severity="info" />
                    <Button label="Cancelar pedido" text size="small" :loading="isBusy" @click="cancelRequest" />
                </template>
                <Button
                    v-else-if="isActive"
                    label="Pedir para participar"
                    icon="pi pi-video"
                    class="p-button-rounded"
                    outlined
                    :loading="isBusy"
                    @click="requestToJoin"
                />
            </div>
            </div>
            <div class="col-12 lg:col-4">
                <LiveChat :event-ref="eventId" height="20rem" @live-status="onLiveStatusEvent" />
            </div>
        </div>

        <div v-else>
            <p class="detail-text">
                {{ isActive ? 'O anfitrião está ao vivo agora.' : 'A live interativa ainda não começou.' }}
                Só quem tem um bilhete de live pode assistir e pedir para participar com a câmara.
            </p>

            <Message v-if="watchError" severity="warn" :closable="false" class="mb-3">
                {{ watchError }}
            </Message>

            <div class="flex flex-wrap gap-2">
                <Button
                    :label="isActive ? 'Entrar na live' : 'Abrir live'"
                    icon="pi pi-play"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    :loading="isJoining"
                    @click="startWatching"
                />
                <router-link v-if="watchError && checkoutPath" :to="checkoutPath">
                    <Button label="Comprar bilhete de live" outlined class="p-button-rounded" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.detail-panel {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem;
    background: var(--surface-0);
}

.detail-title {
    font-size: 1.25rem;
    color: var(--text-color);
}

.detail-text {
    color: #64748b;
    line-height: 1.6;
}
</style>
