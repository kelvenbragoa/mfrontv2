<script setup>
import { useRouter } from 'vue-router';
import TicketSalesDashboard from '@/views/pages/promotor/eventos/dashboard/components/TicketSalesDashboard.vue';

const eventId = useRouter().currentRoute.value.params.id;
const dashboardPath = `/admin/eventos/${eventId}/dashboard`;
</script>

<template>
    <TicketSalesDashboard
        resource="bilhetes"
        title="Dashboard de bilhetes"
        subtitle="Vendas, gráficos e emissões de bilhetes do evento."
        issued-label="Vendas de bilhetes"
        :dashboard-path="dashboardPath"
        show-pdf
    />
</template>
