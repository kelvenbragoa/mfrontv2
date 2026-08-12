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
const bars = ref([]);
const products = ref([]);
const lines = ref({});
const toBarStoreId = ref(null);
const reference = ref('');
const note = ref('');

const baseEventPath = computed(() => `/${props.scope}/eventos/${eventId}`);
const destinationBars = computed(() => bars.value.filter((b) => Number(b.id) !== Number(barId)));

const productRows = computed(() =>
    products.value.map((product) => ({
        ...product,
        qty: Number(lines.value[product.id] || 0)
    }))
);

const selectedCount = computed(() => productRows.value.filter((row) => row.qty > 0).length);
const selectedTotalQty = computed(() =>
    productRows.value.reduce((sum, row) => sum + (row.qty > 0 ? row.qty : 0), 0)
);

const setQty = (productId, value) => {
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
        bars.value = response.data.bars || [];
        products.value = response.data.products || [];
        const initial = {};
        products.value.forEach((product) => {
            initial[product.id] = 0;
        });
        lines.value = initial;
        toBarStoreId.value = destinationBars.value[0]?.id ?? null;
    } catch (error) {
        loadError.value = error?.response?.data?.message || 'Não foi possível carregar os dados da transferência.';
    } finally {
        isLoading.value = false;
    }
};

const submit = async () => {
    if (!toBarStoreId.value) {
        toast.add({
            severity: 'warn',
            summary: 'Bar destino',
            detail: 'Seleciona o bar de destino.',
            life: 3500
        });
        return;
    }

    const items = productRows.value
        .filter((row) => row.qty > 0)
        .map((row) => ({ product_id: row.id, qty: row.qty }));

    if (!items.length) {
        toast.add({
            severity: 'warn',
            summary: 'Sem quantidades',
            detail: 'Indica quantidade em pelo menos um produto.',
            life: 3500
        });
        return;
    }

    const insufficient = productRows.value.find((row) => row.qty > Number(row.qtd || 0));
    if (insufficient) {
        toast.add({
            severity: 'error',
            summary: 'Stock insuficiente',
            detail: `"${insufficient.name}" só tem ${insufficient.qtd} em stock.`,
            life: 4000
        });
        return;
    }

    isSaving.value = true;
    try {
        const response = await axios.post(`${baseURL}/promotor-stock-notes`, {
            event_id: Number(eventId),
            bar_store_id: Number(barId),
            to_bar_store_id: Number(toBarStoreId.value),
            type: 'transfer',
            reference: reference.value || null,
            note: note.value || null,
            items
        });

        toast.add({
            severity: 'success',
            summary: 'Transferência',
            detail: response.data.message || 'Transferência registada.',
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
            detail: error?.response?.data?.message || 'Não foi possível transferir o stock.',
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
    <div class="stock-transfer-form">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button
                    icon="pi pi-arrow-left"
                    label="Voltar"
                    text
                    class="px-0 mb-2"
                    @click="router.push(`${baseEventPath}/bar/${barId}`)"
                />
                <h4 class="m-0 text-900">Transferência entre bars</h4>
                <span class="text-600">De {{ bar?.name || 'Bar' }} para outro bar do mesmo evento.</span>
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
                            <h5 class="m-0">Produtos a transferir</h5>
                            <span class="text-600 text-sm">No destino, o produto é encontrado pelo nome (ou criado se não existir).</span>
                        </div>
                        <Tag :value="`${selectedCount} produtos · ${selectedTotalQty} un.`" severity="info" />
                    </div>

                    <div v-if="!products.length" class="empty-state">
                        <p class="text-600 mb-3">Este bar ainda não tem produtos.</p>
                    </div>

                    <div v-else-if="destinationBars.length === 0" class="empty-state">
                        <p class="text-600 mb-3">Precisas de pelo menos outro bar neste evento para transferir.</p>
                    </div>

                    <DataTable v-else :value="productRows" class="p-datatable-sm" responsiveLayout="scroll">
                        <Column header="Produto" field="name" />
                        <Column header="Stock origem">
                            <template #body="{ data }">
                                <strong>{{ data.qtd }}</strong>
                            </template>
                        </Column>
                        <Column header="Qtd a transferir">
                            <template #body="{ data }">
                                <InputNumber
                                    :modelValue="data.qty"
                                    :min="0"
                                    :max="Number(data.qtd || 0)"
                                    showButtons
                                    buttonLayout="horizontal"
                                    class="w-8rem"
                                    @update:modelValue="(val) => setQty(data.id, val)"
                                />
                            </template>
                        </Column>
                        <Column header="Após origem">
                            <template #body="{ data }">
                                {{ Math.max(0, Number(data.qtd || 0) - Number(data.qty || 0)) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="col-12 lg:col-4">
                <div class="card">
                    <h5 class="mt-0">Detalhes</h5>
                    <div class="field">
                        <label for="to_bar">Bar destino</label>
                        <Dropdown
                            id="to_bar"
                            v-model="toBarStoreId"
                            :options="destinationBars"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar bar"
                            class="w-full"
                        />
                    </div>
                    <div class="field">
                        <label for="reference">Referência</label>
                        <InputText id="reference" v-model="reference" class="w-full" placeholder="Opcional" />
                    </div>
                    <div class="field">
                        <label for="note">Observação</label>
                        <Textarea id="note" v-model="note" rows="4" class="w-full" autoResize placeholder="Opcional" />
                    </div>
                    <Button
                        label="Confirmar transferência"
                        icon="pi pi-arrows-h"
                        class="w-full"
                        :loading="isSaving"
                        :disabled="!products.length || !destinationBars.length"
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
