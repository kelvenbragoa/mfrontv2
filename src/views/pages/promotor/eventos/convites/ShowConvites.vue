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
const customer = ref([]);
const invites = ref([]);
const loadingButtonDelete = ref(false);
const dataIdBeingDeleted = ref(0);


//DIALOG
const displayCreateInvite = ref(false);
const openCreateInvite = () => {
    displayCreateInvite.value = true;
};
const closeCreateInvite = () => {
    displayCreateInvite.value = false;
};

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const schema = yup.object({

});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const name = ref();

const fields = ref(null);

const onSubmitCustomer = () => {
    fields.value = {
        name: name.value,
        event_id: retriviedData.value.event_id,
        invite_id: retriviedData.value.id,
        status: 1
    };
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/promotor-customers`, fields.value)
        .then((response) => {
            // router.push({ path: '/deliveries' });
            // retriviedData.value = response.data.event;
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Convidado criado com sucesso', life: 3000 });
            getData();
            name.value = '';
            isLoadingButton.value = false;
            closeCreateInvite();
        })
        .catch((error) => {
            isLoadingButton.value = false;
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Detalhe da Mensagem', life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            // isLoadingButton.value = false;
        });
};

const onSubmitCreateTicket = handleSubmit(() => {
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
        .delete(`${baseURL}/promotor-customers/${dataIdBeingDeleted.value}`)
        .then(() => {
            customer.value = customer.value.filter((data) => data.id !== dataIdBeingDeleted.value);
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

const getData = () => {
    axios
        .get(`${baseURL}/promotor-invites/${router.currentRoute.value.params.idconvites}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.invite;
            customer.value = response.data.customer;

            // provinces.value = response.data.province;
            // cities.value = response.data.city;
            // categories.value = response.data.category;
            // typeevent.value = response.data.typeevent;
            // invites.value = response.data.invites;
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

            <p>Detalhes do Convite</p>

            <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
            <p><strong>Descrição: </strong>{{ retriviedData.description }}</p>
            <!-- <p><strong>Preço: </strong>{{ retriviedData.price }}</p>
                <p><strong>Quantidade Máxima: </strong>{{ retriviedData.max_qtd }}</p>
                <p><strong>Data Inicio: </strong> {{ retriviedData.start_date }} - {{ retriviedData.start_time }}</p>
                <p><strong>Data Fim: </strong> {{ retriviedData.end_date }} - {{ retriviedData.end_time }}</p>
             -->
            <hr />
            <h5 class="mt-2 mb-2">Convidados Para o Evento</h5>
            <!-- /promotor/eventos/:id/bilhetes/create -->

            <Button @click.prevent="openCreateInvite()" label="Criar Novo Registro" class="mr-2 mb-2"> <i class="pi pi-plus"></i> Criar Convidados </Button>
            <p>Esta tabela de Convidados contem {{ customer.length }} Registros.</p>
            <DataTable :value="customer" tableStyle="min-width: 50rem">
                <template #header>
                    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                        <span class="text-xl text-900 font-bold">Convidados</span>
                        <Button icon="pi pi-refresh" rounded raised @click="getData" />
                    </div>
                </template>
                <Column field="name" header="#">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="name" sortable header="Nome"></Column>
                <Column field="status" sortable header="Estado"></Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <router-link :to="'/promotor/eventos/' + retriviedData.id + '/convites/' + slotProps.data.id" class="mr-2"><i class="pi pi-eye"></i></router-link>
                        <a href="#" @click.prevent="confirmDeletionInvite(slotProps.data.id)" class="mr-2"><i class="pi pi-trash"></i></a>
                    </template>
                </Column>
                <template #footer> No total são {{ customer.length }} Convidados. </template>
            </DataTable>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
    <Dialog header="Convidado" v-model:visible="displayCreateInvite" :style="{ width: '350px' }" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <form @submit="onSubmitCustomer">
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <h5>Adicionar Convidado</h5>
                        <div class="field">
                            <label for="name">Convidado</label>
                            <InputText v-model="name" id="name" required type="text" :class="{ 'p-invalid': errors.name }" />
                        </div>
                    </div>
                    <Button label="Submeter" class="mr-2 mb-2" @click="onSubmitCustomer" :disabled="isLoadingButton"></Button>
                    <ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                </div>
            </form>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" @click="closeCreateInvite" class="p-button-text" />
            <Button label="Sim" icon="pi pi-check" @click="onSubmitCreateTicket" class="p-button-text" autofocus />
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
</template>
