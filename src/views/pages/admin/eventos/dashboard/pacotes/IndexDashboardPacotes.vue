<script setup>
import { useRouter } from 'vue-router';
import TicketSalesDashboard from '@/views/pages/promotor/eventos/dashboard/components/TicketSalesDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <TicketSalesDashboard
        resource="pacotes"
        title="Dashboard de pacotes"
        subtitle="Vendas, gráficos e emissões de pacotes do evento."
        issued-label="Vendas de pacotes"
        :dashboard-path="dashboardPath"
    />
</template>
