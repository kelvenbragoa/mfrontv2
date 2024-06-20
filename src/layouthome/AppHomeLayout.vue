<script setup>
import AppFooter from './AppFooter.vue';
import AppHeader from './AppHeader.vue';
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <app-header></app-header>
            <router-view></router-view>
            <app-footer></app-footer>
        </div>
    </div>
    <Toast />
</template>
