<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL, storageURL, logout } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { Bootstrap4Pagination, TailwindPagination } from 'laravel-vue-pagination';
import Paginator from 'primevue/paginator';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const retriviedData = ref({ data: [] });
const name = ref();
const email = ref();
const mobile = ref();
const address = ref();
const isAuthenticated = ref([]);
const isLoadingLogOut = ref(false);


function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const schema = yup.object({
    name: yup.string().required().trim().label('Nome'),
});
const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});
const logoutapp = () => {
    isLoadingLogOut.value = true;
    logout();
    isLoadingLogOut.value = false;
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
    isAuthenticated.value = JSON.parse(localStorage.getItem('user'));
    if (isAuthenticated.value) {
        name.value = isAuthenticated.value.name;
        email.value = isAuthenticated.value.email;
        mobile.value = isAuthenticated.value.mobile;
        address.value = isAuthenticated.value.address;
    }
    getData();
});
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div class="col-12 md:col-12 lg:col-12 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                <div style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-4 surface-card h-full" style="border-radius: 8px">
                        <h5 class="mb-2 text-900">Perfil</h5>
                        <div class="field">
                            <label for="name">Email:</label>
                            <span>{{ email }}</span>
                        </div>
                        <div class="field">
                            <label for="name">Nome:</label>
                            <span>{{ name }}</span>
                        </div>
                        <div class="field">
                            <label for="name">Telefone:</label>
                            <span>{{ mobile }}</span>
                        </div>
                        <div class="field">
                            <label for="name">Endereço:</label>
                            <span>{{ address }}</span>
                        </div>
                        <!-- <p>Atualizar a palavra passe</p>
                        <form @submit="onSubmit">
                            <div class="field">
                                <label for="old_password">Palavra passe antiga</label>
                                <InputText v-model="old_password" id="old_password" type="text" />
                                <small id="old_password-help" class="p-error">{{ errors.old_password }}</small>
                            </div>
                            <div class="field">
                                <label for="new_password">Nova palavra passe</label>
                                <InputText v-model="new_password" id="new_password" type="text" />
                                <small id="new_password-help" class="p-error">{{ errors.new_password }}</small>
                            </div>
                            <div class="field">
                                <label for="new_password_confirmation">Repetir a palavra passe</label>
                                <InputText v-model="new_password_confirmation" id="new_password_confirmation" type="text" />
                                <small id="new_password_confirmation-help" class="p-error">{{ errors.new_password_confirmation }}</small>
                            </div>
                            <div class="col-12 md:col-2">
                                <Button label="Submeter" class="mr-2 mb-2" @click="onSubmit" :disabled="isLoadingButton"></Button
                                ><ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                            </div>
                        </form> -->
                        <Button label="LogOut" class="mr-2 mb-2" @click="logoutapp()" :disabled="isLoadingLogOut"> <i :class="!isLoadingLogOut ? 'pi pi-sign-out' : 'pi pi-spinner'"></i>LogOut</Button>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
