<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';
import { Bootstrap4Pagination, TailwindPagination } from 'laravel-vue-pagination';
import { logout } from '@/service/ApiConstant';
import Paginator from 'primevue/paginator';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingLogOut = ref(false);
const isLoadingButton = ref(false);
const retriviedData = ref({ data: [] });
const audits = ref({ data: [] });
const toast = useToast();
const searchQuery = ref(null);
const histories = ref();
const displayConfirmation = ref(false);
const deviceavailability = ref(false);
const name = ref();
const email = ref();
const mobile = ref();
const role = ref();

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const loadingButtonDelete = ref(false);
let dataIdBeingDeleted = ref(null);

const schema = yup.object({
    old_password: yup.string().required().min(6).label('Password'),
    new_password: yup.string().required().min(6).label('Password'),
    new_password_confirmation: yup
        .string()
        .oneOf([yup.ref('new_password')], 'Passwords must match')
        .required()
        .label('Password confirmation')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [old_password] = defineField('old_password');
const [new_password] = defineField('new_password');
const [new_password_confirmation] = defineField('new_password_confirmation');

const onSubmit = handleSubmit((values) => {
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/updatepassword`, values)
        .then((response) => {
            resetForm();
            // router.push({ path: '/users' });
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Password editado com sucesso', life: 3000 });
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

const getData = async (page = 1) => {
    axios
        .get(`${baseURL}/promotor-profile`, {
            params: {
                query: searchQuery.value
            }
        })
        .then((response) => {
            retriviedData.value = response.data.user;
            name.value = response.data.user.name;
            email.value = response.data.user.email;
            mobile.value = response.data.user.mobile;
            role.value = response.data.user.role.name;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            goBackUsingBack();
        });
};

const logoutapp = () => {
    isLoadingLogOut.value = true;
    logout();
    isLoadingLogOut.value = false;
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="grid" v-if="!isLoadingDiv">
        <div class="col-12 lg:col-6 xl:col-4">
            <div className="card">
                <div className="text-center">
                    <h5>Perfil do Usuario</h5>
                    <img src="/demo/images/logo2.png" alt="Image" height="100" class="mb-3 circle" />
                </div>
                <hr />
                <p><strong>Nome:</strong> {{ retriviedData.name }}</p>
                <p><strong>Email:</strong> {{ retriviedData.email }}</p>
                <p><strong>Mobile:</strong> {{ retriviedData.mobile }}</p>
                <p><strong>Nivel:</strong> {{ retriviedData.role.name }}</p>
                <Button label="LogOut" class="mr-2 mb-2" @click="logoutapp()" :disabled="isLoadingLogOut"> <i :class="!isLoadingLogOut ? 'pi pi-sign-out' : 'pi pi-spinner'"></i>LogOut</Button>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-8">
            <div className="card">
                <h5>Atualizar dados do usuario</h5>
                <p>Utilize o formulario para atualizar seus dados</p>
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <p>Dados do usuario</p>

                        <div class="field">
                            <label for="name">Nome</label>
                            <InputText v-model="name" id="name" type="text" disabled />
                        </div>
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText v-model="email" id="email" type="text" disabled />
                        </div>
                        <div class="field">
                            <label for="mobile">Telefone</label>
                            <InputText v-model="mobile" id="mobile" type="text" disabled />
                        </div>
                        <div class="field">
                            <label for="role">Nivel</label>
                            <InputText v-model="role" id="role" type="text" disabled />
                        </div>

                        <p>Atualizar a palavra passe</p>
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
                        </form>
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
