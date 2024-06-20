<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL,storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { Bootstrap4Pagination, TailwindPagination } from 'laravel-vue-pagination';

import Paginator from 'primevue/paginator';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const isLoadingButtonExport = ref(false);
const retriviedData = ref({ data: [] });
const expandedRows = ref([]);
const toast = useToast();
const searchQuery = ref(null);
const displayConfirmation = ref(false);
function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/promotor-eventos?page=${page}`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data.event;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};
watch(
    searchQuery,
    debounce(() => {
        getData();
    }, 300)
);

const expandAll = () => {
    expandedRows.value = retriviedData.value.data.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};

const closeConfirmation = () => {
    displayConfirmation.value = false;
};
const confirmDeletion = (id) => {
    displayConfirmation.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteData = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-eventos/${dataIdBeingDeleted.value}`)
        .then(() => {
            retriviedData.value.data = retriviedData.value.data.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmation();
            toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Message Detail', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            loadingButtonDelete.value = false;
        })
        .finally(() => {
            loadingButtonDelete.value = false;
        });
};

// const downloadReport = () => {
//     isLoadingButtonExport.value = true;
//     axios
//         .get(`${baseURL}/export/company`, { responseType: 'blob' })
//         .then((response) => {
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', 'company.xlsx');
//             document.body.appendChild(link);
//             link.click();

//             toast.add({ severity: 'success', detail: `Relatorio baixado com sucesso`, summary: 'Sucesso', life: 3000 });
//             isLoadingButtonExport.value = false;
//         })
//         .catch((error) => {
//             isLoadingButtonExport.value = false;
//             toast.add({ severity: 'error', detail: `${error}`, summary: 'Erro', life: 3000 });
//         });
// };

onMounted(() => {
    getData();
});
</script>

<template>
    <div className="card" v-if="!isLoadingDiv">
        <div class="col-12">
            <div class="card-w-title">
                <h5>Eventos</h5>
                <IconField iconPosition="left">
                    <InputIcon class="pi pi-search" />
                    <InputText type="text" placeholder="Procurar ..." v-model="searchQuery" />
                </IconField>
            </div>

            <h5>Registro das Eventos</h5>

            <router-link to="/promotor/eventos/create">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Novo Registro </Button>
            </router-link>
            <!-- <Button label="Baixar" class="mr-2 mb-2" @click="downloadReport()" :disabled="isLoadingButtonExport"> <i :class="!isLoadingButtonExport ? 'pi pi-arrow-down' : 'pi pi-spinner'"></i> Baixar Registro </Button> -->


            <p>Esta tabela contem {{ retriviedData.data ? retriviedData.total : 0 }} Registros.</p>

            <DataTable :value="retriviedData.data" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Eventos</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>
                <Column header="Image">
                        <template #body="slotProps">
                            <img :src="storageURL + slotProps.data.image" :alt="storageURL +slotProps.data.image" class="shadow-2" width="100" style="border-radius: 15px;"/>
                        </template>
                </Column>
                <Column field="name" sortable header="Nome"></Column>
                <Column field="city.name" sortable header="Cidade"></Column>
                <Column field="province.name" sortable header="Província"></Column>
                <Column field="category.name" sortable header="Categoria"></Column>
                <Column field="type.name" sortable header="Tipo"></Column>
                <Column field="status.name" sortable header="Estado">
                    <template #body="slotProps">
                        <Tag severity="success" v-if="slotProps.data.status_id == 2">{{ slotProps.data.status.name }}</Tag>
                        <Tag severity="danger" v-if="slotProps.data.status_id == 1">{{ slotProps.data.status.name }}</Tag>
                        <Tag severity="warning" v-if="slotProps.data.status_id == 3">{{ slotProps.data.status.name }}</Tag>
                        <Tag severity="info" v-if="slotProps.data.status_id == 4">{{ slotProps.data.status.name }}</Tag>
                        <!-- <Dropdown v-model="device_availability_id" :options="deviceavailability" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.device_availability_id }" disabled /> -->
                    </template>
                </Column>
                <Column field="created_at" sortable header="Criado em">
                    <template #body="slotProps">
                        {{ moment(slotProps.data.created_at).format('DD-MM-YYYY H:mm') }}
                    </template>
                </Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + slotProps.data.id + '/edit'"><i class="pi pi-file-edit"></i></router-link> | <router-link :to="'/promotor/eventos/' + slotProps.data.id"><i class="pi pi-eye"></i></router-link> |
                        <a href="#" @click.prevent="confirmDeletion(slotProps.data.id)"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ retriviedData.data ? retriviedData.total : 0 }} Eventos. </template>
            </DataTable>
            <TailwindPagination :data="retriviedData" @pagination-change-page="getData" bg-whitebg-blue-50 style="width: 10px" />
        </div>
    </div>

    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>

    <Dialog header="Confirmação" v-model:visible="displayConfirmation" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmation" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteData" class="p-button-text" autofocus />
        </template>
    </Dialog>
</template>
