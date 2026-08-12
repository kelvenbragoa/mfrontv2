<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import {
    getPromotorPublicLabel,
    getPromotorPublicUrl,
    shouldUseSubdomainUrls,
    RESERVED_SUBDOMAINS
} from '@/utils/promotorHost';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const userId = route.params.id;

const isLoading = ref(true);
const loadError = ref(null);
const user = ref(null);
const isSavingUser = ref(false);
const isSavingPassword = ref(false);
const isSavingPage = ref(false);

const avatarFile = ref(null);
const bannerFile = ref(null);
const avatarPreview = ref(null);
const bannerPreview = ref(null);
const avatarBroken = ref(false);
const bannerBroken = ref(false);
const useSubdomainLinks = shouldUseSubdomainUrls();

const DEFAULT_BANNER = '/demo/images/logo2.png';

const roleOptions = [
    { label: 'Administrador', value: 1 },
    { label: 'Utilizador', value: 2 }
];

const userSchema = yup.object({
    name: yup.string().required().trim().label('Nome'),
    email: yup.string().required().email().trim().label('Email'),
    mobile: yup.string().nullable().trim().label('Telefone'),
    role_id: yup.number().required().label('Papel'),
    is_promotor: yup.boolean().label('Promotor'),
    company_name: yup.string().nullable().trim().label('Empresa'),
    company_location: yup.string().nullable().trim().label('Localização'),
    description: yup.string().nullable().trim().max(2000).label('Descrição')
});

const passwordSchema = yup.object({
    password: yup.string().required('Indica a nova palavra-passe.').min(8, 'Mínimo de 8 caracteres.'),
    password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], 'As palavras-passe não coincidem.')
        .required('Confirma a nova palavra-passe.')
});

const pageSchema = yup.object({
    company_name: yup.string().nullable().trim().label('Nome público'),
    company_location: yup.string().nullable().trim().label('Localização'),
    description: yup.string().nullable().trim().max(2000).label('Descrição'),
    slug: yup
        .string()
        .nullable()
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa apenas letras minúsculas, números e hífens.')
        .test('reserved', 'Este slug está reservado. Escolhe outro.', (value) => {
            if (!value) return true;
            return !RESERVED_SUBDOMAINS.has(value);
        })
        .label('Slug')
});

const {
    defineField: defineUserField,
    handleSubmit: handleUserSubmit,
    errors: userErrors,
    setErrors: setUserErrors,
    setValues: setUserValues
} = useForm({ validationSchema: userSchema });

const {
    defineField: definePasswordField,
    handleSubmit: handlePasswordSubmit,
    errors: passwordErrors,
    setErrors: setPasswordErrors,
    resetForm: resetPasswordForm
} = useForm({ validationSchema: passwordSchema });

const {
    defineField: definePageField,
    handleSubmit: handlePageSubmit,
    errors: pageErrors,
    setErrors: setPageErrors,
    setValues: setPageValues
} = useForm({ validationSchema: pageSchema });

const [name] = defineUserField('name');
const [email] = defineUserField('email');
const [mobile] = defineUserField('mobile');
const [role_id] = defineUserField('role_id');
const [is_promotor] = defineUserField('is_promotor');
const [company_name] = defineUserField('company_name');
const [company_location] = defineUserField('company_location');
const [description] = defineUserField('description');

const [password] = definePasswordField('password');
const [password_confirmation] = definePasswordField('password_confirmation');

const [page_company_name] = definePageField('company_name');
const [page_company_location] = definePageField('company_location');
const [page_description] = definePageField('description');
const [slug] = definePageField('slug');

const publicUrl = computed(() => getPromotorPublicUrl(slug.value));
const publicLabel = computed(() => getPromotorPublicLabel(slug.value));
const isPromotor = computed(() => !!user.value?.is_promotor);

const currentAvatarSrc = computed(() => {
    if (avatarPreview.value) return avatarPreview.value;
    if (user.value?.image && !avatarBroken.value) return storageURL + user.value.image;
    return null;
});

const currentBannerSrc = computed(() => {
    if (bannerPreview.value) return bannerPreview.value;
    if (user.value?.banner && !bannerBroken.value) return storageURL + user.value.banner;
    return DEFAULT_BANNER;
});

const usingDefaultBanner = computed(() => !bannerPreview.value && (!user.value?.banner || bannerBroken.value));

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

const applyUserToForms = (data) => {
    user.value = data;
    setUserValues({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        role_id: Number(data.role_id) || 2,
        is_promotor: !!Number(data.is_promotor),
        company_name: data.company_name || '',
        company_location: data.company_location || '',
        description: data.description || ''
    });
    setPageValues({
        company_name: data.company_name || '',
        company_location: data.company_location || '',
        description: data.description || '',
        slug: data.slug || ''
    });
};

const loadUser = async () => {
    isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/admin-users/${userId}`);
        applyUserToForms(response.data.user);
        avatarBroken.value = false;
        bannerBroken.value = false;
        revokeIfBlob(avatarPreview.value);
        revokeIfBlob(bannerPreview.value);
        avatarFile.value = null;
        bannerFile.value = null;
        avatarPreview.value = null;
        bannerPreview.value = null;
    } catch (error) {
        const status = error?.response?.status;
        loadError.value =
            status === 404
                ? 'Utilizador não encontrado.'
                : status === 403
                  ? 'Sem permissão.'
                  : 'Não foi possível carregar o utilizador.';
    } finally {
        isLoading.value = false;
    }
};

const onSaveUser = handleUserSubmit(async (values) => {
    isSavingUser.value = true;
    try {
        const response = await axios.post(`${baseURL}/admin-users/${userId}`, {
            ...values,
            is_promotor: values.is_promotor ? 1 : 0
        });
        applyUserToForms(response.data.user);
        toast.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Dados do utilizador actualizados.',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível guardar.',
            life: 4000
        });
        if (error?.response?.data?.errors) setUserErrors(error.response.data.errors);
    } finally {
        isSavingUser.value = false;
    }
});

const onResetPassword = handlePasswordSubmit(async (values) => {
    isSavingPassword.value = true;
    try {
        await axios.post(`${baseURL}/admin-users/${userId}/reset-password`, values);
        resetPasswordForm();
        toast.add({
            severity: 'success',
            summary: 'Password redefinida',
            detail: 'A nova palavra-passe foi guardada.',
            life: 3500
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível redefinir.',
            life: 4000
        });
        if (error?.response?.data?.errors) setPasswordErrors(error.response.data.errors);
    } finally {
        isSavingPassword.value = false;
    }
});

const onSavePage = handlePageSubmit(async (values) => {
    isSavingPage.value = true;
    const payload = {
        company_name: values.company_name || '',
        company_location: values.company_location || '',
        description: values.description || '',
        slug: values.slug || ''
    };
    if (avatarFile.value) payload.image = avatarFile.value;
    if (bannerFile.value) payload.banner = bannerFile.value;

    try {
        const response = await axios.post(`${baseURL}/admin-users/${userId}/page`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        applyUserToForms(response.data.user);
        revokeIfBlob(avatarPreview.value);
        revokeIfBlob(bannerPreview.value);
        avatarFile.value = null;
        bannerFile.value = null;
        avatarPreview.value = null;
        bannerPreview.value = null;
        toast.add({
            severity: 'success',
            summary: 'Página actualizada',
            detail: 'Configurações do promotor guardadas.',
            life: 3500
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível guardar a página.',
            life: 4000
        });
        if (error?.response?.data?.errors) setPageErrors(error.response.data.errors);
    } finally {
        isSavingPage.value = false;
    }
});

watch(slug, (value) => {
    if (!value) return;
    const normalized = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
    if (normalized !== value) slug.value = normalized;
});

onMounted(() => loadUser());
</script>

<template>
    <div class="admin-user-show">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button icon="pi pi-arrow-left" label="Voltar" text class="px-0 mb-2" @click="router.push('/admin/utilizadores')" />
                <h4 class="m-0 text-900">Utilizador</h4>
                <span class="text-600">{{ user?.email || 'Carregar detalhes...' }}</span>
            </div>
            <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isLoading" @click="loadUser" />
        </div>

        <div v-if="isLoading" class="grid">
            <div class="col-12 lg:col-7"><div class="card"><Skeleton height="22rem" /></div></div>
            <div class="col-12 lg:col-5"><div class="card"><Skeleton height="16rem" /></div></div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="loadUser" />
        </div>

        <div v-else class="grid">
            <div class="col-12 lg:col-7">
                <form class="card" @submit.prevent="onSaveUser">
                    <div class="section-header mb-4">
                        <h5 class="m-0">Dados da conta</h5>
                        <span class="text-600 text-sm">Nome, contacto, papel e estado de promotor.</span>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="name">Nome</label>
                            <InputText id="name" v-model="name" class="w-full" :class="{ 'p-invalid': userErrors.name }" />
                            <small class="p-error">{{ userErrors.name }}</small>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="email">Email</label>
                            <InputText id="email" v-model="email" class="w-full" :class="{ 'p-invalid': userErrors.email }" />
                            <small class="p-error">{{ userErrors.email }}</small>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="mobile">Telefone</label>
                            <InputText id="mobile" v-model="mobile" class="w-full" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="role_id">Papel</label>
                            <Dropdown
                                id="role_id"
                                v-model="role_id"
                                :options="roleOptions"
                                optionLabel="label"
                                optionValue="value"
                                class="w-full"
                            />
                        </div>
                        <div class="field col-12">
                            <div class="flex align-items-center gap-2">
                                <InputSwitch v-model="is_promotor" inputId="is_promotor" />
                                <label for="is_promotor" class="mb-0">É promotor</label>
                            </div>
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="company_name">Empresa</label>
                            <InputText id="company_name" v-model="company_name" class="w-full" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="company_location">Localização</label>
                            <InputText id="company_location" v-model="company_location" class="w-full" />
                        </div>
                        <div class="field col-12">
                            <label for="description">Descrição</label>
                            <Textarea id="description" v-model="description" rows="3" class="w-full" autoResize />
                        </div>
                    </div>

                    <Button type="submit" label="Guardar dados" icon="pi pi-check" :loading="isSavingUser" />
                </form>

                <form v-if="isPromotor" class="card mt-3" @submit.prevent="onSavePage">
                    <div class="section-header mb-3">
                        <h5 class="m-0">Página pública do promotor</h5>
                        <span class="text-600 text-sm">Banner, foto, slug e biografia.</span>
                    </div>

                    <div class="banner-preview mb-3" :class="{ 'banner-preview--default': usingDefaultBanner }">
                        <img :src="currentBannerSrc" alt="Banner" @error="user?.banner && !bannerPreview && (bannerBroken = true)" />
                    </div>

                    <div class="flex flex-wrap align-items-end gap-3 mb-3">
                        <div class="avatar-preview">
                            <img
                                v-if="currentAvatarSrc"
                                :src="currentAvatarSrc"
                                alt="Avatar"
                                @error="avatarBroken = true"
                            />
                            <span v-else>Foto</span>
                        </div>
                        <div class="flex flex-column gap-2">
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                chooseLabel="Foto de perfil"
                                :auto="true"
                                customUpload
                                @uploader="onAvatarSelect"
                            />
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                chooseLabel="Banner"
                                :auto="true"
                                customUpload
                                @uploader="onBannerSelect"
                            />
                        </div>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col-12 md:col-6">
                            <label for="page_company_name">Nome público</label>
                            <InputText id="page_company_name" v-model="page_company_name" class="w-full" />
                        </div>
                        <div class="field col-12 md:col-6">
                            <label for="page_company_location">Localização</label>
                            <InputText id="page_company_location" v-model="page_company_location" class="w-full" />
                        </div>
                        <div class="field col-12">
                            <label for="slug">Slug / link</label>
                            <InputGroup v-if="useSubdomainLinks">
                                <InputText id="slug" v-model="slug" class="w-full" placeholder="nova-era" />
                                <InputGroupAddon>.mticket.co.mz</InputGroupAddon>
                            </InputGroup>
                            <InputGroup v-else>
                                <InputGroupAddon>/p/</InputGroupAddon>
                                <InputText id="slug" v-model="slug" class="w-full" placeholder="nova-era" />
                            </InputGroup>
                            <small v-if="publicLabel" class="text-600">{{ publicLabel }}</small>
                            <small v-if="pageErrors.slug" class="p-error block">{{ pageErrors.slug }}</small>
                        </div>
                        <div class="field col-12">
                            <label for="page_description">Descrição</label>
                            <Textarea id="page_description" v-model="page_description" rows="4" class="w-full" autoResize />
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <Button type="submit" label="Guardar página" icon="pi pi-check" :loading="isSavingPage" />
                        <a v-if="publicUrl && useSubdomainLinks" :href="publicUrl" target="_blank" rel="noopener">
                            <Button type="button" label="Ver página" icon="pi pi-external-link" outlined />
                        </a>
                        <router-link v-else-if="slug" :to="`/p/${slug}`" target="_blank">
                            <Button type="button" label="Ver página" icon="pi pi-external-link" outlined />
                        </router-link>
                    </div>
                </form>
            </div>

            <div class="col-12 lg:col-5">
                <form class="card" @submit.prevent="onResetPassword">
                    <div class="section-header mb-4">
                        <h5 class="m-0">Redefinir password</h5>
                        <span class="text-600 text-sm">Define uma nova palavra-passe para este utilizador.</span>
                    </div>

                    <div class="field">
                        <label for="password">Nova palavra-passe</label>
                        <Password
                            id="password"
                            v-model="password"
                            toggleMask
                            class="w-full"
                            inputClass="w-full"
                            :class="{ 'p-invalid': passwordErrors.password }"
                        />
                        <small class="p-error">{{ passwordErrors.password }}</small>
                    </div>

                    <div class="field">
                        <label for="password_confirmation">Confirmar</label>
                        <Password
                            id="password_confirmation"
                            v-model="password_confirmation"
                            toggleMask
                            :feedback="false"
                            class="w-full"
                            inputClass="w-full"
                            :class="{ 'p-invalid': passwordErrors.password_confirmation }"
                        />
                        <small class="p-error">{{ passwordErrors.password_confirmation }}</small>
                    </div>

                    <Button type="submit" label="Redefinir password" icon="pi pi-key" severity="danger" :loading="isSavingPassword" />
                </form>

                <div class="card mt-3">
                    <div class="section-header mb-3">
                        <h5 class="m-0">Resumo</h5>
                    </div>
                    <div class="summary-row"><span>ID</span><strong>#{{ user?.id }}</strong></div>
                    <div class="summary-row"><span>Papel</span><strong>{{ user?.role?.name || '--' }}</strong></div>
                    <div class="summary-row">
                        <span>Promotor</span>
                        <Tag :value="isPromotor ? 'Sim' : 'Não'" :severity="isPromotor ? 'success' : 'secondary'" />
                    </div>
                    <div class="summary-row"><span>Slug</span><strong>{{ user?.slug || '--' }}</strong></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.section-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

.banner-preview {
    height: 9rem;
    border-radius: 1rem;
    overflow: hidden;
    background: #000;
}

.banner-preview--default img {
    object-fit: contain;
}

.banner-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-preview {
    width: 5rem;
    height: 5rem;
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
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--surface-border);
    color: #64748b;
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-row strong {
    color: #0f172a;
}
</style>
