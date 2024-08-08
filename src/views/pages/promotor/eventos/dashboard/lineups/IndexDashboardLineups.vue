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
            label: 'Vendas Diárias Pacotes',
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
            label: 'Vendas Mensais Pacotes',
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
        .get(`${baseURL}/promotor-dashboard/${router.currentRoute.value.params.id}/lineups`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data;

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
        <div class="col-12 xl:col-12">
            <div class="card">
                <h5>Convites do Evento</h5>
                <DataTable :value="retriviedData.lineups" tableStyle="min-width: 50rem">
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <span class="text-xl text-900 font-bold">LineUps</span>
                            <Button icon="pi pi-refresh" rounded raised @click="getData" />
                        </div>
                    </template>
                    <Column field="name" header="#">
                        <template #body="slotProps">
                            {{ slotProps.index + 1 }}
                        </template>
                    </Column>

                    <Column field="name" sortable header="Nome"></Column>
                    <Column field="description" sortable header="Descrição"></Column>
                    <Column field="start_date" sortable header="Data Inicio">
                        <template #body="slotProps">{{ slotProps.data.start_time }} </template>
                    </Column>
                    <Column field="end_date" sortable header="Data Fim">
                        <template #body="slotProps"> {{ slotProps.data.end_time }} </template>
                    </Column>
                    <template #footer> No total são {{ retriviedData.lineups.length }} Lineups. </template>
                </DataTable>
            </div>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
