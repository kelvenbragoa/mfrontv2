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
const searchQuery = ref(null);
const retriviedData = ref({ data: [] });
function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/promotor-dashboard/${router.currentRoute.value.params.id}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
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
    <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>

    <div class="grid" v-if="!isLoadingDiv">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bilhetes</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.tickets }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Pacotes</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.packages }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Convites</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.invites }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">LineUps</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.lineups }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bares</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.bars }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Produtos</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.products }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Protocolos</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.protocols }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Controladores de Produtos</span>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.barmans }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Produtos</h5>
                <DataTable :value="retriviedData.event.products" :rows="1" responsiveLayout="scroll">
                    <Column field="name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <Column field="price" header="Bar" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.barstore.name }} </template>
                    </Column>
                    <Column field="price" header="Stock Inicial" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.qtd + slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) }} </template>
                    </Column>
                    <Column field="price" header="Quantidade" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.qtd }} </template>
                    </Column>
                    <Column field="price" header="Preço Venda" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sell_price }} MT </template>
                    </Column>
                    <Column field="price" header="Preço Compra" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.buy_price }} MT </template>
                    </Column>
                    <Column field="price" header="Qtd Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) }} </template>
                    </Column>
                    <Column field="price" header="Valor de Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0)*slotProps.data.sell_price }}MT </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Bilhetes do Evento</h5>
                <DataTable :value="retriviedData.event.tickets" :rows="1" responsiveLayout="scroll">
                    <Column field="name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <Column field="max_qtd" header="Quantidade Máxima" :sortable="true" style="width: 35%"></Column>
                    <Column field="price" header="Preço" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.price }} MT </template>
                    </Column>
                    <Column field="start_date" header="Data Inicio" :sortable="true" style="width: 35%"></Column>
                    <Column field="end_date" header="Data Fim" :sortable="true" style="width: 35%"></Column>
                    <Column field="description" header="Descrição" :sortable="true" style="width: 35%"></Column>
                    <!-- <Column field="sells" header="Vendas" :sortable="true" style="width: 35%"></Column> -->

                    <Column field="sells" header="Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ slotProps.data.sells.length }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Convites do Evento</h5>
                <DataTable :value="retriviedData.event.invites" :rows="1" responsiveLayout="scroll">
                    <Column field="name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <!-- <Column field="max_qtd" header="Quantidade Máxima" :sortable="true" style="width: 35%"></Column>
                    <Column field="price" header="Preço" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ slotProps.data.price }} MT
                        </template>
                    </Column>                   
                     <Column field="start_date" header="Data Inicio" :sortable="true" style="width: 35%"></Column>
                    <Column field="end_date" header="Data Fim" :sortable="true" style="width: 35%"></Column> -->
                    <Column field="description" header="Descrição" :sortable="true" style="width: 35%"></Column>
                    <!-- <Column field="sells" header="Vendas" :sortable="true" style="width: 35%"></Column> -->

                    <Column field="customers" header="Nº" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ slotProps.data.customers.length }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Bares</h5>
                <DataTable :value="retriviedData.event.barstores" :rows="1" responsiveLayout="scroll">
                    <Column field="name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <Column field="price" header="Qtd Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) }} </template>
                    </Column>
                    <Column field="price" header="Valor Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + parseFloat(item.total), 0) }} MT </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Recent Sales</h5>
                <DataTable :value="products" :rows="5" :paginator="true" responsiveLayout="scroll">
                    <Column style="width: 15%">
                        <template #header> Image </template>
                        <template #body="slotProps">
                            <img :src="'demo/images/product/' + slotProps.data.image" :alt="slotProps.data.image" width="50" class="shadow-2" />
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" style="width: 35%"></Column>
                    <Column field="price" header="Price" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.price) }}
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #header> View </template>
                        <template #body>
                            <Button icon="pi pi-search" type="button" class="p-button-text"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-5">
                    <h5>Best Selling Products</h5>
                    <div>
                        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu2.toggle($event)"></Button>
                        <Menu ref="menu2" :popup="true" :model="items"></Menu>
                    </div>
                </div>
                <ul class="list-none p-0 m-0">
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Space T-Shirt</span>
                            <div class="mt-1 text-600">Clothing</div>
                        </div>
                        <div class="mt-2 md:mt-0 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-orange-500 h-full" style="width: 50%"></div>
                            </div>
                            <span class="text-orange-500 ml-3 font-medium">%50</span>
                        </div>
                    </li>
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Portal Sticker</span>
                            <div class="mt-1 text-600">Accessories</div>
                        </div>
                        <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-cyan-500 h-full" style="width: 16%"></div>
                            </div>
                            <span class="text-cyan-500 ml-3 font-medium">%16</span>
                        </div>
                    </li>
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Supernova Sticker</span>
                            <div class="mt-1 text-600">Accessories</div>
                        </div>
                        <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-pink-500 h-full" style="width: 67%"></div>
                            </div>
                            <span class="text-pink-500 ml-3 font-medium">%67</span>
                        </div>
                    </li>
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Wonders Notebook</span>
                            <div class="mt-1 text-600">Office</div>
                        </div>
                        <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-green-500 h-full" style="width: 35%"></div>
                            </div>
                            <span class="text-green-500 ml-3 font-medium">%35</span>
                        </div>
                    </li>
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Mat Black Case</span>
                            <div class="mt-1 text-600">Accessories</div>
                        </div>
                        <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-purple-500 h-full" style="width: 75%"></div>
                            </div>
                            <span class="text-purple-500 ml-3 font-medium">%75</span>
                        </div>
                    </li>
                    <li class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                        <div>
                            <span class="text-900 font-medium mr-2 mb-1 md:mb-0">Robots T-Shirt</span>
                            <div class="mt-1 text-600">Clothing</div>
                        </div>
                        <div class="mt-2 md:mt-0 ml-0 md:ml-8 flex align-items-center">
                            <div class="surface-300 border-round overflow-hidden w-10rem lg:w-6rem" style="height: 8px">
                                <div class="bg-teal-500 h-full" style="width: 40%"></div>
                            </div>
                            <span class="text-teal-500 ml-3 font-medium">%40</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div> -->
        <!-- <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Sales Overview</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <h5>Notifications</h5>
                    <div>
                        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu1.toggle($event)"></Button>
                        <Menu ref="menu1" :popup="true" :model="items"></Menu>
                    </div>
                </div>

                <span class="block text-600 font-medium mb-3">TODAY</span>
                <ul class="p-0 mx-0 mt-0 mb-4 list-none">
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-dollar text-xl text-blue-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Richard Jones
                            <span class="text-700">has purchased a blue t-shirt for <span class="text-blue-500">79$</span></span>
                        </span>
                    </li>
                    <li class="flex align-items-center py-2">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-download text-xl text-orange-500"></i>
                        </div>
                        <span class="text-700 line-height-3">Your request for withdrawal of <span class="text-blue-500 font-medium">2500$</span> has been initiated.</span>
                    </li>
                </ul>

                <span class="block text-600 font-medium mb-3">YESTERDAY</span>
                <ul class="p-0 m-0 list-none">
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-dollar text-xl text-blue-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Keyser Wick
                            <span class="text-700">has purchased a black jacket for <span class="text-blue-500">59$</span></span>
                        </span>
                    </li>
                    <li class="flex align-items-center py-2 border-bottom-1 surface-border">
                        <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                            <i class="pi pi-question text-xl text-pink-500"></i>
                        </div>
                        <span class="text-900 line-height-3"
                            >Jane Davis
                            <span class="text-700">has posted a new questions about your product.</span>
                        </span>
                    </li>
                </ul>
            </div>
             <div
                class="px-4 py-5 shadow-2 flex flex-column md:flex-row md:align-items-center justify-content-between mb-3"
                style="border-radius: 1rem; background: linear-gradient(0deg, rgba(0, 123, 255, 0.5), rgba(0, 123, 255, 0.5)), linear-gradient(92.54deg, #1c80cf 47.88%, #ffffff 100.01%)"
            >
                <div>
                    <div class="text-blue-100 font-medium text-xl mt-2 mb-3">TAKE THE NEXT STEP</div>
                    <div class="text-white font-medium text-5xl">Try PrimeBlocks</div>
                </div>
                <div class="mt-4 mr-auto md:mt-0 md:mr-0">
                    <a href="https://www.primefaces.org/primeblocks-vue" class="p-button font-bold px-5 py-3 p-button-warning p-button-rounded p-button-raised"> Get Started </a>
                </div>
            </div>
        </div> -->
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
