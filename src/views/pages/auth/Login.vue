<script setup>
import { onBeforeMount, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL } from '@/service/ApiConstant';

const toast = useToast();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const submitted = ref(false);
const errorMessage = ref('');
const fieldErrors = ref({});

const validate = () => {
    const errors = {};

    if (!email.value.trim()) {
        errors.email = 'Indica o teu email.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
        errors.email = 'Email inválido.';
    }

    if (!password.value) {
        errors.password = 'Indica a tua palavra-passe.';
    } else if (password.value.length < 8) {
        errors.password = 'A palavra-passe tem no mínimo 8 caracteres.';
    }

    fieldErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const redirectByRole = (user) => {
    if (user.role_id == 1) {
        router.replace('/admin/dashboard');
        return;
    }
    if (user.is_promotor == 1) {
        router.replace('/promotor/dashboard');
        return;
    }
    router.replace('/');
};

const loginUser = async () => {
    errorMessage.value = '';

    if (!validate()) {
        return;
    }

    submitted.value = true;

    try {
        const response = await axios.post(`${baseURL}/login`, {
            email: email.value.trim().toLowerCase(),
            password: password.value
        });

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (rememberMe.value) {
            localStorage.setItem('remembered_email', email.value.trim().toLowerCase());
        } else {
            localStorage.removeItem('remembered_email');
        }

        toast.add({
            severity: 'success',
            summary: 'Bem-vindo de volta',
            detail: 'Sessão iniciada com sucesso.',
            life: 2500
        });

        redirectByRole(response.data.user);
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível iniciar sessão. Verifica a tua ligação.';
        toast.add({
            severity: 'error',
            summary: 'Falha no login',
            detail: errorMessage.value,
            life: 4000
        });
    } finally {
        submitted.value = false;
    }
};

onBeforeMount(() => {
    const remembered = localStorage.getItem('remembered_email');
    if (remembered) {
        email.value = remembered;
        rememberMe.value = true;
    }
});
</script>

<template>
    <div class="auth-page">
        <aside class="auth-brand">
            <div class="auth-brand__veil" />
            <div class="auth-brand__content">
                <router-link to="/" class="auth-brand__logo">MTICKET</router-link>
                <h2 class="auth-brand__title">Todos os eventos numa só plataforma</h2>
                <p class="auth-brand__text">
                    Compra bilhetes, guarda o teu QR Code e acompanha o histórico das tuas compras.
                </p>
                <ul class="auth-brand__list">
                    <li><i class="pi pi-check-circle" /> Pagamento seguro com M-Pesa</li>
                    <li><i class="pi pi-check-circle" /> Bilhete no email e WhatsApp</li>
                    <li><i class="pi pi-check-circle" /> Entrada rápida com QR Code</li>
                </ul>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <router-link to="/" class="auth-card__brand">MTICKET</router-link>

                <h1 class="auth-card__title">Entrar na conta</h1>
                <p class="auth-card__subtitle">Bem-vindo de volta. Acede aos teus bilhetes.</p>

                <Message v-if="errorMessage" severity="error" :closable="false" class="w-full mb-3">
                    {{ errorMessage }}
                </Message>

                <form class="auth-form" @submit.prevent="loginUser">
                    <div class="field">
                        <label for="email">Email</label>
                        <IconField iconPosition="left" class="w-full">
                            <InputIcon class="pi pi-envelope" />
                            <InputText
                                id="email"
                                v-model="email"
                                type="email"
                                inputmode="email"
                                autocomplete="email"
                                autocapitalize="off"
                                spellcheck="false"
                                placeholder="nome@email.com"
                                class="w-full auth-input"
                                :class="{ 'p-invalid': fieldErrors.email }"
                                :disabled="submitted"
                            />
                        </IconField>
                        <small class="p-error">{{ fieldErrors.email }}</small>
                    </div>

                    <div class="field">
                        <label for="password">Palavra-passe</label>
                        <Password
                            id="password"
                            v-model="password"
                            placeholder="A tua palavra-passe"
                            :toggleMask="true"
                            :feedback="false"
                            class="w-full"
                            inputClass="w-full auth-input"
                            :class="{ 'p-invalid': fieldErrors.password }"
                            :disabled="submitted"
                        />
                        <small class="p-error">{{ fieldErrors.password }}</small>
                    </div>

                    <div class="auth-row">
                        <div class="flex align-items-center">
                            <Checkbox v-model="rememberMe" inputId="rememberMe" binary class="mr-2" :disabled="submitted" />
                            <label for="rememberMe" class="auth-row__label">Lembrar-me</label>
                        </div>
                        <router-link to="/register" class="auth-link">Precisas de ajuda?</router-link>
                    </div>

                    <Button
                        type="submit"
                        :label="submitted ? 'A entrar...' : 'Entrar'"
                        icon="pi pi-sign-in"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 auth-submit"
                        :loading="submitted"
                        :disabled="submitted"
                    />
                </form>

                <p class="auth-foot">
                    Ainda não tens conta?
                    <router-link to="/register" class="auth-link">Cria a tua conta</router-link>
                </p>

                <router-link to="/" class="auth-back">
                    <i class="pi pi-arrow-left mr-2" />
                    Voltar à página inicial
                </router-link>
            </div>
        </main>
    </div>
</template>

<style scoped>
.auth-page {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 100vh;
    background: var(--surface-ground);
}

.auth-brand {
    display: none;
    position: relative;
    overflow: hidden;
    background-color: #0b3d91;
    background-image: url('/demo/images/mticket.jpg');
    background-size: cover;
    background-position: center;
}

.auth-brand__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 61, 145, 0.94) 0%, rgba(30, 111, 227, 0.88) 55%, rgba(79, 156, 248, 0.82) 100%);
}

.auth-brand__content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3.5rem;
}

.auth-brand__logo {
    color: #fff;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-decoration: none;
    margin-bottom: 2rem;
}

.auth-brand__title {
    margin: 0 0 0.85rem;
    color: #fff;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
    max-width: 18ch;
}

.auth-brand__text {
    margin: 0 0 1.75rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.05rem;
    line-height: 1.55;
    max-width: 32ch;
}

.auth-brand__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    color: rgba(255, 255, 255, 0.95);
}

.auth-brand__list li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.auth-main {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1.15rem 2.5rem;
}

.auth-card {
    width: 100%;
    max-width: 27rem;
    border: 1px solid var(--surface-border);
    border-radius: 1.25rem;
    padding: 1.75rem 1.5rem 1.5rem;
    background: var(--surface-0);
    box-shadow: 0 12px 32px rgba(15, 40, 80, 0.08);
    animation: rise-in 0.45s ease-out both;
}

.auth-card__brand {
    display: inline-block;
    margin-bottom: 1.25rem;
    color: #2563eb;
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-decoration: none;
}

.auth-card__title {
    margin: 0 0 0.35rem;
    color: #0f172a;
    font-size: 1.6rem;
    font-weight: 700;
}

.auth-card__subtitle {
    margin: 0 0 1.35rem;
    color: #64748b;
    line-height: 1.45;
}

.auth-form .field {
    margin-bottom: 1rem;
}

.auth-form label {
    display: block;
    margin-bottom: 0.4rem;
    color: #334155;
    font-weight: 600;
}

.auth-input {
    font-size: 1rem !important;
    min-height: 2.9rem;
}

.auth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.15rem;
}

.auth-row__label {
    margin: 0;
    color: #475569;
    font-weight: 500;
}

.auth-link {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
}

.auth-link:hover {
    text-decoration: underline;
}

.auth-submit {
    min-height: 3rem;
    font-size: 1.05rem;
}

.auth-foot {
    margin: 1.25rem 0 0;
    text-align: center;
    color: #64748b;
}

.auth-back {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    color: #64748b;
    text-decoration: none;
    font-size: 0.95rem;
}

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (min-width: 992px) {
    .auth-page {
        grid-template-columns: 1.05fr 1fr;
    }

    .auth-brand {
        display: block;
    }

    .auth-card {
        max-width: 28rem;
        padding: 2.25rem 2rem 2rem;
    }

    .auth-card__brand {
        display: none;
    }
}
</style>
