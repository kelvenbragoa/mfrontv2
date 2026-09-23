<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { baseURL, storageURL } from '@/service/ApiConstant';
import { currentUserId, getEcho } from '@/service/realtime';

const props = defineProps({
    eventRef: {
        type: [String, Number],
        required: true
    },
    height: {
        type: String,
        default: '22rem'
    }
});

const emit = defineEmits(['live-status']);

const toast = useToast();
const MAX_MESSAGES = 200;

const eventId = ref(null);
const messages = ref([]);
const pinned = ref(null);
const isHost = ref(false);
const banned = ref(false);
const unavailable = ref('');
const draft = ref('');
const isSending = ref(false);
const hearts = ref([]);
const listEl = ref(null);

const myId = currentUserId();
let channelName = null;
let pendingHearts = 0;
let heartFlushTimer = null;
let heartSeq = 0;

const canWrite = computed(() => !banned.value && !unavailable.value);

const avatarUrl = (user) => {
    if (!user?.image) return null;
    return String(user.image).startsWith('http') ? user.image : `${storageURL}${user.image}`;
};

const initials = (name) =>
    String(name || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

const isNearBottom = () => {
    const el = listEl.value;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 80;
};

const scrollToBottom = async (force = false) => {
    const shouldScroll = force || isNearBottom();
    await nextTick();
    if (shouldScroll && listEl.value) {
        listEl.value.scrollTop = listEl.value.scrollHeight;
    }
};

const addMessage = (message) => {
    if (!message || messages.value.some((item) => item.id === message.id)) return;
    const stickToBottom = isNearBottom();
    messages.value = [...messages.value, message].slice(-MAX_MESSAGES);
    scrollToBottom(stickToBottom);
};

const spawnHearts = (count) => {
    const total = Math.min(count, 8);
    for (let i = 0; i < total; i++) {
        const id = ++heartSeq;
        const heart = {
            id,
            left: 10 + Math.random() * 60,
            delay: i * 120,
            hue: [0, 330, 350, 15][Math.floor(Math.random() * 4)]
        };
        hearts.value = [...hearts.value, heart];
        setTimeout(() => {
            hearts.value = hearts.value.filter((item) => item.id !== id);
        }, 2600 + heart.delay);
    }
};

const load = async () => {
    try {
        const response = await axios.get(`${baseURL}/eventos/${props.eventRef}/live-chat`);
        eventId.value = response.data.event_id;
        messages.value = response.data.messages || [];
        pinned.value = response.data.pinned;
        isHost.value = Boolean(response.data.is_host);
        banned.value = Boolean(response.data.banned);
        scrollToBottom(true);
        subscribe();
    } catch (error) {
        unavailable.value = error?.response?.data?.message || 'O chat não está disponível.';
    }
};

const subscribe = async () => {
    if (!eventId.value || channelName) return;
    channelName = `live.${eventId.value}`;
    try {
        const echo = await getEcho();
        echo.private(channelName)
            .listen('.chat.message', (event) => addMessage(event.message))
            .listen('.chat.hidden', (event) => {
                const ids = event.ids || [];
                messages.value = messages.value.filter((item) => !ids.includes(item.id));
                if (pinned.value && ids.includes(pinned.value.id)) pinned.value = null;
            })
            .listen('.chat.pinned', (event) => {
                pinned.value = event.message || null;
            })
            .listen('.reaction', (event) => {
                if (event.user_id !== myId) spawnHearts(event.count || 1);
            })
            .listen('.live.status', (event) => emit('live-status', event));
    } catch {
        // chat still works through the initial history; realtime resumes on reload
    }
};

const send = async () => {
    const body = draft.value.trim();
    if (!body || isSending.value) return;
    isSending.value = true;
    try {
        const response = await axios.post(`${baseURL}/eventos/${props.eventRef}/live-chat`, { body });
        draft.value = '';
        addMessage(response.data.message);
        scrollToBottom(true);
    } catch (error) {
        if (error?.response?.status === 403) banned.value = true;
        toast.add({ severity: 'warn', summary: 'Chat', detail: error?.response?.data?.message || 'Não foi possível enviar.', life: 3000 });
    } finally {
        isSending.value = false;
    }
};

const flushHearts = () => {
    heartFlushTimer = null;
    const count = pendingHearts;
    pendingHearts = 0;
    if (count > 0) {
        axios.post(`${baseURL}/eventos/${props.eventRef}/live-chat/reactions`, { count }).catch(() => {});
    }
};

const sendHeart = () => {
    spawnHearts(1);
    pendingHearts = Math.min(pendingHearts + 1, 30);
    if (!heartFlushTimer) {
        heartFlushTimer = setTimeout(flushHearts, 800);
    }
};

const hostAction = async (method, path, successText) => {
    try {
        await axios[method](`${baseURL}/promotor-eventos/${eventId.value}/live-chat/${path}`);
        if (successText) toast.add({ severity: 'success', summary: 'Chat', detail: successText, life: 2000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Chat', detail: error?.response?.data?.message || 'Acção não concluída.', life: 3000 });
    }
};

const pinMessage = (message) => hostAction('post', `messages/${message.id}/pin`);
const unpin = () => hostAction('delete', 'pin');
const hideMessage = (message) => hostAction('post', `messages/${message.id}/hide`);
const banUser = (message) => hostAction('post', `users/${message.user.id}/ban`, `${message.user.name} já não pode comentar.`);

onMounted(load);

onBeforeUnmount(async () => {
    if (heartFlushTimer) {
        clearTimeout(heartFlushTimer);
        flushHearts();
    }
    if (channelName) {
        try {
            (await getEcho()).leave(channelName);
        } catch {
            // socket already closed
        }
    }
});
</script>

<template>
    <div class="live-chat">
        <div class="live-chat-header">
            <span class="font-semibold"><i class="pi pi-comments mr-2" />Chat ao vivo</span>
        </div>

        <div v-if="pinned" class="live-chat-pinned">
            <i class="pi pi-thumbtack text-primary" />
            <div class="flex-1 min-w-0">
                <span class="font-semibold">{{ pinned.user?.name }}</span>
                <span class="ml-1">{{ pinned.body }}</span>
            </div>
            <Button v-if="isHost" icon="pi pi-times" text rounded size="small" v-tooltip.top="'Desafixar'" @click="unpin" />
        </div>

        <div ref="listEl" class="live-chat-list" :style="{ height }">
            <p v-if="unavailable" class="text-500 text-sm text-center mt-4">{{ unavailable }}</p>
            <p v-else-if="!messages.length" class="text-500 text-sm text-center mt-4">Sê o primeiro a comentar.</p>

            <div v-for="message in messages" :key="message.id" class="live-chat-message">
                <Avatar
                    :image="avatarUrl(message.user) || undefined"
                    :label="avatarUrl(message.user) ? undefined : initials(message.user?.name)"
                    shape="circle"
                    size="normal"
                />
                <div class="flex-1 min-w-0">
                    <span class="font-semibold mr-1">{{ message.user?.name }}</span>
                    <Tag v-if="message.is_host" value="Anfitrião" severity="info" class="live-chat-badge mr-1" />
                    <span class="live-chat-body">{{ message.body }}</span>
                </div>
                <div v-if="isHost" class="live-chat-actions">
                    <Button icon="pi pi-thumbtack" text rounded size="small" v-tooltip.top="'Fixar'" @click="pinMessage(message)" />
                    <Button icon="pi pi-eye-slash" text rounded size="small" v-tooltip.top="'Ocultar'" @click="hideMessage(message)" />
                    <Button
                        v-if="!message.is_host && message.user?.id !== myId"
                        icon="pi pi-ban"
                        text
                        rounded
                        size="small"
                        severity="danger"
                        v-tooltip.top="'Impedir de comentar'"
                        @click="banUser(message)"
                    />
                </div>
            </div>
        </div>

        <div class="live-chat-hearts">
            <i
                v-for="heart in hearts"
                :key="heart.id"
                class="pi pi-heart-fill live-chat-heart"
                :style="{ left: `${heart.left}%`, animationDelay: `${heart.delay}ms`, color: `hsl(${heart.hue}, 85%, 55%)` }"
            />
        </div>

        <form class="live-chat-input" @submit.prevent="send">
            <InputText
                v-model="draft"
                class="flex-1"
                maxlength="300"
                :disabled="!canWrite"
                :placeholder="banned ? 'Não podes comentar nesta live' : 'Comentar…'"
            />
            <Button type="submit" icon="pi pi-send" rounded :disabled="!canWrite || !draft.trim()" :loading="isSending" />
            <Button type="button" icon="pi pi-heart-fill" rounded text severity="danger" :disabled="!!unavailable" @click="sendHeart" />
        </form>
    </div>
</template>

<style scoped>
.live-chat {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--surface-border);
    border-radius: 0.85rem;
    background: var(--surface-0);
    overflow: hidden;
}

.live-chat-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--surface-border);
}

.live-chat-pinned {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(33, 150, 243, 0.08);
    border-bottom: 1px solid var(--surface-border);
    font-size: 0.9rem;
}

.live-chat-list {
    overflow-y: auto;
    padding: 0.5rem 0.75rem;
}

.live-chat-message {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.35rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.live-chat-body {
    word-break: break-word;
}

.live-chat-badge {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
}

.live-chat-actions {
    display: none;
    flex-shrink: 0;
}

.live-chat-message:hover .live-chat-actions {
    display: flex;
}

.live-chat-input {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem;
    border-top: 1px solid var(--surface-border);
}

.live-chat-hearts {
    position: absolute;
    right: 0.5rem;
    bottom: 3.5rem;
    width: 4rem;
    height: 14rem;
    pointer-events: none;
}

.live-chat-heart {
    position: absolute;
    bottom: 0;
    font-size: 1.4rem;
    opacity: 0;
    animation: heart-float 2.4s ease-out forwards;
}

@keyframes heart-float {
    0% {
        transform: translateY(0) scale(0.6);
        opacity: 0;
    }
    15% {
        opacity: 1;
    }
    100% {
        transform: translateY(-13rem) translateX(-0.8rem) scale(1.2);
        opacity: 0;
    }
}
</style>
