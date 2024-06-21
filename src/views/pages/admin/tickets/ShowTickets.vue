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
import QrcodeVue from 'qrcode.vue';


const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const retriviedData = ref();
const toast = useToast();
const provinces = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const tickets = ref([]);

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
        .get(`${baseURL}/admin-tickets/${router.currentRoute.value.params.id}`)
        .then((response) => {
            retriviedData.value = response.data.ticket;

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

            <p>Ticket</p>

            <p><strong>ID: </strong>#{{ retriviedData.id }}</p>
            <p><strong>Evento: </strong>{{ retriviedData.event.name }}</p>
            <p><strong>Bilhete: </strong>{{ retriviedData.ticket.name }}</p>
            <p><strong>Transação: </strong>{{ retriviedData.sell.transaction.reference }}</p>
            <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
            <p><strong>Email: </strong>{{ retriviedData.email }}</p>
            <p><strong>Telefone: </strong>{{ retriviedData.mobile }}</p>
            <hr />

            <div class="ticket">
                <div class="left">
                    <div class="image" :style="`background-image: url(${storageURL}${retriviedData.event.image})`">
                        <p class="admit-one">
                            <span>Mticket</span>
                            <span>Mticket</span>
                            <span>Mticket</span>
                        </p>
                        <div class="ticket-number">
                            <p>#0{{ retriviedData.id }}</p>
                        </div>
                    </div>
                    <div class="ticket-info">
                        <p class="date">
                            <span>{{ moment(retriviedData.event.start_date).format('dddd') }}</span>
                            <span class="june-29">{{ moment(retriviedData.event.start_date).format('D') }} - {{ moment(retriviedData.event.start_date).format('MM') }}</span>
                            <span>{{ moment(retriviedData.event.start_date).format('YYYY') }}</span>
                        </p>
                        <div class="show-name">
                            <h1>{{ retriviedData.event.name }}</h1>
                            <br />
                            <h2>{{ retriviedData.name }}</h2>
                            <h2>{{ retriviedData.ticket.name }}</h2>
                            <div class="cardticket">
                                <p>{{ retriviedData.ticket.description }}</p>
                            </div>
                        </div>
                        <div class="time">
                            <p>{{ moment(retriviedData.event.start_time, 'HH:mm:ss').format('HH:mm') }}</p>
                        </div>
                        <p class="location">
                            <span>{{ retriviedData.event.address }}</span> <span class="separator"> </span><span>{{ retriviedData.event.province.name }}, Moçambique</span>
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
                            <h1>{{ retriviedData.event.name }}</h1>
                        </div>
                        <div class="time">
                            <p>{{ moment(retriviedData.event.start_time, 'HH:mm:ss').format('HH:mm') }} até {{ moment(retriviedData.event.end_time, 'HH:mm:ss').format('HH:mm') }}</p>
                        </div>
                        <div class="barcode">
                            <qrcode-vue :value="`{&quot;s&quot;:${retriviedData.status},&quot;i&quot;:${retriviedData.id},&quot;ie&quot;:${retriviedData.event_id}}`" :size="100" level="H" render-as="svg" />
                        </div>
                        <p class="ticket-number">#0{{ retriviedData.id }}</p>
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
