<script setup>
import Hls from 'hls.js';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    src: {
        type: String,
        default: ''
    }
});

const videoEl = ref(null);
let hls = null;

const destroy = () => {
    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (videoEl.value) {
        videoEl.value.removeAttribute('src');
        videoEl.value.load();
    }
};

const attach = () => {
    destroy();

    if (!props.src || !videoEl.value) {
        return;
    }

    const video = videoEl.value;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = props.src;
        return;
    }

    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(props.src);
        hls.attachMedia(video);
    }
};

watch(() => props.src, attach);
onMounted(attach);
onBeforeUnmount(destroy);
</script>

<template>
    <video ref="videoEl" class="live-video" controls playsinline autoplay muted />
</template>

<style scoped>
.live-video {
    display: block;
    width: 100%;
    background: #0f172a;
    border-radius: 0.75rem;
    aspect-ratio: 16 / 9;
}
</style>
