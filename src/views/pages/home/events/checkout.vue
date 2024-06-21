<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { ProductService } from '@/service/ProductService';
import { PhotoService } from '@/service/PhotoService';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import VueNumeric from 'vue-numeric';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const loadingButtonDelete = ref(false);
const retriviedData = ref();
const tickets = ref();
const toast = useToast();
const products = ref([]);
const images = ref([]);
const total = ref(0);
const isAuthenticated = ref([]);

const schema = yup.object({
    customerName: yup.string().required().trim().label('Nome'),
    customerEmail: yup.string().required().trim().label('Email'),
    customerMobile: yup.string().required().trim().label('Telefone'),
    // paymentNumber: yup.string().required().label('Telefone')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [customerName] = defineField('customerName');
const [customerEmail] = defineField('customerEmail');
const [customerMobile] = defineField('customerMobile');
const [paymentNumber] = defineField('paymentNumber');
const [user_id] = defineField('user_id');

const getSeverity = (status) => {
    switch (status) {
        case 'INSTOCK':
            return 'success';

        case 'LOWSTOCK':
            return 'warning';

        case 'OUTOFSTOCK':
            return 'danger';

        default:
            return null;
    }
};

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const totalQuantity = computed(() => {
    return tickets.value.reduce((total, ticket) => total + ticket.quantity, 0);
});

const totalPrice = computed(() => {
    return tickets.value.reduce((total, ticket) => total + ticket.quantity * ticket.price, 0);
});

const onSubmit = handleSubmit((values) => {
    values.tickets = tickets.value;
    values.amount = totalPrice.value;
    const other = values.tickets;
    isLoadingButton.value = true;

    axios
        .post(`${baseURL}/checkout`, values, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            // resetForm();
            localStorage.setItem('order', JSON.stringify(response.data.order));
            router.push({ path: '/encomenda' });
            toast.add({ severity: 'success', summary: `Successo`, detail: 'A sua compra foi efetuada com sucesso', life: 3000 });
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
        .get(`${baseURL}/checkout/${router.currentRoute.value.params.id}`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            retriviedData.value = response.data.events;
            tickets.value = response.data.tickets;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};
onMounted(() => {
    isAuthenticated.value = JSON.parse(localStorage.getItem('user'));
    if (isAuthenticated.value) {
        customerName.value = isAuthenticated.value.name;
        customerEmail.value = isAuthenticated.value.email;
        customerMobile.value = isAuthenticated.value.mobile;
        user_id.value = isAuthenticated.value.id;
    }
    getData();
});
</script>

<template>
    <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8" v-if="!isLoadingDiv">
        <div class="grid justify-content-left">
            <div class="col-12 text-left mt-8 mb-4">
                <h2 class="text-900 font-normal mb-2">{{ retriviedData.name }}</h2>
                <span class="text-600 text-2xl">{{ moment(retriviedData.start_date).format('LL') }}, {{ retriviedData.address }}, {{ retriviedData.province.name }}</span>
            </div>

            <div class="col-12 md:col-12 lg:col-12 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <h2 class="text-900 font-normal mb-2">Pagamentos</h2>
                        <div class="grid grid-nogutter">
                            <div v-for="(item, index) in tickets" :key="item.id" class="col-12">
                                <div class="flex flex-column sm:flex-row sm:align-items-center p-4 gap-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
                                    <div class="md:w-10rem relative">
                                        <img class="block xl:block border-round mx-auto border-round w-full" :src="storageURL + retriviedData.image" :alt="item.name" />
                                        <Tag :value="item.inventoryStatus" :severity="getSeverity(item)" class="absolute" style="left: 4px; top: 4px"></Tag>
                                    </div>
                                    <div class="flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4">
                                        <div class="flex flex-row md:flex-column justify-content-between align-items-start gap-2">
                                            <div>
                                                <!-- <span class="font-medium text-secondary text-sm">{{ item.name }}</span> -->
                                                <div class="text-lg font-medium text-900 mt-2">{{ item.name }}</div>
                                                <div class="text-lg font-medium text-900 mt-2">Inicio: {{ moment(item.start_date).format('LL') }} {{ moment(item.start_time, 'HH:mm:ss').format('HH:mm') }}</div>
                                                <div class="text-lg font-medium text-900 mt-2">Fim: {{ moment(item.end_date).format('LL') }} {{ moment(item.end_time, 'HH:mm:ss').format('HH:mm') }}</div>
                                            </div>
                                        </div>
                                        <div
                                            class="flex flex-column md:align-items-end gap-5"
                                            v-if="moment().isAfter(moment(`${item.end_date} ${item.end_time}`)) || item.max_qtd <= 0 || moment().isSameOrBefore(moment(`${item.start_date} ${item.start_time})`))"
                                        >
                                            <span class="text-xl font-semibold text-900 text-red"><Tag value="Bilhete Indisponível" severity="danger" /></span>
                                        </div>
                                        <div class="flex flex-column md:align-items-end gap-5" v-else>
                                            <span class="text-xl font-semibold text-900">{{ item.price }} MT</span>
                                            <div class="flex flex-row-reverse md:flex-row gap-2">
                                                <InputNumber v-model="item.quantity" showButtons buttonLayout="horizontal" :min="0" :max="5" :disabled="isLoadingButton">
                                                    <template #incrementbuttonicon>
                                                        <span class="pi pi-plus" />
                                                    </template>
                                                    <template #decrementbuttonicon>
                                                        <span class="pi pi-minus" />
                                                    </template>
                                                </InputNumber>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div v-if="totalQuantity > 0">
                            <h2 class="text-900 font-normal mb-2">Resumo da Encomenda</h2>
                            <h5 class="text-900 font-normal mb-2">Total de Bilhetes: {{ totalQuantity }}</h5>
                            <h5 class="text-900 font-normal mb-2">Preço Total: {{ totalPrice.toFixed(2) }} MT</h5>
                            <form @submit="onSubmit">
                                <div class="card p-fluid">
                                    <h5>Detalhes do Cliente</h5>
                                    <div class="field">
                                        <label for="customerName">Nome</label>
                                        <InputText id="customerName" v-model="customerName" type="text" :class="{ 'p-invalid': errors.customerName }" :disabled="isLoadingButton || isAuthenticated" />
                                        <small id="city_id-help" class="p-error">{{ errors.customerName }}</small>
                                    </div>
                                    <div class="field">
                                        <label for="customerEmail">Email ( O seu bilhete será encaminhado para este email)</label>
                                        <InputText id="customerEmail" v-model="customerEmail" type="email" :class="{ 'p-invalid': errors.customerEmail }" :disabled="isLoadingButton || isAuthenticated" />
                                        <small id="city_id-help" class="p-error">{{ errors.customerEmail }}</small>
                                    </div>
                                    <div class="field">
                                        <label for="customerMobile">Telemóvel ( WhatsApp - O seu bilhete será encaminhado para este número)</label>
                                        <InputText id="customerMobile" v-model="customerMobile" type="number" :class="{ 'p-invalid': errors.customerMobile }" :disabled="isLoadingButton || isAuthenticated" />
                                        <small id="city_id-help" class="p-error">{{ errors.customerMobile }}</small>
                                    </div>
                                </div>
                                <div class="card p-fluid">
                                    
                                    <h5>Informações do Pagamento</h5>
                                    <div v-if="retriviedData.type_event_id == 1">
                                        <img src="/demo/images/mpesa.png" alt="Logo" height="100" class="mr-2" />
                                        <div class="field">
                                            <label for="paymentNumber">Número de MPESA</label>
                                            <InputText id="paymentNumber" v-model="paymentNumber" type="text" :class="{ 'p-invalid': errors.paymentNumber }" :disabled="isLoadingButton" />
                                            <InputText id="user_id" v-model="user_id" type="hidden" />

                                            <small id="city_id-help" class="p-error">{{ errors.paymentNumber }}</small>
                                        </div>
                                    </div>
                                   
                                    <div class="field">
                                        <label>Valor Total a Pagar: {{ totalPrice.toFixed(2) }} MT</label>
                                    </div>
                                    <div class="field" v-if="!isAuthenticated">
                                        <label>Nota: Recomendamos que registre-se na plataforma e faça a compra do seu bilhete, para manter históricos dos seus bilhetes e recuperar a qualquer momento.</label>
                                    </div>
                                    <div class="field">
                                        <Button label="Submeter" class="mr-2 mb-2" @click="onSubmit" :disabled="isLoadingButton"></Button
                                        ><ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div v-else>
                            <h2 class="text-900 font-normal mb-2">Pagamentos</h2>
                            <h5 class="text-900 font-normal mb-2">Nenhum Bilhete Selecionado!</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
