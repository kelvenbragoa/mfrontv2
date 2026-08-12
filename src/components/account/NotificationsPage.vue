<script setup>
import { computed, onMounted, ref } from 'vue';
import { baseURL } from '@/service/ApiConstant';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import moment from 'moment';

const toast = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref(null);
const notifications = ref([]);
const searchQuery = ref('');

const formatDateTime = (value) => (value ? moment(value).format('DD/MM/YYYY HH:mm') : '--');
const formatRelative = (value) => (value ? moment(value).fromNow() : '');

const parsePayload = (notification) => {
    const raw = notification?.data;
    if (!raw) return {};
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return { message: raw };
        }
    }
    return raw;
};

const notificationMessage = (notification) => {
    const payload = parsePayload(notification);
    return payload.data || payload.message || payload.title || payload.body || 'Notificação do sistema';
};

const notificationIcon = (notification) => {
    const type = String(notification?.type || '').toLowerCase();
    if (type.includes('ticket') || type.includes('sell') || type.includes('paid')) return 'pi pi-ticket';
    if (type.includes('event')) return 'pi pi-calendar';
    if (type.includes('invite')) return 'pi pi-envelope';
    if (type.includes('alert') || type.includes('warn')) return 'pi pi-exclamation-triangle';
    return 'pi pi-bell';
};

const notificationTone = (notification) => (notification?.read_at ? 'read' : 'unread');

const getData = async ({ silent = false } = {}) => {
    if (silent) isRefreshing.value = true;
    else isLoading.value = true;
    loadError.value = null;

    try {
        const response = await axios.get(`${baseURL}/notifications`);
        notifications.value = response.data.notifications || [];
    } catch (error) {
        const status = error?.response?.status;
        const message =
            status === 401 ? 'A sessão expirou. Inicia sessão novamente.' :
            status === 403 ? 'Não tens permissão para ver as notificações.' :
            'Não foi possível carregar as notificações.';

        if (notifications.value.length) {
            toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 4000 });
        } else {
            loadError.value = message;
        }
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
};

const filteredNotifications = computed(() => {
    const query = searchQuery.value?.trim().toLowerCase();
    if (!query) return notifications.value;

    return notifications.value.filter((item) =>
        [notificationMessage(item), formatDateTime(item.created_at), item.type].some((part) =>
            String(part ?? '').toLowerCase().includes(query)
        )
    );
});

const unreadCount = computed(() => notifications.value.filter((item) => !item.read_at).length);
const hasActiveFilters = computed(() => !!searchQuery.value?.trim());
const clearFilters = () => { searchQuery.value = ''; };

onMounted(() => getData());
</script>

<template>
    <div class="notifications-page">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <h4 class="m-0 text-900">Notificações</h4>
                <span class="text-600">Atualizações e alertas da tua conta.</span>
            </div>
            <Button icon="pi pi-refresh" label="Atualizar" outlined :loading="isRefreshing" @click="getData({ silent: true })" />
        </div>

        <div v-if="isLoading" class="grid">
            <div class="col-12 md:col-4"><div class="card mb-0"><Skeleton height="5rem" /></div></div>
            <div class="col-12">
                <div class="card">
                    <Skeleton v-for="n in 4" :key="`sk-${n}`" height="4.5rem" class="mb-3" />
                </div>
            </div>
        </div>

        <div v-else-if="loadError" class="card empty-state">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
            <h5 class="text-900 mb-2">Notificações indisponíveis</h5>
            <p class="text-600 mb-4">{{ loadError }}</p>
            <Button label="Tentar novamente" icon="pi pi-refresh" @click="getData()" />
        </div>

        <template v-else>
            <div class="grid mb-1">
                <div class="col-12 md:col-4">
                    <div class="card mb-0 h-full kpi-card">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">Total</span>
                            <span class="kpi-icon kpi-icon--blue"><i class="pi pi-inbox" /></span>
                        </div>
                        <div class="text-900 font-medium text-2xl">{{ filteredNotifications.length }}</div>
                    </div>
                </div>
                <div class="col-12 md:col-4">
                    <div class="card mb-0 h-full kpi-card">
                        <div class="flex justify-content-between align-items-start mb-3">
                            <span class="block text-500 font-medium">Não lidas</span>
                            <span class="kpi-icon kpi-icon--orange"><i class="pi pi-bell" /></span>
                        </div>
                        <div class="text-900 font-medium text-2xl">{{ unreadCount }}</div>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="filter-bar mb-4">
                    <IconField iconPosition="left" class="filter-bar__search">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" placeholder="Procurar notificações..." class="w-full" />
                    </IconField>
                    <Button v-if="hasActiveFilters" label="Limpar" icon="pi pi-times" text @click="clearFilters" />
                </div>

                <div v-if="filteredNotifications.length" class="notification-list">
                    <article
                        v-for="notification in filteredNotifications"
                        :key="notification.id"
                        class="notification-item"
                        :class="`notification-item--${notificationTone(notification)}`"
                    >
                        <span class="notification-item__icon">
                            <i :class="notificationIcon(notification)" />
                        </span>
                        <div class="notification-item__content">
                            <p class="notification-item__message">{{ notificationMessage(notification) }}</p>
                            <div class="notification-item__meta">
                                <span>{{ formatRelative(notification.created_at) }}</span>
                                <span class="meta-dot">·</span>
                                <span>{{ formatDateTime(notification.created_at) }}</span>
                            </div>
                        </div>
                        <Tag v-if="!notification.read_at" value="Nova" severity="info" rounded class="notification-item__tag" />
                    </article>
                </div>

                <div v-else class="empty-state">
                    <i class="pi pi-bell-slash text-4xl text-400 mb-3" />
                    <h5 class="text-900 mb-2">
                        {{ hasActiveFilters ? 'Nenhuma notificação encontrada' : 'Sem notificações' }}
                    </h5>
                    <p class="text-600 m-0">
                        {{ hasActiveFilters ? 'Ajusta a pesquisa e tenta novamente.' : 'Quando houver novidades, aparecem aqui.' }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.kpi-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.65rem;
}

.kpi-icon--blue { background: #dbeafe; color: #2563eb; }
.kpi-icon--orange { background: #ffedd5; color: #ea580c; }

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.filter-bar__search {
    flex: 1 1 18rem;
    min-width: 14rem;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    background: var(--surface-card);
}

.notification-item--unread {
    border-color: #bfdbfe;
    background: #f8fbff;
}

.notification-item__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.65rem;
    background: #eef2ff;
    color: #4f46e5;
    flex-shrink: 0;
}

.notification-item__content {
    flex: 1;
    min-width: 0;
}

.notification-item__message {
    margin: 0 0 0.35rem;
    color: #0f172a;
    line-height: 1.5;
}

.notification-item__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    color: #64748b;
    font-size: 0.85rem;
}

.meta-dot {
    opacity: 0.6;
}

.notification-item__tag {
    flex-shrink: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem;
}
</style>
