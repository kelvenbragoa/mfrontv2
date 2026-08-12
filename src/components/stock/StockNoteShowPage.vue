<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import moment from 'moment';

const props = defineProps({
    scope: { type: String, default: 'promotor' }
});

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const loadError = ref(null);
const note = ref(null);

const baseEventPath = computed(() => `/${props.scope}/eventos/${route.params.id}`);

const typeLabel = computed(() => {
    if (note.value?.type === 'entry') return 'Entrada';
    if (note.value?.type === 'exit') return 'Saída';
    if (note.value?.type === 'transfer') return 'Transferência';
    if (note.value?.type === 'inventory') return 'Inventário';
    return note.value?.type || 'Nota';
});

const typeSeverity = computed(() => {
    if (note.value?.type === 'entry') return 'success';
    if (note.value?.type === 'exit') return 'warn';
    if (note.value?.type === 'inventory') return 'secondary';
    return 'info';
});

const loadNote = async () => {
    isLoading.value = true;
    loadError.value = null;
    try {
        const response = await axios.get(`${baseURL}/promotor-stock-notes/${route.params.noteId}`);
        note.value = response.data.note;
    } catch (error) {
        loadError.value = error?.response?.data?.message || 'Não foi possível carregar a nota.';
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => loadNote());
</script>

<template>
    <div class="stock-note-show">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button
                    icon="pi pi-arrow-left"
                    label="Voltar ao bar"
                    text
                    class="px-0 mb-2"
                    @click="router.push(`${baseEventPath}/bar/${note?.bar_store_id || ''}`)"
                />
                <h4 class="m-0 text-900">Nota de {{ typeLabel.toLowerCase() }} #{{ note?.id || route.params.noteId }}</h4>
                <span class="text-600">Histórico confirmado de stock</span>
            </div>
            <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isLoading" @click="loadNote" />
        </div>

        <div v-if="isLoading" class="card"><Skeleton height="14rem" /></div>
        <div v-else-if="loadError" class="card empty-state">
            <p class="text-600 mb-3">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="loadNote" />
        </div>
        <div v-else class="grid">
            <div class="col-12 md:col-4">
                <div class="card">
                    <div class="summary-row"><span>Tipo</span><Tag :value="typeLabel" :severity="typeSeverity" /></div>
                    <div class="summary-row">
                        <span>{{ note.type === 'transfer' ? 'Bar origem' : 'Bar' }}</span>
                        <strong>{{ note.barstore?.name }}</strong>
                    </div>
                    <div v-if="note.type === 'transfer'" class="summary-row">
                        <span>Bar destino</span><strong>{{ note.to_barstore?.name || '--' }}</strong>
                    </div>
                    <div class="summary-row"><span>Referência</span><strong>{{ note.reference || '--' }}</strong></div>
                    <div v-if="note.type === 'entry'" class="summary-row">
                        <span>Fornecedor</span><strong>{{ note.supplier || '--' }}</strong>
                    </div>
                    <div class="summary-row"><span>Por</span><strong>{{ note.creator?.name || '--' }}</strong></div>
                    <div class="summary-row">
                        <span>Data</span>
                        <strong>{{ moment(note.confirmed_at || note.created_at).format('DD/MM/YYYY HH:mm') }}</strong>
                    </div>
                    <p v-if="note.note" class="text-600 mt-3 mb-0">{{ note.note }}</p>
                </div>
            </div>
            <div class="col-12 md:col-8">
                <div class="card">
                    <h5 class="mt-0">Linhas</h5>
                    <DataTable :value="note.items || []" class="p-datatable-sm">
                        <Column :header="note.type === 'transfer' ? 'Produto origem' : 'Produto'">
                            <template #body="{ data }">{{ data.product?.name || `#${data.product_id}` }}</template>
                        </Column>
                        <Column v-if="note.type === 'transfer'" header="Produto destino">
                            <template #body="{ data }">{{ data.to_product?.name || `#${data.to_product_id}` }}</template>
                        </Column>
                        <Column :header="note.type === 'inventory' ? 'Contado' : 'Qtd'" field="qty" />
                        <Column :header="note.type === 'inventory' ? 'Sistema' : note.type === 'transfer' ? 'Origem antes' : 'Antes'" field="qty_before" />
                        <Column :header="note.type === 'inventory' ? 'Depois' : note.type === 'transfer' ? 'Origem depois' : 'Depois'" field="qty_after" />
                        <Column v-if="note.type === 'inventory'" header="Diferença">
                            <template #body="{ data }">
                                <span :class="(data.qty_after - data.qty_before) === 0 ? 'text-600' : (data.qty_after - data.qty_before) > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                                    {{ (data.qty_after - data.qty_before) > 0 ? '+' : '' }}{{ data.qty_after - data.qty_before }}
                                </span>
                            </template>
                        </Column>
                        <Column v-if="note.type === 'transfer'" header="Destino antes" field="to_qty_before" />
                        <Column v-if="note.type === 'transfer'" header="Destino depois" field="to_qty_after" />
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.summary-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--surface-border);
    color: #64748b;
}
.summary-row strong { color: #0f172a; }
.empty-state { text-align: center; padding: 2rem; }
</style>
