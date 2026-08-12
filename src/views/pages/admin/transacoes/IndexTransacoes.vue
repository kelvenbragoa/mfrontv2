<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import { debounce } from 'lodash';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const retriviedData = ref({ data: [] });
const summary = ref({ pending: 0, amount: 0 });
const searchQuery = ref('');
const currentPage = ref(1);
const rowsPerPage = ref(20);
const first = ref(0);

const confirmDialog = ref(false);
const confirmTarget = ref(null);
const isConfirming = ref(false);

const getData = async (page = 1, { silent = false } = {}) => {
    currentPage.value = page;
    first.value = (page - 1) * rowsPerPage.value;

    if (silent) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const response = await axios.get(`${baseURL}/admin-transacoes`, {
            params: {
                page,
                per_page: rowsPerPage.value,
                query: searchQuery.value || null
            }
        });

        retriviedData.value = response.data.transaction;
        summary.value = response.data.summary ?? summary.value;
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;

        if (status === 403) {
            loadError.value = 'Não tens permissão para gerir transações.';
        } else if (status === 401) {
            loadError.value = 'A sessão expirou. Inicia sessão novamente.';
        } else {
            loadError.value = 'Não foi possível carregar as transações. Tenta novamente.';
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

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatNumber = (value) => new Intl.NumberFormat('pt-PT').format(Number(value) || 0);

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');

const ticketCount = (row) => row.sell?.selldetails?.length ?? 0;

const askConfirmation = (row) => {
    confirmTarget.value = row;
    confirmDialog.value = true;
};

const closeConfirmation = () => {
    confirmDialog.value = false;
    confirmTarget.value = null;
};

const confirmTransaction = async () => {
    if (!confirmTarget.value) return;

    isConfirming.value = true;
    const targetId = confirmTarget.value.id;

    try {
        const response = await axios.post(`${baseURL}/admin-transacoes/${targetId}/confirmar`);

        retriviedData.value.data = retriviedData.value.data.filter((item) => item.id !== targetId);
        if (retriviedData.value.total) retriviedData.value.total -= 1;
        summary.value = response.data.summary ?? summary.value;

        toast.add({
            severity: response.data.email_sent === false ? 'warn' : 'success',
            summary: 'Transação confirmada',
            detail: response.data.message,
            life: 5000
        });

        closeConfirmation();

        if (!retriviedData.value.data.length && currentPage.value > 1) {
            getData(currentPage.value - 1, { silent: true });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message ?? 'Não foi possível confirmar a transação.',
            life: 5000
        });
    } finally {
        isConfirming.value = false;
    }
};

const hasRows = computed(() => !!retriviedData.value.data?.length);

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="admin-transactions">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Transações por confirmar</h4>
                <span class="text-600">Pagamentos M-Pesa que ficaram pendentes e ainda não geraram bilhetes</span>
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
            <div class="col-12 md:col-6 xl:col-3">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Transações pendentes</span>
                    <span class="text-900 font-medium text-2xl">{{ formatNumber(summary.pending) }}</span>
                </div>
            </div>
            <div class="col-12 md:col-6 xl:col-3">
                <div class="card mb-0">
                    <span class="block text-500 text-sm mb-2">Valor em espera</span>
                    <span class="text-900 font-medium text-2xl">{{ formatCurrency(summary.amount) }}</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex flex-wrap align-items-center justify-content-between gap-3">
                <IconField iconPosition="left" class="search-field">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Procurar por referência, nome, email ou telemóvel..." class="w-full" />
                </IconField>
                <Button v-if="searchQuery" label="Limpar" icon="pi pi-times" text @click="searchQuery = ''" />
            </div>

            <Message severity="info" :closable="false" class="mt-3">
                Ao confirmar, a encomenda passa a venda definitiva, os bilhetes são emitidos e enviados por email ao comprador.
            </Message>

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
                    {{ (retriviedData.total || 0) === 1 ? 'transação encontrada' : 'transações encontradas' }}
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
                    currentPageReportTemplate="A mostrar {first} a {last} de {totalRecords} transações"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    tableStyle="min-width: 58rem"
                    @page="onPage"
                >
                    <Column header="Referência">
                        <template #body="slotProps">
                            <span class="font-medium text-900">{{ slotProps.data.reference || '--' }}</span>
                        </template>
                    </Column>

                    <Column header="Comprador">
                        <template #body="slotProps">
                            <div class="flex flex-column">
                                <span class="text-900">{{ slotProps.data.sell?.name || 'Sem nome' }}</span>
                                <span class="text-500 text-sm">
                                    {{ slotProps.data.sell?.email || slotProps.data.sell?.mobile || '--' }}
                                </span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Evento">
                        <template #body="slotProps">
                            <router-link
                                v-if="slotProps.data.sell?.event"
                                :to="`/admin/eventos/${slotProps.data.sell.event.id}`"
                                class="text-primary no-underline"
                            >
                                {{ slotProps.data.sell.event.name }}
                            </router-link>
                            <span v-else class="text-500">Evento indisponível</span>
                        </template>
                    </Column>

                    <Column header="Bilhetes">
                        <template #body="slotProps">
                            {{ formatNumber(ticketCount(slotProps.data)) }}
                        </template>
                    </Column>

                    <Column header="Valor">
                        <template #body="slotProps">
                            <span class="text-900 font-medium">{{ formatCurrency(slotProps.data.sell?.total) }}</span>
                        </template>
                    </Column>

                    <Column header="Método">
                        <template #body="slotProps">
                            <span class="uppercase text-600">{{ slotProps.data.method || '--' }}</span>
                        </template>
                    </Column>

                    <Column header="Criada em">
                        <template #body="slotProps">
                            {{ formatDateTime(slotProps.data.created_at) }}
                        </template>
                    </Column>

                    <Column header="Ações" style="width: 12rem">
                        <template #body="slotProps">
                            <Button
                                label="Confirmar"
                                icon="pi pi-check"
                                size="small"
                                :disabled="!slotProps.data.sell"
                                @click="askConfirmation(slotProps.data)"
                            />
                        </template>
                    </Column>
                </DataTable>

                <div v-else class="empty-state">
                    <i class="pi pi-check-circle text-4xl text-green-400 mb-3" />
                    <h5 class="text-900 mb-2">Nada por confirmar</h5>
                    <p class="text-600 m-0">
                        {{ searchQuery ? 'Nenhuma transação corresponde à pesquisa.' : 'Todos os pagamentos pendentes foram tratados.' }}
                    </p>
                </div>
            </template>
        </div>

        <Dialog
            v-model:visible="confirmDialog"
            header="Confirmar pagamento"
            :style="{ width: '30rem' }"
            :modal="true"
            :draggable="false"
        >
            <div v-if="confirmTarget" class="confirm-body">
                <p class="mt-0 mb-3 line-height-3">
                    Vais confirmar a referência <strong>{{ confirmTarget.reference }}</strong> e emitir
                    <strong>{{ ticketCount(confirmTarget) }}</strong> bilhete(s) para
                    <strong>{{ confirmTarget.sell?.name || 'o comprador' }}</strong>.
                </p>
                <ul class="confirm-list">
                    <li>
                        <span class="text-500">Evento</span>
                        <span class="text-900">{{ confirmTarget.sell?.event?.name || '--' }}</span>
                    </li>
                    <li>
                        <span class="text-500">Valor</span>
                        <span class="text-900">{{ formatCurrency(confirmTarget.sell?.total) }}</span>
                    </li>
                    <li>
                        <span class="text-500">Email</span>
                        <span class="text-900">{{ confirmTarget.sell?.email || '--' }}</span>
                    </li>
                </ul>
                <p class="text-600 text-sm mt-3 mb-0">Esta ação não pode ser desfeita.</p>
            </div>
            <template #footer>
                <Button label="Voltar" text :disabled="isConfirming" @click="closeConfirmation" />
                <Button label="Confirmar e emitir" icon="pi pi-check" :loading="isConfirming" @click="confirmTransaction" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.search-field {
    flex: 1 1 22rem;
    min-width: 14rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

.confirm-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.confirm-list li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--surface-border);
}

.confirm-list li:last-child {
    border-bottom: none;
}
</style>
