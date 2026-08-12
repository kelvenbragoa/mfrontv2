<script setup>
import { useRouter } from 'vue-router';
import InvitesDashboard from '@/components/event-dashboard/InvitesDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <InvitesDashboard :dashboard-path="dashboardPath" />
</template>
