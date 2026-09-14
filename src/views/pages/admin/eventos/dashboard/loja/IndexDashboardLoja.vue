<script setup>
import { useRouter } from 'vue-router';
import ShopSalesDashboard from '@/views/pages/promotor/eventos/dashboard/components/ShopSalesDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <ShopSalesDashboard :dashboard-path="dashboardPath" />
</template>
