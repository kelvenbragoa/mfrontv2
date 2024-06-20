<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL } from '@/service/ApiConstant';

const toast = useToast();
const email = ref('');
const password = ref('');
const checked = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

const loginUser = () => {
    submitted.value = true;
    axios
        .post(`${baseURL}/login`, {
            email: email.value.toLowerCase(),
            password: password.value
        })
        .then((response) => {
            console.log(response.data.access_token);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.add({ severity: 'success', summary: 'Successo', detail: 'Message Detail', life: 3000 });
            if (response.data.user.role_id == 1) {
                router.replace('/admin/dashboard');
            }
            if (response.data.user.role_id == 2) {
                if (response.data.user.is_promotor == 1) {
                    router.replace('/promotor/dashboard');
                } else {
                    router.replace('/');
                }
            }
        })
        .catch((error) => {
            errorMessage.value = error.response.data.message;
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Message Detail', life: 3000 });
        })
        .finally(() => {
            submitted.value = false;
        });
};

onBeforeMount(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // User is authenticated, proceed to the route
        // router.replace('/dashboard');
    }
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <router-link to="/"> <img src="/demo/images/logo2.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" /></router-link>
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/logo.png" alt="Image" height="50" class="mb-3" />
                        <p class="text-600 font-medium">Entre com a sua conta!</p>
                        <p class="text-600 font-medium">Acesse a todos o eventos em uma só plataforma..</p>
                        <div v-if="errorMessage">
                            <Button :label="errorMessage" class="mr-2" severity="danger" />
                        </div>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Telefone/Email</label>
                        <InputText id="email1" type="text" placeholder="Telefone/Email" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Palavra passe</label>
                        <Password id="password1" v-model="password" placeholder="Palavra passe" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" :feedback="false"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <router-link to="" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Esqueceu password?</router-link>
                        </div>
                        <Button label="Entrar" class="w-full p-3 text-xl" @click="loginUser" v-if="!submitted"></Button>
                        <div class="text-center mb-5" v-if="submitted">
                            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </div>
                        <p><span>Ainda não tem uma conta?</span><router-link to="/register" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Se registre agora</router-link></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
