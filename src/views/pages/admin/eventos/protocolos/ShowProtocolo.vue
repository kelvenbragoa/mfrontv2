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
const provinces = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const protocols = ref([]);
const selectedProtocol = ref(null); // Protocolo selecionado
const total = ref(0);
const idProtocolo = ref(0);


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

const fetchProtocolData = () => {
    console.log(selectedProtocol.value)
    idProtocolo.value = selectedProtocol.value;
    getData();
}

const getData = () => {
    axios
        // .get(`${baseURL}/promotor-protocolo/${router.currentRoute.value.params.idprotocolo}`)
        .get(`${baseURL}/promotor-protocolo/${idProtocolo.value}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.protocolo;
            total.value = response.data.total;
            protocols.value = response.data.protocols;
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
    idProtocolo.value = router.currentRoute.value.params.idprotocolo;
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
            <Dropdown v-model="selectedProtocol" :options="protocols" optionLabel="name" optionValue="id"
                placeholder="Selecione um protocolo" class="w-full md:w-20rem" @change="fetchProtocolData" />

            <p>Detalhes do Protocolo</p>
            
                <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
                <p><strong>Usuário: </strong>{{ retriviedData.user }}</p>
                <p><strong>Telefone: </strong>{{ retriviedData.mobile }}</p>
                <p><strong>BI: </strong>{{ retriviedData.bi }}</p>
                <p><strong>Password: </strong>{{ retriviedData.password }}</p>
                <hr>
                <h5>Indicadores do Protocolo</h5>
                <div class="grid">
                    <div class="col-12 md:col-6 lg:col-3">
                        <Card>
                            <template #content>
                                <div class="indicator-card">
                                    <span class="pi pi-chart-bar icon"></span>
                                    <h4>Bilhetes Verificados</h4>
                                    <p class="value">{{ total }}</p>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>

                
            
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
