<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import moment from 'moment';
import { baseURL, storageURL } from '@/service/ApiConstant';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const notFound = ref(false);
const event = ref(null);
const offers = ref([]);
const brokenImage = ref(false);
const currentUser = ref(null);

const schema = yup.object({
    customerName: yup.string().required().trim().label('Nome'),
    customerEmail: yup.string().required().trim().email().label('Email'),
    customerMobile: yup.string().required().trim().label('Telefone'),
    paymentNumber: yup.string().required().trim().label('Número de MPESA'),
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

const imageFor = (item) => {
    if (brokenImage.value || !item?.image) {
        return event.value?.image ? storageURL + event.value.image : '/demo/images/product/product-placeholder.svg';
    }
    return storageURL + item.image;
};

const selected = computed(() => (offers.value || []).filter((row) => Number(row.quantity) > 0));
const totalQuantity = computed(() => selected.value.reduce((sum, row) => sum + Number(row.quantity || 0), 0));
const totalPrice = computed(() => selected.value.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.price || 0), 0));

const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MT`;

const remainingQty = (item) => Math.max(0, Number(item?.qtd || 0));
const orderMax = (item) => Math.max(0, Math.min(5, remainingQty(item)));
const isUnavailable = (item) => remainingQty(item) <= 0;

const flattenProducts = (products) => {
    const rows = [];
    (products || []).forEach((product) => {
        const variants = product.variants || [];
        if (variants.length) {
            variants.forEach((variant) => {
                rows.push({
                    key: `${product.id}:${variant.id}`,
                    shop_product_id: product.id,
                    shop_product_variant_id: variant.id,
                    name: `${product.name} / ${variant.name}`,
                    description: product.description,
                    image: product.image,
                    price: variant.sell_price ?? product.sell_price,
                    qtd: variant.qtd,
                    quantity: 0
                });
            });
        } else {
            rows.push({
                key: `${product.id}:0`,
                shop_product_id: product.id,
                shop_product_variant_id: null,
                name: product.name,
                description: product.description,
                image: product.image,
                price: product.sell_price,
                qtd: product.qtd,
                quantity: 0
            });
        }
    });
    return rows;
};

const onSubmit = handleSubmit(async (values) => {
    if (isEventClosed.value) {
        toast.add({ severity: 'warn', summary: 'Evento encerrado', detail: 'As vendas deste evento já terminaram.', life: 4000 });
        return;
    }
    if (totalQuantity.value <= 0) {
        toast.add({ severity: 'warn', summary: 'Seleciona produtos', detail: 'Escolhe pelo menos um item da loja.', life: 3500 });
        return;
    }
    const over = selected.value.find((row) => Number(row.quantity) > orderMax(row));
    if (over) {
        toast.add({ severity: 'warn', summary: 'Quantidade indisponível', detail: `Só restam ${orderMax(over)} de "${over.name}".`, life: 4000 });
        return;
    }

    isLoadingButton.value = true;
    try {
        const response = await axios.post(`${baseURL}/shop-checkout`, {
            ...values,
            event_id: event.value.id,
            items: selected.value.map((row) => ({
                shop_product_id: row.shop_product_id,
                shop_product_variant_id: row.shop_product_variant_id,
                quantity: Number(row.quantity)
            }))
        });
        localStorage.setItem('shop-order', JSON.stringify(response.data.order));
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Encomenda paga. Mostra o QR no evento.', life: 3500 });
        router.push({ name: 'encomenda.loja' });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro no pagamento',
            detail: error?.response?.data?.message || 'Não foi possível concluir o pagamento.',
            life: 4500
        });
        if (error?.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        await getData(true);
    } finally {
        isLoadingButton.value = false;
    }
});

const getData = async (silent = false) => {
    if (!silent) {
        isLoadingDiv.value = true;
    }
    notFound.value = false;
    try {
        const response = await axios.get(`${baseURL}/shop-checkout/${route.params.id}`);
        const previous = silent
            ? Object.fromEntries(offers.value.map((row) => [row.key, Number(row.quantity || 0)]))
            : {};
        event.value = response.data.event;
        offers.value = flattenProducts(response.data.products);
        if (silent) {
            offers.value.forEach((row) => {
                row.quantity = Math.min(previous[row.key] || 0, orderMax(row));
            });
        } else {
            const preselect = route.query.product;
            if (preselect) {
                offers.value.forEach((row) => {
                    if (String(row.shop_product_id) === String(preselect) && orderMax(row) > 0) {
                        row.quantity = 1;
                    }
                });
            }
        }
    } catch (error) {
        notFound.value = error?.response?.status === 404;
        if (!notFound.value) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a loja.', life: 4000 });
        }
    } finally {
        isLoadingDiv.value = false;
    }
};

onMounted(() => {
    try {
        currentUser.value = JSON.parse(localStorage.getItem('user'));
    } catch {
        currentUser.value = null;
    }
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
        <Skeleton height="18rem" class="border-round-xl" />
    </div>

    <div v-else-if="notFound" class="checkout-page px-4 lg:px-8 mx-0 lg:mx-8 py-6">
        <div class="empty-block">
            <h2 class="text-900 mt-0 mb-2">Evento não encontrado</h2>
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
                <p class="checkout-hero__eyebrow">Loja do evento</p>
                <h1 class="checkout-hero__title">{{ event.name }}</h1>
                <p class="checkout-hero__meta">
                    <span><i class="pi pi-calendar mr-2" />{{ moment(event.start_date).format('LL') }}</span>
                    <span><i class="pi pi-map-marker mr-2" />{{ locationLabel }}</span>
                </p>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <Message severity="info" :closable="false" class="mb-4 w-full">
                Pagas agora e levantas no dia do evento.
            </Message>
            <Message v-if="isEventClosed" severity="warn" :closable="false" class="mb-4 w-full">
                As vendas deste evento já encerraram.
            </Message>

            <div class="grid">
                <div class="col-12 lg:col-8">
                    <div class="detail-panel">
                        <h2 class="detail-title">Escolhe os produtos</h2>
                        <p class="detail-text">Camisolas, bonés e produtos. Máximo 5 unidades por tamanho.</p>

                        <div v-if="offers.length" class="ticket-list">
                            <div
                                v-for="item in offers"
                                :key="item.key"
                                class="ticket-card"
                                :class="{ 'ticket-card--disabled': isUnavailable(item) || isEventClosed }"
                            >
                                <img :src="imageFor(item)" :alt="item.name" class="ticket-card__image" @error="brokenImage = true" />
                                <div class="ticket-card__body">
                                    <div class="ticket-card__top">
                                        <div>
                                            <h3 class="ticket-card__name">{{ item.name }}</h3>
                                            <p v-if="item.description" class="ticket-card__desc">{{ item.description }}</p>
                                        </div>
                                        <div class="ticket-card__price">{{ formatMoney(item.price) }}</div>
                                    </div>
                                    <div v-if="isUnavailable(item) || isEventClosed" class="mt-3">
                                        <Tag value="Esgotado" severity="danger" />
                                    </div>
                                    <div v-else class="ticket-card__actions">
                                        <InputNumber
                                            v-model="item.quantity"
                                            showButtons
                                            buttonLayout="horizontal"
                                            :min="0"
                                            :max="orderMax(item)"
                                            :disabled="isLoadingButton"
                                        >
                                            <template #incrementbuttonicon><span class="pi pi-plus" /></template>
                                            <template #decrementbuttonicon><span class="pi pi-minus" /></template>
                                        </InputNumber>
                                        <small class="text-600 block mt-2">Restam {{ remainingQty(item) }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="empty-block mt-3">
                            <p class="text-600 m-0">Ainda não há produtos na loja deste evento.</p>
                        </div>
                    </div>
                </div>

                <div class="col-12 lg:col-4">
                    <aside class="summary-card">
                        <h2 class="detail-title">Resumo</h2>
                        <div v-if="totalQuantity > 0" class="summary-lines">
                            <div v-for="item in selected" :key="'sum-' + item.key" class="summary-line">
                                <span>{{ item.quantity }}× {{ item.name }}</span>
                                <strong>{{ formatMoney(item.quantity * item.price) }}</strong>
                            </div>
                        </div>
                        <p v-else class="detail-text">Nenhum produto selecionado.</p>
                        <Divider />
                        <div class="summary-total">
                            <span>Total</span>
                            <strong>{{ formatMoney(totalPrice) }}</strong>
                        </div>
                        <p class="summary-qty">{{ totalQuantity }} {{ totalQuantity === 1 ? 'item' : 'itens' }}</p>

                        <form v-if="totalQuantity > 0 && !isEventClosed" class="checkout-form" @submit.prevent="onSubmit">
                            <h3 class="detail-subtitle">Dados do comprador</h3>
                            <div class="field">
                                <label for="customerName">Nome</label>
                                <InputText id="customerName" v-model="customerName" class="w-full" :class="{ 'p-invalid': errors.customerName }" :disabled="isLoadingButton || isLoggedIn" />
                                <small class="p-error">{{ errors.customerName }}</small>
                            </div>
                            <div class="field">
                                <label for="customerEmail">Email</label>
                                <InputText id="customerEmail" v-model="customerEmail" type="email" class="w-full" :class="{ 'p-invalid': errors.customerEmail }" :disabled="isLoadingButton || isLoggedIn" />
                                <small class="p-error">{{ errors.customerEmail }}</small>
                            </div>
                            <div class="field">
                                <label for="customerMobile">Telemóvel</label>
                                <InputText id="customerMobile" v-model="customerMobile" type="tel" class="w-full" :class="{ 'p-invalid': errors.customerMobile }" :disabled="isLoadingButton || isLoggedIn" />
                                <small class="p-error">{{ errors.customerMobile }}</small>
                            </div>
                            <div class="payment-box">
                                <img src="/demo/images/mpesa.png" alt="M-Pesa" height="48" class="mb-2" />
                                <div class="field mb-0">
                                    <label for="paymentNumber">Número de M-Pesa</label>
                                    <InputText id="paymentNumber" v-model="paymentNumber" type="tel" class="w-full" :class="{ 'p-invalid': errors.paymentNumber }" :disabled="isLoadingButton" placeholder="84/85..." />
                                    <small class="p-error">{{ errors.paymentNumber }}</small>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                :label="isLoadingButton ? 'A processar...' : 'Pagar e levantar no evento'"
                                class="w-full p-button-rounded border-none font-medium text-white bg-blue-500"
                                :disabled="isLoadingButton"
                                :loading="isLoadingButton"
                            />
                        </form>
                        <Button v-else-if="isEventClosed" label="Vendas encerradas" class="w-full p-button-rounded" disabled />
                        <Button v-else label="Seleciona produtos para continuar" class="w-full p-button-rounded" disabled />
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.checkout-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
}
.checkout-hero__content { padding-top: 2.5rem; padding-bottom: 2.25rem; }
.checkout-hero__back { display: inline-flex; align-items: center; color: rgba(255,255,255,.92); text-decoration: none; font-weight: 600; margin-bottom: .85rem; }
.checkout-hero__eyebrow { margin: 0 0 .4rem; color: rgba(255,255,255,.8); font-size: .9rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.checkout-hero__title { margin: 0 0 .65rem; color: #fff; font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 700; line-height: 1.15; }
.checkout-hero__meta { display: flex; flex-wrap: wrap; gap: .85rem 1.25rem; margin: 0; color: rgba(255,255,255,.9); }
.detail-panel, .summary-card { border: 1px solid var(--surface-border); border-radius: 1rem; padding: 1.25rem; background: var(--surface-0); }
.summary-card { position: sticky; top: 1.25rem; box-shadow: 0 10px 28px rgba(15,40,80,.08); }
.detail-title { margin: 0 0 .5rem; font-size: 1.35rem; color: #0f172a; font-weight: 600; }
.detail-subtitle { margin: 0 0 .85rem; font-size: 1.05rem; color: #0f172a; font-weight: 600; }
.detail-text { margin: 0 0 1.25rem; color: #64748b; line-height: 1.5; }
.ticket-list { display: flex; flex-direction: column; gap: .9rem; }
.ticket-card { display: grid; grid-template-columns: 7rem 1fr; gap: 1rem; padding: .9rem; border: 1px solid var(--surface-border); border-radius: .9rem; background: #f8fafc; }
.ticket-card--disabled { opacity: .72; }
.ticket-card__image { width: 100%; height: 7rem; object-fit: cover; border-radius: .7rem; background: #e8eef7; }
.ticket-card__top { display: flex; justify-content: space-between; gap: .75rem; }
.ticket-card__name { margin: 0 0 .25rem; font-size: 1.1rem; color: #0f172a; }
.ticket-card__desc { margin: .2rem 0 0; color: #64748b; font-size: .92rem; }
.ticket-card__price { font-weight: 800; color: #2563eb; white-space: nowrap; }
.ticket-card__actions { margin-top: .85rem; }
.summary-lines { display: flex; flex-direction: column; gap: .55rem; margin-bottom: .5rem; }
.summary-line { display: flex; justify-content: space-between; gap: .75rem; color: #475569; font-size: .95rem; }
.summary-total { display: flex; justify-content: space-between; align-items: center; font-size: 1.2rem; color: #0f172a; }
.summary-total strong { color: #2563eb; }
.summary-qty { margin: .35rem 0 1rem; color: #64748b; }
.checkout-form .field { margin-bottom: .9rem; }
.checkout-form label { display: block; margin-bottom: .35rem; color: #334155; font-weight: 600; }
.payment-box { border: 1px solid var(--surface-border); border-radius: .85rem; padding: .9rem; margin-bottom: .9rem; background: #fff; }
.empty-block { border: 1px dashed var(--surface-border); border-radius: 1rem; padding: 2.5rem 1.5rem; text-align: center; background: var(--surface-50, #f8fafc); }
@media (max-width: 991px) { .summary-card { position: static; } }
@media (max-width: 640px) { .ticket-card { grid-template-columns: 1fr; } .ticket-card__image { height: 10rem; } }
</style>
