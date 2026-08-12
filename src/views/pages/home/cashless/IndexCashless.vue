<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const submitted = ref(false);
const card = ref('');
const errorMessage = ref('');

const normalizedCard = () => card.value.trim().toLowerCase();

const searchCard = async () => {
    errorMessage.value = '';
    const value = normalizedCard();

    if (!value) {
        errorMessage.value = 'Insere o número da pulseira ou cartão.';
        return;
    }

    submitted.value = true;

    try {
        const response = await axios.post(`${baseURL}/cashless`, { card: value });
        toast.add({
            severity: 'success',
            summary: 'Pulseira encontrada',
            detail: response.data.message || 'A abrir a tua carteira cashless.',
            life: 2500
        });
        router.push(`/recargas/${value}`);
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível encontrar a pulseira.';
        toast.add({
            severity: 'error',
            summary: 'Pulseira não encontrada',
            detail: errorMessage.value,
            life: 4000
        });
    } finally {
        submitted.value = false;
    }
};
</script>

<template>
    <div class="cashless-page">
        <section class="cashless-hero">
            <div class="cashless-hero__content px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="cashless-hero__eyebrow">Cashless</p>
                <h1 class="cashless-hero__title">Recarrega a tua pulseira</h1>
                <p class="cashless-hero__subtitle">Consulta o saldo e faz recargas M-Pesa em segundos.</p>
            </div>
        </section>

        <section class="cashless-body px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8">
            <div class="cashless-panel">
                <div class="cashless-panel__visual">
                    <img src="/demo/images/cashless.png" alt="Pulseira cashless Mticket" class="cashless-panel__image" />
                </div>

                <div class="cashless-panel__form">
                    <h2 class="cashless-panel__title">Encontrar pulseira</h2>
                    <p class="cashless-panel__help">O número está normalmente impresso na pulseira ou no cartão do evento.</p>

                    <Message v-if="errorMessage" severity="error" :closable="false" class="w-full mb-3">
                        {{ errorMessage }}
                    </Message>

                    <label for="cardId" class="cashless-label">#ID da pulseira / cartão</label>
                    <IconField iconPosition="left" class="w-full mb-3">
                        <InputIcon class="pi pi-id-card" />
                        <InputText
                            id="cardId"
                            v-model="card"
                            type="text"
                            inputmode="text"
                            autocomplete="off"
                            autocapitalize="off"
                            spellcheck="false"
                            placeholder="Ex: a1b2c3"
                            class="w-full cashless-input"
                            :disabled="submitted"
                            @keyup.enter="searchCard"
                        />
                    </IconField>

                    <Button
                        :label="submitted ? 'A procurar...' : 'Continuar'"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 cashless-submit"
                        :loading="submitted"
                        :disabled="submitted"
                        @click="searchCard"
                    />

                    <ul class="cashless-tips">
                        <li>Confirma o código antes de continuar</li>
                        <li>A recarga é feita com M-Pesa</li>
                        <li>O saldo atualiza após o pagamento</li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.cashless-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.55s ease-out;
}

.cashless-hero__content {
    padding: 1.75rem 0 1.5rem;
}

.cashless-hero__eyebrow {
    margin: 0 0 0.35rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.cashless-hero__title {
    margin: 0 0 0.45rem;
    color: #fff;
    font-size: clamp(1.55rem, 5vw, 2.4rem);
    font-weight: 700;
    line-height: 1.15;
}

.cashless-hero__subtitle {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    line-height: 1.45;
    max-width: 28rem;
}

.cashless-body {
    padding-top: 1rem;
    padding-bottom: 2rem;
}

.cashless-panel {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 1.15rem;
    overflow: hidden;
    background: var(--surface-0);
    box-shadow: 0 10px 28px rgba(15, 40, 80, 0.08);
}

.cashless-panel__visual {
    background: #eef4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}

.cashless-panel__image {
    width: min(100%, 220px);
    height: auto;
    object-fit: contain;
}

.cashless-panel__form {
    padding: 1.25rem 1.15rem 1.4rem;
}

.cashless-panel__title {
    margin: 0 0 0.35rem;
    color: #0f172a;
    font-size: 1.25rem;
}

.cashless-panel__help {
    margin: 0 0 1rem;
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.45;
}

.cashless-label {
    display: block;
    margin-bottom: 0.4rem;
    color: #334155;
    font-weight: 600;
}

.cashless-input {
    font-size: 1.05rem !important;
    padding: 0.9rem 0.85rem !important;
}

.cashless-submit {
    min-height: 3rem;
    font-size: 1.05rem;
}

.cashless-tips {
    margin: 1.1rem 0 0;
    padding-left: 1.1rem;
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.55;
}

@keyframes hero-fade {
    from {
        opacity: 0.7;
    }
    to {
        opacity: 1;
    }
}

@media (min-width: 768px) {
    .cashless-hero__content {
        padding: 2.5rem 0 2.1rem;
    }

    .cashless-panel {
        grid-template-columns: 0.9fr 1.1fr;
        align-items: stretch;
    }

    .cashless-panel__visual {
        padding: 2rem;
    }

    .cashless-panel__image {
        width: min(100%, 280px);
    }

    .cashless-panel__form {
        padding: 2rem;
    }
}
</style>
