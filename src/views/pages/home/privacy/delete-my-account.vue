<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

// Form data
const formData = reactive({
    fullName: '',
    email: '',
    phone: '',
    userId: '',
    accountType: null,
    reason: null,
    reasonDetails: '',
    confirmTerms: false,
    confirmUnderstanding: false
});

// Form state
const isSubmitting = ref(false);
const formSubmitted = ref(false);

// Form validation
const isFormValid = ref(false);

const validateForm = () => {
    isFormValid.value = formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.accountType !== null && formData.reason !== null && formData.confirmTerms && formData.confirmUnderstanding;
};

// Form submission
const submitDeletionRequest = async () => {
    if (!isFormValid.value) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, preencha todos os campos obrigatórios.',
            life: 3000
        });
        return;
    }

    isSubmitting.value = true;
    
    try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        formSubmitted.value = true;
        toast.add({
            severity: 'success',
            summary: 'Solicitação Enviada',
            detail: 'O seu pedido de eliminação foi enviado com sucesso. Entraremos em contacto em breve.',
            life: 5000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao enviar o pedido. Tente novamente.',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

// Watch form changes for validation
watch(formData, validateForm, { deep: true });
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div id="delete-account" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-center">
                    <div class="col-12 md:col-8 lg:col-6">
                        <!-- Header -->
                        <div class="text-center mt-8 mb-6">
                            <div class="mb-4">
                                <i class="pi pi-trash text-6xl text-red-500"></i>
                            </div>
                            <h1 class="text-900 font-normal mb-2">Eliminar Minha Conta</h1>
                            <span class="text-600 text-xl">Exercer o Direito de Apagamento de Dados</span>
                            <p class="text-500 mt-3">Solicite a eliminação completa dos seus dados pessoais da plataforma Mticket</p>
                        </div>

                        <div v-if="!formSubmitted">
                            <!-- Information Alert -->
                            <div class="p-3 bg-yellow-50 border-round mb-4">
                                <div class="flex align-items-start">
                                    <i class="pi pi-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                                    <div>
                                        <h4 class="text-yellow-800 mb-2">Informações Importantes</h4>
                                        <ul class="text-yellow-700 mb-0 pl-3">
                                            <li>A eliminação da conta é permanente e irreversível</li>
                                            <li>Todos os seus dados pessoais serão removidos do sistema</li>
                                            <li>O histórico de bilhetes pode ser mantido para fins fiscais por período legal</li>
                                            <li>O processo pode levar até 30 dias para ser concluído</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Form -->
                            <div class="card">
                                <h3 class="text-900 mb-4">Formulário de Solicitação</h3>
                                
                                <form @submit.prevent="submitDeletionRequest" class="p-fluid">
                                    <!-- Personal Information -->
                                    <div class="field">
                                        <label for="fullName" class="font-medium text-900">Nome Completo *</label>
                                        <InputText 
                                            id="fullName" 
                                            v-model="formData.fullName" 
                                            placeholder="Digite o seu nome completo"
                                            required 
                                        />
                                    </div>

                                    <div class="field">
                                        <label for="email" class="font-medium text-900">Email *</label>
                                        <InputText 
                                            id="email" 
                                            v-model="formData.email" 
                                            type="email"
                                            placeholder="Digite o email da sua conta"
                                            required 
                                        />
                                    </div>

                                    <div class="field">
                                        <label for="phone" class="font-medium text-900">Telefone</label>
                                        <InputText 
                                            id="phone" 
                                            v-model="formData.phone" 
                                            placeholder="Digite o seu número de telefone (opcional)"
                                        />
                                    </div>

                                    <div class="field">
                                        <label for="userId" class="font-medium text-900">ID de Utilizador</label>
                                        <InputText 
                                            id="userId" 
                                            v-model="formData.userId" 
                                            placeholder="Se conhecer o seu ID de utilizador (opcional)"
                                        />
                                    </div>

                                    <!-- Account Type -->
                                    <div class="field">
                                        <label class="font-medium text-900">Tipo de Conta *</label>
                                        <div class="mt-2">
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="buyer" 
                                                    v-model="formData.accountType" 
                                                    value="buyer" 
                                                />
                                                <label for="buyer" class="ml-2">Comprador de Bilhetes</label>
                                            </div>
                                            <div class="field-radiobutton">
                                                <RadioButton 
                                                    id="promoter" 
                                                    v-model="formData.accountType" 
                                                    value="promoter" 
                                                />
                                                <label for="promoter" class="ml-2">Promotor de Eventos</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Deletion Reason -->
                                    <div class="field">
                                        <label class="font-medium text-900">Motivo da Eliminação *</label>
                                        <div class="mt-2">
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="no_longer_use" 
                                                    v-model="formData.reason" 
                                                    value="no_longer_use" 
                                                />
                                                <label for="no_longer_use" class="ml-2">Não uso mais a plataforma</label>
                                            </div>
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="privacy_concerns" 
                                                    v-model="formData.reason" 
                                                    value="privacy_concerns" 
                                                />
                                                <label for="privacy_concerns" class="ml-2">Preocupações com privacidade</label>
                                            </div>
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="too_many_emails" 
                                                    v-model="formData.reason" 
                                                    value="too_many_emails" 
                                                />
                                                <label for="too_many_emails" class="ml-2">Demasiados emails/notificações</label>
                                            </div>
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="service_issues" 
                                                    v-model="formData.reason" 
                                                    value="service_issues" 
                                                />
                                                <label for="service_issues" class="ml-2">Problemas com o serviço</label>
                                            </div>
                                            <div class="field-radiobutton mb-2">
                                                <RadioButton 
                                                    id="switching_platform" 
                                                    v-model="formData.reason" 
                                                    value="switching_platform" 
                                                />
                                                <label for="switching_platform" class="ml-2">Mudança para outra plataforma</label>
                                            </div>
                                            <div class="field-radiobutton">
                                                <RadioButton 
                                                    id="other" 
                                                    v-model="formData.reason" 
                                                    value="other" 
                                                />
                                                <label for="other" class="ml-2">Outro motivo</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Additional Details -->
                                    <div v-if="formData.reason === 'other' || formData.reason === 'service_issues'" class="field">
                                        <label for="reasonDetails" class="font-medium text-900">Detalhes Adicionais</label>
                                        <Textarea 
                                            id="reasonDetails" 
                                            v-model="formData.reasonDetails" 
                                            rows="4"
                                            placeholder="Por favor, descreva com mais detalhe..."
                                        />
                                    </div>

                                    <!-- Confirmations -->
                                    <div class="field mt-4">
                                        <div class="field-checkbox mb-3">
                                            <Checkbox 
                                                id="confirmTerms" 
                                                v-model="formData.confirmTerms" 
                                                :binary="true"
                                            />
                                            <label for="confirmTerms" class="ml-2 font-medium">
                                                Confirmo que compreendo que esta ação é irreversível e que todos os meus dados serão eliminados permanentemente. *
                                            </label>
                                        </div>
                                        
                                        <div class="field-checkbox">
                                            <Checkbox 
                                                id="confirmUnderstanding" 
                                                v-model="formData.confirmUnderstanding" 
                                                :binary="true"
                                            />
                                            <label for="confirmUnderstanding" class="ml-2 font-medium">
                                                Compreendo que o processo pode levar até 30 dias e que alguns dados podem ser mantidos por obrigações legais. *
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="text-center mt-5">
                                        <Button 
                                            type="submit"
                                            label="Enviar Solicitação de Eliminação" 
                                            icon="pi pi-send"
                                            class="p-button-danger p-button-lg"
                                            :loading="isSubmitting"
                                            :disabled="!isFormValid"
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Success Message -->
                        <div v-else class="card text-center">
                            <div class="mb-4">
                                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                            </div>
                            <h3 class="text-900 mb-3">Solicitação Enviada com Sucesso!</h3>
                            <p class="text-600 mb-4">
                                Recebemos o seu pedido de eliminação de dados. A nossa equipa irá processar a sua solicitação e entrar em contacto consigo em breve.
                            </p>
                            <div class="p-3 bg-blue-50 border-round mb-4">
                                <h4 class="text-blue-900 mb-2">Próximos Passos:</h4>
                                <ul class="text-blue-800 mb-0 text-left pl-4">
                                    <li>Receberá um email de confirmação em breve</li>
                                    <li>A nossa equipa validará a sua identidade</li>
                                    <li>O processo de eliminação iniciará após validação</li>
                                    <li>Será notificado quando o processo estiver completo</li>
                                </ul>
                            </div>
                            <div class="mt-4">
                                <Button 
                                    label="Voltar à Página Inicial" 
                                    icon="pi pi-home" 
                                    class="p-button-outlined mr-2"
                                    @click="router.push('/')"
                                />
                                <Button 
                                    label="Contactar Suporte" 
                                    icon="pi pi-phone" 
                                    class="p-button-outlined"
                                    @click="window.open('mailto:suporte@mticket.co.ao')"
                                />
                            </div>
                        </div>

                        <!-- Back Button -->
                        <div v-if="!formSubmitted" class="text-center mt-6">
                            <Button 
                                label="Voltar" 
                                icon="pi pi-arrow-left" 
                                class="p-button-outlined" 
                                @click="goBackUsingBack()" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>