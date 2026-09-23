<script setup>
import { computed } from 'vue';
import AgoraVideoTile from '@/components/live/agora/AgoraVideoTile.vue';

const props = defineProps({
    tiles: {
        type: Array,
        default: () => []
    },
    emptyText: {
        type: String,
        default: 'A aguardar o anfitrião…'
    }
});

const gridClass = computed(() => {
    const count = props.tiles.length;
    if (count <= 1) return 'stage-1';
    if (count === 2) return 'stage-2';
    return 'stage-4';
});
</script>

<template>
    <div class="agora-stage" :class="gridClass">
        <AgoraVideoTile
            v-for="tile in tiles"
            :key="tile.key"
            :track="tile.track"
            :label="tile.label"
            :mirror="tile.mirror"
            :placeholder="tile.placeholder || 'Câmara desligada'"
        />
        <div v-if="!tiles.length" class="agora-stage-empty">
            <i class="pi pi-spin pi-spinner text-2xl mb-2" />
            <span>{{ emptyText }}</span>
        </div>
    </div>
</template>

<style scoped>
.agora-stage {
    display: grid;
    gap: 0.5rem;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #020617;
    border-radius: 1rem;
    padding: 0.5rem;
}

.stage-1 {
    grid-template-columns: 1fr;
}

.stage-2 {
    grid-template-columns: 1fr 1fr;
}

.stage-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
}

.agora-stage-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
}

@media (max-width: 640px) {
    .agora-stage {
        aspect-ratio: 3 / 4;
    }

    .stage-2 {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }
}
</style>
