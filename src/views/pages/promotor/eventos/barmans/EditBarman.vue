<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import moment from 'moment';


const router = useRouter();
const isLoadingDiv = ref(false);
const isLoadingButton = ref(false);
const retriviedData = ref();
const barstore = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const toast = useToast();

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const schema = yup.object({
    name: yup.string().required().trim().label('Nome'),
    bi: yup.string().required().trim().label('BI'),
    mobile: yup.string().required().trim().label('Telefeone'),
    bar_store_id: yup.string().required().trim().label('barstore'),
    // description: yup.string().required().trim().label('Descricao'),
    // max_qtd: yup.string().required().label('Quantidade'),
    event_id: yup.string().required().label('Evento'),
    // start_date: yup.string().required().label('Data'),
    // start_time: yup.string().required().label('Horas'),
    // end_date: yup.string().required().label('Data'),
    // end_time: yup.string().required().label('Horas')

    // email: yup.string().required().email().label('Email province_id'),
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
const [event_id] = defineField('event_id');
const [bi] = defineField('bi');
const [mobile] = defineField('mobile');
const [bar_store_id] = defineField('bar_store_id');
// const [start_date] = defineField('start_date');
// const [start_time] = defineField('start_time');
// const [end_date] = defineField('end_date');
// const [end_time] = defineField('end_time');
// const [price] = defineField('price');



const onSubmit = handleSubmit((values) => {

    isLoadingButton.value = true;
    axios
        .put(`${baseURL}/promotor-barman/${router.currentRoute.value.params.idbarman}`, values)
        .then((response) => {
            resetForm();
            router.back();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Barman alterado com sucesso', life: 3000 });
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

const onFileUpload = (event) => {
    image.value = event.files[0];
    console.log(image.value);
};

const getData = () => {
    axios
    .get(`${baseURL}/promotor-barman/${router.currentRoute.value.params.idbarman}/edit`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.barman;
            name.value = retriviedData.value.name;
            bi.value = retriviedData.value.bi;
            mobile.value = retriviedData.value.mobile;
            event_id.value = retriviedData.value.event_id;
            bar_store_id.value = retriviedData.value.bar_store_id;
            barstore.value = response.data.barstore;

            // start_time.value = retriviedData.value.start_time;
            // end_time.value = retriviedData.value.end_time;
            // start_date.value = retriviedData.value.start_date;
            // end_date.value = retriviedData.value.end_date;
            // max_qtd.value = retriviedData.value.max_qtd;
            // price.value = retriviedData.value.price;
            // description.value = retriviedData.value.description;


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
                <h5>Editar Barman</h5>
            </div>

            <small class="p-error">Os campos marcados * sao considerados campos obrigatorios.</small>
            <form @submit="onSubmit">
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <h5>Formulário Edição de Barmans</h5>
                        <h5>Informação Geral</h5>
                        <div class="field">
                            <label for="name">Nome</label>
                            <InputText v-model="name" id="name" type="text" :class="{ 'p-invalid': errors.name }" />
                            <InputText v-model="event_id" id="event_id" type="hidden" :class="{ 'p-invalid': errors.event_id }" />

                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>
                        <div class="field">
                            <label for="mobile">Telefone</label>
                            <InputText v-model="mobile" id="mobile" type="text" :class="{ 'p-invalid': errors.mobile }" />

                            <small id="mobile-help" class="p-error">{{ errors.mobile }}</small>
                        </div>
                        <div class="field">
                            <label for="bi">BI</label>
                            <InputText v-model="bi" id="bi" type="text" :class="{ 'p-invalid': errors.bi }" />

                            <small id="bi-help" class="p-error">{{ errors.bi }}</small>
                        </div>
                        <div class="field">
                                <label for="bar_store_id">Bar</label>
                                <Dropdown v-model="bar_store_id" :options="barstore" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.bar_store_id }" />
                                <small id="bar_store_id-help" class="p-error">{{ errors.bar_store_id }}</small>
                        </div>
                        
                        
                    </div>
                    <Button label="Submeter" class="mr-2 mb-2" @click="onSubmit" :disabled="isLoadingButton"></Button
                    ><ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                </div>
            </form>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
