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
import { usePaperizer } from 'paperizer';
import html2pdf from 'html2pdf.js';

const printContent = ref();

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const searchQuery = ref(null);
const retriviedData = ref({ data: [] });
let documentStyle = getComputedStyle(document.documentElement);
let textColor = documentStyle.getPropertyValue('--text-color');
let textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
let surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const { paperize } = usePaperizer('print-me', {
    styles: ['https://cdn.tailwindcss.com']
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
const downloadPDF = () => {
    // paperize();
    const element = printContent.value;
    // const opt = {
    //     margin: 0.1,
    //     filename: 'document.pdf',
    //     image: { type: 'jpeg', quality: 0.98 },
    //     pagebreak: { avoid: 'tr', mode: 'css', before: '#nextpage1', after: '1cm' },
    //     html2canvas: { scale: 2 },
    //     jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    // };

    const opt = {
        margin: [0, -0.1, 0, 0],
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 1 },
        pagebreak: { avoid: 'tr', mode: 'css', before: '#nextpage1', after: '1cm' },
        html2canvas: { scale: 1, useCORS: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', putTotalPages: true }
    };
    html2pdf().from(element).set(opt).save();
};

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const barData = ref({
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    datasets: [
        {
            label: 'Vendas Diárias',
            backgroundColor: documentStyle.getPropertyValue('--primary-500'),
            borderColor: documentStyle.getPropertyValue('--primary-500'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    ]
});

const barDataMonth = ref({
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    datasets: [
        {
            label: 'Vendas Mensais',
            backgroundColor: documentStyle.getPropertyValue('--primary-500'),
            borderColor: documentStyle.getPropertyValue('--primary-500'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    ]
});

const barOptions = ref({
    plugins: {
        legend: {
            labels: {
                fontColor: textColor
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: textColorSecondary,
                font: {
                    weight: 500
                }
            },
            grid: {
                display: false,
                drawBorder: false
            }
        },
        y: {
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder,
                drawBorder: false
            }
        }
    }
});

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/promotor-dashboard/${router.currentRoute.value.params.id}/bilhetes`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;
            barData.value.datasets = retriviedData.value.ticket_report.map((data) => ({
                label: data.name,
                backgroundColor: getRandomColor(),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: data.dataTicketDay
            }));

            barDataMonth.value.datasets = retriviedData.value.ticket_report.map((data) => ({
                label: data.name,
                backgroundColor: getRandomColor(),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: data.dataTicketMonth
            }));

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
    <div v-if="!isLoadingDiv">
        <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
        <Button label="Print" class="mr-2 mb-2" @click="downloadPDF"><i class="pi pi-print"></i> Print</Button>
    </div>

    <div class="grid" v-if="!isLoadingDiv" id="print-me" ref="printContent">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bilhetes Vendidos</span>
                        <div class="text-900 font-medium text-ml">{{ retriviedData.allsells_total }}</div>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.allsells_value }} MT</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bilhetes Vendindos Hoje</span>
                        <div class="text-900 font-medium text-ml">{{ retriviedData.allsells_total_today }}</div>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.allsells_value_today }} MT</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bilhetes Vendidos esta semana</span>
                        <div class="text-900 font-medium text-ml">{{ retriviedData.allsells_total_week }}</div>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.allsells_value_week }} MT</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Bilhetes Vendidos este mês</span>
                        <div class="text-900 font-medium text-ml">{{ retriviedData.allsells_total_month }}</div>
                        <div class="text-900 font-medium text-xl">{{ retriviedData.allsells_value_month }} MT</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
            </div>
        </div>

        <div class="col-12 xl:col-12" v-for="(report, index) in retriviedData.ticket_report" :key="index">
            <div class="card">
                <h5>{{ report.name }}</h5>
                <div class="grid">
                    <div class="col-12 lg:col-6 xl:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">Bilhetes Vendidos</span>
                                    <div class="text-900 font-medium text-ml">{{ report.total }}</div>
                                    <div class="text-900 font-medium text-xl">{{ report.value }} MT</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                                </div>
                            </div>
                            <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 xl:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">Bilhetes Vendindos Hoje</span>
                                    <div class="text-900 font-medium text-ml">{{ report.total_today }}</div>
                                    <div class="text-900 font-medium text-xl">{{ report.value_today }} MT</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                                </div>
                            </div>
                            <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 xl:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">Bilhetes Vendidos esta semana</span>
                                    <div class="text-900 font-medium text-ml">{{ report.total_week }}</div>
                                    <div class="text-900 font-medium text-xl">{{ report.value_week }} MT</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                                </div>
                            </div>
                            <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
                        </div>
                    </div>
                    <div class="col-12 lg:col-6 xl:col-3">
                        <div class="card mb-0">
                            <div class="flex justify-content-between mb-3">
                                <div>
                                    <span class="block text-500 font-medium mb-3">Bilhetes Vendidos este mês</span>
                                    <div class="text-900 font-medium text-ml">{{ report.total_month }}</div>
                                    <div class="text-900 font-medium text-xl">{{ report.value_month }} MT</div>
                                </div>
                                <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                                    <i class="pi pi-comment text-purple-500 text-xl"></i>
                                </div>
                            </div>
                            <router-link :to="'/promotor/eventos/' + router.currentRoute.value.params.id"><i class="pi pi-eye text-blue-500 text-xl"></i></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 xl:col-12">
            <div class="grid">
                <div class="col-12 xl:col-6">
                    <div class="card">
                        <h5>Vendas Diárias</h5>
                        <Chart type="bar" :data="barData" :options="barOptions"></Chart>
                    </div>
                </div>
                <div class="col-12 xl:col-6">
                    <div class="card">
                        <h5>Vendas Mensais</h5>
                        <Chart type="bar" :data="barDataMonth" :options="barOptions"></Chart>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Bilhetes do Evento</h5>
                <DataTable :value="retriviedData.tickets_issued" :rows="1" responsiveLayout="scroll">
                    <Column field="ticket.name" header="Nome" :sortable="true" style="width: 35%"></Column>
                    <Column field="qty" header="Quantidade" :sortable="true" style="width: 35%"></Column>
                    <Column field="total" header="Valor" :sortable="true" style="width: 35%">
                        <template #body="slotProps"> {{ slotProps.data.price }} MT </template>
                    </Column>
                    <Column field="name" header="Cliente" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ slotProps.data.user_id == 0 ? 'MTICKET VENDA FISICA' : `${slotProps.data.name} / ${slotProps.data.mobile}` }}
                        </template>
                    </Column>
                    <!-- <Column field="sells" header="Vendas" :sortable="true" style="width: 35%"></Column> -->

                    <Column field="sells" header="Data" :sortable="true" style="width: 35%">
                        <template #body="slotProps">
                            {{ moment(slotProps.data.created_at).format('DD-MM-YYYY H:mm') }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
