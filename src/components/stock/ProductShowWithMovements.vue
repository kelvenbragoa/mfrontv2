<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const props = defineProps({
    scope: { type: String, default: 'promotor' }
});

const router = useRouter();
const toast = useToast();
const isLoadingDiv = ref(true);
const retriviedData = ref(null);
const movements = ref([]);

function goBackUsingBack() {
    if (router) router.back();
}

const typeLabel = (type) => {
    if (type === 'entry') return 'Entrada';
    if (type === 'exit') return 'Saída';
    if (type === 'transfer_out') return 'Transferência (saída)';
    if (type === 'transfer_in') return 'Transferência (entrada)';
    if (type === 'transfer') return 'Transferência';
    if (type === 'inventory') return 'Inventário';
    if (type === 'sale') return 'Venda';
    if (type === 'sale_cancel') return 'Cancel. venda';
    return type || '--';
};

const typeSeverity = (type) => {
    if (type === 'entry' || type === 'transfer_in' || type === 'sale_cancel') return 'success';
    if (type === 'exit' || type === 'transfer_out' || type === 'sale') return 'warn';
    if (type === 'inventory') return 'secondary';
    return 'info';
};

const loadMovements = (productId) => {
    axios
        .get(`${baseURL}/promotor-product-movements/${productId}`, { params: { per_page: 30 } })
        .then((response) => {
            movements.value = response.data?.movements?.data || [];
        })
        .catch(() => {
            movements.value = [];
        });
};

const getData = () => {
    axios
        .get(`${baseURL}/promotor-products/${router.currentRoute.value.params.idproduto}`)
        .then((response) => {
            retriviedData.value = response.data.product;
            loadMovements(retriviedData.value.id);
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};

onMounted(() => getData());
</script>

<template>
    <div class="card" v-if="!isLoadingDiv && retriviedData">
        <div class="col-12">
            <div class="card-w-title">
                <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
            </div>

            <p>Detalhes do Produto</p>
            <p><strong>Nome: </strong>{{ retriviedData.name }}</p>
            <p><strong>Stock: </strong>{{ retriviedData.qtd }}</p>
            <p><strong>Compra: </strong>{{ retriviedData.buy_price }}</p>
            <p><strong>Venda: </strong>{{ retriviedData.sell_price }}</p>
            <p><strong>Bar: </strong>{{ retriviedData.barstore?.name }}</p>
            <p class="text-600">Stock muda via notas (entrada/saída/transferência/inventário) e vendas do barman.</p>

            <div class="flex flex-wrap gap-2 mb-3" v-if="retriviedData.bar_store_id">
                <router-link :to="`/${scope}/eventos/${retriviedData.event_id}/bar/${retriviedData.bar_store_id}/stock/entrada`">
                    <Button label="Nota de entrada" icon="pi pi-plus-circle" severity="success" />
                </router-link>
                <router-link :to="`/${scope}/eventos/${retriviedData.event_id}/bar/${retriviedData.bar_store_id}/stock/saida`">
                    <Button label="Nota de saída" icon="pi pi-minus-circle" severity="warn" />
                </router-link>
            </div>

            <hr />
            <h5>Histórico de movimentos</h5>
            <DataTable :value="movements" class="p-datatable-sm" tableStyle="min-width: 40rem">
                <Column header="Data">
                    <template #body="{ data }">{{ moment(data.created_at).format('DD/MM/YYYY HH:mm') }}</template>
                </Column>
                <Column header="Tipo">
                    <template #body="{ data }">
                        <Tag :value="typeLabel(data.type)" :severity="typeSeverity(data.type)" />
                    </template>
                </Column>
                <Column header="Antes" field="qty_before" />
                <Column header="Delta" field="qty_delta" />
                <Column header="Depois" field="qty_after" />
                <Column header="Nota">
                    <template #body="{ data }">
                        <router-link
                            v-if="data.stock_note_id"
                            :to="`/${scope}/eventos/${retriviedData.event_id}/stock/${data.stock_note_id}`"
                        >
                            #{{ data.stock_note_id }}
                        </router-link>
                        <span v-else>--</span>
                    </template>
                </Column>
                <Column header="Por">
                    <template #body="{ data }">{{ data.user?.name || '--' }}</template>
                </Column>
                <template #empty>Sem movimentos registados.</template>
            </DataTable>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
