<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const email = ref('');
const token = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const submitted = ref(false);
const errorMessage = ref('');
const fieldErrors = ref({});

const hasResetParams = computed(() => !!token.value && !!email.value);

const validate = () => {
    const errors = {};
    if (!password.value) {
        errors.password = 'Indica a nova palavra-passe.';
    } else if (password.value.length < 8) {
        errors.password = 'A palavra-passe tem no mínimo 8 caracteres.';
    }
    if (!passwordConfirmation.value) {
        errors.passwordConfirmation = 'Confirma a palavra-passe.';
    } else if (password.value !== passwordConfirmation.value) {
        errors.passwordConfirmation = 'As palavras-passe não coincidem.';
    }
    fieldErrors.value = errors;
    return Object.keys(errors).length === 0;
};

onMounted(() => {
    token.value = String(route.query.token || '');
    email.value = String(route.query.email || '');
    if (!hasResetParams.value) {
        errorMessage.value = 'Link inválido. Pede um novo email de recuperação.';
    }
});

const submit = async () => {
    errorMessage.value = '';
    if (!hasResetParams.value || !validate()) return;

    submitted.value = true;
    try {
        const response = await axios.post(`${baseURL}/reset-password`, {
            email: email.value.trim().toLowerCase(),
            token: token.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value
        });
        toast.add({
            severity: 'success',
            summary: 'Palavra-passe actualizada',
            detail: response.data?.message || 'Já podes entrar com a nova palavra-passe.',
            life: 3500
        });
        router.replace('/login');
    } catch (error) {
        errorMessage.value =
            error?.response?.data?.message || 'Não foi possível redefinir a palavra-passe. Tenta novamente.';
        toast.add({
            severity: 'error',
            summary: 'Erro',
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
                <h2 class="auth-brand__title">Escolhe uma nova palavra-passe</h2>
                <p class="auth-brand__text">Depois de redefinir, podes entrar na app e no site com a nova senha.</p>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <router-link to="/" class="auth-card__brand">MTICKET</router-link>
                <h1 class="auth-card__title">Redefinir palavra-passe</h1>
                <p class="auth-card__subtitle">Define uma nova senha para {{ email || 'a tua conta' }}.</p>

                <Message v-if="errorMessage" severity="error" :closable="false" class="w-full mb-3">
                    {{ errorMessage }}
                </Message>

                <form class="auth-form" @submit.prevent="submit">
                    <div class="field">
                        <label for="password">Nova palavra-passe</label>
                        <Password
                            id="password"
                            v-model="password"
                            placeholder="Mínimo 8 caracteres"
                            :toggleMask="true"
                            :feedback="false"
                            class="w-full"
                            inputClass="w-full auth-input"
                            :class="{ 'p-invalid': fieldErrors.password }"
                            :disabled="submitted || !hasResetParams"
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
                            :class="{ 'p-invalid': fieldErrors.passwordConfirmation }"
                            :disabled="submitted || !hasResetParams"
                        />
                        <small class="p-error">{{ fieldErrors.passwordConfirmation }}</small>
                    </div>

                    <Button
                        type="submit"
                        :label="submitted ? 'A guardar...' : 'Redefinir palavra-passe'"
                        icon="pi pi-lock"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 auth-submit"
                        :loading="submitted"
                        :disabled="submitted || !hasResetParams"
                    />
                </form>

                <p class="auth-foot">
                    <router-link to="/auth/forgot-password" class="auth-link">Pedir novo link</router-link>
                    ·
                    <router-link to="/login" class="auth-link">Entrar</router-link>
                </p>
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
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.05rem;
    line-height: 1.55;
    max-width: 32ch;
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
.auth-submit {
    min-height: 3rem;
    font-size: 1.05rem;
}
.auth-foot {
    margin: 1.25rem 0 0;
    text-align: center;
    color: #64748b;
}
.auth-link {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
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
