<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const user = ref([]);
const router = useRouter();

const openLinkToHome = () => {
    if (user.value.role_id == 1) {
        router.push('/admin/perfil');
    }
    if (user.value.role_id == 2) {
        if (user.value.is_promotor == 0) {
            router.push('/perfil');
        }
        if (user.value.is_promotor == 1) {
            router.push('/promotor/perfil');
        }
    }
};

onMounted(() => {
    user.value = JSON.parse(localStorage.getItem('user'));
});
</script>

<template>
    <div class="py-4 px-4 mx-0 md:mx-6 lg:mx-8 lg:px-8 flex align-items-center justify-content-between relative lg:static mb-3">
        <router-link class="flex align-items-center" to="/">
            <!-- <img :src="logoUrl" alt="Sakai Logo" height="50" class="mr-0 lg:mr-2" /> -->
            <span class="text-900 font-bold text-2xl line-height-3 mr-8 text-blue-500">MTICKET</span>
        </router-link>
        <a class="cursor-pointer block lg:hidden text-700 p-ripple" v-ripple v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
            <i class="pi pi-bars text-4xl"></i>
        </a>
        <div class="align-items-center surface-0 flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 px-6 lg:px-0 z-2" style="top: 120px">
            <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
                <li>
                    <router-link to="/eventos" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Eventos</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/ser-promotor" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Seja um promotor</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/recargas" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Cashless</span>
                    </router-link>
                </li>
                <!-- <li v-if="user">
                    <a @click="smoothScroll('#features')" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Carrinho</span>
                    </a>
                </li> -->
                <li v-if="user">
                    <router-link to="/meusbilhetes" class="flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3 p-ripple" v-ripple>
                        <span>Meus Bilhetes</span>
                    </router-link>
                </li>
            </ul>
            <div class="flex justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0">
                <router-link to="/login" v-if="!user"><Button label="Login" class="p-button-text p-button-rounded border-none font-light line-height-2 text-blue-500"></Button></router-link>
                <router-link to="/register" v-if="!user"><Button label="Registrar" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></router-link>
                <a @click="openLinkToHome()" v-if="user"><Button label="Perfil" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></a>
            </div>
        </div>
    </div>
</template>
