<script setup>
import ProfilePage from '@/components/account/ProfilePage.vue';
import PromotorPageSettings from '@/components/account/PromotorPageSettings.vue';
</script>

<template>
    <div class="flex flex-column gap-4">
        <PromotorPageSettings />
        <ProfilePage default-role-label="Promotor" />
    </div>
</template>
