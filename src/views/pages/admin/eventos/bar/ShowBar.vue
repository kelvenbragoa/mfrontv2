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
const stockNotes = ref([]);
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

const loadStockNotes = (eventId, barId) => {
    axios
        .get(`${baseURL}/promotor-stock-notes`, {
            params: { event_id: eventId, bar_store_id: barId, per_page: 10 }
        })
        .then((response) => {
            stockNotes.value = response.data?.notes?.data || [];
        })
        .catch(() => {
            stockNotes.value = [];
        });
};

const getData = () => {
    axios
        .get(`${baseURL}/promotor-bar/${router.currentRoute.value.params.idbar}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.bar;
            products.value = response.data.products;
            loadStockNotes(retriviedData.value.event_id, retriviedData.value.id);
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
            <div class="flex flex-wrap gap-2 mb-3">
                <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/produtos/create'">
                    <Button label="Criar Produto" class="mr-2 mb-2" icon="pi pi-plus" />
                </router-link>
                <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/bar/' + retriviedData.id + '/stock/entrada'">
                    <Button label="Nota de entrada" class="mr-2 mb-2" icon="pi pi-plus-circle" severity="success" />
                </router-link>
                <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/bar/' + retriviedData.id + '/stock/saida'">
                    <Button label="Nota de saída" class="mr-2 mb-2" icon="pi pi-minus-circle" severity="warn" />
                </router-link>
                <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/bar/' + retriviedData.id + '/stock/transferencia'">
                    <Button label="Transferir" class="mr-2 mb-2" icon="pi pi-arrows-h" severity="info" />
                </router-link>
                <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/bar/' + retriviedData.id + '/stock/inventario'">
                    <Button label="Inventário" class="mr-2 mb-2" icon="pi pi-check-square" severity="secondary" />
                </router-link>
            </div>
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
                <template #footer> No total são {{ products.length }} produtos. </template>
            </DataTable>

            <hr class="mt-4" />
            <h5>Notas de stock recentes</h5>
            <DataTable :value="stockNotes" tableStyle="min-width: 40rem" class="p-datatable-sm">
                <Column header="#">
                    <template #body="slotProps">{{ slotProps.data.id }}</template>
                </Column>
                <Column header="Tipo">
                    <template #body="slotProps">
                        <Tag
                            :value="
                                slotProps.data.type === 'entry'
                                    ? 'Entrada'
                                    : slotProps.data.type === 'exit'
                                      ? 'Saída'
                                      : slotProps.data.type === 'inventory'
                                        ? 'Inventário'
                                        : 'Transferência'
                            "
                            :severity="
                                slotProps.data.type === 'entry'
                                    ? 'success'
                                    : slotProps.data.type === 'exit'
                                      ? 'warn'
                                      : slotProps.data.type === 'inventory'
                                        ? 'secondary'
                                        : 'info'
                            "
                        />
                    </template>
                </Column>
                <Column header="Referência">
                    <template #body="slotProps">
                        <span v-if="slotProps.data.type === 'transfer'">
                            {{ slotProps.data.barstore?.name || '—' }} → {{ slotProps.data.to_barstore?.name || '—' }}
                        </span>
                        <span v-else>{{ slotProps.data.reference || '--' }}</span>
                    </template>
                </Column>
                <Column header="Linhas" field="items_count" />
                <Column header="Data">
                    <template #body="slotProps">{{ moment(slotProps.data.confirmed_at || slotProps.data.created_at).format('DD/MM/YYYY HH:mm') }}</template>
                </Column>
                <Column header="">
                    <template #body="slotProps">
                        <router-link :to="'/admin/eventos/' + retriviedData.event_id + '/stock/' + slotProps.data.id">
                            <i class="pi pi-eye"></i>
                        </router-link>
                    </template>
                </Column>
                <template #empty>Ainda sem notas de stock neste bar.</template>
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
