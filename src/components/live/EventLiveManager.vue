<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import EventLiveSetup from '@/components/live/EventLiveSetup.vue';
import EventAgoraSetup from '@/components/live/EventAgoraSetup.vue';

const props = defineProps({
    eventId: {
        type: [String, Number],
        required: true
    }
});

const isLoading = ref(true);
const muxLive = ref(null);
const agoraLive = ref(null);
const chosenMode = ref(null);

const fetchLive = async (path) => {
    try {
        const response = await axios.get(`${baseURL}/promotor-eventos/${props.eventId}/${path}`);
        return response.data.live || null;
    } catch {
        return null;
    }
};

const load = async () => {
    isLoading.value = true;
    const [mux, agora] = await Promise.all([fetchLive('live'), fetchLive('live-agora')]);
    muxLive.value = mux;
    agoraLive.value = agora;
    isLoading.value = false;
};

const isUsable = (live) => live && live.status !== 'disabled';

const mode = computed(() => {
    if (chosenMode.value) return chosenMode.value;
    if (isUsable(muxLive.value)) return 'broadcast';
    if (isUsable(agoraLive.value)) return 'interactive';
    if (muxLive.value) return 'broadcast';
    if (agoraLive.value) return 'interactive';
    return null;
});

const canSwitch = computed(() => !isUsable(muxLive.value) && !isUsable(agoraLive.value));

const choose = (value) => {
    chosenMode.value = value;
};

const onAgoraChanged = (live) => {
    agoraLive.value = live;
};

onMounted(load);
</script>

<template>
    <div v-if="isLoading" class="card">
        <Skeleton height="6rem" />
    </div>

    <div v-else-if="!mode" class="card">
        <h5 class="mb-2">Live do evento</h5>
        <p class="text-600 mb-4">Que tipo de live queres fazer? Quem tem bilhete de live pode assistir em qualquer um dos modos.</p>

        <div class="grid">
            <div class="col-12 md:col-6">
                <button type="button" class="mode-option" @click="choose('broadcast')">
                    <i class="pi pi-desktop text-3xl text-primary mb-3" />
                    <span class="mode-title">Broadcast</span>
                    <span class="mode-text">
                        Transmissão estilo TV a partir do OBS ou outro programa. Ideal para shows e grandes audiências. Atraso de alguns segundos.
                    </span>
                </button>
            </div>
            <div class="col-12 md:col-6">
                <button type="button" class="mode-option" @click="choose('interactive')">
                    <i class="pi pi-users text-3xl text-primary mb-3" />
                    <span class="mode-title">Interativa</span>
                    <span class="mode-text">
                        Live com a câmara do navegador, quase sem atraso. Os espectadores podem pedir para entrar na live e tu aceitas, como no Instagram.
                    </span>
                </button>
            </div>
        </div>
    </div>

    <div v-else>
        <div v-if="canSwitch" class="flex justify-content-end mb-2">
            <Button
                :label="mode === 'broadcast' ? 'Mudar para live interativa' : 'Mudar para broadcast (OBS)'"
                icon="pi pi-arrow-right-arrow-left"
                text
                size="small"
                @click="choose(mode === 'broadcast' ? 'interactive' : 'broadcast')"
            />
        </div>
        <EventLiveSetup v-if="mode === 'broadcast'" :event-id="eventId" />
        <EventAgoraSetup v-else :event-id="eventId" @changed="onAgoraChanged" />
    </div>
</template>

<style scoped>
.mode-option {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 1.25rem;
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    background: var(--surface-0);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    font: inherit;
    color: inherit;
}

.mode-option:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 14px rgba(33, 150, 243, 0.15);
}

.mode-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.mode-text {
    color: #64748b;
    line-height: 1.5;
    font-size: 0.9rem;
}
</style>
