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
    <div v-if="!isLoadingDiv">
        <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
    </div>

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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id + '/dashboard/bilhetes'"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id + '/dashboard/pacotes'"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id + '/dashboard/convites'"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id + '/dashboard/lineups'"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
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
                <router-link :to="'/admin/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Produtos</h5>
                <DataTable :value="retriviedData.event.products" :rows="1" responsiveLayout="scroll">
                    <Column field="name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <Column field="barstore.name" header="Bar" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.barstore.name }} </template>
                    </Column>
                    <Column field="stock" header="Stock Inicial" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.qtd + slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) }} </template>
                    </Column>
                    <Column field="qtd" header="Quantidade" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.qtd }} </template>
                    </Column>
                    <Column field="sell_price" header="Preço Venda" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sell_price }} MT </template>
                    </Column>
                    <Column field="buy_price" header="Preço Compra" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.buy_price }} MT </template>
                    </Column>
                    <Column field="qtdsell" header="Qtd Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) }} </template>
                    </Column>
                    <Column field="pricesell" header="Valor de Vendas" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.sells.reduce((sum, item) => sum + item.qtd, 0) * slotProps.data.sell_price }}MT </template>
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
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
