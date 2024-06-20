<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { ProductService } from '@/service/ProductService';
import { PhotoService } from '@/service/PhotoService';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const loadingButtonDelete = ref(false);
const retriviedData = ref();
const event_recomended = ref();
const toast = useToast();

const products = ref([]);
const images = ref([]);

const { layoutConfig } = useLayout();

const smoothScroll = (id) => {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
};
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
};
const getData = () => {
    axios
        .get(`${baseURL}/eventos/${router.currentRoute.value.params.id}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.events;
            event_recomended.value = response.data.event_recomended;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};
onMounted(() => {
    getData();
});
</script>

<template>
    <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8" v-if="!isLoadingDiv">
        <div class="grid justify-content-left">
            <div class="col-12 text-left mt-8 mb-4">
                <h2 class="text-900 font-normal mb-2">{{ retriviedData.name }}</h2>
                <span class="text-600 text-2xl">{{ moment(retriviedData.start_date).format('LL') }}, {{ retriviedData.address }}, {{ retriviedData.province.name }}</span>
            </div>

            <div class="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <!-- <div class="flex align-items-center justify-content-center mb-3" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                    
                                </div> -->
                        <h5 class="mb-2 text-900">Informações</h5>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-clock text-2xl"></i> {{ moment(retriviedData.start_date).format('LL') }}</span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-tags text-2xl"></i> {{ retriviedData.tickets.length }} Bilhetes disponíveis</span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-map-marker text-2xl"></i> {{ retriviedData.city.name }}, {{ retriviedData.province.name }}</span>
                        </p>
                        <p><Tag :value="getValue(retriviedData.end_date)" :severity="getSeverity(retriviedData.end_date)" style="right: 6px; top: 5px" /></p>
                        <router-link :to="'/checkout/' + retriviedData.id + '/evento'" v-if="moment() < moment(retriviedData.end_date)"
                            ><Button label="Comprar" class="p-button-rounded border-none font-light text-white line-height-2 bg-blue-500"></Button
                        ></router-link>
                    </div>
                </div>
            </div>

            <div class="col-12 md:col-12 lg:col-8 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <span class="text-600">{{ retriviedData.city.name }}, {{ retriviedData.province.name }} {{ retriviedData.address }}.</span>
                        <img :src="storageURL + retriviedData.image" class="w-full border-round hover:scale-110 transition duration-500 cursor-pointer object-cover" />
                        <h2 class="text-900 font-normal mb-2">{{ retriviedData.name }}</h2>
                        <p>
                            <span class="text-600"
                                ><strong>{{ retriviedData.like.length }}</strong
                                ><i class="pi pi-fw pi-thumbs-up-fill"></i> | {{ retriviedData.tickets.length }} Bilhetes
                            </span>
                        </p>
                        <p class="mt-4"><strong>Informações</strong></p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-map-marker"></i> {{ retriviedData.city.name }}, {{ retriviedData.province.name }}</span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-at"></i>{{ retriviedData.user.email }}</span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-mobile"></i>{{ retriviedData.user.mobile }}</span>
                        </p>
                        <hr />

                        <p class="mt-4"><strong>Descrição</strong></p>
                        <p>
                            <span class="text-600"> {{ retriviedData.description }} </span>
                        </p>
                        <hr />
                        <p class="mt-4"><strong>LineUps</strong></p>
                        <Panel :header="retriviedData.lineups.length + ' LineUp'" :toggleable="true" :collapsed="true" class="mb-1">
                            <p class="line-height-3 m-0" v-for="lineup in retriviedData.lineups" :key="lineup.id">
                                <strong> {{ lineup.name }} </strong> : {{ lineup.description }} - {{ lineup.start_time }} - {{ lineup.end_time }}
                            </p>
                        </Panel>
                        <hr />
                        <p class="mt-4"><strong>Dúvidas</strong></p>
                        <Panel header="Em caso de cancelamento de evento?" :toggleable="true" :collapsed="true" class="mb-1">
                            <p class="line-height-3 m-0">Em caso de cancelamento do evento o promotor irá informar em relação a proxima data.</p>
                        </Panel>
                        <Panel header="Os ingressos não adiquiridos na plataforma mticket?" :toggleable="true" :collapsed="true" class="mb-1">
                            <p class="line-height-3 m-0">A aquisição dos ingressos para eventos só serão aceites se forem adiquiridos a partir da plataforma.</p>
                        </Panel>
                        <Panel header="Como é feito o scan" :toggleable="true" :collapsed="true" class="mb-1">
                            <p class="line-height-3 m-0">Após a aquisição do ingresso irá receber o mesmo em forma de QrCode, baste que apresente na portaria.</p>
                        </Panel>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
