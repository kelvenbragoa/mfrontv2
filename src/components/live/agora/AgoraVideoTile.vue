<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
    track: {
        type: Object,
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    mirror: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Câmara desligada'
    }
});

const container = ref(null);
let playingTrack = null;

const stopPlaying = () => {
    try {
        playingTrack?.stop();
    } catch {
        // already stopped
    }
    playingTrack = null;
};

watch(
    [() => props.track, container],
    ([track, el]) => {
        if (playingTrack && playingTrack !== track) {
            stopPlaying();
        }
        if (track && el && playingTrack !== track) {
            track.play(el, { fit: 'cover', mirror: props.mirror });
            playingTrack = track;
        }
    },
    { immediate: true }
);

onBeforeUnmount(stopPlaying);
</script>

<template>
    <div class="agora-tile">
        <div ref="container" class="agora-tile-video" />
        <div v-if="!track" class="agora-tile-empty">
            <i class="pi pi-video-slash text-2xl mb-2" />
            <span>{{ placeholder }}</span>
        </div>
        <span v-if="label" class="agora-tile-label">{{ label }}</span>
    </div>
</template>

<style scoped>
.agora-tile {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 8rem;
    background: #0f172a;
    border-radius: 0.85rem;
    overflow: hidden;
}

.agora-tile-video {
    position: absolute;
    inset: 0;
}

.agora-tile-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.85rem;
}

.agora-tile-label {
    position: absolute;
    left: 0.6rem;
    bottom: 0.6rem;
    padding: 0.2rem 0.6rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.7);
    color: #fff;
    font-size: 0.8rem;
}
</style>
