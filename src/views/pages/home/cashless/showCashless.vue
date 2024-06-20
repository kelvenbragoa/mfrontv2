<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { Bootstrap4Pagination, TailwindPagination } from 'laravel-vue-pagination';
import Paginator from 'primevue/paginator';

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const retriviedData = ref({ data: [] });
const isLoadingButton = ref(false);

const schema = yup.object({
    paymentNumber: yup.string().required().label('Telefone'),
    amount: yup.string().required().label('Valor')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const getTransaction = (transaction) => {
    switch (transaction) {
        case 0:
            return 'Recarga';
        case 1:
            return 'Compra';
        case 2:
            return 'Devolução';

        default:
            break;
    }
};
function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const [paymentNumber] = defineField('paymentNumber');
const [cardId] = defineField('cardId');
const [amount] = defineField('amount');

const onSubmit = handleSubmit((values) => {
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/cashless-recharge`, values, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
            cardId.value = retriviedData.value.card.id;
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Cartão recarregado com sucesso', life: 3000 });
            resetForm();
            // localStorage.setItem('order', JSON.stringify(response.data.order));
            // router.push({ path: '/encomenda' });
            // toast.add({ severity: 'success', summary: `Successo`, detail: 'A sua compra foi efetuada com sucesso', life: 3000 });
        })
        .catch((error) => {
            isLoadingButton.value = false;
            // goBackUsingBack();
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Detalhe da Mensagem', life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            isLoadingButton.value = false;
        });
});

const getData = async () => {
    axios
        .get(`${baseURL}/cashless/${router.currentRoute.value.params.id}`)
        .then((response) => {
            retriviedData.value = response.data;
            cardId.value = retriviedData.value.card.id;
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
    <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8" v-if="!isLoadingDiv">
        <div class="grid justify-content-left">
            <div class="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <!-- <div class="flex align-items-center justify-content-center mb-3" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                    
                                </div> -->
                        <h5 class="mb-2 text-900">Informações</h5>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-credit-card text-2xl"></i> {{ retriviedData.card.id }}</span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-user text-2xl"></i> {{ retriviedData.card.name }} </span>
                        </p>
                        <p>
                            <span class="text-600"><i class="pi pi-fw pi-dollar text-2xl"></i> {{ retriviedData.card.balance }} MT </span>
                        </p>
                        <hr />
                        <h5 class="mb-2 text-900">Recarregar</h5>
                        <img src="/demo/images/mpesa.png" alt="Logo" height="50" class="mr-2" />
                        <div class="field">
                            <label for="paymentNumber">Número de MPESA</label> <br />
                            <InputText id="paymentNumber" v-model="paymentNumber" type="text" :class="{ 'p-invalid': errors.paymentNumber }" :disabled="isLoadingButton" /><br />
                            <InputText id="cardId" v-model="cardId" type="hidden" />

                            <small id="city_id-help" class="p-error">{{ errors.paymentNumber }}</small>
                        </div>
                        <div class="field">
                            <label for="amount">Valor</label><br />
                            <InputText id="amount" v-model="amount" type="text" :class="{ 'p-invalid': errors.amount }" :disabled="isLoadingButton" /><br />
                            <small id="city_id-help" class="p-error">{{ errors.amount }}</small>
                        </div>
                        <div class="field">
                            <Button label="Submeter" class="mr-2 mb-2" @click="onSubmit" :disabled="isLoadingButton"></Button
                            ><ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 md:col-12 lg:col-8 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <img src="/demo/images/cashless.png" class="w-full border-round hover:scale-110 transition duration-500 cursor-pointer object-cover" height="400" />
                        <h2 class="text-900 font-normal mb-2">{{ retriviedData.name }}</h2>

                        <p class="mt-4">
                            <strong>Transações({{ retriviedData.transactions.length }})</strong>
                        </p>
                        <div
                            v-for="transaction in retriviedData.transactions"
                            :key="transaction.id"
                            style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"
                            class="mt-2"
                        >
                            <div class="flex justify-content-between align-items-center m-1">
                                <span> {{ getTransaction(transaction.type_of_transaction_id) }} </span>
                                <span> {{ transaction.type_of_transaction_id == 1 ? '-' : '+' }} {{ transaction.total }} </span>
                            </div>
                            <div class="flex justify-content-between align-items-center m-1">
                                <span> {{ moment(transaction.created_at).format('DD-MM-YYYY HH:mm') }} </span>
                                <span> {{ transaction.balance }} </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="surface-0 flex justify-content-center" v-else>
        <div class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-column align-items-center justify-content-center">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                <p>Por Favor Aguarde...</p>
            </div>
        </div>
    </div>
</template>
