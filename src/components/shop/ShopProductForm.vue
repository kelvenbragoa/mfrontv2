<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { baseURL, storageURL } from '@/service/ApiConstant';

const router = useRouter();
const toast = useToast();

const eventId = router.currentRoute.value.params.id;
const productId = router.currentRoute.value.params.idproduto;
const isEdit = computed(() => !!productId);

const isLoading = ref(!!productId);
const isSubmitting = ref(false);
const imageFile = ref(null);
const imagePreview = ref(null);
const currentImage = ref(null);
const variants = ref([]);

const schema = yup.object({
    name: yup.string().required().trim().label('Nome'),
    description: yup.string().nullable().label('Descrição'),
    sell_price: yup.number().typeError('Indica o preço').min(0).required().label('Preço'),
    qtd: yup.number().typeError('Indica o stock').min(0).required().label('Stock'),
    status: yup.boolean()
});

const { defineField, handleSubmit, errors, setErrors, setValues } = useForm({
    validationSchema: schema,
    initialValues: {
        name: '',
        description: '',
        sell_price: '',
        qtd: 0,
        status: true
    }
});

const [name] = defineField('name');
const [description] = defineField('description');
const [sell_price] = defineField('sell_price');
const [qtd] = defineField('qtd');
const [status] = defineField('status');

const goBack = () => router.back();

const addVariant = (preset = '') => {
    variants.value.push({ id: null, name: preset, qtd: 0, sell_price: '' });
};

const removeVariant = (index) => {
    variants.value.splice(index, 1);
};

const addSizePresets = () => {
    ['S', 'M', 'L', 'XL'].forEach((size) => {
        if (!variants.value.some((row) => String(row.name).toUpperCase() === size)) {
            addVariant(size);
        }
    });
};

const onFileUpload = (event) => {
    const file = event.files?.[0];
    if (!file) return;
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
};

const clearImage = () => {
    imageFile.value = null;
    imagePreview.value = null;
};

const loadProduct = async () => {
    try {
        const response = await axios.get(`${baseURL}/promotor-shop-products/${productId}/edit`);
        const product = response.data.product;
        setValues({
            name: product.name,
            description: product.description || '',
            sell_price: product.sell_price,
            qtd: product.qtd ?? 0,
            status: Number(product.status) === 1
        });
        currentImage.value = product.image || null;
        variants.value = (product.variants || []).map((row) => ({
            id: row.id,
            name: row.name,
            qtd: row.qtd ?? 0,
            sell_price: row.sell_price ?? ''
        }));
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o produto.', life: 4000 });
        goBack();
    } finally {
        isLoading.value = false;
    }
};

const onSubmit = handleSubmit(async (values) => {
    isSubmitting.value = true;

    const form = new FormData();
    form.append('event_id', eventId);
    form.append('name', values.name);
    form.append('description', values.description || '');
    form.append('sell_price', values.sell_price);
    form.append('qtd', variants.value.length ? 0 : values.qtd);
    form.append('status', values.status ? '1' : '0');
    form.append('pickup_only', '1');
    form.append(
        'variants',
        JSON.stringify(
            variants.value
                .filter((row) => String(row.name || '').trim())
                .map((row) => ({
                    id: row.id || undefined,
                    name: String(row.name).trim(),
                    qtd: Number(row.qtd || 0),
                    sell_price: row.sell_price === '' || row.sell_price === null ? null : Number(row.sell_price)
                }))
        )
    );
    if (imageFile.value) {
        form.append('image', imageFile.value);
    }

    try {
        if (isEdit.value) {
            form.append('_method', 'PUT');
            await axios.post(`${baseURL}/promotor-shop-products/${productId}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.add({ severity: 'success', summary: 'Guardado', detail: 'Produto da loja actualizado.', life: 3000 });
        } else {
            await axios.post(`${baseURL}/promotor-shop-products`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.add({ severity: 'success', summary: 'Criado', detail: 'Produto adicionado à loja do evento.', life: 3000 });
        }
        goBack();
    } catch (error) {
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.message || 'Não foi possível guardar o produto.',
            life: 4000
        });
    } finally {
        isSubmitting.value = false;
    }
});

onMounted(() => {
    if (isEdit.value) {
        loadProduct();
    }
});
</script>

<template>
    <div v-if="isLoading" class="text-center py-6">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
        <p>A carregar...</p>
    </div>

    <div v-else class="card">
        <Button label="Voltar" class="mb-3" outlined @click="goBack">
            <i class="pi pi-angle-left mr-2" /> Voltar
        </Button>
        <h5 class="mt-0">{{ isEdit ? 'Editar produto da loja' : 'Adicionar produto à loja' }}</h5>
        <p class="text-600 mt-0 mb-4">Venda antecipada com levantamento no evento.</p>

        <form @submit.prevent="onSubmit">
            <div class="card p-fluid mb-3">
                <div class="field">
                    <label for="shop-name">Nome *</label>
                    <InputText id="shop-name" v-model="name" :class="{ 'p-invalid': errors.name }" />
                    <small class="p-error">{{ errors.name }}</small>
                </div>
                <div class="field">
                    <label for="shop-description">Descrição</label>
                    <Textarea id="shop-description" v-model="description" rows="3" autoResize />
                </div>
                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="shop-price">Preço de venda (MT) *</label>
                        <InputText id="shop-price" v-model="sell_price" type="number" min="0" step="0.01" :class="{ 'p-invalid': errors.sell_price }" />
                        <small class="p-error">{{ errors.sell_price }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="shop-qtd">Stock *</label>
                        <InputText id="shop-qtd" v-model="qtd" type="number" min="0" :disabled="variants.length > 0" :class="{ 'p-invalid': errors.qtd }" />
                        <small v-if="variants.length" class="text-600">O stock passa a ser a soma dos tamanhos.</small>
                        <small class="p-error">{{ errors.qtd }}</small>
                    </div>
                </div>
                <div class="field flex align-items-center gap-3">
                    <InputSwitch v-model="status" inputId="shop-status" />
                    <label for="shop-status" class="mb-0">Visível na loja pública</label>
                </div>
            </div>

            <div class="card mb-3">
                <div class="flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 class="mt-0 mb-1">Tamanhos / variantes</h5>
                        <p class="text-600 m-0">Opcional. Usa para camisolas (S, M, L…).</p>
                    </div>
                    <div class="flex gap-2">
                        <Button type="button" label="S M L XL" outlined size="small" @click="addSizePresets" />
                        <Button type="button" label="Adicionar" icon="pi pi-plus" size="small" @click="addVariant()" />
                    </div>
                </div>

                <div v-if="!variants.length" class="text-600">Sem variantes — vende-se o produto com o stock acima.</div>
                <div v-for="(row, index) in variants" :key="row.id || index" class="variant-row mb-2">
                    <InputText v-model="row.name" placeholder="Tamanho (ex: M)" class="flex-1" />
                    <InputText v-model="row.qtd" type="number" min="0" placeholder="Stock" style="width: 7rem" />
                    <InputText v-model="row.sell_price" type="number" min="0" step="0.01" placeholder="Preço (opcional)" style="width: 9rem" />
                    <Button type="button" icon="pi pi-trash" text rounded severity="danger" @click="removeVariant(index)" />
                </div>
            </div>

            <div class="card mb-3">
                <h5 class="mt-0 mb-3">Fotografia</h5>
                <div class="flex align-items-center gap-3 flex-wrap">
                    <img
                        v-if="imagePreview || currentImage"
                        :src="imagePreview || storageURL + currentImage"
                        alt=""
                        class="shop-preview"
                    />
                    <FileUpload
                        mode="basic"
                        name="image"
                        accept="image/*"
                        :maxFileSize="4000000"
                        chooseLabel="Escolher imagem"
                        customUpload
                        auto
                        @uploader="onFileUpload"
                    />
                    <Button v-if="imagePreview" type="button" label="Limpar" text @click="clearImage" />
                </div>
            </div>

            <Button type="submit" :label="isEdit ? 'Guardar' : 'Criar produto'" :loading="isSubmitting" />
        </form>
    </div>
</template>

<style scoped>
.variant-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.shop-preview {
    width: 96px;
    height: 96px;
    object-fit: cover;
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
}
</style>
