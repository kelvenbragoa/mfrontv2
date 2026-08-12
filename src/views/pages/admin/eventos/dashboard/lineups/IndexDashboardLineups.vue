<script setup>
import { useRouter } from 'vue-router';
import LineupsDashboard from '@/components/event-dashboard/LineupsDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <LineupsDashboard :dashboard-path="dashboardPath" />
</template>
