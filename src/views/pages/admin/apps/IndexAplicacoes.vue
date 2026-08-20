<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import moment from 'moment';
import { baseURL } from '@/service/ApiConstant';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const apps = ref([]);
const saving = ref(false);

const releaseDialog = ref(false);
const policyDialog = ref(false);
const selectedApp = ref(null);

const releaseForm = ref({
    version_name: '',
    version_code: 1,
    changelog: '',
    force_update: false,
    min_version_code: 0,
    apk: null
});

const policyForm = ref({
    version_name: '',
    version_code: 1,
    min_version_code: 0,
    force_update: false,
    play_store_url: '',
    app_store_url: '',
    changelog: ''
});

const getData = async ({ silent = false } = {}) => {
    if (silent) isRefreshing.value = true;
    else isLoading.value = true;

    try {
        const response = await axios.get(`${baseURL}/admin-apps`);
        apps.value = response.data.apps ?? [];
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;
        loadError.value =
            status === 403
                ? 'Não tens permissão para gerir as aplicações.'
                : status === 401
                  ? 'A sessão expirou. Inicia sessão novamente.'
                  : 'Não foi possível carregar as aplicações.';

        if (silent) {
            toast.add({ severity: 'error', summary: 'Erro', detail: loadError.value, life: 4000 });
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const nextVersionCode = (app) => (app?.latest_release?.version_code ?? 0) + 1;

const openReleaseDialog = (app) => {
    selectedApp.value = app;
    const next = nextVersionCode(app);
    releaseForm.value = {
        version_name: app.latest_release?.version_name ?? '1.0.0',
        version_code: next,
        changelog: '',
        force_update: false,
        min_version_code: app.force_update ? next : app.min_version_code ?? 0,
        apk: null
    };
    releaseDialog.value = true;
};

const openPolicyDialog = (app) => {
    selectedApp.value = app;
    const latest = app.latest_release;
    policyForm.value = {
        version_name: latest?.version_name ?? '1.0.1',
        version_code: latest?.version_code ?? 7,
        min_version_code: app.min_version_code ?? 0,
        force_update: !!app.force_update,
        play_store_url: app.play_store_url ?? '',
        app_store_url: app.app_store_url ?? '',
        changelog: ''
    };
    policyDialog.value = true;
};

const onApkSelect = (event) => {
    releaseForm.value.apk = event.files?.[0] ?? null;
};

const publishRelease = async () => {
    const app = selectedApp.value;
    if (!app) return;

    if (app.distribution === 'internal' && !releaseForm.value.apk) {
        toast.add({ severity: 'warn', summary: 'APK em falta', detail: 'Seleciona o ficheiro .apk', life: 3500 });
        return;
    }

    saving.value = true;
    try {
        const form = new FormData();
        form.append('version_name', releaseForm.value.version_name);
        form.append('version_code', String(releaseForm.value.version_code));
        form.append('changelog', releaseForm.value.changelog || '');
        form.append('force_update', releaseForm.value.force_update ? '1' : '0');
        form.append('min_version_code', String(releaseForm.value.min_version_code || 0));
        form.append('platform', 'android');
        if (releaseForm.value.apk) {
            form.append('apk', releaseForm.value.apk);
        }

        await axios.post(`${baseURL}/admin-apps/${app.slug}/releases`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.add({ severity: 'success', summary: 'Publicado', detail: 'Versão publicada com sucesso.', life: 3000 });
        releaseDialog.value = false;
        await getData({ silent: true });
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            Object.values(error?.response?.data?.errors || {})[0]?.[0] ||
            'Não foi possível publicar a versão.';
        toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4500 });
    } finally {
        saving.value = false;
    }
};

const saveClientPolicy = async () => {
    const app = selectedApp.value;
    if (!app) return;

    saving.value = true;
    try {
        const latestCode = app.latest_release?.version_code ?? 0;
        if (Number(policyForm.value.version_code) > latestCode) {
            await axios.post(`${baseURL}/admin-apps/${app.slug}/releases`, {
                version_name: policyForm.value.version_name,
                version_code: policyForm.value.version_code,
                changelog: policyForm.value.changelog,
                force_update: policyForm.value.force_update,
                min_version_code: policyForm.value.min_version_code,
                platform: 'android'
            });
        }

        await axios.post(`${baseURL}/admin-apps/${app.slug}`, {
            min_version_code: policyForm.value.min_version_code,
            force_update: policyForm.value.force_update,
            play_store_url: policyForm.value.play_store_url || null,
            app_store_url: policyForm.value.app_store_url || null
        });

        toast.add({ severity: 'success', summary: 'Guardado', detail: 'Política de versão actualizada.', life: 3000 });
        policyDialog.value = false;
        await getData({ silent: true });
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            Object.values(error?.response?.data?.errors || {})[0]?.[0] ||
            'Não foi possível guardar.';
        toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4500 });
    } finally {
        saving.value = false;
    }
};

const formatBytes = (bytes) => {
    const value = Number(bytes) || 0;
    if (!value) return '--';
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

const distributionLabel = (app) => (app.distribution === 'store' ? 'Lojas públicas' : 'Loja interna');

const versionLabel = (app) => {
    const release = app.latest_release;
    if (!release) return 'Sem versão publicada';
    return `${release.version_name} (${release.version_code})`;
};

const openPublicStore = () => {
    window.open(`${window.location.origin}/apps`, '_blank');
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="admin-apps">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Aplicações</h4>
                <span class="text-600">
                    Loja interna do Bar e Check-in, e política de actualização do Client nas lojas.
                </span>
            </div>
            <div class="flex gap-2">
                <Button icon="pi pi-external-link" label="Ver loja pública" outlined @click="openPublicStore" />
                <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
            </div>
        </div>

        <div v-if="isLoading" class="grid">
            <div v-for="n in 3" :key="n" class="col-12 lg:col-4">
                <div class="card"><Skeleton height="14rem" /></div>
            </div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Não foi possível carregar</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
        </div>

        <div v-else class="grid">
            <div v-for="app in apps" :key="app.slug" class="col-12 lg:col-4">
                <div class="card app-card h-full">
                    <div class="flex align-items-start justify-content-between gap-2 mb-3">
                        <div>
                            <h5 class="m-0 text-900">{{ app.name }}</h5>
                            <Tag class="mt-2" :value="distributionLabel(app)" :severity="app.distribution === 'store' ? 'info' : 'success'" />
                        </div>
                        <i :class="app.distribution === 'store' ? 'pi pi-mobile text-2xl text-blue-500' : 'pi pi-android text-2xl text-green-600'" />
                    </div>

                    <p class="text-600 mb-3">{{ app.description }}</p>

                    <div class="app-meta">
                        <span>Versão actual</span>
                        <strong>{{ versionLabel(app) }}</strong>
                    </div>
                    <div class="app-meta">
                        <span>Mínimo obrigatório</span>
                        <strong>{{ app.min_version_code || 0 }}</strong>
                    </div>
                    <div class="app-meta">
                        <span>Forçar update</span>
                        <Tag :value="app.force_update ? 'Sim' : 'Não'" :severity="app.force_update ? 'danger' : 'secondary'" />
                    </div>

                    <div class="flex flex-column gap-2 mt-4">
                        <Button
                            v-if="app.distribution === 'internal'"
                            label="Publicar APK"
                            icon="pi pi-upload"
                            @click="openReleaseDialog(app)"
                        />
                        <Button
                            v-else
                            label="Definir versão das lojas"
                            icon="pi pi-cog"
                            @click="openPolicyDialog(app)"
                        />
                        <a
                            v-if="app.latest_release?.download_url"
                            :href="app.latest_release.download_url"
                            class="p-button p-component p-button-outlined w-full justify-content-center no-underline"
                            target="_blank"
                            rel="noopener"
                        >
                            <span class="p-button-icon pi pi-download" />
                            <span class="p-button-label">Descarregar APK actual</span>
                        </a>
                    </div>

                    <div v-if="app.releases?.length" class="mt-4">
                        <p class="text-500 text-sm mb-2">Histórico</p>
                        <ul class="release-list">
                            <li v-for="release in app.releases.slice(0, 5)" :key="release.id">
                                <span>{{ release.version_name }} · {{ release.version_code }}</span>
                                <span class="text-500">{{ formatDate(release.created_at) }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="releaseDialog" modal header="Publicar versão Android" :style="{ width: '32rem' }">
            <div class="field">
                <label>Nome da versão (1.2.0)</label>
                <InputText v-model="releaseForm.version_name" class="w-full" />
            </div>
            <div class="field">
                <label>Version code (+N do pubspec)</label>
                <InputNumber v-model="releaseForm.version_code" class="w-full" :min="1" :useGrouping="false" />
                <small class="text-500">Tem de ser maior do que a versão já publicada.</small>
            </div>
            <div class="field">
                <label>Ficheiro APK</label>
                <FileUpload
                    mode="basic"
                    name="apk"
                    accept=".apk,application/vnd.android.package-archive"
                    :maxFileSize="157286400"
                    :auto="false"
                    chooseLabel="Escolher APK"
                    customUpload
                    @select="onApkSelect"
                />
                <small v-if="releaseForm.apk" class="block mt-2 text-600">
                    {{ releaseForm.apk.name }} · {{ formatBytes(releaseForm.apk.size) }}
                </small>
            </div>
            <div class="field">
                <label>Notas da versão</label>
                <Textarea v-model="releaseForm.changelog" rows="3" class="w-full" />
            </div>
            <div class="field-checkbox">
                <Checkbox v-model="releaseForm.force_update" :binary="true" inputId="force_internal" />
                <label for="force_internal">Obrigar actualização nesta versão</label>
            </div>
            <template #footer>
                <Button label="Cancelar" text :disabled="saving" @click="releaseDialog = false" />
                <Button label="Publicar" icon="pi pi-check" :loading="saving" @click="publishRelease" />
            </template>
        </Dialog>

        <Dialog v-model:visible="policyDialog" modal header="Versão do Client nas lojas" :style="{ width: '32rem' }">
            <p class="text-600 mt-0 mb-3">
                Só activa o bloqueio depois da build estar disponível na Play Store e na App Store.
            </p>
            <div class="field">
                <label>Nome da versão nas lojas</label>
                <InputText v-model="policyForm.version_name" class="w-full" />
            </div>
            <div class="field">
                <label>Version code nas lojas</label>
                <InputNumber v-model="policyForm.version_code" class="w-full" :min="1" :useGrouping="false" />
            </div>
            <div class="field">
                <label>Mínimo obrigatório (version code)</label>
                <InputNumber v-model="policyForm.min_version_code" class="w-full" :min="0" :useGrouping="false" />
                <small class="text-500">Quem estiver abaixo disto é obrigado a actualizar.</small>
            </div>
            <div class="field">
                <label>Play Store</label>
                <InputText v-model="policyForm.play_store_url" class="w-full" />
            </div>
            <div class="field">
                <label>App Store</label>
                <InputText v-model="policyForm.app_store_url" class="w-full" />
            </div>
            <div class="field">
                <label>Notas (opcional)</label>
                <Textarea v-model="policyForm.changelog" rows="3" class="w-full" />
            </div>
            <div class="field-checkbox">
                <Checkbox v-model="policyForm.force_update" :binary="true" inputId="force_store" />
                <label for="force_store">Forçar actualização agora</label>
            </div>
            <template #footer>
                <Button label="Cancelar" text :disabled="saving" @click="policyDialog = false" />
                <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="saveClientPolicy" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.app-card {
    display: flex;
    flex-direction: column;
}

.app-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--surface-200);
    font-size: 0.9rem;
}

.release-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.release-list li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.85rem;
    padding: 0.25rem 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem;
}
</style>
