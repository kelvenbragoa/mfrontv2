<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL } from '@/service/ApiConstant';

const { layoutConfig } = useLayout();
const name = ref('');
const email = ref('');
const mobile = ref('');
const submitted = ref(false);
const errorMessage = ref('');
const toast = useToast();


const radioValue = ref('');
const password = ref('');
const password_confirmation = ref('');
const checked = ref(false);

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
const registerUser = () => {
    submitted.value = true;
    axios
        .post(`${baseURL}/register`, {
            name: name.value,
            email: email.value.toLowerCase(),
            mobile: mobile.value,
            is_promotor: radioValue.value,
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
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <router-link to="/"> <img src="/demo/images/logo2.png" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" /></router-link>
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/logo.png" alt="Image" height="50" class="mb-3" />
                        <p class="text-600 font-medium">Registrar nova conta!</p>
                        <p class="text-600 font-medium">Acesse a todos o eventos em uma só plataforma..</p>
                        <div v-if="errorMessage">
                            <Button :label="errorMessage" class="mr-2" severity="danger" />
                        </div>
                    </div>

                    <div>
                        <label for="name" class="block text-900 text-xl font-medium mb-2">Nome Completo</label>
                        <InputText id="name" type="text" placeholder="Nome Completo" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="name" />

                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="mobile" class="block text-900 text-xl font-medium mb-2">Telefone</label>
                        <InputText id="mobile" type="text" placeholder="Telefone" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="mobile" />

                        <label for="user" class="block text-900 text-xl font-medium mb-2">Tipo de Usuário</label>
                        <div class="field-radiobutton mb-2">
                            <RadioButton id="option1" name="is_promotor" value="0" v-model="radioValue" />
                            <label for="option1">User Normal</label>
                        </div>
                        <div class="field-radiobutton mb-2">
                            <RadioButton id="option2" name="is_promotor" value="1" v-model="radioValue" />
                            <label for="option2">Promotor</label>
                        </div>


                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Palavra passe</label>
                        <Password id="password1" v-model="password" placeholder="Palavra passe" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Confirmar Palavra passe</label>
                        <Password id="password1" v-model="password_confirmation" placeholder="Confirmar Palavra passe" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                       
                        <Button label="Rgistrar" class="w-full p-3 text-xl" @click="registerUser" v-if="!submitted"></Button>
                        <div class="text-center mb-5" v-if="submitted">
                            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                        </div>
                        <p v-if="!submitted"><span>Já tem uma conta?</span><router-link to="/login" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Entre com sua conta</router-link></p>

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
