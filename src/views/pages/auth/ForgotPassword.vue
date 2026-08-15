<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';

const toast = useToast();
const email = ref('');
const submitted = ref(false);
const sent = ref(false);
const errorMessage = ref('');
const fieldError = ref('');

const validate = () => {
    if (!email.value.trim()) {
        fieldError.value = 'Indica o teu email.';
        return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
        fieldError.value = 'Email inválido.';
        return false;
    }
    fieldError.value = '';
    return true;
};

const submit = async () => {
    errorMessage.value = '';
    if (!validate()) return;

    submitted.value = true;
    try {
        const response = await axios.post(`${baseURL}/forgot-password`, {
            email: email.value.trim().toLowerCase()
        });
        sent.value = true;
        toast.add({
            severity: 'success',
            summary: 'Email enviado',
            detail: response.data?.message || 'Verifica a tua caixa de entrada.',
            life: 4000
        });
    } catch (error) {
        errorMessage.value =
            error?.response?.data?.message || 'Não foi possível enviar o email. Tenta novamente.';
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
                <h2 class="auth-brand__title">Recupera o acesso à tua conta</h2>
                <p class="auth-brand__text">Enviamos um link seguro para redefinires a palavra-passe no site.</p>
            </div>
        </aside>

        <main class="auth-main">
            <div class="auth-card">
                <router-link to="/" class="auth-card__brand">MTICKET</router-link>
                <h1 class="auth-card__title">Esqueceste a palavra-passe?</h1>
                <p class="auth-card__subtitle">Indica o email da conta. Se existir, recebes um link para redefinir.</p>

                <Message v-if="errorMessage" severity="error" :closable="false" class="w-full mb-3">
                    {{ errorMessage }}
                </Message>
                <Message v-if="sent" severity="success" :closable="false" class="w-full mb-3">
                    Se o email existir na Mticket, envíamos as instruções. Verifica também o spam.
                </Message>

                <form v-if="!sent" class="auth-form" @submit.prevent="submit">
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
                                placeholder="nome@email.com"
                                class="w-full auth-input"
                                :class="{ 'p-invalid': fieldError }"
                                :disabled="submitted"
                            />
                        </IconField>
                        <small class="p-error">{{ fieldError }}</small>
                    </div>

                    <Button
                        type="submit"
                        :label="submitted ? 'A enviar...' : 'Enviar link'"
                        icon="pi pi-send"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 auth-submit"
                        :loading="submitted"
                        :disabled="submitted"
                    />
                </form>

                <p class="auth-foot">
                    Já lembras a palavra-passe?
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
