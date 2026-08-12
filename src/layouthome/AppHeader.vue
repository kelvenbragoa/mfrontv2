<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    getCurrentPromotorSlug,
    getMainSiteUrl,
    isPromotorSubdomain
} from '@/utils/promotorHost';

const user = ref(null);
const router = useRouter();
const onPromotorSubdomain = isPromotorSubdomain();
const tenantSlug = getCurrentPromotorSlug();

const mainHref = (path) => getMainSiteUrl(path);

const openLinkToHome = () => {
    if (!user.value) return;

    if (user.value.role_id == 1) {
        if (onPromotorSubdomain) {
            window.location.href = mainHref('/admin/perfil');
            return;
        }
        router.push('/admin/perfil');
        return;
    }

    if (user.value.role_id == 2) {
        const path = user.value.is_promotor == 1 ? '/promotor/perfil' : '/perfil';
        if (onPromotorSubdomain) {
            window.location.href = mainHref(path);
            return;
        }
        router.push(path);
    }
};

onMounted(() => {
    try {
        user.value = JSON.parse(localStorage.getItem('user'));
    } catch {
        user.value = null;
    }
});
</script>

<template>
    <div class="py-4 px-4 mx-0 md:mx-6 lg:mx-8 lg:px-8 flex align-items-center justify-content-between relative lg:static mb-3">
        <a v-if="onPromotorSubdomain" class="flex align-items-center" :href="mainHref('/')">
            <span class="text-900 font-bold text-2xl line-height-3 mr-8 text-blue-500">MTICKET</span>
        </a>
        <router-link v-else class="flex align-items-center" to="/">
            <span class="text-900 font-bold text-2xl line-height-3 mr-8 text-blue-500">MTICKET</span>
        </router-link>
        <a class="cursor-pointer block lg:hidden text-700 p-ripple" v-ripple v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
            <i class="pi pi-bars text-4xl"></i>
        </a>
        <div class="align-items-center surface-0 flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 px-6 lg:px-0 z-2" style="top: 120px">
            <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
                <li v-if="onPromotorSubdomain && tenantSlug">
                    <router-link to="/" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Página do promotor</span>
                    </router-link>
                </li>
                <li>
                    <a v-if="onPromotorSubdomain" :href="mainHref('/eventos')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Eventos</span>
                    </a>
                    <router-link v-else to="/eventos" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Eventos</span>
                    </router-link>
                </li>
                <li>
                    <a v-if="onPromotorSubdomain" :href="mainHref('/promotores')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Promotores</span>
                    </a>
                    <router-link v-else to="/promotores" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Promotores</span>
                    </router-link>
                </li>
                <li>
                    <a v-if="onPromotorSubdomain" :href="mainHref('/ser-promotor')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Seja um promotor</span>
                    </a>
                    <router-link v-else to="/ser-promotor" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Seja um promotor</span>
                    </router-link>
                </li>
                <li>
                    <a v-if="onPromotorSubdomain" :href="mainHref('/recargas')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Cashless</span>
                    </a>
                    <router-link v-else to="/recargas" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Cashless</span>
                    </router-link>
                </li>
                <li v-if="user">
                    <a v-if="onPromotorSubdomain" :href="mainHref('/meusbilhetes')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Meus Bilhetes</span>
                    </a>
                    <router-link v-else to="/meusbilhetes" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Meus Bilhetes</span>
                    </router-link>
                </li>
            </ul>
            <div class="flex justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0">
                <a v-if="!user && onPromotorSubdomain" :href="mainHref('/login')"><Button label="Login" class="p-button-text p-button-rounded border-none font-light line-height-2 text-blue-500"></Button></a>
                <router-link v-else-if="!user" to="/login"><Button label="Login" class="p-button-text p-button-rounded border-none font-light line-height-2 text-blue-500"></Button></router-link>
                <a v-if="!user && onPromotorSubdomain" :href="mainHref('/register')"><Button label="Registrar" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></a>
                <router-link v-else-if="!user" to="/register"><Button label="Registrar" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></router-link>
                <a @click="openLinkToHome()" v-if="user"><Button label="Perfil" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></a>
            </div>
        </div>
    </div>
</template>
