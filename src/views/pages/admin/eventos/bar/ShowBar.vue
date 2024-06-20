<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import moment from 'moment';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const retriviedData = ref();
const toast = useToast();
const products = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const tickets = ref([]);
const dataIdBeingDeleted = ref(0);
const loadingButtonDelete = ref(false);



//DIALOG
const displayCreateTicket = ref(false);
const openCreateTicket = () => {
    displayCreateTicket.value = true;
};
const closeCreateTicket = () => {
    displayCreateTicket.value = false;
};

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const schema = yup.object({
    name: yup.string().required().label('Name'),
    address: yup.string().required().label('Address'),
    city: yup.string().required().label('City'),
    province_id: yup.string().required().label('Province')
    // email: yup.string().required().email().label('Email address'),
    // fullName: yup.string().required().label('Full name'),
    // password: yup.string().required().min(6).label('Password'),
    // passwordConfirm: yup
    //     .string()
    //     .oneOf([yup.ref('password')], 'Passwords must match')
    //     .required()
    //     .label('Password confirmation'),
    // terms: yup.boolean().required().isTrue('You must agree to terms and conditions').label('terms agreement'),
    // type: yup.string().required().label('Account type')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [name] = defineField('name');
const [address] = defineField('address');
const [city] = defineField('city');
const [province_id] = defineField('province_id');

const onSubmitCreateTicket = handleSubmit((values) => {
    console.log('Submitted with', values);
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/drivers`, values)
        .then((response) => {
            resetForm();
            router.push({ path: '/drivers' });
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Registro criada com sucesso', life: 3000 });
        })
        .catch((error) => {
            isLoadingButton.value = false;
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Detalhe da Mensagem', life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            isLoadingButton.value = false;
        });
});

//DELETE PRODUCT
const displayConfirmationProduct = ref(false);
const closeConfirmationProduct = () => {
    displayConfirmationProduct.value = false;
};
const confirmDeletionProduct = (id) => {
    displayConfirmationProduct.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataProduct = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-products/${dataIdBeingDeleted.value}`)
        .then(() => {
            products.value = products.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationProduct();
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

const getData = () => {
    axios
        .get(`${baseURL}/promotor-bar/${router.currentRoute.value.params.idbar}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.bar;
            products.value = response.data.products;
            // provinces.value = response.data.province;
            // cities.value = response.data.city;
            // categories.value = response.data.category;
            // typeevent.value = response.data.typeevent;
            // tickets.value = response.data.tickets;
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
    <div className="card" v-if="!isLoadingDiv">
        <div class="col-12">
            <div class="card-w-title">
                <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
                <!-- <h5>Evento</h5> -->
            </div>

            <p>Detalhes do Bar</p>
            <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
            <p><strong>Produtos: </strong>{{ retriviedData.products.length }}</p>
            <hr>
            <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/produtos/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Produto </Button>
            </router-link>
            <p>Esta tabela de Produtos contem {{ products.length }} Registros.</p>
            <DataTable :value="products" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Productos</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="buy_price" sortable header="Compra"></Column>
                <Column field="sell_price" sortable header="Venda"></Column>
                <Column field="qtd" sortable header="Qtd"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/produtos/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/produtos/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionProduct(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ products.length }} Bares. </template>
            </DataTable>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
    <Dialog header="Confirmação" v-model:visible="displayConfirmationProduct" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationProduct" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataProduct" class="p-button-text" autofocus />
        </template>
    </Dialog>
</template>
