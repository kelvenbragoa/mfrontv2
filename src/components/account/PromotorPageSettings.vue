<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const isLoading = ref(true);
const isSaving = ref(false);
const loadError = ref(null);
const user = ref(null);

const avatarFile = ref(null);
const bannerFile = ref(null);
const avatarPreview = ref(null);
const bannerPreview = ref(null);
const avatarBroken = ref(false);
const bannerBroken = ref(false);

const schema = yup.object({
    company_name: yup.string().nullable().trim().label('Nome da empresa'),
    company_location: yup.string().nullable().trim().label('Localização'),
    description: yup.string().nullable().trim().max(2000).label('Descrição'),
    slug: yup
        .string()
        .nullable()
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa apenas letras minúsculas, números e hífens.')
        .label('Slug')
});

const { defineField, handleSubmit, errors, setErrors, setValues } = useForm({
    validationSchema: schema
});

const [company_name] = defineField('company_name');
const [company_location] = defineField('company_location');
const [description] = defineField('description');
const [slug] = defineField('slug');

const publicUrl = computed(() => {
    if (!slug.value) return null;
    return `${window.location.origin}/p/${slug.value}`;
});

const currentAvatarSrc = computed(() => {
    if (avatarPreview.value) return avatarPreview.value;
    if (user.value?.image && !avatarBroken.value) return storageURL + user.value.image;
    return null;
});

const DEFAULT_BANNER = '/demo/images/logo2.png';

const currentBannerSrc = computed(() => {
    if (bannerPreview.value) return bannerPreview.value;
    if (user.value?.banner && !bannerBroken.value) return storageURL + user.value.banner;
    return DEFAULT_BANNER;
});

const usingDefaultBanner = computed(() => {
    return !bannerPreview.value && (!user.value?.banner || bannerBroken.value);
});

const revokeIfBlob = (url) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
};

const onAvatarSelect = (event) => {
    const file = event.files?.[0];
    if (!file) return;
    avatarFile.value = file;
    revokeIfBlob(avatarPreview.value);
    avatarPreview.value = URL.createObjectURL(file);
    avatarBroken.value = false;
};

const onBannerSelect = (event) => {
    const file = event.files?.[0];
    if (!file) return;
    bannerFile.value = file;
    revokeIfBlob(bannerPreview.value);
    bannerPreview.value = URL.createObjectURL(file);
    bannerBroken.value = false;
};

const clearAvatarSelection = () => {
    revokeIfBlob(avatarPreview.value);
    avatarFile.value = null;
    avatarPreview.value = null;
};

const clearBannerSelection = () => {
    revokeIfBlob(bannerPreview.value);
    bannerFile.value = null;
    bannerPreview.value = null;
};

const loadProfile = async () => {
    isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-profile`);
        user.value = response.data.user;
        setValues({
            company_name: user.value?.company_name || '',
            company_location: user.value?.company_location || '',
            description: user.value?.description || '',
            slug: user.value?.slug || ''
        });
    } catch (error) {
        loadError.value =
            error?.response?.status === 401
                ? 'A sessão expirou. Inicia sessão novamente.'
                : 'Não foi possível carregar a página pública.';
    } finally {
        isLoading.value = false;
    }
};

const copyPublicUrl = async () => {
    if (!publicUrl.value) return;
    try {
        await navigator.clipboard.writeText(publicUrl.value);
        toast.add({
            severity: 'success',
            summary: 'Link copiado',
            detail: publicUrl.value,
            life: 3000
        });
    } catch {
        toast.add({
            severity: 'info',
            summary: 'Link da página',
            detail: publicUrl.value,
            life: 5000
        });
    }
};

const onSubmit = handleSubmit(async (values) => {
    isSaving.value = true;

    const payload = {
        company_name: values.company_name || '',
        company_location: values.company_location || '',
        description: values.description || '',
        slug: values.slug || ''
    };

    if (avatarFile.value) payload.image = avatarFile.value;
    if (bannerFile.value) payload.banner = bannerFile.value;

    try {
        const response = await axios.post(`${baseURL}/promotor-page`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        user.value = response.data.user;
        setValues({
            company_name: user.value?.company_name || '',
            company_location: user.value?.company_location || '',
            description: user.value?.description || '',
            slug: user.value?.slug || ''
        });

        clearAvatarSelection();
        clearBannerSelection();
        avatarBroken.value = false;
        bannerBroken.value = false;

        toast.add({
            severity: 'success',
            summary: 'Página actualizada',
            detail: 'A tua página pública foi guardada.',
            life: 3500
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Não foi possível guardar',
            detail: error?.response?.data?.message || 'Verifica os campos e tenta novamente.',
            life: 4500
        });

        if (error?.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
    } finally {
        isSaving.value = false;
    }
});

watch(slug, (value) => {
    if (!value) return;
    const normalized = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
    if (normalized !== value) {
        slug.value = normalized;
    }
});

onMounted(() => loadProfile());
</script>

<template>
    <div class="page-settings">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Página pública</h4>
                <span class="text-600">Configura o banner, foto e link da tua página de promotor.</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <Button
                    v-if="publicUrl"
                    icon="pi pi-copy"
                    label="Copiar link"
                    outlined
                    @click="copyPublicUrl"
                />
                <router-link v-if="slug" :to="`/p/${slug}`" target="_blank">
                    <Button icon="pi pi-external-link" label="Ver página" outlined />
                </router-link>
            </div>
        </div>

        <div v-if="isLoading" class="card">
            <Skeleton height="10rem" class="mb-3" />
            <Skeleton height="16rem" />
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="loadProfile" />
        </div>

        <form v-else class="card" @submit.prevent="onSubmit">
            <div class="banner-preview mb-4" :class="{ 'banner-preview--default': usingDefaultBanner }">
                <img
                    :src="currentBannerSrc"
                    alt="Banner"
                    @error="user?.banner && !bannerPreview && (bannerBroken = true)"
                />
                <span v-if="usingDefaultBanner" class="banner-preview__hint">Banner por defeito</span>
            </div>

            <div class="flex flex-wrap align-items-end gap-3 mb-4">
                <div class="avatar-preview">
                    <img
                        v-if="currentAvatarSrc"
                        :src="currentAvatarSrc"
                        alt="Foto de perfil"
                        @error="avatarBroken = true"
                    />
                    <span v-else>Foto</span>
                </div>
                <div class="flex flex-column gap-2">
                    <FileUpload
                        mode="basic"
                        name="image"
                        accept="image/*"
                        chooseLabel="Foto de perfil"
                        :auto="true"
                        customUpload
                        @uploader="onAvatarSelect"
                    />
                    <FileUpload
                        mode="basic"
                        name="banner"
                        accept="image/*"
                        chooseLabel="Banner"
                        :auto="true"
                        customUpload
                        @uploader="onBannerSelect"
                    />
                </div>
            </div>

            <div class="grid">
                <div class="col-12 md:col-6 field">
                    <label for="company_name">Nome público</label>
                    <InputText id="company_name" v-model="company_name" class="w-full" placeholder="Nova Era Entretenimentos" />
                    <small v-if="errors.company_name" class="p-error">{{ errors.company_name }}</small>
                </div>

                <div class="col-12 md:col-6 field">
                    <label for="company_location">Localização</label>
                    <InputText id="company_location" v-model="company_location" class="w-full" placeholder="Maputo" />
                    <small v-if="errors.company_location" class="p-error">{{ errors.company_location }}</small>
                </div>

                <div class="col-12 field">
                    <label for="slug">Slug / link</label>
                    <InputGroup>
                        <InputGroupAddon>/p/</InputGroupAddon>
                        <InputText id="slug" v-model="slug" class="w-full" placeholder="nova-era" />
                    </InputGroup>
                    <small class="text-600">Mais tarde isto será algo como nova-era.mticket.co.mz</small>
                    <small v-if="errors.slug" class="p-error block">{{ errors.slug }}</small>
                </div>

                <div class="col-12 field">
                    <label for="description">Descrição</label>
                    <Textarea id="description" v-model="description" rows="4" class="w-full" autoResize placeholder="Conta quem és e o que organizas..." />
                    <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-2">
                <Button type="submit" label="Guardar página" icon="pi pi-check" :loading="isSaving" />
            </div>
        </form>
    </div>
</template>

<style scoped>
.banner-preview {
    position: relative;
    height: 10rem;
    border-radius: 1rem;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
}

.banner-preview--default img {
    object-fit: contain;
}

.banner-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.banner-preview__hint {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
}

.avatar-preview {
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 999px;
    overflow: hidden;
    border: 3px solid #fff;
    box-shadow: 0 8px 20px rgba(15, 40, 80, 0.15);
    background: #1d4ed8;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    color: #334155;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem;
}
</style>
