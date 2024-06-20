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
const submitted = ref(false);
const card = ref('');
const errorMessage = ref('');
const successMessage = ref('');




const searchCard = () => {
    submitted.value = true;
    axios
        .post(`${baseURL}/cashless`, {
            card: card.value.toLowerCase()
        })
        .then((response) => {
            errorMessage.value = null
            successMessage.value = response.data.message;
            toast.add({ severity: 'success', summary: 'Successo', detail: 'Message Detail', life: 3000 });
            router.push(`recargas/${card.value.toLowerCase()}`)
        })
        .catch((error) => {
            errorMessage.value = error.response.data.message;
            successMessage.value = null
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Message Detail', life: 3000 });
        })
        .finally(() => {
            submitted.value = false;
        });
};

const getData = async () => {
    axios
        .get(`${baseURL}/homepage`)
        .then((response) => {
            retriviedData.value = response.data;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            // goBackUsingBack();
        });
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-column align-items-center justify-content-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                        <div class="text-center mb-5">
                            <img src="/demo/images/cashless.png" alt="Image" height="300" class="mb-3" />
                            <p class="text-600 font-medium">Recarregue a sua pulseira!</p>
                            <div v-if="errorMessage">
                                <Button :label="errorMessage" class="mr-2" severity="danger" />
                            </div>
                            <div v-if="successMessage">
                                <Button :label="successMessage" class="mr-2" severity="success" />
                            </div>
                        </div>

                        <div>
                            <label for="email1" class="block text-900 text-xl font-medium mb-2">#ID da Pulseira/Cartão</label>
                            <InputText id="email1" type="text" placeholder="Insira o número da sua pulseira" class="w-full  mb-5" style="padding: 1rem" v-model="card" />

                            <Button label="Procurar" class="w-full p-3 text-xl" @click="searchCard" v-if="!submitted"></Button>
                            <div class="text-center mb-5" v-if="submitted">
                                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
