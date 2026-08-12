<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    scope: { type: String, default: 'promotor' }
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

const eventId = route.params.id;
const barId = route.params.idbar;

const isLoading = ref(true);
const isSaving = ref(false);
const loadError = ref(null);
const bar = ref(null);
const products = ref([]);
const lines = ref({});
const reference = ref('');
const note = ref('');

const baseEventPath = computed(() => `/${props.scope}/eventos/${eventId}`);

const productRows = computed(() =>
    products.value.map((product) => {
        const counted = Number(lines.value[product.id] ?? product.qtd ?? 0);
        const system = Number(product.qtd || 0);
        return {
            ...product,
            system,
            counted,
            diff: counted - system
        };
    })
);

const changedCount = computed(() => productRows.value.filter((row) => row.diff !== 0).length);
const surplusTotal = computed(() =>
    productRows.value.reduce((sum, row) => sum + (row.diff > 0 ? row.diff : 0), 0)
);
const deficitTotal = computed(() =>
    productRows.value.reduce((sum, row) => sum + (row.diff < 0 ? Math.abs(row.diff) : 0), 0)
);

const setCounted = (productId, value) => {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    lines.value = { ...lines.value, [productId]: qty };
};

const loadForm = async () => {
    isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-stock-notes/create`, {
            params: { event_id: eventId, bar_store_id: barId }
        });
        bar.value = response.data.bar;
        products.value = response.data.products || [];
        const initial = {};
        products.value.forEach((product) => {
            initial[product.id] = Number(product.qtd || 0);
        });
        lines.value = initial;
    } catch (error) {
        loadError.value = error?.response?.data?.message || 'Não foi possível carregar os produtos do bar.';
    } finally {
        isLoading.value = false;
    }
};

const submit = async () => {
    if (!productRows.value.length) {
        toast.add({
            severity: 'warn',
            summary: 'Sem produtos',
            detail: 'Este bar ainda não tem produtos para inventariar.',
            life: 3500
        });
        return;
    }

    const items = productRows.value.map((row) => ({
        product_id: row.id,
        qty: row.counted
    }));

    isSaving.value = true;
    try {
        const response = await axios.post(`${baseURL}/promotor-stock-notes`, {
            event_id: Number(eventId),
            bar_store_id: Number(barId),
            type: 'inventory',
            reference: reference.value || null,
            note: note.value || null,
            items
        });

        toast.add({
            severity: 'success',
            summary: 'Inventário',
            detail: response.data.message || 'Inventário registado.',
            life: 3500
        });

        const noteId = response.data?.note?.id;
        if (noteId) {
            router.push(`${baseEventPath.value}/stock/${noteId}`);
        } else {
            router.push(`${baseEventPath.value}/bar/${barId}`);
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível guardar o inventário.',
            life: 4500
        });
    } finally {
        isSaving.value = false;
    }
};

watch(
    () => route.params.idbar,
    () => loadForm()
);

onMounted(() => loadForm());
</script>

<template>
    <div class="stock-inventory-form">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button
                    icon="pi pi-arrow-left"
                    label="Voltar"
                    text
                    class="px-0 mb-2"
                    @click="router.push(`${baseEventPath}/bar/${barId}`)"
                />
                <h4 class="m-0 text-900">Inventário de stock</h4>
                <span class="text-600">{{ bar?.name || 'Bar' }} — conta o stock físico e confirma o ajuste.</span>
            </div>
        </div>

        <div v-if="isLoading" class="card">
            <Skeleton height="16rem" />
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="loadForm" />
        </div>

        <div v-else class="grid">
            <div class="col-12 lg:col-8">
                <div class="card">
                    <div class="flex flex-wrap justify-content-between gap-2 mb-3">
                        <div>
                            <h5 class="m-0">Contagem</h5>
                            <span class="text-600 text-sm">Valores começam iguais ao sistema. Altera só o que for diferente.</span>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <Tag :value="`${changedCount} com diferença`" :severity="changedCount ? 'warn' : 'success'" />
                            <Tag v-if="surplusTotal" :value="`+${surplusTotal}`" severity="success" />
                            <Tag v-if="deficitTotal" :value="`-${deficitTotal}`" severity="danger" />
                        </div>
                    </div>

                    <div v-if="!products.length" class="empty-state">
                        <p class="text-600 mb-3">Este bar ainda não tem produtos.</p>
                        <router-link :to="`${baseEventPath}/produtos/create`">
                            <Button label="Criar produto" icon="pi pi-plus" />
                        </router-link>
                    </div>

                    <DataTable v-else :value="productRows" class="p-datatable-sm" responsiveLayout="scroll">
                        <Column header="Produto" field="name" />
                        <Column header="Sistema">
                            <template #body="{ data }">
                                <strong>{{ data.system }}</strong>
                            </template>
                        </Column>
                        <Column header="Contado">
                            <template #body="{ data }">
                                <InputNumber
                                    :modelValue="data.counted"
                                    :min="0"
                                    showButtons
                                    buttonLayout="horizontal"
                                    class="w-8rem"
                                    @update:modelValue="(val) => setCounted(data.id, val)"
                                />
                            </template>
                        </Column>
                        <Column header="Diferença">
                            <template #body="{ data }">
                                <span :class="data.diff === 0 ? 'text-600' : data.diff > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                                    {{ data.diff > 0 ? '+' : '' }}{{ data.diff }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="col-12 lg:col-4">
                <div class="card">
                    <h5 class="mt-0">Detalhes</h5>
                    <div class="field">
                        <label for="reference">Referência</label>
                        <InputText id="reference" v-model="reference" class="w-full" placeholder="Ex: Inv. 12/08" />
                    </div>
                    <div class="field">
                        <label for="note">Observação</label>
                        <Textarea id="note" v-model="note" rows="4" class="w-full" autoResize placeholder="Opcional" />
                    </div>
                    <p class="text-600 text-sm mb-3">
                        Ao confirmar, o stock passa a ser o valor contado. Só produtos com diferença geram movimento no histórico.
                    </p>
                    <Button
                        label="Confirmar inventário"
                        icon="pi pi-check-square"
                        class="w-full"
                        :loading="isSaving"
                        :disabled="!products.length"
                        @click="submit"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
.field label {
    display: block;
    margin-bottom: 0.35rem;
    font-weight: 600;
    color: #334155;
}
.empty-state {
    text-align: center;
    padding: 2rem 1rem;
}
</style>
