<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL, storageURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';
import EventLiveSetup from '@/components/live/EventLiveSetup.vue';

const router = useRouter();
const toast = useToast();

const eventId = router.currentRoute.value.params.id;

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const event = ref(null);
const tickets = ref([]);
const invites = ref([]);
const packages = ref([]);
const bars = ref([]);
const protocols = ref([]);
const barmans = ref([]);
const products = ref([]);
const lineups = ref([]);
const imageBroken = ref(false);

const deleteDialog = ref(false);
const deleteTarget = ref(null);
const isDeleting = ref(false);

const copyDialog = ref(false);
const copyTarget = ref(null);
const isCopying = ref(false);

const statusMeta = {
    1: { label: 'Cancelado', severity: 'danger' },
    2: { label: 'Aprovado', severity: 'success' },
    3: { label: 'Pendente', severity: 'warning' },
    4: { label: 'Em revisão', severity: 'info' }
};

const collections = {
    ticket: tickets,
    package: packages,
    invite: invites,
    bar: bars,
    lineup: lineups,
    product: products
};

const deleteEndpoints = {
    ticket: 'promotor-tickets',
    package: 'promotor-packages',
    invite: 'promotor-invites',
    bar: 'promotor-bar',
    lineup: 'promotor-lineups',
    product: 'promotor-products'
};

const deleteLabels = {
    ticket: 'bilhete',
    package: 'pacote',
    invite: 'convite',
    bar: 'bar',
    lineup: 'artista do line-up',
    product: 'produto'
};

const getData = async ({ silent = false } = {}) => {
    if (silent) {
        isRefreshing.value = true;
    } else {
        isLoading.value = true;
    }

    try {
        const response = await axios.get(`${baseURL}/promotor-eventos/${eventId}`);
        const data = response.data;

        if (!data.event) {
            loadError.value = 'Evento não encontrado.';
            return;
        }

        event.value = data.event;
        tickets.value = data.tickets ?? [];
        invites.value = data.invites ?? [];
        packages.value = data.package ?? [];
        bars.value = data.bar ?? [];
        protocols.value = data.protocols ?? [];
        barmans.value = data.barmans ?? [];
        lineups.value = data.lineup ?? [];
        products.value = data.products ?? [];
        loadError.value = null;
    } catch (error) {
        const status = error?.response?.status;

        if (status === 404) {
            loadError.value = 'Evento não encontrado.';
        } else if (status === 403) {
            loadError.value = 'Não tens permissão para ver este evento.';
        } else {
            loadError.value = 'Não foi possível carregar o evento. Tenta novamente.';
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const goBack = () => router.push('/promotor/eventos');

const formatCurrency = (value) =>
    `${new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)} MT`;

const formatDate = (value) => (value ? moment(value).format('DD/MM/YYYY') : '--');

const formatTime = (value) => (value ? moment(value, 'HH:mm:ss').format('HH:mm') : '--');

const dateTime = (date, time) => `${formatDate(date)}${time ? ` às ${formatTime(time)}` : ''}`;

const eventImage = computed(() => {
    if (!event.value?.image || imageBroken.value) return '/demo/images/mticket.jpg';
    return storageURL + event.value.image;
});

const eventLocation = computed(() => {
    if (!event.value) return '--';
    return [event.value.city?.name, event.value.province?.name].filter(Boolean).join(', ') || event.value.address || '--';
});

const currentStatus = computed(() => {
    if (!event.value) return null;
    return {
        label: event.value.status?.name || statusMeta[event.value.status_id]?.label || 'Sem estado',
        severity: statusMeta[event.value.status_id]?.severity ?? 'info'
    };
});

const askDelete = (type, row) => {
    deleteTarget.value = { type, id: row.id, name: row.name };
    deleteDialog.value = true;
};

const closeDelete = () => {
    deleteDialog.value = false;
    deleteTarget.value = null;
};

const confirmDelete = async () => {
    if (!deleteTarget.value) return;

    isDeleting.value = true;
    const { type, id } = deleteTarget.value;

    try {
        await axios.delete(`${baseURL}/${deleteEndpoints[type]}/${id}`);
        collections[type].value = collections[type].value.filter((item) => item.id !== id);

        toast.add({
            severity: 'success',
            summary: 'Removido',
            detail: `O ${deleteLabels[type]} foi eliminado.`,
            life: 3000
        });

        closeDelete();
    } catch (error) {
        const status = error?.response?.status;
        const detail =
            status === 404
                ? `Não é possível eliminar este ${deleteLabels[type]}: já existem registos associados.`
                : error?.response?.data?.message || 'Não foi possível eliminar. Tenta novamente.';

        toast.add({ severity: 'error', summary: 'Erro', detail, life: 5000 });
    } finally {
        isDeleting.value = false;
    }
};

const askCopyBar = (row) => {
    copyTarget.value = row;
    copyDialog.value = true;
};

const closeCopyBar = () => {
    copyDialog.value = false;
    copyTarget.value = null;
};

const copyBar = async () => {
    if (!copyTarget.value) return;

    isCopying.value = true;

    try {
        await axios.get(`${baseURL}/promotor-bar/${copyTarget.value.id}/copy`);
        await getData({ silent: true });
        toast.add({ severity: 'success', summary: 'Bar copiado', detail: 'O bar foi duplicado com os produtos.', life: 3000 });
        closeCopyBar();
    } catch {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar o bar.', life: 4000 });
    } finally {
        isCopying.value = false;
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div class="promotor-event-show">
        <div v-if="isLoading" class="card">
            <Skeleton width="12rem" height="1.5rem" class="mb-4" />
            <Skeleton height="10rem" class="mb-4" />
            <Skeleton v-for="n in 4" :key="`sk-${n}`" height="3rem" class="mb-2" />
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Não foi possível abrir o evento</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <div class="flex gap-2">
                <Button label="Voltar" icon="pi pi-angle-left" outlined @click="goBack" />
                <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
            </div>
        </div>

        <template v-else>
            <div class="card">
                <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                    <Button label="Voltar" icon="pi pi-angle-left" text @click="goBack" />
                    <div class="flex flex-wrap gap-2">
                        <router-link :to="`/promotor/eventos/${event.id}/edit`">
                            <Button label="Editar" icon="pi pi-pencil" outlined />
                        </router-link>
                        <router-link :to="`/promotor/eventos/${event.id}/dashboard`">
                            <Button label="Dashboard" icon="pi pi-chart-bar" />
                        </router-link>
                    </div>
                </div>

                <div class="event-header">
                    <img :src="eventImage" :alt="event.name" class="event-header__image" @error="imageBroken = true" />

                    <div class="event-header__content">
                        <div class="flex flex-wrap align-items-center gap-2 mb-2">
                            <Tag :severity="currentStatus.severity" :value="currentStatus.label" />
                            <span class="text-500">{{ event.category?.name || 'Sem categoria' }}</span>
                            <span v-if="event.type?.name" class="text-500">· {{ event.type.name }}</span>
                        </div>

                        <h4 class="mt-0 mb-2 text-900">{{ event.name }}</h4>

                        <div class="event-meta">
                            <span><i class="pi pi-map-marker mr-2" />{{ eventLocation }}</span>
                            <span><i class="pi pi-calendar mr-2" />{{ dateTime(event.start_date, event.start_time) }}</span>
                            <span><i class="pi pi-clock mr-2" />Termina {{ dateTime(event.end_date, event.end_time) }}</span>
                        </div>

                        <p v-if="event.description" class="text-600 line-height-3 mt-3 mb-0">{{ event.description }}</p>
                    </div>
                </div>

                <div class="detail-grid mt-4">
                    <div>
                        <span class="detail-label">Endereço</span>
                        <span class="detail-value">{{ event.address || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Email</span>
                        <span class="detail-value">{{ event.email || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Telefone</span>
                        <span class="detail-value">{{ event.phone || '--' }}</span>
                    </div>
                    <div>
                        <span class="detail-label">Taxa</span>
                        <span class="detail-value">{{ event.tax != null ? `${event.tax}%` : '--' }}</span>
                    </div>
                </div>
            </div>

            <EventLiveSetup :event-id="event.id" />

            <div class="card">
                <div class="flex align-items-center justify-content-between mb-3">
                    <h5 class="m-0">Conteúdo do evento</h5>
                    <Button icon="pi pi-refresh" text rounded :loading="isRefreshing" @click="getData({ silent: true })" />
                </div>

                <TabView>
                    <TabPanel :header="`Bilhetes (${tickets.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/bilhetes/create`">
                                <Button label="Criar bilhete" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="tickets.length" :value="tickets" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Preço" sortable field="price">
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.price) }}</template>
                            </Column>
                            <Column header="Início">
                                <template #body="slotProps">{{ dateTime(slotProps.data.start_date, slotProps.data.start_time) }}</template>
                            </Column>
                            <Column header="Fim">
                                <template #body="slotProps">{{ dateTime(slotProps.data.end_date, slotProps.data.end_time) }}</template>
                            </Column>
                            <Column field="max_qtd" header="Qtd. máxima" sortable />
                            <Column header="Ações" style="width: 9rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/bilhetes/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/bilhetes/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('ticket', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Ainda não há bilhetes criados para este evento.</p>
                    </TabPanel>

                    <TabPanel :header="`Pacotes (${packages.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/pacotes/create`">
                                <Button label="Criar pacote" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="packages.length" :value="packages" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Preço" sortable field="price">
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.price) }}</template>
                            </Column>
                            <Column field="description" header="Descrição" />
                            <Column header="Ações" style="width: 9rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/pacotes/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/pacotes/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('package', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem pacotes criados.</p>
                    </TabPanel>

                    <TabPanel :header="`Convites (${invites.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/convites/create`">
                                <Button label="Criar convite" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="invites.length" :value="invites" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column field="description" header="Descrição" />
                            <Column header="Ações" style="width: 9rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/convites/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/convites/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('invite', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem convites criados.</p>
                    </TabPanel>

                    <TabPanel :header="`Line-up (${lineups.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/lineup/create`">
                                <Button label="Adicionar ao line-up" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="lineups.length" :value="lineups" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column field="description" header="Descrição" />
                            <Column header="Início">
                                <template #body="slotProps">{{ dateTime(slotProps.data.start_date, slotProps.data.start_time) }}</template>
                            </Column>
                            <Column header="Fim">
                                <template #body="slotProps">{{ dateTime(slotProps.data.end_date, slotProps.data.end_time) }}</template>
                            </Column>
                            <Column header="Ações" style="width: 9rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/lineup/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/lineup/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('lineup', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem artistas no line-up.</p>
                    </TabPanel>

                    <TabPanel :header="`Bares (${bars.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/bar/create`">
                                <Button label="Criar bar" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="bars.length" :value="bars" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Nº produtos">
                                <template #body="slotProps">{{ slotProps.data.products?.length ?? 0 }}</template>
                            </Column>
                            <Column header="Ações" style="width: 12rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/bar/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/bar/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-copy"
                                            text
                                            rounded
                                            severity="secondary"
                                            v-tooltip.top="'Duplicar bar'"
                                            @click="askCopyBar(slotProps.data)"
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('bar', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem bares criados.</p>
                    </TabPanel>

                    <TabPanel :header="`Produtos (${products.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/produtos/create`">
                                <Button label="Criar produto" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="products.length" :value="products" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column header="Compra" sortable field="buy_price">
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.buy_price) }}</template>
                            </Column>
                            <Column header="Venda" sortable field="sell_price">
                                <template #body="slotProps">{{ formatCurrency(slotProps.data.sell_price) }}</template>
                            </Column>
                            <Column field="qtd" header="Qtd" sortable />
                            <Column field="barstore.name" header="Bar" sortable />
                            <Column header="Ações" style="width: 9rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/produtos/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/produtos/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            v-tooltip.top="'Eliminar'"
                                            @click="askDelete('product', slotProps.data)"
                                        />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem produtos registados.</p>
                    </TabPanel>

                    <TabPanel :header="`Protocolos (${protocols.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/protocolos/create`">
                                <Button label="Criar protocolo" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="protocols.length" :value="protocols" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column field="mobile" header="Telefone" />
                            <Column field="bi" header="BI" />
                            <Column field="user" header="Utilizador" />
                            <Column field="tickets_count" header="Bilhetes validados" sortable />
                            <Column header="Ações" style="width: 7rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/protocolos/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/protocolos/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem protocolos atribuídos.</p>
                    </TabPanel>

                    <TabPanel :header="`Barmans (${barmans.length})`">
                        <div class="tab-toolbar">
                            <router-link :to="`/promotor/eventos/${event.id}/barmans/create`">
                                <Button label="Criar barman" icon="pi pi-plus" size="small" />
                            </router-link>
                        </div>

                        <DataTable v-if="barmans.length" :value="barmans" responsiveLayout="scroll" class="p-datatable-sm">
                            <Column field="name" header="Nome" sortable />
                            <Column field="mobile" header="Telefone" />
                            <Column field="bi" header="BI" />
                            <Column field="user" header="Utilizador" />
                            <Column field="barstore.name" header="Bar" sortable />
                            <Column header="Ações" style="width: 7rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1">
                                        <router-link :to="`/promotor/eventos/${event.id}/barmans/${slotProps.data.id}`">
                                            <Button icon="pi pi-eye" text rounded severity="secondary" v-tooltip.top="'Ver'" />
                                        </router-link>
                                        <router-link :to="`/promotor/eventos/${event.id}/barmans/${slotProps.data.id}/edit`">
                                            <Button icon="pi pi-pencil" text rounded severity="secondary" v-tooltip.top="'Editar'" />
                                        </router-link>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <p v-else class="tab-empty">Sem barmans atribuídos.</p>
                    </TabPanel>
                </TabView>
            </div>
        </template>

        <Dialog v-model:visible="deleteDialog" header="Eliminar registo" :style="{ width: '26rem' }" :modal="true" :draggable="false">
            <div v-if="deleteTarget" class="flex align-items-start gap-3">
                <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mt-1" />
                <span class="line-height-3">
                    Eliminar o {{ deleteLabels[deleteTarget.type] }} <strong>{{ deleteTarget.name }}</strong>? Esta ação não pode ser desfeita.
                </span>
            </div>
            <template #footer>
                <Button label="Voltar" text :disabled="isDeleting" @click="closeDelete" />
                <Button label="Eliminar" icon="pi pi-trash" severity="danger" :loading="isDeleting" @click="confirmDelete" />
            </template>
        </Dialog>

        <Dialog v-model:visible="copyDialog" header="Duplicar bar" :style="{ width: '26rem' }" :modal="true" :draggable="false">
            <div v-if="copyTarget" class="flex align-items-start gap-3">
                <i class="pi pi-copy text-2xl text-primary mt-1" />
                <span class="line-height-3">
                    Criar uma cópia do bar <strong>{{ copyTarget.name }}</strong> com os mesmos produtos?
                </span>
            </div>
            <template #footer>
                <Button label="Voltar" text :disabled="isCopying" @click="closeCopyBar" />
                <Button label="Duplicar" icon="pi pi-copy" :loading="isCopying" @click="copyBar" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.event-header {
    display: flex;
    gap: 1.5rem;
}

.event-header__image {
    width: 16rem;
    height: 11rem;
    border-radius: 0.85rem;
    object-fit: cover;
    flex-shrink: 0;
}

.event-header__content {
    flex: 1;
    min-width: 0;
}

.event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    color: #64748b;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--surface-border);
}

.detail-label {
    display: block;
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}

.detail-value {
    color: var(--text-color);
    font-weight: 500;
    word-break: break-word;
}

.tab-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.tab-empty {
    text-align: center;
    color: #64748b;
    padding: 2.5rem 1rem;
    margin: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

@media (max-width: 991px) {
    .detail-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 767px) {
    .event-header {
        flex-direction: column;
    }

    .event-header__image {
        width: 100%;
        height: 12rem;
    }
}
</style>
