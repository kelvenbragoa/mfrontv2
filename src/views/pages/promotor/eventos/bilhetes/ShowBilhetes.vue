<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const isLoadingDiv = ref(true);
const isSavingField = ref(false);
const isDeletingField = ref(false);
const ticket = ref(null);
const fields = ref([]);

const displayFieldDialog = ref(false);
const editingField = ref(null);

const fieldTypes = [
    { label: 'Texto', value: 'text' },
    { label: 'Texto longo', value: 'textarea' },
    { label: 'Número', value: 'number' },
    { label: 'Lista (select)', value: 'select' },
    { label: 'Checkbox', value: 'checkbox' },
    { label: 'Termos e condições', value: 'terms' }
];

const fieldForm = ref(emptyFieldForm());

function emptyFieldForm() {
    return {
        label: '',
        type: 'text',
        required: false,
        optionsText: '',
        terms_text: '',
        sort_order: null
    };
}

const ticketId = computed(() => router.currentRoute.value.params.idbilhetes);

const typeLabel = (type) => fieldTypes.find((t) => t.value === type)?.label || type;

const goBackUsingBack = () => {
    if (router) router.back();
};

const goEditTicket = () => {
    router.push(`/promotor/eventos/${router.currentRoute.value.params.id}/bilhetes/${ticketId.value}/edit`);
};

const loadData = async () => {
    isLoadingDiv.value = true;
    try {
        const [ticketRes, fieldsRes] = await Promise.all([
            axios.get(`${baseURL}/promotor-tickets/${ticketId.value}`),
            axios.get(`${baseURL}/promotor-tickets/${ticketId.value}/form-fields`)
        ]);
        ticket.value = ticketRes.data.ticket;
        fields.value = fieldsRes.data.fields || ticketRes.data.ticket?.form_fields || [];
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível carregar o bilhete.',
            life: 3500
        });
        goBackUsingBack();
    } finally {
        isLoadingDiv.value = false;
    }
};

const openCreateField = () => {
    editingField.value = null;
    fieldForm.value = emptyFieldForm();
    fieldForm.value.sort_order = fields.value.length;
    displayFieldDialog.value = true;
};

const openEditField = (field) => {
    editingField.value = field;
    fieldForm.value = {
        label: field.label || '',
        type: field.type || 'text',
        required: !!field.required,
        optionsText: Array.isArray(field.options) ? field.options.join('\n') : '',
        terms_text: field.terms_text || '',
        sort_order: field.sort_order ?? 0
    };
    displayFieldDialog.value = true;
};

const closeFieldDialog = () => {
    displayFieldDialog.value = false;
    editingField.value = null;
    fieldForm.value = emptyFieldForm();
};

const buildPayload = () => {
    const form = fieldForm.value;
    const payload = {
        label: form.label.trim(),
        type: form.type,
        required: form.type === 'terms' ? true : !!form.required,
        sort_order: form.sort_order === '' || form.sort_order === null ? undefined : Number(form.sort_order)
    };

    if (form.type === 'select') {
        payload.options = String(form.optionsText || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    } else {
        payload.options = null;
    }

    if (form.type === 'terms') {
        payload.terms_text = form.terms_text?.trim() || '';
    } else {
        payload.terms_text = null;
    }

    return payload;
};

const saveField = async () => {
    const form = fieldForm.value;
    if (!form.label.trim()) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'O título do campo é obrigatório.', life: 3000 });
        return;
    }
    if (form.type === 'select') {
        const options = String(form.optionsText || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
        if (options.length < 1) {
            toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Indica pelo menos uma opção (uma por linha).', life: 3000 });
            return;
        }
    }
    if (form.type === 'terms' && !String(form.terms_text || '').trim()) {
        toast.add({ severity: 'warn', summary: 'Atenção', detail: 'O texto dos termos é obrigatório.', life: 3000 });
        return;
    }

    isSavingField.value = true;
    const payload = buildPayload();

    try {
        if (editingField.value) {
            const { data } = await axios.put(
                `${baseURL}/promotor-tickets/${ticketId.value}/form-fields/${editingField.value.id}`,
                payload
            );
            const idx = fields.value.findIndex((f) => f.id === editingField.value.id);
            if (idx >= 0) fields.value.splice(idx, 1, data.field);
            toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Campo atualizado.', life: 2500 });
        } else {
            const { data } = await axios.post(`${baseURL}/promotor-tickets/${ticketId.value}/form-fields`, payload);
            fields.value.push(data.field);
            fields.value.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
            toast.add({ severity: 'success', summary: 'Criado', detail: 'Campo adicionado ao formulário.', life: 2500 });
        }
        closeFieldDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível guardar o campo.',
            life: 3500
        });
    } finally {
        isSavingField.value = false;
    }
};

const deleteField = async (field) => {
    if (!window.confirm(`Remover o campo "${field.label}"?`)) return;

    isDeletingField.value = true;
    try {
        await axios.delete(`${baseURL}/promotor-tickets/${ticketId.value}/form-fields/${field.id}`);
        fields.value = fields.value.filter((f) => f.id !== field.id);
        toast.add({ severity: 'success', summary: 'Removido', detail: 'Campo eliminado.', life: 2500 });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error?.response?.data?.message || 'Não foi possível eliminar o campo.',
            life: 3500
        });
    } finally {
        isDeletingField.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<template>
    <div v-if="!isLoadingDiv && ticket" class="ticket-show">
        <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
                <Button label="Voltar" icon="pi pi-angle-left" text class="mb-2 p-0" @click="goBackUsingBack" />
                <h4 class="m-0 text-900">{{ ticket.name }}</h4>
                <span class="text-600">Detalhes do bilhete e formulário de inscrição</span>
                <Tag v-if="ticket.is_live" value="Live — só online" severity="danger" class="mt-2" />
            </div>
            <Button label="Editar bilhete" icon="pi pi-pencil" outlined @click="goEditTicket" />
        </div>

        <div class="card mb-3">
            <h5 class="mt-0">Detalhes</h5>
            <div class="grid">
                <div class="col-12 md:col-6">
                    <p class="mb-2"><strong>Descrição:</strong> {{ ticket.description || '—' }}</p>
                    <p class="mb-2"><strong>Preço:</strong> {{ ticket.price }} MT</p>
                    <p class="mb-2"><strong>Stock (max_qtd):</strong> {{ ticket.max_qtd }}</p>
                    <p class="mb-0">
                        <strong>Máx. por compra:</strong>
                        {{ ticket.max_per_order || '5 (padrão)' }}
                    </p>
                    <p v-if="ticket.is_live" class="mb-0 mt-2 text-600">
                        Este bilhete dá acesso à live e não é válido na entrada.
                    </p>
                </div>
                <div class="col-12 md:col-6">
                    <p class="mb-2">
                        <strong>Venda início:</strong> {{ ticket.start_date }} {{ ticket.start_time }}
                    </p>
                    <p class="mb-0">
                        <strong>Venda fim:</strong> {{ ticket.end_date }} {{ ticket.end_time }}
                    </p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                    <h5 class="m-0">Formulário do bilhete</h5>
                    <p class="text-600 mt-1 mb-0">
                        Campos que o comprador preenche no checkout (um bloco por bilhete comprado).
                    </p>
                </div>
                <Button label="Adicionar campo" icon="pi pi-plus" @click="openCreateField" />
            </div>

            <div v-if="fields.length === 0" class="empty-fields">
                <i class="pi pi-inbox text-3xl text-400 mb-2" />
                <p class="text-600 m-0">Ainda sem campos. Adiciona perguntas, tamanho de t-shirt, termos, etc.</p>
            </div>

            <div v-else class="field-list">
                <div v-for="field in fields" :key="field.id" class="field-row">
                    <div class="field-row__main">
                        <div class="flex align-items-center gap-2 mb-1">
                            <strong class="text-900">{{ field.label }}</strong>
                            <Tag :value="typeLabel(field.type)" severity="info" />
                            <Tag v-if="field.required" value="Obrigatório" severity="danger" />
                        </div>
                        <small class="text-600">chave: {{ field.field_key }} · ordem: {{ field.sort_order }}</small>
                        <div v-if="field.type === 'select' && field.options?.length" class="mt-2 text-600 text-sm">
                            Opções: {{ field.options.join(', ') }}
                        </div>
                        <div v-if="field.type === 'terms' && field.terms_text" class="mt-2 terms-preview">
                            {{ field.terms_text }}
                        </div>
                    </div>
                    <div class="field-row__actions">
                        <Button icon="pi pi-pencil" rounded text @click="openEditField(field)" />
                        <Button
                            icon="pi pi-trash"
                            rounded
                            text
                            severity="danger"
                            :loading="isDeletingField"
                            @click="deleteField(field)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <Dialog
            v-model:visible="displayFieldDialog"
            modal
            :header="editingField ? 'Editar campo' : 'Novo campo'"
            :style="{ width: 'min(560px, 95vw)' }"
            @hide="closeFieldDialog"
        >
            <div class="field">
                <label for="field_label">Título <span class="required">*</span></label>
                <InputText id="field_label" v-model="fieldForm.label" class="w-full" placeholder="Ex: Tamanho da t-shirt" />
            </div>

            <div class="field">
                <label for="field_type">Tipo <span class="required">*</span></label>
                <Dropdown
                    id="field_type"
                    v-model="fieldForm.type"
                    :options="fieldTypes"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                />
            </div>

            <div v-if="fieldForm.type !== 'terms'" class="field-checkbox">
                <Checkbox v-model="fieldForm.required" :binary="true" inputId="field_required" />
                <label for="field_required">Campo obrigatório</label>
            </div>
            <small v-else class="text-600 block mb-3">Termos são sempre obrigatórios.</small>

            <div v-if="fieldForm.type === 'select'" class="field">
                <label for="field_options">Opções (uma por linha) <span class="required">*</span></label>
                <Textarea
                    id="field_options"
                    v-model="fieldForm.optionsText"
                    rows="4"
                    class="w-full"
                    placeholder="S&#10;M&#10;L&#10;XL"
                />
            </div>

            <div v-if="fieldForm.type === 'terms'" class="field">
                <label for="field_terms">Texto dos termos <span class="required">*</span></label>
                <Textarea
                    id="field_terms"
                    v-model="fieldForm.terms_text"
                    rows="6"
                    class="w-full"
                    placeholder="Declaro que li e aceito o regulamento..."
                />
            </div>

            <div class="field">
                <label for="field_order">Ordem de apresentação</label>
                <InputText id="field_order" v-model="fieldForm.sort_order" type="number" min="0" class="w-full" />
            </div>

            <template #footer>
                <Button label="Cancelar" text @click="closeFieldDialog" :disabled="isSavingField" />
                <Button
                    :label="editingField ? 'Guardar' : 'Adicionar'"
                    icon="pi pi-check"
                    :loading="isSavingField"
                    @click="saveField"
                />
            </template>
        </Dialog>
    </div>

    <div v-else class="text-center py-6">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
        <p>A carregar bilhete...</p>
    </div>
</template>

<style scoped>
.ticket-show {
    max-width: 900px;
}

.required {
    color: #e24c4c;
}

.empty-fields {
    border: 1px dashed var(--surface-border);
    border-radius: 12px;
    padding: 2rem 1rem;
    text-align: center;
}

.field-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.field-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    justify-content: space-between;
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    background: var(--surface-ground);
}

.field-row__main {
    min-width: 0;
    flex: 1;
}

.field-row__actions {
    display: flex;
    gap: 0.25rem;
}

.terms-preview {
    white-space: pre-wrap;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    max-height: 6rem;
    overflow: auto;
}

.field-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>
