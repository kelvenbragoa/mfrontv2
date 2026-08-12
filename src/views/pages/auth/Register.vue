<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import router from '../../../router';
import { baseURL } from '@/service/ApiConstant';

const toast = useToast();

const name = ref('');
const email = ref('');
const mobile = ref('');
const accountType = ref('0');
const password = ref('');
const passwordConfirmation = ref('');
const acceptedTerms = ref(false);

const submitted = ref(false);
const errorMessage = ref('');
const fieldErrors = ref({});

const accountTypes = [
    {
        value: '0',
        icon: 'pi pi-user',
        title: 'Cliente',
        text: 'Comprar bilhetes e recarregar pulseiras'
    },
    {
        value: '1',
        icon: 'pi pi-megaphone',
        title: 'Promotor',
        text: 'Criar e vender eventos na Mticket'
    }
];

const validate = () => {
    const errors = {};

    if (!name.value.trim()) {
        errors.name = 'Indica o teu nome completo.';
    }

    if (!email.value.trim()) {
        errors.email = 'Indica o teu email.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
        errors.email = 'Email inválido.';
    }

    if (!mobile.value.trim()) {
        errors.mobile = 'Indica o teu telefone.';
    } else if (!/^[0-9]{9}$/.test(mobile.value.trim())) {
        errors.mobile = 'Usa 9 dígitos (ex: 84xxxxxxx).';
    }

    if (!password.value) {
        errors.password = 'Cria uma palavra-passe.';
    } else if (password.value.length < 8) {
        errors.password = 'A palavra-passe tem no mínimo 8 caracteres.';
    }

    if (password.value !== passwordConfirmation.value) {
        errors.password_confirmation = 'As palavras-passe não coincidem.';
    }

    if (!acceptedTerms.value) {
        errors.terms = 'Aceita os termos para continuar.';
    }

    fieldErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const applyServerErrors = (errors) => {
    const mapped = {};
    Object.keys(errors || {}).forEach((key) => {
        mapped[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
    });
    fieldErrors.value = { ...fieldErrors.value, ...mapped };
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

const registerUser = async () => {
    errorMessage.value = '';

    if (!validate()) {
        return;
    }

    submitted.value = true;

    try {
        const response = await axios.post(`${baseURL}/register`, {
            name: name.value.trim(),
            email: email.value.trim().toLowerCase(),
            mobile: mobile.value.trim(),
            is_promotor: accountType.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        });

        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.add({
            severity: 'success',
            summary: 'Conta criada',
            detail: 'Bem-vindo à Mticket.',
            life: 2500
        });

        redirectByRole(response.data.user);
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível criar a conta. Verifica a tua ligação.';
        applyServerErrors(error?.response?.data?.errors);
        toast.add({
            severity: 'error',
            summary: 'Falha no registo',
            detail: errorMessage.value,
            life: 4000
        });
    } finally {
        submitted.value = false;
    }
};
</script>

<template>
    <div class="auth-page">
        <aside class="auth-brand">
            <div class="auth-brand__veil" />
            <div class="auth-brand__content">
                <router-link to="/" class="auth-brand__logo">MTICKET</router-link>
                <h2 class="auth-brand__title">Cria a tua conta em menos de um minuto</h2>
                <p class="auth-brand__text">
                    Compra bilhetes como cliente ou publica os teus próprios eventos como promotor.
                </p>
                <ul class="auth-brand__list">
                    <li><i class="pi pi-check-circle" /> Histórico de bilhetes sempre disponível</li>
                    <li><i class="pi pi-check-circle" /> Pagamento seguro com M-Pesa</li>
                    <li><i class="pi pi-check-circle" /> Painel completo para promotores</li>
                </ul>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <router-link to="/" class="auth-card__brand">MTICKET</router-link>

                <h1 class="auth-card__title">Criar conta</h1>
                <p class="auth-card__subtitle">Regista-te para comprares bilhetes ou criares eventos.</p>

                <Message v-if="errorMessage" severity="error" :closable="false" class="w-full mb-3">
                    {{ errorMessage }}
                </Message>

                <form class="auth-form" @submit.prevent="registerUser">
                    <div class="field">
                        <label>Tipo de conta</label>
                        <div class="type-grid">
                            <button
                                v-for="option in accountTypes"
                                :key="option.value"
                                type="button"
                                class="type-card"
                                :class="{ 'type-card--active': accountType === option.value }"
                                :disabled="submitted"
                                @click="accountType = option.value"
                            >
                                <i :class="option.icon" />
                                <span class="type-card__title">{{ option.title }}</span>
                                <span class="type-card__text">{{ option.text }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="field">
                        <label for="name">Nome completo</label>
                        <IconField iconPosition="left" class="w-full">
                            <InputIcon class="pi pi-user" />
                            <InputText
                                id="name"
                                v-model="name"
                                type="text"
                                autocomplete="name"
                                placeholder="O teu nome"
                                class="w-full auth-input"
                                :class="{ 'p-invalid': fieldErrors.name }"
                                :disabled="submitted"
                            />
                        </IconField>
                        <small class="p-error">{{ fieldErrors.name }}</small>
                    </div>

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
                        <label for="mobile">Telefone</label>
                        <IconField iconPosition="left" class="w-full">
                            <InputIcon class="pi pi-mobile" />
                            <InputText
                                id="mobile"
                                v-model="mobile"
                                type="tel"
                                inputmode="numeric"
                                maxlength="9"
                                autocomplete="tel"
                                placeholder="84xxxxxxx"
                                class="w-full auth-input"
                                :class="{ 'p-invalid': fieldErrors.mobile }"
                                :disabled="submitted"
                            />
                        </IconField>
                        <small class="p-error">{{ fieldErrors.mobile }}</small>
                    </div>

                    <div class="field">
                        <label for="password">Palavra-passe</label>
                        <Password
                            id="password"
                            v-model="password"
                            placeholder="Mínimo 8 caracteres"
                            :toggleMask="true"
                            class="w-full"
                            inputClass="w-full auth-input"
                            :class="{ 'p-invalid': fieldErrors.password }"
                            :disabled="submitted"
                            promptLabel="Cria uma palavra-passe"
                            weakLabel="Fraca"
                            mediumLabel="Média"
                            strongLabel="Forte"
                        />
                        <small class="p-error">{{ fieldErrors.password }}</small>
                    </div>

                    <div class="field">
                        <label for="passwordConfirmation">Confirmar palavra-passe</label>
                        <Password
                            id="passwordConfirmation"
                            v-model="passwordConfirmation"
                            placeholder="Repete a palavra-passe"
                            :toggleMask="true"
                            :feedback="false"
                            class="w-full"
                            inputClass="w-full auth-input"
                            :class="{ 'p-invalid': fieldErrors.password_confirmation }"
                            :disabled="submitted"
                        />
                        <small class="p-error">{{ fieldErrors.password_confirmation }}</small>
                    </div>

                    <div class="field">
                        <div class="flex align-items-start gap-2">
                            <Checkbox v-model="acceptedTerms" inputId="terms" binary :disabled="submitted" />
                            <label for="terms" class="terms-label">
                                Aceito os
                                <router-link to="/privacy" class="auth-link">termos de serviço</router-link>
                                e a
                                <router-link to="/privacy" class="auth-link">política de privacidade</router-link>.
                            </label>
                        </div>
                        <small class="p-error">{{ fieldErrors.terms }}</small>
                    </div>

                    <Button
                        type="submit"
                        :label="submitted ? 'A criar conta...' : 'Criar conta'"
                        icon="pi pi-user-plus"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 auth-submit"
                        :loading="submitted"
                        :disabled="submitted"
                    />
                </form>

                <p class="auth-foot">
                    Já tens conta?
                    <router-link to="/login" class="auth-link">Entra aqui</router-link>
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
    max-width: 28rem;
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

.type-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
}

.type-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 0.85rem 0.9rem;
    border: 1px solid var(--surface-border);
    border-radius: 0.85rem;
    background: #f8fafc;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, background 0.2s ease;
}

.type-card i {
    color: #2563eb;
    font-size: 1.15rem;
    margin-bottom: 0.15rem;
}

.type-card--active {
    border-color: #2563eb;
    background: #eff6ff;
}

.type-card__title {
    color: #0f172a;
    font-weight: 700;
}

.type-card__text {
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.35;
}

.terms-label {
    margin: 0 !important;
    color: #475569 !important;
    font-weight: 400 !important;
    line-height: 1.45;
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
        max-width: 29rem;
        padding: 2.25rem 2rem 2rem;
    }

    .auth-card__brand {
        display: none;
    }
}

@media (max-width: 380px) {
    .type-grid {
        grid-template-columns: 1fr;
    }
}
</style>
