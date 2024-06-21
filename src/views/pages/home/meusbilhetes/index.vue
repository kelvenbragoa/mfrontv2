<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { Bootstrap4Pagination, TailwindPagination } from 'laravel-vue-pagination';
import Paginator from 'primevue/paginator';

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const retriviedData = ref({ data: [] });
function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/homepage?page=${page}`)
        .then((response) => {
            retriviedData.value = response.data;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            // goBackUsingBack();
        });
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="surface-0 flex justify-content-center">
        <p>Carregando...</p>
    </div>
    <div v-else class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-left">
                    <div class="col-12 text-left mt-8 mb-4">
                        <h2 class="text-900 font-normal mb-2">Eventos Populares</h2>
                        <span class="text-600 text-2xl">Explore eventos, shows, teatros e muitos mais...</span>
                    </div>
                    <div class="grid">
                        <div class="col-12 lg:col-6 xl:col-4" v-for="event in retriviedData.events.data" :key="event.id">
                            <router-link :to="'/eventos/' + event.id" style="text-decoration: none; color: inherit">
                                <div class="border-4 surface-border border-round m-3">
                                    <div class="mb-3">
                                        
                                        <div class="relative mx-auto">
                                            <img :src="storageURL + event.image" class="w-full border-round hover:scale-110 transition duration-500 cursor-pointer object-cover" />
                                        </div>
                                    </div>

                                    <div class="mb-2 font-medium">{{ event.user.company_name }}</div>
                                    <div class="mb-3 font-medium">{{ event.province.name }}</div>
                                    <div class="mb-3 font-bold text-2xl">{{ event.name }}</div>
                                    <div class="flex justify-content-between align-items-center mb-1"></div>
                                    <div class="flex justify-content-between align-items-center">
                                        <div class="mt-0 font-semibold text-xl">{{ moment(event.start_date).format('LL') }}</div>
                                        <span>
                                            <Button icon="pi pi-eye" severity="secondary" outlined />
                                        </span>
                                    </div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
