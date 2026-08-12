<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoadingDiv = ref(true);
const notFound = ref(false);
const isLoadingButton = ref(false);
const card = ref(null);
const transactions = ref([]);

const quickAmounts = [50, 100, 200, 500, 1000];

const schema = yup.object({
    paymentNumber: yup
        .string()
        .required()
        .trim()
        .matches(/^[0-9]{9}$/, 'Usa 9 dígitos (ex: 84xxxxxxx)')
        .label('Número M-Pesa'),
    amount: yup
        .number()
        .typeError('Indica um valor válido')
        .required()
        .min(1, 'O valor mínimo é 1 MT')
        .label('Valor'),
    cardId: yup.mixed().nullable()
});

const { defineField, handleSubmit, errors, setErrors, setFieldValue } = useForm({
    validationSchema: schema
});

const [paymentNumber] = defineField('paymentNumber');
const [cardId] = defineField('cardId');
const [amount] = defineField('amount');

const balanceLabel = computed(() => `${Number(card.value?.balance || 0).toLocaleString('pt-MZ')} MT`);

const getTransactionLabel = (type) => {
    switch (Number(type)) {
        case 0:
            return 'Recarga';
        case 1:
            return 'Compra';
        case 2:
            return 'Devolução';
        default:
            return 'Movimento';
    }
};

const getTransactionSeverity = (type) => {
    switch (Number(type)) {
        case 0:
            return 'success';
        case 1:
            return 'danger';
        case 2:
            return 'info';
        default:
            return 'secondary';
    }
};

const isDebit = (type) => Number(type) === 1;

const formatMoney = (value) => `${Number(value || 0).toLocaleString('pt-MZ')} MT`;

const selectAmount = (value) => {
    setFieldValue('amount', value);
};

const applyResponse = (data) => {
    card.value = data.card || null;
    transactions.value = data.transactions || [];
    if (card.value?.id) {
        setFieldValue('cardId', card.value.id);
    }
};

const onSubmit = handleSubmit(async (values) => {
    isLoadingButton.value = true;

    try {
        const response = await axios.post(
            `${baseURL}/cashless-recharge`,
            {
                ...values,
                cardId: cardId.value || card.value?.id
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        applyResponse(response.data);
        setFieldValue('paymentNumber', '');
        setFieldValue('amount', null);

        toast.add({
            severity: 'success',
            summary: 'Recarga concluída',
            detail: 'O saldo da pulseira foi atualizado.',
            life: 3500
        });
    } catch (error) {
        const message = error?.response?.data?.message || 'Não foi possível concluir a recarga.';
        toast.add({
            severity: 'error',
            summary: 'Erro na recarga',
            detail: message,
            life: 4000
        });
        if (error?.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
    } finally {
        isLoadingButton.value = false;
    }
});

const getData = async () => {
    isLoadingDiv.value = true;
    notFound.value = false;

    try {
        const response = await axios.get(`${baseURL}/cashless/${route.params.id}`);
        applyResponse(response.data);
    } catch (error) {
        notFound.value = true;
        toast.add({
            severity: 'error',
            summary: 'Pulseira indisponível',
            detail: error?.response?.data?.message || 'Não foi possível carregar esta pulseira.',
            life: 4000
        });
    } finally {
        isLoadingDiv.value = false;
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="cashless-show px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="8rem" class="mb-3 border-round-xl" />
        <Skeleton height="14rem" class="mb-3 border-round-xl" />
        <Skeleton height="12rem" class="border-round-xl" />
    </div>

    <div v-else-if="notFound" class="cashless-show px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8 py-5">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Pulseira não encontrada</h2>
            <p class="text-600 mb-3">Verifica o código ou contacta o suporte Mticket.</p>
            <router-link to="/recargas">
                <Button label="Tentar outro código" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </router-link>
        </div>
    </div>

    <div v-else-if="card" class="cashless-show">
        <section class="cashless-hero">
            <div class="cashless-hero__content px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8">
                <router-link to="/recargas" class="cashless-hero__back">
                    <i class="pi pi-arrow-left mr-2" />
                    Outra pulseira
                </router-link>
                <p class="cashless-hero__eyebrow">Carteira cashless</p>
                <h1 class="cashless-hero__title">{{ card.name || 'Pulseira Mticket' }}</h1>
                <p class="cashless-hero__meta">ID #{{ card.id }}</p>
            </div>
        </section>

        <section class="px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8 py-3">
            <div class="balance-card">
                <span class="balance-card__label">Saldo disponível</span>
                <strong class="balance-card__value">{{ balanceLabel }}</strong>
                <span class="balance-card__hint">Usa este saldo nos pontos do evento</span>
            </div>
        </section>

        <section class="px-3 sm:px-4 lg:px-8 mx-0 lg:mx-8 pb-5">
            <div class="show-grid">
                <aside class="panel recharge-panel">
                    <div class="panel__head">
                        <h2 class="panel__title">Recarregar</h2>
                        <img src="/demo/images/mpesa.png" alt="M-Pesa" height="36" />
                    </div>
                    <p class="panel__text">Escolhe um valor ou escreve outro. Confirma no telefone quando o M-Pesa pedir.</p>

                    <div class="quick-amounts">
                        <button
                            v-for="value in quickAmounts"
                            :key="value"
                            type="button"
                            class="quick-amount"
                            :class="{ 'quick-amount--active': Number(amount) === value }"
                            :disabled="isLoadingButton"
                            @click="selectAmount(value)"
                        >
                            {{ value }} MT
                        </button>
                    </div>

                    <form class="recharge-form" @submit.prevent="onSubmit">
                        <div class="field">
                            <label for="amount">Valor (MT)</label>
                            <InputNumber
                                id="amount"
                                v-model="amount"
                                inputId="amount"
                                :min="1"
                                :useGrouping="false"
                                class="w-full"
                                inputClass="w-full cashless-input"
                                :disabled="isLoadingButton"
                                :class="{ 'p-invalid': errors.amount }"
                                placeholder="Ex: 200"
                            />
                            <small class="p-error">{{ errors.amount }}</small>
                        </div>

                        <div class="field">
                            <label for="paymentNumber">Número M-Pesa</label>
                            <IconField iconPosition="left" class="w-full">
                                <InputIcon class="pi pi-mobile" />
                                <InputText
                                    id="paymentNumber"
                                    v-model="paymentNumber"
                                    type="tel"
                                    inputmode="numeric"
                                    maxlength="9"
                                    placeholder="84xxxxxxx"
                                    class="w-full cashless-input"
                                    :class="{ 'p-invalid': errors.paymentNumber }"
                                    :disabled="isLoadingButton"
                                />
                            </IconField>
                            <small class="p-error">{{ errors.paymentNumber }}</small>
                        </div>

                        <InputText id="cardId" v-model="cardId" type="hidden" />

                        <Button
                            type="submit"
                            :label="isLoadingButton ? 'A processar...' : 'Pagar com M-Pesa'"
                            icon="pi pi-wallet"
                            class="w-full p-button-rounded border-none font-medium text-white bg-blue-500 cashless-submit"
                            :loading="isLoadingButton"
                            :disabled="isLoadingButton"
                        />
                    </form>
                </aside>

                <div class="panel">
                    <div class="panel__head">
                        <h2 class="panel__title">Movimentos</h2>
                        <Tag :value="`${transactions.length}`" severity="info" />
                    </div>

                    <div v-if="transactions.length" class="tx-list">
                        <article v-for="transaction in transactions" :key="transaction.id" class="tx-item">
                            <div class="tx-item__top">
                                <Tag
                                    :value="getTransactionLabel(transaction.type_of_transaction_id)"
                                    :severity="getTransactionSeverity(transaction.type_of_transaction_id)"
                                />
                                <strong :class="isDebit(transaction.type_of_transaction_id) ? 'tx-debit' : 'tx-credit'">
                                    {{ isDebit(transaction.type_of_transaction_id) ? '-' : '+' }}
                                    {{ formatMoney(transaction.total) }}
                                </strong>
                            </div>
                            <div class="tx-item__bottom">
                                <span>{{ moment(transaction.created_at).format('DD/MM/YYYY HH:mm') }}</span>
                                <span>Saldo: {{ formatMoney(transaction.balance) }}</span>
                            </div>
                        </article>
                    </div>

                    <div v-else class="empty-inline">
                        <p class="m-0">Ainda não há movimentos nesta pulseira.</p>
                    </div>
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
    padding: 1.5rem 0 1.35rem;
}

.cashless-hero__back {
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 0.7rem;
}

.cashless-hero__eyebrow {
    margin: 0 0 0.3rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.cashless-hero__title {
    margin: 0 0 0.3rem;
    color: #fff;
    font-size: clamp(1.4rem, 4.5vw, 2.1rem);
    font-weight: 700;
    line-height: 1.2;
}

.cashless-hero__meta {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
}

.balance-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-radius: 1.1rem;
    padding: 1.15rem 1.2rem;
    background: linear-gradient(135deg, #102a63 0%, #1d4ed8 100%);
    color: #fff;
    box-shadow: 0 10px 24px rgba(15, 40, 80, 0.18);
}

.balance-card__label {
    font-size: 0.9rem;
    opacity: 0.9;
}

.balance-card__value {
    font-size: clamp(1.8rem, 6vw, 2.4rem);
    font-weight: 800;
    letter-spacing: 0.01em;
}

.balance-card__hint {
    font-size: 0.9rem;
    opacity: 0.85;
}

.show-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.panel {
    border: 1px solid var(--surface-border);
    border-radius: 1.1rem;
    padding: 1.15rem;
    background: var(--surface-0);
}

.panel__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.65rem;
}

.panel__title {
    margin: 0;
    color: #0f172a;
    font-size: 1.2rem;
}

.panel__text {
    margin: 0 0 0.9rem;
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.45;
}

.quick-amounts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
    margin-bottom: 1rem;
}

.quick-amount {
    border: 1px solid var(--surface-border);
    background: #f8fafc;
    color: #1e293b;
    border-radius: 0.75rem;
    min-height: 2.75rem;
    font-weight: 700;
    cursor: pointer;
}

.quick-amount--active {
    border-color: #2563eb;
    background: #eff6ff;
    color: #1d4ed8;
}

.recharge-form .field {
    margin-bottom: 0.9rem;
}

.recharge-form label {
    display: block;
    margin-bottom: 0.35rem;
    color: #334155;
    font-weight: 600;
}

.cashless-input {
    font-size: 1.05rem !important;
    min-height: 2.85rem;
}

.cashless-submit {
    min-height: 3rem;
    font-size: 1.05rem;
}

.tx-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
}

.tx-item {
    border: 1px solid var(--surface-border);
    border-radius: 0.85rem;
    padding: 0.8rem 0.9rem;
    background: #f8fafc;
}

.tx-item__top,
.tx-item__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
}

.tx-item__bottom {
    margin-top: 0.45rem;
    color: #64748b;
    font-size: 0.9rem;
}

.tx-credit {
    color: #15803d;
}

.tx-debit {
    color: #b91c1c;
}

.empty-block,
.empty-inline {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 1.5rem 1.1rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
    color: #64748b;
}

@keyframes hero-fade {
    from {
        opacity: 0.7;
    }
    to {
        opacity: 1;
    }
}

@media (min-width: 992px) {
    .cashless-hero__content {
        padding: 2.25rem 0 2rem;
    }

    .show-grid {
        grid-template-columns: 0.95fr 1.05fr;
        align-items: start;
    }

    .recharge-panel {
        position: sticky;
        top: 1rem;
    }

    .quick-amounts {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

@media (max-width: 420px) {
    .quick-amounts {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
