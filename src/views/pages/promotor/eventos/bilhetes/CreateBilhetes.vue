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
const provinces = ref([]);
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
    price: yup.string().required().trim().label('Preco'),
    description: yup.string().required().trim().label('Descricao'),
    max_qtd: yup.string().required().label('Quantidade'),
    max_per_order: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null || originalValue === undefined ? null : value))
        .nullable()
        .min(1)
        .integer()
        .label('Máx. por compra'),
    event_id: yup.string().required().label('Evento'),
    start_date: yup.string().required().label('Data'),
    start_time: yup.string().required().label('Horas'),
    end_date: yup.string().required().label('Data'),
    end_time: yup.string().required().label('Horas'),
    is_live: yup.boolean().nullable()

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
const [description] = defineField('description');
const [max_qtd] = defineField('max_qtd');
const [max_per_order] = defineField('max_per_order');
const [start_date] = defineField('start_date');
const [start_time] = defineField('start_time');
const [end_date] = defineField('end_date');
const [end_time] = defineField('end_time');
const [price] = defineField('price');
const [is_live] = defineField('is_live');



const onSubmit = handleSubmit((values) => {

    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/promotor-tickets`, { ...values, is_live: values.is_live ? 1 : 0 }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            resetForm();
            router.back();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Bilhete criado com sucesso', life: 3000 });
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

const getCreateEvents = () => {
    axios
        .get(`${baseURL}/promotor-eventos/create`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            provinces.value = response.data.province;
            cities.value = response.data.city;
            categories.value = response.data.category;
            typeevent.value = response.data.typeevent;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};
onMounted(() => {
    event_id.value = router.currentRoute.value.params.id
    is_live.value = false;
    // getCreateEvents();
});
</script>
<template>
    <div className="card" v-if="!isLoadingDiv">
        <div class="col-12">
            <div class="card-w-title">
                <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
                <h5>Criar Ticket</h5>
            </div>

            <small class="p-error">Os campos marcados * sao considerados campos obrigatorios.</small>
            <form @submit="onSubmit">
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <h5>Formulário Criação de Bilhetes</h5>
                        <h5>Informação Geral</h5>
                        <div class="field">
                            <label for="name">Nome</label>
                            <InputText v-model="name" id="name" type="text" :class="{ 'p-invalid': errors.name }" />
                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>
                        <div class="field">
                            <label for="price">Preço</label>
                            <InputText v-model="price" id="price" type="number" :class="{ 'p-invalid': errors.price }" />
                            <small id="price-help" class="p-error">{{ errors.price }}</small>
                        </div>
                        <div class="field">
                            <label for="description">Descrição</label>
                            <InputText v-model="description" id="description" type="text" :class="{ 'p-invalid': errors.description }" />
                            <small id="description-help" class="p-error">{{ errors.description }}</small>
                        </div>
                        <div class="field">
                            <label for="max_qtd">Quantidade Máxima</label>
                            <InputText v-model="max_qtd" id="max_qtd" type="number" :class="{ 'p-invalid': errors.max_qtd }" />
                            <InputText v-model="event_id" id="event_id" type="hidden" :class="{ 'p-invalid': errors.event_id }" />
                            <small id="max_qtd-help" class="p-error">{{ errors.max_qtd }}</small>
                        </div>
                        <div class="field">
                            <label for="max_per_order">Máx. bilhetes por compra (opcional)</label>
                            <InputText
                                v-model="max_per_order"
                                id="max_per_order"
                                type="number"
                                min="1"
                                placeholder="Ex: 1 (só um de cada vez)"
                                :class="{ 'p-invalid': errors.max_per_order }"
                            />
                            <small class="text-600">Limita a quantidade no checkout web. Vazio = até 5. Não afecta o check-in.</small>
                            <small id="max_per_order-help" class="p-error block">{{ errors.max_per_order }}</small>
                        </div>
                        <div class="field">
                            <div class="flex align-items-center gap-2">
                                <InputSwitch v-model="is_live" inputId="is_live" />
                                <label for="is_live" class="mb-0">Dá acesso à live online</label>
                            </div>
                            <small class="text-600">Este bilhete não é válido na entrada do evento. Só serve para ver a live no site.</small>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="start_date">Data de Inicio</label>
                                <InputText v-model="start_date" id="start_date" type="date" :class="{ 'p-invalid': errors.start_date }" />
                                <small id="start_date-help" class="p-error">{{ errors.start_date }}</small>
                            </div>
                            <div class="field col">
                                <label for="start_time">Horas de Inicio</label>
                                <InputText v-model="start_time" id="start_time" type="time" :class="{ 'p-invalid': errors.start_time }" />
                                <small id="start_time-help" class="p-error">{{ errors.start_time }}</small>
                            </div>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="end_date">Data de Termino</label>
                                <InputText v-model="end_date" id="end_date" type="date" :class="{ 'p-invalid': errors.end_date }" />
                                <small id="end_date-help" class="p-error">{{ errors.end_date }}</small>
                            </div>
                            <div class="field col">
                                <label for="end_time">Horas de Termino</label>
                                <InputText v-model="end_time" id="end_time" type="time" :class="{ 'p-invalid': errors.end_time }" />
                                <small id="end_time-help" class="p-error">{{ errors.end_time }}</small>
                            </div>
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
