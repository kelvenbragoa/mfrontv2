<script setup>
import TicketSalesDashboard from '../components/TicketSalesDashboard.vue';
</script>

<template>
    <TicketSalesDashboard
        resource="bilhetes"
        title="Dashboard de bilhetes"
        subtitle="Vendas, gráficos e emissões de bilhetes do evento."
        issued-label="Vendas de bilhetes"
        show-pdf
    />
</template>
