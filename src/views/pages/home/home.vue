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

const smoothScroll = (id) => {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
};
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 5,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 3
    },
    {
        breakpoint: '560px',
        numVisible: 2,
        numScroll: 1
    }
]);

const getValue = (eventdate) => {
    var now = moment();
    var date = moment(eventdate);
    if (now.isSameOrBefore(date)) {
        return 'A venda';
    } else {
        return 'Encerrado';
    }
};

const getSeverity = (eventdate) => {
    var now = moment();
    var date = moment(eventdate);
    if (now.isSameOrBefore(date)) {
        return 'success';
    } else {
        return 'danger';
    }
};

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
                        <h2 class="text-900 font-normal mb-2">Descubra o que fazer</h2>
                        <span class="text-600 text-2xl">Explore eventos, shows, teatros e muitos mais...</span>
                    </div>
                    <Carousel :value="retriviedData.categories" :numVisible="5" :numScroll="5" :responsiveOptions="carouselResponsiveOptions">
                        
                        <template #item="slotProps">
                            <router-link :to="'/categorias/' + slotProps.data.id">
                                <div class="m-5"><img :src="storageURL + slotProps.data.image" :alt="slotProps.data.name" style="border-radius: 50%; object-fit: cover;" width="200px" height="200px" class="w-full max-w-md ..." /> <br /></div>
                                <p style="text-align: center; color: black">{{ slotProps.data.name }}</p>
                            </router-link>
                        </template>
                    </Carousel>
                </div>
            </div>

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
                                    <div class="flex justify-content-between align-items-center mb-1">
                                        <Tag :value="event.type.name" severity="info" />
                                        <span>
                                            <Tag :value="getValue(event.end_date)" :severity="getSeverity(event.end_date)" />
                                        </span>
                                    </div>

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
                    <div class="col-12 lg:col-6 xl:col-4">
                        <TailwindPagination :data="retriviedData.events" @pagination-change-page="getData" bg-whitebg-blue-50 style="width: 10px" />
                    </div>


                    <div
                        class="col-12 mt-8 mb-8 p-2 md:p-8"
                        style="border-radius: 20px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
                    >
                        <div class="flex flex-column justify-content-center align-items-left text-left px-3 py-3 md:py-0">
                            <h3 class="text-gray-900 mb-2">Queres ser um promotor?</h3>
                            <p class="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-4" style="max-width: 900px">Entre com a sua conta Mticket, e crie eventos fantasticos com a nossa companhia.</p>
                        </div>
                        <router-link to="ser-promotor"> <Button label="Seja um promotor" class="p-button-rounded border-none font-light ml-2 mt-4 text-white line-height-2 bg-blue-500"></Button></router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
