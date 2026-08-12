<script setup>
import { computed, onMounted, ref } from 'vue';
import { baseURL, logout } from '@/service/ApiConstant';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
    defaultRoleLabel: { type: String, default: 'Utilizador' }
});

const toast = useToast();
const confirm = useConfirm();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const isSavingPassword = ref(false);
const isLoggingOut = ref(false);
const user = ref(null);

const schema = yup.object({
    old_password: yup.string().required('Indica a palavra-passe atual.').min(8, 'Mínimo de 8 caracteres.'),
    new_password: yup.string().required('Indica a nova palavra-passe.').min(8, 'Mínimo de 8 caracteres.'),
    new_password_confirmation: yup
        .string()
        .oneOf([yup.ref('new_password')], 'As palavras-passe não coincidem.')
        .required('Confirma a nova palavra-passe.')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [old_password] = defineField('old_password');
const [new_password] = defineField('new_password');
const [new_password_confirmation] = defineField('new_password_confirmation');

const initials = computed(() => {
    const name = user.value?.name?.trim();
    if (!name) return 'U';
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
});

const roleLabel = computed(() => user.value?.role?.name || props.defaultRoleLabel);

const profileFields = computed(() => {
    if (!user.value) return [];
    return [
        { key: 'name', label: 'Nome', value: user.value.name, icon: 'pi pi-user' },
        { key: 'email', label: 'Email', value: user.value.email, icon: 'pi pi-envelope' },
        { key: 'mobile', label: 'Telefone', value: user.value.mobile || '--', icon: 'pi pi-phone' },
        { key: 'role', label: 'Nível de acesso', value: roleLabel.value, icon: 'pi pi-shield' }
    ];
});

const getData = async ({ silent = false } = {}) => {
    if (silent) isRefreshing.value = true;
    else isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/promotor-profile`);
        user.value = response.data.user;
    } catch (error) {
        const status = error?.response?.status;
        const message =
            status === 401 ? 'A sessão expirou. Inicia sessão novamente.' :
            status === 403 ? 'Não tens permissão para ver este perfil.' :
            'Não foi possível carregar o perfil.';

        if (user.value) {
            toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
        } else {
            loadError.value = message;
        }

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const onSubmit = handleSubmit(async (values) => {
    isSavingPassword.value = true;

    try {
        await axios.post(`${baseURL}/updatepassword`, values);
        resetForm();
        toast.add({
            severity: 'success',
            summary: 'Palavra-passe atualizada',
            detail: 'A tua palavra-passe foi alterada com sucesso.',
            life: 3500
        });
    } catch (error) {
        const message = error?.response?.data?.message;
        toast.add({
            severity: 'error',
            summary: 'Não foi possível atualizar',
            detail: message === "Old Password Doesn't match!" ? 'A palavra-passe actual está incorrecta.' : message || 'Tenta novamente.',
            life: 4500
        });

        if (error?.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
    } finally {
        isSavingPassword.value = false;
    }
});

const confirmLogout = () => {
    confirm.require({
        header: 'Terminar sessão',
        message: 'Tens a certeza que queres sair da conta?',
        icon: 'pi pi-sign-out',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Sair',
        accept: () => {
            isLoggingOut.value = true;
            logout();
            isLoggingOut.value = false;
        }
    });
};

onMounted(() => getData());
</script>

<template>
    <ConfirmDialog />

    <div class="profile-page">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Perfil</h4>
                <span class="text-600">Gerir os teus dados e segurança da conta.</span>
            </div>
            <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
        </div>

        <div v-if="isLoading" class="grid">
            <div class="col-12 lg:col-4">
                <div class="card"><Skeleton height="16rem" class="mb-3" /><Skeleton height="2.5rem" /></div>
            </div>
            <div class="col-12 lg:col-8">
                <div class="card"><Skeleton height="22rem" /></div>
            </div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Perfil indisponível</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
        </div>

        <div v-else class="grid">
            <div class="col-12 lg:col-4">
                <div class="card profile-card h-full">
                    <div class="profile-card__header">
                        <span class="profile-avatar">{{ initials }}</span>
                        <div>
                            <h5 class="m-0 text-900">{{ user?.name }}</h5>
                            <span class="text-600 text-sm">{{ user?.email }}</span>
                        </div>
                    </div>

                    <div class="profile-fields">
                        <div v-for="field in profileFields" :key="field.key" class="profile-field">
                            <span class="profile-field__icon"><i :class="field.icon" /></span>
                            <div>
                                <span class="profile-field__label">{{ field.label }}</span>
                                <span class="profile-field__value">{{ field.value }}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        label="Terminar sessão"
                        icon="pi pi-sign-out"
                        severity="danger"
                        outlined
                        class="w-full mt-4"
                        :loading="isLoggingOut"
                        @click="confirmLogout"
                    />
                </div>
            </div>

            <div class="col-12 lg:col-8">
                <div class="card h-full">
                    <div class="section-header mb-4">
                        <h5 class="m-0">Segurança</h5>
                        <span class="text-600 text-sm">Altera a tua palavra-passe de acesso.</span>
                    </div>

                    <form class="password-form" @submit.prevent="onSubmit">
                        <div class="field">
                            <label for="old_password">Palavra-passe actual</label>
                            <Password
                                id="old_password"
                                v-model="old_password"
                                toggleMask
                                :feedback="false"
                                class="w-full"
                                inputClass="w-full"
                                :class="{ 'p-invalid': errors.old_password }"
                            />
                            <small v-if="errors.old_password" class="p-error">{{ errors.old_password }}</small>
                        </div>

                        <div class="field">
                            <label for="new_password">Nova palavra-passe</label>
                            <Password
                                id="new_password"
                                v-model="new_password"
                                toggleMask
                                class="w-full"
                                inputClass="w-full"
                                :class="{ 'p-invalid': errors.new_password }"
                            />
                            <small v-if="errors.new_password" class="p-error">{{ errors.new_password }}</small>
                        </div>

                        <div class="field">
                            <label for="new_password_confirmation">Confirmar nova palavra-passe</label>
                            <Password
                                id="new_password_confirmation"
                                v-model="new_password_confirmation"
                                toggleMask
                                :feedback="false"
                                class="w-full"
                                inputClass="w-full"
                                :class="{ 'p-invalid': errors.new_password_confirmation }"
                            />
                            <small v-if="errors.new_password_confirmation" class="p-error">{{ errors.new_password_confirmation }}</small>
                        </div>

                        <div class="flex flex-wrap gap-2 mt-2">
                            <Button type="submit" label="Guardar palavra-passe" icon="pi pi-check" :loading="isSavingPassword" />
                            <Button type="button" label="Limpar" icon="pi pi-times" text :disabled="isSavingPassword" @click="resetForm()" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.profile-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.profile-fields {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.profile-field {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 0.75rem 0.85rem;
    border-radius: 10px;
    background: var(--surface-50, #f8fafc);
}

.profile-field__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: #eef2ff;
    color: #4f46e5;
    flex-shrink: 0;
}

.profile-field__label {
    display: block;
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.15rem;
}

.profile-field__value {
    display: block;
    color: #0f172a;
    font-weight: 500;
    word-break: break-word;
}

.section-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.password-form .field {
    margin-bottom: 1.25rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem;
}
</style>
