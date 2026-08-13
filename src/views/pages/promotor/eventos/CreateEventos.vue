<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const isLoading = ref(true);
const loadError = ref(null);
const isSubmitting = ref(false);
const provinces = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const imageFile = ref(null);
const imagePreview = ref(null);

const schema = yup.object({
    name: yup.string().required().trim().label('Nome'),
    province_id: yup.mixed().required().label('Província'),
    city_id: yup.mixed().required().label('Cidade'),
    description: yup.string().required().trim().label('Descrição'),
    main_category_id: yup.mixed().required().label('Categoria principal'),
    second_category_id: yup.mixed().nullable().label('Categoria secundária'),
    type_event_id: yup.mixed().required().label('Tipo de evento'),
    address: yup.string().required().trim().label('Endereço'),
    latitude: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
        .nullable()
        .min(-90)
        .max(90)
        .label('Latitude'),
    longitude: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
        .nullable()
        .min(-180)
        .max(180)
        .label('Longitude'),
    start_date: yup.string().required().label('Data de início'),
    start_time: yup.string().required().label('Hora de início'),
    end_date: yup.string().required().label('Data de fim'),
    end_time: yup.string().required().label('Hora de fim'),
    email: yup.string().required().email().trim().label('Email'),
    phone: yup.string().required().trim().label('Telefone'),
    website: yup.string().nullable().trim().label('Website'),
    instagram: yup.string().nullable().trim().label('Instagram'),
    facebook: yup.string().nullable().trim().label('Facebook'),
    twitter: yup.string().nullable().trim().label('Twitter'),
    youtube: yup.string().nullable().trim().label('YouTube')
});

const { defineField, handleSubmit, errors, setErrors, setFieldValue } = useForm({
    validationSchema: schema,
    initialValues: {
        website: '',
        instagram: '',
        facebook: '',
        twitter: '',
        youtube: '',
        second_category_id: null,
        latitude: null,
        longitude: null
    }
});

const [name] = defineField('name');
const [province_id] = defineField('province_id');
const [city_id] = defineField('city_id');
const [description] = defineField('description');
const [main_category_id] = defineField('main_category_id');
const [second_category_id] = defineField('second_category_id');
const [type_event_id] = defineField('type_event_id');
const [address] = defineField('address');
const [latitude] = defineField('latitude');
const [longitude] = defineField('longitude');
const [start_date] = defineField('start_date');
const [start_time] = defineField('start_time');
const [end_date] = defineField('end_date');
const [end_time] = defineField('end_time');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [website] = defineField('website');
const [instagram] = defineField('instagram');
const [facebook] = defineField('facebook');
const [twitter] = defineField('twitter');
const [youtube] = defineField('youtube');

watch(province_id, () => {
    setFieldValue('city_id', null);
});

const goBack = () => router.push('/promotor/eventos');

const onFileUpload = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    imageFile.value = file;

    if (imagePreview.value?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.value);
    }
    imagePreview.value = URL.createObjectURL(file);
};

const clearImage = () => {
    if (imagePreview.value?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.value);
    }
    imageFile.value = null;
    imagePreview.value = null;
};

const onSubmit = handleSubmit(async (values) => {
    isSubmitting.value = true;

    const payload = {
        ...values,
        website: values.website || '',
        instagram: values.instagram || '',
        facebook: values.facebook || '',
        twitter: values.twitter || '',
        youtube: values.youtube || '',
        second_category_id: values.second_category_id || values.main_category_id
    };

    if (imageFile.value) {
        payload.image = imageFile.value;
    }

    try {
        const response = await axios.post(`${baseURL}/promotor-eventos`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.add({
            severity: 'success',
            summary: 'Evento criado',
            detail: 'O evento foi submetido e fica pendente de aprovação.',
            life: 4000
        });

        const createdId = response.data?.id;
        router.push(createdId ? `/promotor/eventos/${createdId}` : '/promotor/eventos');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível criar',
            detail: error?.response?.data?.message || 'Verifica os campos e tenta novamente.',
            life: 4000
        });

        if (error?.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
    } finally {
        isSubmitting.value = false;
    }
});

const loadForm = async () => {
    isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-eventos/create`);
        provinces.value = response.data.province ?? [];
        cities.value = response.data.city ?? [];
        categories.value = response.data.category ?? [];
        typeevent.value = response.data.typeevent ?? [];
    } catch (error) {
        const status = error?.response?.status;
        loadError.value =
            status === 401
                ? 'A sessão expirou. Inicia sessão novamente.'
                : 'Não foi possível carregar o formulário.';
    } finally {
        isLoading.value = false;
    }
};

const hasImage = computed(() => !!imagePreview.value);

onMounted(() => {
    loadForm();
});
</script>

<template>
    <div class="event-form-page">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button label="Voltar" icon="pi pi-angle-left" text class="mb-2 p-0" @click="goBack" />
                <h4 class="m-0 text-900">Criar evento</h4>
                <span class="text-600">Preenche os dados do evento. Fica pendente até aprovação.</span>
            </div>
        </div>

        <div v-if="isLoading" class="card">
            <Skeleton width="10rem" height="1.25rem" class="mb-4" />
            <Skeleton v-for="n in 8" :key="`sk-${n}`" height="2.75rem" class="mb-3" />
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Formulário indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <div class="flex gap-2">
                <Button label="Voltar" outlined icon="pi pi-angle-left" @click="goBack" />
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="loadForm" />
            </div>
        </div>

        <form v-else class="p-fluid" @submit.prevent="onSubmit">
            <div class="card mb-3">
                <h5 class="mt-0 mb-1">Informação geral</h5>
                <p class="text-600 mt-0 mb-4">Nome, classificação e descrição do evento.</p>

                <div class="field">
                    <label for="name">Nome <span class="required">*</span></label>
                    <InputText id="name" v-model="name" :class="{ 'p-invalid': errors.name }" placeholder="Nome do evento" />
                    <small class="p-error">{{ errors.name }}</small>
                </div>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-4">
                        <label for="main_category_id">Categoria principal <span class="required">*</span></label>
                        <Dropdown
                            id="main_category_id"
                            v-model="main_category_id"
                            :options="categories"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar"
                            filter
                            :class="{ 'p-invalid': errors.main_category_id }"
                        />
                        <small class="p-error">{{ errors.main_category_id }}</small>
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="second_category_id">Categoria secundária</label>
                        <Dropdown
                            id="second_category_id"
                            v-model="second_category_id"
                            :options="categories"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Opcional"
                            showClear
                            filter
                            :class="{ 'p-invalid': errors.second_category_id }"
                        />
                        <small class="p-error">{{ errors.second_category_id }}</small>
                    </div>
                    <div class="field col-12 md:col-4">
                        <label for="type_event_id">Tipo de evento <span class="required">*</span></label>
                        <Dropdown
                            id="type_event_id"
                            v-model="type_event_id"
                            :options="typeevent"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar"
                            :class="{ 'p-invalid': errors.type_event_id }"
                        />
                        <small class="p-error">{{ errors.type_event_id }}</small>
                    </div>
                </div>

                <div class="field">
                    <label for="description">Descrição <span class="required">*</span></label>
                    <Textarea
                        id="description"
                        v-model="description"
                        rows="5"
                        autoResize
                        :class="{ 'p-invalid': errors.description }"
                        placeholder="Descreve o evento para o público"
                    />
                    <small class="p-error">{{ errors.description }}</small>
                </div>
            </div>

            <div class="card mb-3">
                <h5 class="mt-0 mb-1">Localização e datas</h5>
                <p class="text-600 mt-0 mb-4">Onde e quando o evento acontece.</p>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="province_id">Província <span class="required">*</span></label>
                        <Dropdown
                            id="province_id"
                            v-model="province_id"
                            :options="provinces"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar"
                            filter
                            :class="{ 'p-invalid': errors.province_id }"
                        />
                        <small class="p-error">{{ errors.province_id }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="city_id">Cidade <span class="required">*</span></label>
                        <Dropdown
                            id="city_id"
                            v-model="city_id"
                            :options="cities"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecionar"
                            filter
                            :class="{ 'p-invalid': errors.city_id }"
                        />
                        <small class="p-error">{{ errors.city_id }}</small>
                    </div>
                </div>

                <div class="field">
                    <label for="address">Endereço <span class="required">*</span></label>
                    <InputText id="address" v-model="address" :class="{ 'p-invalid': errors.address }" placeholder="Morada ou local do evento" />
                    <small class="p-error">{{ errors.address }}</small>
                </div>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="latitude">Latitude (mapa)</label>
                        <InputNumber
                            id="latitude"
                            v-model="latitude"
                            :minFractionDigits="0"
                            :maxFractionDigits="7"
                            :useGrouping="false"
                            placeholder="-19.8187"
                            class="w-full"
                            :class="{ 'p-invalid': errors.latitude }"
                        />
                        <small class="p-error">{{ errors.latitude }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="longitude">Longitude (mapa)</label>
                        <InputNumber
                            id="longitude"
                            v-model="longitude"
                            :minFractionDigits="0"
                            :maxFractionDigits="7"
                            :useGrouping="false"
                            placeholder="34.8553"
                            class="w-full"
                            :class="{ 'p-invalid': errors.longitude }"
                        />
                        <small class="p-error">{{ errors.longitude }}</small>
                    </div>
                </div>
                <small class="text-600 block mb-3">
                    Opcional. No Google Maps, clica com o botão direito no local e copia as coordenadas (ex.: Beira ≈ -19.82, 34.85).
                </small>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="start_date">Data de início <span class="required">*</span></label>
                        <InputText id="start_date" v-model="start_date" type="date" :class="{ 'p-invalid': errors.start_date }" />
                        <small class="p-error">{{ errors.start_date }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="start_time">Hora de início <span class="required">*</span></label>
                        <InputText id="start_time" v-model="start_time" type="time" :class="{ 'p-invalid': errors.start_time }" />
                        <small class="p-error">{{ errors.start_time }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="end_date">Data de fim <span class="required">*</span></label>
                        <InputText id="end_date" v-model="end_date" type="date" :class="{ 'p-invalid': errors.end_date }" />
                        <small class="p-error">{{ errors.end_date }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="end_time">Hora de fim <span class="required">*</span></label>
                        <InputText id="end_time" v-model="end_time" type="time" :class="{ 'p-invalid': errors.end_time }" />
                        <small class="p-error">{{ errors.end_time }}</small>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <h5 class="mt-0 mb-1">Contactos</h5>
                <p class="text-600 mt-0 mb-4">Informação para o público contactar a organização.</p>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="email">Email <span class="required">*</span></label>
                        <InputText id="email" v-model="email" type="email" :class="{ 'p-invalid': errors.email }" />
                        <small class="p-error">{{ errors.email }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="phone">Telefone <span class="required">*</span></label>
                        <InputText id="phone" v-model="phone" :class="{ 'p-invalid': errors.phone }" />
                        <small class="p-error">{{ errors.phone }}</small>
                    </div>
                    <div class="field col-12">
                        <label for="website">Website</label>
                        <InputText id="website" v-model="website" :class="{ 'p-invalid': errors.website }" placeholder="https://" />
                        <small class="p-error">{{ errors.website }}</small>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <h5 class="mt-0 mb-1">Redes sociais</h5>
                <p class="text-600 mt-0 mb-4">Campos opcionais.</p>

                <div class="formgrid grid">
                    <div class="field col-12 md:col-6">
                        <label for="instagram">Instagram</label>
                        <InputText id="instagram" v-model="instagram" :class="{ 'p-invalid': errors.instagram }" />
                        <small class="p-error">{{ errors.instagram }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="facebook">Facebook</label>
                        <InputText id="facebook" v-model="facebook" :class="{ 'p-invalid': errors.facebook }" />
                        <small class="p-error">{{ errors.facebook }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="twitter">Twitter / X</label>
                        <InputText id="twitter" v-model="twitter" :class="{ 'p-invalid': errors.twitter }" />
                        <small class="p-error">{{ errors.twitter }}</small>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="youtube">Vídeo YouTube</label>
                        <InputText id="youtube" v-model="youtube" :class="{ 'p-invalid': errors.youtube }" placeholder="URL do vídeo" />
                        <small class="p-error">{{ errors.youtube }}</small>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <h5 class="mt-0 mb-1">Imagem de capa</h5>
                <p class="text-600 mt-0 mb-4">Recomendado: imagem horizontal, até 1 MB.</p>

                <div class="image-row">
                    <div v-if="hasImage" class="image-preview-wrap">
                        <img :src="imagePreview" alt="Pré-visualização" class="image-preview" />
                        <Button type="button" icon="pi pi-times" rounded text severity="danger" class="image-clear" @click="clearImage" />
                    </div>
                    <FileUpload
                        mode="basic"
                        name="image"
                        accept="image/*"
                        :maxFileSize="1000000"
                        chooseLabel="Escolher imagem"
                        customUpload
                        auto
                        @uploader="onFileUpload"
                    />
                </div>
            </div>

            <div class="flex flex-wrap justify-content-end gap-2">
                <Button type="button" label="Cancelar" outlined :disabled="isSubmitting" @click="goBack" />
                <Button type="submit" label="Criar evento" icon="pi pi-check" :loading="isSubmitting" />
            </div>
        </form>
    </div>
</template>

<style scoped>
.required {
    color: #dc2626;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

.image-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
}

.image-preview-wrap {
    position: relative;
}

.image-preview {
    width: 16rem;
    height: 10rem;
    object-fit: cover;
    border-radius: 0.85rem;
    border: 1px solid var(--surface-border);
}

.image-clear {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
}
</style>
