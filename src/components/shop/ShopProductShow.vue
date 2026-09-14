<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL, storageURL } from '@/service/ApiConstant';

const router = useRouter();
const toast = useToast();
const productId = router.currentRoute.value.params.idproduto;
const eventId = router.currentRoute.value.params.id;

const isLoading = ref(true);
const product = ref(null);

const goBack = () => router.back();
const editPath = computed(() => {
    const base = router.currentRoute.value.path.includes('/admin/') ? '/admin' : '/promotor';
    return `${base}/eventos/${eventId}/loja/${productId}/edit`;
});

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

onMounted(async () => {
    try {
        const response = await axios.get(`${baseURL}/promotor-shop-products/${productId}`);
        product.value = response.data.product;
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Produto da loja não encontrado.', life: 4000 });
        goBack();
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div v-if="isLoading" class="text-center py-6">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
    </div>
    <div v-else-if="product" class="card">
        <div class="flex justify-content-between align-items-center mb-4">
            <Button label="Voltar" outlined @click="goBack">
                <i class="pi pi-angle-left mr-2" /> Voltar
            </Button>
            <router-link :to="editPath">
                <Button label="Editar" icon="pi pi-pencil" />
            </router-link>
        </div>

        <div class="flex gap-4 flex-wrap">
            <img
                v-if="product.image"
                :src="storageURL + product.image"
                alt=""
                class="shop-show-image"
            />
            <div>
                <Tag :value="product.status === 1 ? 'Activo' : 'Oculto'" :severity="product.status === 1 ? 'success' : 'secondary'" />
                <h3 class="mt-2 mb-2">{{ product.name }}</h3>
                <p v-if="product.description" class="text-600">{{ product.description }}</p>
                <p class="font-bold text-xl text-blue-600">{{ formatCurrency(product.sell_price) }}</p>
                <p class="text-600">Stock: {{ product.qtd }}</p>
                <p class="text-600 mb-0">Levantamento no evento</p>
            </div>
        </div>

        <div v-if="product.variants?.length" class="mt-4">
            <h5>Variantes</h5>
            <DataTable :value="product.variants" class="p-datatable-sm">
                <Column field="name" header="Tamanho" />
                <Column field="qtd" header="Stock" />
                <Column header="Preço">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.sell_price ?? product.sell_price) }}
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
.shop-show-image {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 1rem;
    border: 1px solid var(--surface-border);
}
</style>
