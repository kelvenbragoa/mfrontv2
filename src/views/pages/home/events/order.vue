<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, toRefs } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { ProductService } from '@/service/ProductService';
import { PhotoService } from '@/service/PhotoService';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL, styleURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import VueNumeric from 'vue-numeric';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import QrcodeVue from 'qrcode.vue';
import { usePaperizer } from 'paperizer'


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
const orders = ref([]);
const props = defineProps(['data']);

const schema = yup.object({
    customerName: yup.string().required().trim().label('Nome'),
    customerEmail: yup.string().required().trim().label('Email'),
    customerMobile: yup.string().required().trim().label('Telefone'),
    paymentNumber: yup.string().required().label('Telefone')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [customerName] = defineField('customerName');
const [customerEmail] = defineField('customerEmail');
const [customerMobile] = defineField('customerMobile');
const [paymentNumber] = defineField('paymentNumber');

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

    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/checkout`, values, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            resetForm();
            // router.push({ path: '/promotor/eventos' });
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
    orders.value = JSON.parse(localStorage.getItem('order'));

    if( orders.value ){
        isLoadingDiv.value = false;
        localStorage.removeItem('order');

    } else {
        goBackUsingBack();
    }

    // axios
    //     .get(`${baseURL}/checkout/${router.currentRoute.value.params.id}`)
    //     .then((response) => {
    //         // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
    //         retriviedData.value = response.data.events;
    //         tickets.value = response.data.tickets;
    //         isLoadingDiv.value = false;
    //     })
    //     .catch((error) => {
    //         isLoadingDiv.value = false;
    //         toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
    //         goBackUsingBack();
    //     });
};

const { paperize } = usePaperizer('myticket',{
    styles: [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    `${styleURL}/ticket.css`
  ]
})

const downloadMcscr = () =>{
    paperize()
}
onMounted(() => {
    getData();
});
</script>

<template>
    <div id="features" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8" v-if="!isLoadingDiv">
        <div class="grid justify-content-left">
            <div class="col-12 text-left mt-8 mb-4">
                <h2 class="text-900 font-normal mb-2">Minha Encomenda</h2>
            </div>

            <div class="col-12 md:col-12 lg:col-12 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-3 surface-card h-full" style="border-radius: 8px">
                        <h2 class="text-900 font-normal mb-2">Minha Encomenda</h2>
                        <Button label="Baixar" @click="downloadMcscr" class="p-button-rounded border-none font-light text-white line-height-2 bg-blue-500"></Button>
                        <!-- <div class="grid grid-nogutter">
                            <div v-for="(item, index) in orders" :key="item.id" class="col-12">
                                <div class="flex flex-column sm:flex-row sm:align-items-center p-4 gap-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
                                    <div class="md:w-10rem relative">
                                        <img class="block xl:block border-round mx-auto border-round w-full" :src="storageURL + item.event.image" :alt="item.name" />
                                        <Tag :value="item.inventoryStatus" :severity="getSeverity(item)" class="absolute" style="left: 4px; top: 4px"></Tag>
                                    </div>
                                    <div class="flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4">
                                        <div class="flex flex-row md:flex-column justify-content-between align-items-start gap-2">
                                            <div>
                                                <div class="text-lg font-medium text-900 mt-2">{{ item.name }}</div>
                                                <div class="text-lg font-medium text-900 mt-2">Inicio: {{ item.start_date }} {{ item.start_time }}</div>
                                                <div class="text-lg font-medium text-900 mt-2">Fim: {{ item.end_date }} {{ item.end_time }}</div>
                                            </div>
                                        </div>
                                        <div class="flex flex-column md:align-items-end gap-5">
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
                           
                        </div> -->
                        <div v-for="(item, index) in orders" :key="item.id" id="myticket">
                            <p>Encomenda da Venda ID: #{{ item.id }}</p>
                            <div class="ticket" v-for="(item2, index) in item.selldetails" :key="item2.id">
                                <div class="left">
                                    <div class="image" :style="`background-image: url(${storageURL}${item.event.image})`">
                                        <p class="admit-one">
                                            <span>Mticket</span>
                                            <span>Mticket</span>
                                            <span>Mticket</span>
                                        </p>
                                        <div class="ticket-number">
                                            <p>#0{{ item2.id }}</p>
                                        </div>
                                    </div>
                                    <div class="ticket-info">
                                        <p class="date">
                                            <span>{{ moment(item.event.start_date).format('dddd') }}</span>
                                            <span class="june-29">{{ moment(item.event.start_date).format('D') }} - {{ moment(item.event.start_date).format('MM') }}</span>
                                            <span>{{ moment(item.event.start_date).format('YYYY') }}</span>
                                        </p>
                                        <div class="show-name">
                                            <h1>{{ item.event.name }}</h1>
                                            <br />
                                            <h2>{{ item.name }}</h2>
                                            <h2>{{ item.ticket.name }}</h2>
                                            <div class="cardticket">
                                                <p>{{ item.ticket.description }}</p>
                                            </div>
                                        </div>
                                        <div class="time">
                                            <p>{{ moment(item.event.start_time, 'HH:mm:ss').format('HH:mm') }}</p>
                                        </div>
                                        <p class="location">
                                            <span>{{ item.event.address }}</span> <span class="separator"> </span><span>{{ item.event.province.name }}, Moçambique</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="right">
                                    <p class="admit-one">
                                        <span>Mticket</span>
                                        <span>Mticket</span>
                                        <span>Mticket</span>
                                    </p>
                                    <div class="right-info-container">
                                        <div class="show-name">
                                            <h1>{{ item.event.name }}</h1>
                                        </div>
                                        <div class="time">
                                            <p>{{ moment(item.event.start_time, 'HH:mm:ss').format('HH:mm') }} até {{ moment(item.event.end_time, 'HH:mm:ss').format('HH:mm') }}</p>
                                        </div>
                                        <div class="barcode">
                                            <qrcode-vue :value='`{"s":${item2.status},"i":${item2.id},"ie":${item2.event_id}}`' :size="100" level="H" render-as="svg"  />
                                        </div>
                                        <p class="ticket-number">#0{{ item2.id }}</p>
                                    </div>
                                </div>
                            </div>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Staatliches&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');

body,
html {
    height: 100vh;
    display: grid;
    font-family: 'Staatliches', cursive;
    background: #ffff;
    color: black;
    font-size: 14px;
    letter-spacing: 0.1em;
}

.ticketgeneral {
    height: 100vh;
    display: grid;
    font-family: 'Staatliches', cursive;
    background: #ffff;
    color: black;
    font-size: 14px;
    letter-spacing: 0.1em;
}

.ticket {
    margin: auto;
    display: flex;
    background: white;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
    margin-bottom: 5px;
}

.left {
    display: flex;
}

.image {
    height: 250px;
    width: 250px;
    /* background-image: url('/storage/{{$event->image}}'); */
    background-size: contain;
    opacity: 0.85;
}

.admit-one {
    position: absolute;
    color: darkgray;
    height: 250px;
    padding: 0 10px;
    letter-spacing: 0.15em;
    display: flex;
    text-align: center;
    justify-content: space-around;
    writing-mode: vertical-rl;
    transform: rotate(-180deg);
}

.admit-one span:nth-child(2) {
    color: white;
    font-weight: 700;
}

.left .ticket-number {
    height: 250px;
    width: 250px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 5px;
}

.ticket-info {
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: space-between;
    align-items: center;
}

.date {
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    padding: 5px 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.date span {
    width: 100px;
}

.date span:first-child {
    text-align: left;
}

.date span:last-child {
    text-align: right;
}

.date .june-29 {
    color: #d83565;
    font-size: 20px;
}

.show-name {
    font-size: 20px;
    font-family: 'Open Sans', cursive;
    color: #d83565;
}

.show-name h1 {
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 0.1em;
    /* color: #04aff4; */
    color: black;
}

.time {
    padding: 10px 0;
    /* color: #04aff4; */
    color: black;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-weight: 700;
}

.time span {
    font-weight: 400;
    color: gray;
}

.left .time {
    font-size: 16px;
}

.location {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    padding-top: 8px;
    border-top: 1px solid gray;
}

.location .separator {
    font-size: 20px;
}

.right {
    width: 180px;
    border-left: 1px dashed #404040;
}

.right .admit-one {
    color: darkgray;
}

.right .admit-one span:nth-child(2) {
    color: gray;
}

.right .right-info-container {
    height: 250px;
    padding: 10px 10px 10px 35px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.right .show-name h1 {
    font-size: 18px;
}

.barcode {
    height: 100px;
}

.barcode img {
    height: 100%;
}

.right .ticket-number {
    color: gray;
}

.cardticket {
    align-items: center;
    padding: 10px 30px;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: space-between;
    align-items: center;
    max-width: 50ch;
}

.cardticket p {
    color: black;
}
</style>
