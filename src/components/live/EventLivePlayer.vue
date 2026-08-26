<script setup>
import Hls from 'hls.js';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    src: {
        type: String,
        default: ''
    }
});

const videoEl = ref(null);
let hls = null;

const playbackToken = (src) => {
    try {
        return new URL(src, window.location.origin).searchParams.get('token') || '';
    } catch {
        return '';
    }
};

const withToken = (url, token) => {
    if (!token || !url.includes('stream.mux.com') || url.includes('token=')) {
        return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
};

const destroy = () => {
    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (videoEl.value) {
        videoEl.value.pause();
        videoEl.value.removeAttribute('src');
        videoEl.value.load();
    }
};

const attach = async () => {
    destroy();

    if (!props.src) {
        return;
    }

    await nextTick();

    const video = videoEl.value;
    if (!video) {
        return;
    }

    const token = playbackToken(props.src);

    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            liveSyncDurationCount: 3,
            xhrSetup: (xhr, url) => {
                const signed = withToken(url, token);
                if (signed !== url) {
                    xhr.open('GET', signed);
                }
            }
        });

        hls.loadSource(props.src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
        });
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = props.src;
        video.play().catch(() => {});
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
