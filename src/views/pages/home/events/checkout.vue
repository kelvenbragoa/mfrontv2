<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const notFound = ref(false);
const event = ref(null);
const tickets = ref([]);
const brokenImage = ref(false);
const currentUser = ref(null);

const schema = yup.object({
    customerName: yup.string().required().trim().label('Nome'),
    customerEmail: yup.string().required().trim().email().label('Email'),
    customerMobile: yup.string().required().trim().label('Telefone'),
    paymentNumber: yup.string().nullable().label('Número de MPESA'),
    user_id: yup.mixed().nullable()
});

const { defineField, handleSubmit, errors, setErrors } = useForm({
    validationSchema: schema
});

const [customerName] = defineField('customerName');
const [customerEmail] = defineField('customerEmail');
const [customerMobile] = defineField('customerMobile');
const [paymentNumber] = defineField('paymentNumber');
const [user_id] = defineField('user_id');

const isLoggedIn = computed(() => !!currentUser.value);
const isPaidEvent = computed(() => event.value?.type_event_id == 1);
const isEventClosed = computed(() => {
    if (!event.value?.end_date) return false;
    return moment().isAfter(moment(event.value.end_date).endOf('day'));
});

const locationLabel = computed(() => {
    if (!event.value) return '';
    const city = event.value.city?.name;
    const province = event.value.province?.name;
    if (city && province) return `${city}, ${province}`;
    return event.value.address || province || 'Local a anunciar';
});

const eventImage = computed(() => {
    if (!event.value?.image || brokenImage.value) {
        return '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + event.value.image;
});

const totalQuantity = computed(() => {
    return (tickets.value || []).reduce((sum, ticket) => sum + (Number(ticket.quantity) || 0), 0);
});

const totalPrice = computed(() => {
    return (tickets.value || []).reduce((sum, ticket) => sum + (Number(ticket.quantity) || 0) * Number(ticket.price || 0), 0);
});

const selectedTickets = computed(() => {
    return (tickets.value || []).filter((ticket) => Number(ticket.quantity) > 0);
});

const formatMoney = (value) => `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MT`;

const ticketWindow = (item) => {
    const start = `${moment(item.start_date).format('LL')} ${moment(item.start_time, 'HH:mm:ss').format('HH:mm')}`;
    const end = `${moment(item.end_date).format('LL')} ${moment(item.end_time, 'HH:mm:ss').format('HH:mm')}`;
    return { start, end };
};

const isTicketUnavailable = (item) => {
    const start = moment(`${item.start_date} ${item.start_time}`);
    const end = moment(`${item.end_date} ${item.end_time}`);
    return moment().isAfter(end) || Number(item.max_qtd) <= 0 || moment().isBefore(start);
};

const onSubmit = handleSubmit(async (values) => {
    if (isEventClosed.value) {
        toast.add({
            severity: 'warn',
            summary: 'Evento encerrado',
            detail: 'As vendas deste evento já terminaram.',
            life: 4000
        });
        return;
    }

    if (totalQuantity.value <= 0) {
        toast.add({
            severity: 'warn',
            summary: 'Seleciona bilhetes',
            detail: 'Escolhe pelo menos um bilhete para continuar.',
            life: 3500
        });
        return;
    }

    if (isPaidEvent.value && !String(values.paymentNumber || '').trim()) {
        setErrors({ paymentNumber: 'Número de MPESA é obrigatório' });
        return;
    }

    isLoadingButton.value = true;

    const payload = {
        ...values,
        tickets: tickets.value,
        amount: totalPrice.value
    };

    try {
        const response = await axios.post(`${baseURL}/checkout`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        localStorage.setItem('order', JSON.stringify(response.data.order));
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'A sua compra foi efetuada com sucesso',
            life: 3000
        });
        router.push({ path: '/encomenda' });
    } catch (error) {
        const message = error?.response?.data?.message || 'Não foi possível concluir o pagamento.';
        toast.add({
            severity: 'error',
            summary: 'Erro no checkout',
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
        const response = await axios.get(`${baseURL}/checkout/${route.params.id}`);
        event.value = response.data.events;
        tickets.value = response.data.tickets || [];
    } catch (error) {
        if (error?.response?.status === 404) {
            notFound.value = true;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Não foi possível carregar o checkout',
                detail: 'Tenta novamente dentro de momentos.',
                life: 4000
            });
        }
    } finally {
        isLoadingDiv.value = false;
    }
};

onMounted(() => {
    currentUser.value = JSON.parse(localStorage.getItem('user'));
    if (currentUser.value) {
        customerName.value = currentUser.value.name;
        customerEmail.value = currentUser.value.email;
        customerMobile.value = currentUser.value.mobile;
        user_id.value = currentUser.value.id;
    }
    getData();
});
</script>

<template>
    <div v-if="isLoadingDiv" class="checkout-page px-4 lg:px-8 mx-0 lg:mx-8 py-4">
        <Skeleton height="10rem" class="mb-4 border-round-xl" />
        <div class="grid">
            <div class="col-12 lg:col-8">
                <Skeleton height="8rem" class="mb-3 border-round-xl" />
                <Skeleton height="8rem" class="mb-3 border-round-xl" />
            </div>
            <div class="col-12 lg:col-4">
                <Skeleton height="20rem" class="border-round-xl" />
            </div>
        </div>
    </div>

    <div v-else-if="notFound" class="checkout-page px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Evento não encontrado</h2>
            <p class="text-600 mb-3">Não foi possível abrir o checkout deste evento.</p>
            <router-link to="/eventos">
                <Button label="Ver eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
            </router-link>
        </div>
    </div>

    <div v-else-if="event" class="checkout-page">
        <section class="checkout-hero">
            <div class="checkout-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <router-link :to="'/eventos/' + event.slug" class="checkout-hero__back">
                    <i class="pi pi-arrow-left mr-2" />
                    Voltar ao evento
                </router-link>
                <p class="checkout-hero__eyebrow">Checkout</p>
                <h1 class="checkout-hero__title">{{ event.name }}</h1>
                <p class="checkout-hero__meta">
                    <span><i class="pi pi-calendar mr-2" />{{ moment(event.start_date).format('LL') }}</span>
                    <span><i class="pi pi-map-marker mr-2" />{{ locationLabel }}</span>
                </p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <Message v-if="isEventClosed" severity="warn" :closable="false" class="mb-4 w-full">
                As vendas deste evento já encerraram.
            </Message>

            <div class="grid">
                <div class="col-12 lg:col-8">
                    <div class="detail-panel">
                        <h2 class="detail-title">Escolhe os bilhetes</h2>
                        <p class="detail-text">Define a quantidade de cada tipo. Máximo 5 por tipo.</p>

                        <div v-if="tickets.length" class="ticket-list">
                            <div v-for="item in tickets" :key="item.id" class="ticket-card" :class="{ 'ticket-card--disabled': isTicketUnavailable(item) || isEventClosed }">
                                <img :src="eventImage" :alt="item.name" class="ticket-card__image" @error="brokenImage = true" />
                                <div class="ticket-card__body">
                                    <div class="ticket-card__top">
                                        <div>
                                            <h3 class="ticket-card__name">{{ item.name }}</h3>
                                            <p v-if="item.description" class="ticket-card__desc">{{ item.description }}</p>
                                            <p class="ticket-card__window">Vendas: {{ ticketWindow(item).start }} → {{ ticketWindow(item).end }}</p>
                                        </div>
                                        <div class="ticket-card__price">{{ formatMoney(item.price) }}</div>
                                    </div>

                                    <div v-if="isTicketUnavailable(item) || isEventClosed" class="mt-3">
                                        <Tag value="Bilhete indisponível" severity="danger" />
                                    </div>
                                    <div v-else class="ticket-card__actions">
                                        <InputNumber
                                            v-model="item.quantity"
                                            showButtons
                                            buttonLayout="horizontal"
                                            :min="0"
                                            :max="5"
                                            :disabled="isLoadingButton"
                                        >
                                            <template #incrementbuttonicon>
                                                <span class="pi pi-plus" />
                                            </template>
                                            <template #decrementbuttonicon>
                                                <span class="pi pi-minus" />
                                            </template>
                                        </InputNumber>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="empty-block mt-3">
                            <p class="text-600 m-0">Ainda não há bilhetes disponíveis para este evento.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 lg:col-4">
                    <aside class="summary-card">
                        <h2 class="detail-title">Resumo</h2>

                        <div v-if="totalQuantity > 0" class="summary-lines">
                            <div v-for="item in selectedTickets" :key="'sum-' + item.id" class="summary-line">
                                <span>{{ item.quantity }}× {{ item.name }}</span>
                                <strong>{{ formatMoney(item.quantity * item.price) }}</strong>
                            </div>
                        </div>
                        <p v-else class="detail-text">Nenhum bilhete selecionado.</p>

                        <Divider />

                        <div class="summary-total">
                            <span>Total</span>
                            <strong>{{ formatMoney(totalPrice) }}</strong>
                        </div>
                        <p class="summary-qty">{{ totalQuantity }} {{ totalQuantity === 1 ? 'bilhete' : 'bilhetes' }}</p>

                        <form v-if="totalQuantity > 0 && !isEventClosed" class="checkout-form" @submit.prevent="onSubmit">
                            <h3 class="detail-subtitle">Dados do comprador</h3>

                            <div class="field">
                                <label for="customerName">Nome</label>
                                <InputText
                                    id="customerName"
                                    v-model="customerName"
                                    type="text"
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.customerName }"
                                    :disabled="isLoadingButton || isLoggedIn"
                                />
                                <small class="p-error">{{ errors.customerName }}</small>
                            </div>

                            <div class="field">
                                <label for="customerEmail">Email (recebes o bilhete aqui)</label>
                                <InputText
                                    id="customerEmail"
                                    v-model="customerEmail"
                                    type="email"
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.customerEmail }"
                                    :disabled="isLoadingButton || isLoggedIn"
                                />
                                <small class="p-error">{{ errors.customerEmail }}</small>
                            </div>

                            <div class="field">
                                <label for="customerMobile">Telemóvel / WhatsApp</label>
                                <InputText
                                    id="customerMobile"
                                    v-model="customerMobile"
                                    type="tel"
                                    class="w-full"
                                    :class="{ 'p-invalid': errors.customerMobile }"
                                    :disabled="isLoadingButton || isLoggedIn"
                                />
                                <small class="p-error">{{ errors.customerMobile }}</small>
                            </div>

                            <div v-if="isPaidEvent" class="payment-box">
                                <img src="/demo/images/mpesa.png" alt="M-Pesa" height="48" class="mb-2" />
                                <div class="field mb-0">
                                    <label for="paymentNumber">Número de M-Pesa</label>
                                    <InputText
                                        id="paymentNumber"
                                        v-model="paymentNumber"
                                        type="tel"
                                        class="w-full"
                                        :class="{ 'p-invalid': errors.paymentNumber }"
                                        :disabled="isLoadingButton"
                                        placeholder="84/85..."
                                    />
                                    <small class="p-error">{{ errors.paymentNumber }}</small>
                                </div>
                            </div>

                            <InputText id="user_id" v-model="user_id" type="hidden" />

                            <Message v-if="!isLoggedIn" severity="info" :closable="false" class="w-full mb-3">
                                Regista-te para guardar o histórico dos teus bilhetes.
                            </Message>

                            <Button
                                type="submit"
                                :label="isLoadingButton ? 'A processar...' : 'Pagar agora'"
                                class="w-full p-button-rounded border-none font-medium text-white bg-blue-500"
                                :disabled="isLoadingButton"
                                :loading="isLoadingButton"
                            />
                        </form>

                        <div v-else-if="isEventClosed" class="mt-3">
                            <Button label="Vendas encerradas" class="w-full p-button-rounded" disabled />
                        </div>
                        <div v-else class="mt-3">
                            <Button label="Seleciona bilhetes para continuar" class="w-full p-button-rounded" disabled />
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.checkout-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.6s ease-out;
}

.checkout-hero__content {
    padding-top: 2.5rem;
    padding-bottom: 2.25rem;
}

.checkout-hero__back {
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.92);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 0.85rem;
}

.checkout-hero__eyebrow {
    margin: 0 0 0.4rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.checkout-hero__title {
    margin: 0 0 0.65rem;
    color: #fff;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 700;
    line-height: 1.15;
}

.checkout-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem 1.25rem;
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
}

.detail-panel,
.summary-card {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem;
    background: var(--surface-0);
}

.summary-card {
    position: sticky;
    top: 1.25rem;
    box-shadow: 0 10px 28px rgba(15, 40, 80, 0.08);
}

.detail-title {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    color: #0f172a;
    font-weight: 600;
}

.detail-subtitle {
    margin: 0 0 0.85rem;
    font-size: 1.05rem;
    color: #0f172a;
    font-weight: 600;
}

.detail-text {
    margin: 0 0 1.25rem;
    color: #64748b;
    line-height: 1.5;
}

.ticket-list {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}

.ticket-card {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: 1rem;
    padding: 0.9rem;
    border: 1px solid var(--surface-border);
    border-radius: 0.9rem;
    background: #f8fafc;
}

.ticket-card--disabled {
    opacity: 0.72;
}

.ticket-card__image {
    width: 100%;
    height: 7rem;
    object-fit: cover;
    border-radius: 0.7rem;
    background: #e8eef7;
}

.ticket-card__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
}

.ticket-card__name {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
    color: #0f172a;
}

.ticket-card__desc,
.ticket-card__window {
    margin: 0.2rem 0 0;
    color: #64748b;
    font-size: 0.92rem;
}

.ticket-card__price {
    font-weight: 800;
    color: #2563eb;
    white-space: nowrap;
}

.ticket-card__actions {
    margin-top: 0.85rem;
}

.summary-lines {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    margin-bottom: 0.5rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    color: #475569;
    font-size: 0.95rem;
}

.summary-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    color: #0f172a;
}

.summary-total strong {
    color: #2563eb;
}

.summary-qty {
    margin: 0.35rem 0 1rem;
    color: #64748b;
}

.checkout-form .field {
    margin-bottom: 0.9rem;
}

.checkout-form label {
    display: block;
    margin-bottom: 0.35rem;
    color: #334155;
    font-weight: 600;
}

.payment-box {
    border: 1px solid var(--surface-border);
    border-radius: 0.85rem;
    padding: 0.9rem;
    margin-bottom: 0.9rem;
    background: #fff;
}

.empty-block {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
}

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 991px) {
    .summary-card {
        position: static;
    }
}

@media (max-width: 640px) {
    .ticket-card {
        grid-template-columns: 1fr;
    }

    .ticket-card__image {
        height: 10rem;
    }
}
</style>
