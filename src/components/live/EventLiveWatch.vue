<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL } from '@/service/ApiConstant';
import EventLivePlayer from '@/components/live/EventLivePlayer.vue';

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

const live = ref(null);
const playbackUrl = ref('');
const isLoading = ref(true);
const isStarting = ref(false);
const watchError = ref('');
let pollTimer = null;

const isActive = computed(() => live.value?.status === 'active');
const hasLive = computed(() => Boolean(live.value));
const isLoggedIn = computed(() => Boolean(localStorage.getItem('token')));

const loadStatus = async () => {
    try {
        const response = await axios.get(`${baseURL}/eventos/${props.eventId}/live`);
        live.value = response.data.live;
        emit('status', live.value);
    } catch {
        live.value = null;
        emit('status', null);
    } finally {
        isLoading.value = false;
    }
};

const startWatching = async () => {
    watchError.value = '';

    if (!isLoggedIn.value) {
        router.push({
            name: 'login',
            query: { redirect: route.fullPath }
        });
        return;
    }

    isStarting.value = true;

    try {
        const response = await axios.get(`${baseURL}/eventos/${props.eventId}/live/playback`);
        playbackUrl.value = response.data.url;
        live.value = {
            ...(live.value || {}),
            status: response.data.status,
            active: response.data.active
        };
        emit('status', live.value);
    } catch (error) {
        const status = error?.response?.status;
        if (status === 401) {
            router.push({
                name: 'login',
                query: { redirect: route.fullPath }
            });
        } else if (status === 403) {
            watchError.value = error?.response?.data?.message || 'Precisas de um bilhete válido para ver esta live.';
        } else {
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: error?.response?.data?.message || 'Não foi possível abrir a live.',
                life: 4000
            });
        }
    } finally {
        isStarting.value = false;
    }
};

onMounted(() => {
    loadStatus();
    pollTimer = setInterval(loadStatus, 15000);
});

onBeforeUnmount(() => {
    if (pollTimer) {
        clearInterval(pollTimer);
    }
});
</script>

<template>
    <div v-if="!isLoading && hasLive" class="detail-panel mb-4">
        <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <h2 class="detail-title m-0">Live</h2>
            <Tag :value="isActive ? 'Ao vivo' : 'Aguarda transmissão'" :severity="isActive ? 'danger' : 'warning'" />
        </div>

        <div v-if="playbackUrl">
            <EventLivePlayer :src="playbackUrl" />
            <p v-if="!isActive" class="detail-text mt-2 mb-0">A transmissão ainda não começou. O player actualiza quando a live estiver activa.</p>
        </div>

        <div v-else>
            <p class="detail-text">
                {{ isActive ? 'Este evento está a transmitir agora.' : 'A live deste evento ainda não começou.' }}
                Só quem tem bilhete (ou o promotor) pode assistir.
            </p>

            <Message v-if="watchError" severity="warn" :closable="false" class="mb-3">
                {{ watchError }}
            </Message>

            <div class="flex flex-wrap gap-2">
                <Button
                    :label="isActive ? 'Assistir à live' : 'Abrir player'"
                    icon="pi pi-play"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    :loading="isStarting"
                    @click="startWatching"
                />
                <router-link v-if="watchError && checkoutPath" :to="checkoutPath">
                    <Button label="Comprar bilhete" outlined class="p-button-rounded" />
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
