<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const retriviedData = ref({ data: [] });
const summary = ref({ total: 0, promotores: 0, admins: 0 });
const searchQuery = ref('');
const promotorFilter = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(20);
const first = ref(0);
const brokenImages = ref(new Set());

const promotorOptions = [
    { label: 'Promotores', value: 1 },
    { label: 'Não promotores', value: 0 }
];

const getData = async (page = 1, { silent = false } = {}) => {
    currentPage.value = page;
    first.value = (page - 1) * rowsPerPage.value;

    if (silent) isRefreshing.value = true;
    else isLoading.value = true;

    try {
        const response = await axios.get(`${baseURL}/admin-users`, {
            params: {
                page,
                per_page: rowsPerPage.value,
                query: searchQuery.value || null,
                is_promotor: promotorFilter.value
            }
        });

        retriviedData.value = response.data.users;
        summary.value = response.data.summary ?? summary.value;
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;
        loadError.value =
            status === 403
                ? 'Não tens permissão para ver os utilizadores.'
                : status === 401
                  ? 'A sessão expirou. Inicia sessão novamente.'
                  : 'Não foi possível carregar os utilizadores.';

        if (silent) {
            toast.add({ severity: 'error', summary: 'Erro', detail: loadError.value, life: 4000 });
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const onPage = (event) => {
    rowsPerPage.value = event.rows;
    first.value = event.first;
    const page = Math.floor(event.first / event.rows) + 1;
    getData(page, { silent: true });
};

const debouncedSearch = debounce(() => getData(1, { silent: true }), 350);
watch(searchQuery, () => debouncedSearch());
watch(promotorFilter, () => getData(1, { silent: true }));

const hasActiveFilters = computed(() => !!searchQuery.value || promotorFilter.value !== null);

const clearFilters = () => {
    searchQuery.value = '';
    promotorFilter.value = null;
};

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);
const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');
const hasRows = computed(() => !!retriviedData.value.data?.length);

const markBroken = (id) => {
    brokenImages.value = new Set([...brokenImages.value, id]);
};

const avatarSrc = (user) => {
    if (!user?.image || brokenImages.value.has(user.id)) return null;
    return storageURL + user.image;
};

const displayName = (user) => user.company_name || user.name || 'Utilizador';

onMounted(() => getData());
</script>

<template>
    <div class="admin-users">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Utilizadores</h4>
                <span class="text-600">Gerir contas, passwords e páginas de promotores</span>
            </div>
            <Button
                icon="pi pi-refresh"
                label="Atualizar"
                outlined
                :loading="isRefreshing"
                @click="getData(currentPage, { silent: true })"
            />
        </div>

        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Total</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(summary.total) }}</span>
                </div>
            </div>
            <div class="col-6 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Promotores</span>
                    <span class="text-blue-600 font-medium text-2xl">{{ formatNumber(summary.promotores) }}</span>
                </div>
            </div>
            <div class="col-6 md:col-4">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Admins</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(summary.admins) }}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="filter-bar">
                <IconField iconPosition="left" class="filter-bar__search">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Procurar por nome, email, telemóvel, empresa ou slug..." class="w-full" />
                </IconField>

                <Dropdown
                    v-model="promotorFilter"
                    :options="promotorOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Todos"
                    showClear
                    class="filter-bar__select"
                />

                <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
            </div>

            <div v-if="isLoading" class="mt-4">
                <Skeleton v-for="n in 6" :key="`row-${n}`" height="3.5rem" class="mb-2" />
            </div>

            <div v-else-if="loadError" class="empty-state">
                <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
                <h5 class="text-900 mb-2">Não foi possível carregar</h5>
                <p class="text-600 mb-4">{{ loadError }}</p>
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>

            <template v-else>
                <p class="text-600 mt-3 mb-3">
                    {{ formatNumber(retriviedData.total || 0) }}
                    {{ (retriviedData.total || 0) === 1 ? 'utilizador encontrado' : 'utilizadores encontrados' }}
                </p>

                <DataTable
                    v-if="hasRows"
                    :value="retriviedData.data"
                    lazy
                    paginator
                    :rows="rowsPerPage"
                    :first="first"
                    :totalRecords="retriviedData.total || 0"
                    :rowsPerPageOptions="[10, 20, 50]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} utilizadores"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    tableStyle="min-width: 55rem"
                    @page="onPage"
                >
                    <Column header="Utilizador">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <div class="user-avatar">
                                    <img
                                        v-if="avatarSrc(data)"
                                        :src="avatarSrc(data)"
                                        :alt="displayName(data)"
                                        @error="markBroken(data.id)"
                                    />
                                    <span v-else>{{ (displayName(data) || 'U').charAt(0).toUpperCase() }}</span>
                                </div>
                                <div class="flex flex-column">
                                    <span class="text-900 font-medium">{{ displayName(data) }}</span>
                                    <span class="text-500 text-sm">{{ data.email }}</span>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column header="Contacto">
                        <template #body="{ data }">
                            {{ data.mobile || '--' }}
                        </template>
                    </Column>

                    <Column header="Papel">
                        <template #body="{ data }">
                            <Tag v-if="data.role_id == 1" value="Admin" severity="danger" />
                            <Tag v-else :value="data.role?.name || 'Utilizador'" severity="info" />
                        </template>
                    </Column>

                    <Column header="Promotor">
                        <template #body="{ data }">
                            <Tag v-if="data.is_promotor == 1" value="Sim" severity="success" />
                            <Tag v-else value="Não" severity="secondary" />
                        </template>
                    </Column>

                    <Column header="Slug">
                        <template #body="{ data }">
                            <span class="text-600">{{ data.slug || '--' }}</span>
                        </template>
                    </Column>

                    <Column header="Criado">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>

                    <Column header="" style="width: 6rem">
                        <template #body="{ data }">
                            <router-link :to="`/admin/utilizadores/${data.id}`">
                                <Button icon="pi pi-eye" text rounded aria-label="Ver" />
                            </router-link>
                        </template>
                    </Column>
                </DataTable>

                <div v-else class="empty-state">
                    <i class="pi pi-users text-4xl text-blue-500 mb-3" />
                    <h5 class="text-900 mb-2">Nenhum utilizador encontrado</h5>
                    <p class="text-600 mb-0">Ajusta a pesquisa ou limpa os filtros.</p>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.filter-bar__search {
    flex: 1 1 18rem;
}

.filter-bar__select {
    min-width: 12rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.5rem 1rem;
}

.user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    overflow: hidden;
    background: #1d4ed8;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
