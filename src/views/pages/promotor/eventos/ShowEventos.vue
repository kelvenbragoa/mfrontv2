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
const loadingButtonDelete = ref(false);
const retriviedData = ref();
const toast = useToast();
const provinces = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const tickets = ref([]);
const invites = ref([]);
const packages = ref([]);
const bars = ref([]);
const protocols = ref([]);
const barmans = ref([]);
const products = ref([]);
const lineups = ref([]);
const dataIdBeingDeleted = ref(0);
const dataIdBeingCopied = ref(0);


//DELETE TICKET
const displayConfirmationTicket = ref(false);
const closeConfirmationTicket = () => {
    displayConfirmationTicket.value = false;
};
const confirmDeletionTicket = (id) => {
    displayConfirmationTicket.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataTicket = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-tickets/${dataIdBeingDeleted.value}`)
        .then(() => {
            tickets.value = tickets.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationTicket();
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
//DELETE INVITE
const displayConfirmationInvite = ref(false);
const closeConfirmationInvite = () => {
    displayConfirmationInvite.value = false;
};
const confirmDeletionInvite = (id) => {
    displayConfirmationInvite.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataInvite = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-invites/${dataIdBeingDeleted.value}`)
        .then(() => {
            invites.value = invites.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationInvite();
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
//DELETE PACKAGE
const displayConfirmationPackage = ref(false);
const closeConfirmationPackage = () => {
    displayConfirmationPackage.value = false;
};
const confirmDeletionPackage = (id) => {
    displayConfirmationPackage.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataPackage = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-packages/${dataIdBeingDeleted.value}`)
        .then(() => {
            packages.value = packages.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationPackage();
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
//DELETE BAR
const displayConfirmationBar = ref(false);
const closeConfirmationBar = () => {
    displayConfirmationBar.value = false;
};
const confirmDeletionBar = (id) => {
    displayConfirmationBar.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataBar = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-bar/${dataIdBeingDeleted.value}`)
        .then(() => {
            bars.value = bars.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationBar();
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
//COPY BAR
const displayCopyBar = ref(false);
const closeCopyBar = () => {
    loadingButtonDelete.value = false;
    displayCopyBar.value = false;
};
const confirmCopyBar = (id) => {
    displayCopyBar.value = true;
    dataIdBeingCopied.value = id;
};

const copyBar = () => {
    loadingButtonDelete.value = true;

    axios
        .get(`${baseURL}/promotor-bar/${dataIdBeingCopied.value}/copy`)
        .then(() => {
            getData();
            closeCopyBar();
            toast.add({ severity: 'success', summary: `Sucesso`, detail: 'Message Detail', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            closeCopyBar();
            loadingButtonDelete.value = false;
        })
        .finally(() => {
            closeCopyBar();
            loadingButtonDelete.value = false;
        });
};

//DELETE LineUp
const displayConfirmationLineUp = ref(false);
const closeConfirmationLineUp = () => {
    displayConfirmationLineUp.value = false;
};
const confirmDeletionLineUp = (id) => {
    displayConfirmationLineUp.value = true;
    dataIdBeingDeleted.value = id;
};

const deleteDataLineUp = () => {
    loadingButtonDelete.value = true;

    axios
        .delete(`${baseURL}/promotor-lineup/${dataIdBeingDeleted.value}`)
        .then(() => {
            bars.value = bars.value.filter((data) => data.id !== dataIdBeingDeleted.value);
            closeConfirmationLineUp();
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

const getData = () => {
    axios
        .get(`${baseURL}/promotor-eventos/${router.currentRoute.value.params.id}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.event;
            provinces.value = response.data.province;
            cities.value = response.data.city;
            categories.value = response.data.category;
            typeevent.value = response.data.typeevent;
            tickets.value = response.data.tickets;
            invites.value = response.data.invites;
            packages.value = response.data.package;
            bars.value = response.data.bar;
            protocols.value = response.data.protocols;
            barmans.value = response.data.barmans;
            lineups.value = response.data.lineup;
            products.value = response.data.products;
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
                <router-link :to="'/promotor/eventos/' + retriviedData.id + '/dashboard'"><Button label="Dashboard" class="mr-2 mb-2"><i class="pi pi-chart-bar"></i> Dashboard</Button></router-link>

                <!-- <h5>Evento</h5> -->
            </div>

            <p>Detalhes do Evento</p>
            <div class="grid">
                <div class="col-12 lg:col-6 xl:col-6">
                    <div class="card mb-0">
                        <div class="flexmb-3">
                            <h5>Informação Geral</h5>

                            <p><strong>Nome do Evento: </strong> {{ retriviedData.name }}</p>
                            <p><strong>Província: </strong> {{ retriviedData.province.name }}</p>
                            <p><strong>Cidade: </strong> {{ retriviedData.city.name }}</p>
                            <p><strong>Descrição: </strong> {{ retriviedData.description }}</p>
                            <p><strong>Categoria: </strong> {{ retriviedData.category.name }}</p>
                            <p><strong>Tipo de Evento: </strong> {{ retriviedData.type.name }}</p>
                            <p>
                                <strong>Estado do evento: </strong> <Tag severity="success" v-if="retriviedData.status_id == 2">{{ retriviedData.status.name }}</Tag>
                                <Tag severity="danger" v-if="retriviedData.status_id == 1">{{ retriviedData.status.name }}</Tag>
                                <Tag severity="warning" v-if="retriviedData.status_id == 3">{{ retriviedData.status.name }}</Tag>
                                <Tag severity="info" v-if="retriviedData.status_id == 4">{{ retriviedData.status.name }}</Tag>
                            </p>

                            <h5 class="mt-2 mb-2">Localização e Data do Evento</h5>

                            <p><strong>Endereço: </strong> {{ retriviedData.address }}</p>
                            <p><strong>Data Inicio: </strong> {{ retriviedData.start_date }} - {{ retriviedData.start_time }}</p>
                            <p><strong>Data Fim: </strong> {{ retriviedData.end_date }} - {{ retriviedData.end_time }}</p>

                            <h5 class="mt-2 mb-2">Info</h5>
                            <p><strong>Email: </strong> {{ retriviedData.email }}</p>
                            <p><strong>Telefone: </strong> {{ retriviedData.phone }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-6">
                    <div class="card mb-0">
                        <div class="flex justify-content-between mb-3">
                            <img :src="storageURL + retriviedData.image" alt="" weigth="500" height="500" style="border-radius: 15px" />
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <h5 class="mt-2 mb-2">Bilhetes Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bilhetes/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Bilhete </Button>
            </router-link>
            <p>Esta tabela de Bilhetes contem {{ tickets.length }} Registros.</p>
            <DataTable :value="tickets" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Tickets</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="price" sortable header="Preço"></Column>
                <Column field="start_date" sortable header="Data Inicio">
                    <template #body="slotProps"> {{ moment(slotProps.data.start_date).format('DD-MM-YYYY') }} - {{ slotProps.data.start_time }} </template>
                </Column>
                <Column field="end_date" sortable header="Data Fim">
                    <template #body="slotProps"> {{ moment(slotProps.data.end_date).format('DD-MM-YYYY') }} - {{ slotProps.data.end_time }} </template>
                </Column>
                <Column field="max_qtd" sortable header="Quantidade Maxima"></Column>
                <Column field="description" sortable header="Descrição"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bilhetes/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bilhetes/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionTicket(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ tickets.length }} Bilhetes. </template>
            </DataTable>
            <hr />
            <h5 class="mt-2 mb-2">Convites Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/convites/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Convite </Button>
            </router-link>
            <p>Esta tabela de Convites contem {{ invites.length }} Registros.</p>
            <DataTable :value="invites" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Convites</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="description" sortable header="Descrição"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/convites/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/convites/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionInvite(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ invites.length }} Convites. </template>
            </DataTable>
            <hr />
            <h5 class="mt-2 mb-2">Pacotes Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/pacotes/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Pacotes </Button>
            </router-link>
            <p>Esta tabela de Pacotes contem {{ packages.length }} Registros.</p>
            <DataTable :value="packages" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Pacotes</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="price" sortable header="Preço"></Column>
                <Column field="description" sortable header="Descrição"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/pacotes/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/pacotes/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionPackage(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ tickets.length }} Pacotes. </template>
            </DataTable>

            <hr />
            <h5 class="mt-2 mb-2">Bar Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bar/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Bar </Button>
            </router-link>
            <p>Esta tabela de Bares contem {{ bars.length }} Registros.</p>
            <DataTable :value="bars" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Bares</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="products" header="Nº Produtos">
                    <template #body="slotProps">
                        {{ slotProps.data.products.length }}
                    </template>
                </Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bar/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/bar/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionBar(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                        <a href="#" @click.prevent="confirmCopyBar(slotProps.data.id)" class="mr-2"><i class="pi pi-copy"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ tickets.length }} Bares. </template>
            </DataTable>
            <hr />
            <h5 class="mt-2 mb-2">LineUps Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/lineup/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar LineUp </Button>
            </router-link>
            <p>Esta tabela de LineUps contem {{ lineups.length }} Registros.</p>
            <DataTable :value="lineups" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">LineUps</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="description" sortable header="Descrição"></Column>
                <Column field="start_date" sortable header="Data Inicio">
                    <template #body="slotProps">{{ slotProps.data.start_time }} </template>
                </Column>
                <Column field="end_date" sortable header="Data Fim">
                    <template #body="slotProps"> {{ slotProps.data.end_time }} </template>
                </Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/lineup/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/lineup/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionBar(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ lineups.length }} Lineups. </template>
            </DataTable>

            <hr />
            <h5 class="mt-2 mb-2">Productos Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/produtos/create'">
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
                <Column field="buy_price" sortable header="Compra">
                    <template #body="slotProps"> {{ slotProps.data.buy_price }} MT </template>
                </Column>
                <Column field="sell_price" sortable header="Venda">
                    <template #body="slotProps"> {{ slotProps.data.sell_price }} MT </template>
                </Column>
                <Column field="qtd" sortable header="Qtd"></Column>
                <Column field="barstore.name" sortable header="Bar"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/produtos/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/produtos/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionProduct(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ products.length }} Bares. </template>
            </DataTable>
            <hr />
            <h5 class="mt-2 mb-2">Protocolos Para o Evento</h5>
            <!-- /promotor/protocolos/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/protocolos/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Protocolo </Button>
            </router-link>
            <p>Esta tabela de Protocolos contem {{ protocols.length }} Registros.</p>
            <DataTable :value="protocols" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Protocolos</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="mobile" sortable header="Telefone"></Column>
                <Column field="bi" sortable header="BI"></Column>
                <Column field="user" sortable header="Usuário"></Column>
                <Column field="password" sortable header="Password"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/protocolos/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/protocolos/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <!-- <a href="#" @click.prevent="confirmDeletionBar(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a> -->
                    </template>
                </Column>
                <template #footer> No total são {{ protocols.length }} Protocolos. </template>
            </DataTable>
            <hr />
            <h5 class="mt-2 mb-2">Barmans Para o Evento</h5>
            <!-- /promotor/barmans/:id/bilhetes/create -->
            <router-link :to="'/promotor/eventos/' + retriviedData.id + '/barmans/create'">
                <Button label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Barman </Button>
            </router-link>
            <p>Esta tabela de Barmans contem {{ protocols.length }} Registros.</p>
            <DataTable :value="barmans" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Barmans</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="mobile" sortable header="Telefone"></Column>
                <Column field="bi" sortable header="BI"></Column>
                <Column field="user" sortable header="Usuário"></Column>
                <Column field="password" sortable header="Password"></Column>
                <Column field="barstore.name" sortable header="Bar"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/barmans/' + slotProps.data.id + '/edit'" class="mr-2"><i class="pi pi-file-edit"></i></router-link>
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/barmans/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <!-- <a href="#" @click.prevent="confirmDeletionBar(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a> -->
                    </template>
                </Column>
                <template #footer> No total são {{ barmans.length }} Barmans. </template>
            </DataTable>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>

    <Dialog header="Confirmação" v-model:visible="displayConfirmationTicket" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationTicket" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataTicket" class="p-button-text" autofocus />
        </template>
    </Dialog>

    <Dialog header="Confirmação" v-model:visible="displayConfirmationInvite" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationInvite" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataInvite" class="p-button-text" autofocus />
        </template>
    </Dialog>

    <Dialog header="Confirmação" v-model:visible="displayConfirmationBar" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationBar" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataBar" class="p-button-text" autofocus />
        </template>
    </Dialog>

    <Dialog header="Confirmação" v-model:visible="displayConfirmationPackage" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationPackage" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataPackage" class="p-button-text" autofocus />
        </template>
    </Dialog>

    <Dialog header="Confirmação" v-model:visible="displayConfirmationLineUp" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeConfirmationLineUp" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="deleteDataLineUp" class="p-button-text" autofocus />
        </template>
    </Dialog>

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

    <Dialog header="Copiar o bar" v-model:visible="displayCopyBar" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Tem certeza que deseja proceder?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeCopyBar" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="copyBar" :disabled="loadingButtonDelete" class="p-button-text" autofocus />
            <ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="loadingButtonDelete" />
        </template>
    </Dialog>
</template>
