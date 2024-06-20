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

const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

const getValue = (eventdate) => {
    var now = moment();
    var date = moment(eventdate);
    if (now > date) {
        return 'Encerrado';
    } else {
        return 'A Venda';
    }
};

const getSeverity = (eventdate) => {
    var now = moment();
    var date = moment(eventdate);
    if (now > date) {
        return 'danger';
    } else {
        return 'success';
    }
    // switch (status) {
    //     case 'INSTOCK':
    //         return 'success';

    //     case 'LOWSTOCK':
    //         return 'warning';

    //     case 'OUTOFSTOCK':
    //         return 'danger';

    //     default:
    //         return null;
    // }
};

const getData = async () => {
    axios
        .get(`${baseURL}/homepage`)
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
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-left">
                    <div class="col-12 text-left mt-8 mb-4">
                        <h1 class="text-900 font-normal mb-2" style="font-size: 64px; font-weight: 500;">Produza eventos e conteúdos digitais na maior plataforma de venda de ingressos.</h1>
                        <span class="text-600 text-2xl">Soluções completas para promotores de eventos e emprendedores digitais, desde a criação, publicação, gestão, venda e entrega.</span>
                    </div>
                    <router-link to="/eventos"><Button label="Criar Eventos" class="p-button-rounded border-none ml-5 font-light text-white line-height-2 bg-blue-500"></Button></router-link>

                </div>
            </div>
            <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-left">
                    <div class="col-12 text-center mt-8 mb-4">
                        <h1 class="text-900 font-normal mb-2">Vários formatos um so lugar.</h1>
                        <span class="text-600 text-2xl">Alcance todo o seu público a partir da Mticket.</span>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
