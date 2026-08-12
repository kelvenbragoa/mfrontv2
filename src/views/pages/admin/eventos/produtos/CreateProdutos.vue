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
const bars = ref([]);
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
    buy_price: yup.string().required().label('Preço de compra'),
    sell_price: yup.string().required().label('Preço de venda'),
    event_id: yup.string().required().label('Evento'),
    bar_store_id: yup.string().required().label('Bar'),
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [name] = defineField('name');
const [event_id] = defineField('event_id');
const [sell_price] = defineField('sell_price');
const [buy_price] = defineField('buy_price');
const [bar_store_id] = defineField('bar_store_id');


const onSubmit = handleSubmit((values) => {

    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/promotor-products`, values, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            resetForm();
            router.back();
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Produto criado com sucesso', life: 3000 });
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

const getCreateProducts = () => {
    axios
        .get(`${baseURL}/auxiliar-event/${event_id.value}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            bars.value = response.data.barstore;
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
    getCreateProducts();
});
</script>
<template>
    <div className="card" v-if="!isLoadingDiv">
        <div class="col-12">
            <div class="card-w-title">
                <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
                <h5>Criar Produto</h5>
            </div>

            <small class="p-error">Os campos marcados * sao considerados campos obrigatorios.</small>
            <form @submit="onSubmit">
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <h5>Formulário Criação de Produto</h5>
                        <h5>Informação Geral</h5>
                        <div class="field">
                            <label for="name">Nome</label>
                            <InputText v-model="name" id="name" type="text" :class="{ 'p-invalid': errors.name }" />
                            <InputText v-model="event_id" id="name" type="hidden" :class="{ 'p-invalid': errors.name }" />
                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>
                        <div class="field">
                            <label for="buy_price">Preço de Compra</label>
                            <InputText v-model="buy_price" id="buy_price" type="text" :class="{ 'p-invalid': errors.buy_price }" />
                            <small id="buy_price-help" class="p-error">{{ errors.buy_price }}</small>
                        </div>
                        <div class="field">
                            <label for="sell_price">Preço de Venda</label>
                            <InputText v-model="sell_price" id="sell_price" type="text" :class="{ 'p-invalid': errors.sell_price }" />
                            <small id="sell_price-help" class="p-error">{{ errors.sell_price }}</small>
                        </div>
                        <small class="text-600 mb-3 block">O stock começa em 0. Usa uma <strong>nota de entrada</strong> no bar para adicionar quantidades.</small>
                        <div class="field">
                            <label for="bar_store_id">Bar</label>
                            <Dropdown v-model="bar_store_id" :options="bars"  optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.province_id }" />
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
