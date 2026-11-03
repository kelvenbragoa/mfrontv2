<script setup>
import { useRouter } from 'vue-router';
import BarSalesDashboard from '@/views/pages/promotor/eventos/dashboard/components/BarSalesDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <BarSalesDashboard :dashboard-path="dashboardPath" />
</template>
