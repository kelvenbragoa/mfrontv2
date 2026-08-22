<script setup>
import AppFooter from './AppFooter.vue';
import AppHeader from './AppHeader.vue';
import AppInstallDialog from './AppInstallDialog.vue';
import AppOpenBanner from './AppOpenBanner.vue';
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <app-open-banner></app-open-banner>
            <app-header></app-header>
            <router-view></router-view>
            <app-footer></app-footer>
        </div>
    </div>
    <app-install-dialog></app-install-dialog>
    <Toast />
</template>
