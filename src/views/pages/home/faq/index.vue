<script setup>
import { computed, ref } from 'vue';

const searchQuery = ref('');
const selectedTopic = ref('todos');

const faqGroups = [
    {
        key: 'compras',
        label: 'Compras',
        icon: 'pi pi-shopping-cart',
        items: [
            {
                question: 'Como compro um bilhete na Mticket?',
                answer:
                    'Escolhe o evento, clica em "Comprar bilhetes", seleciona a quantidade de cada tipo de bilhete e preenche os teus dados. Depois confirmas o pagamento com M-Pesa no teu telemóvel.'
            },
            {
                question: 'Preciso de ter conta para comprar?',
                answer:
                    'Não é obrigatório. Podes comprar apenas com nome, email e telemóvel. No entanto, com conta ficas com o histórico de compras disponível em "Meus Bilhetes" e podes recuperar os bilhetes a qualquer momento.'
            },
            {
                question: 'Que formas de pagamento posso usar?',
                answer:
                    'Os pagamentos são feitos por M-Pesa. Depois de submeteres a compra, recebes um pedido de confirmação no telemóvel associado ao número que indicaste.'
            },
            {
                question: 'O pagamento falhou. O que faço?',
                answer:
                    'Confirma que o número M-Pesa está correto, que tens saldo suficiente e que aceitaste o pedido dentro do tempo limite. Se o valor não foi debitado, podes repetir a compra. Se foi debitado e não recebeste o bilhete, contacta o suporte.'
            }
        ]
    },
    {
        key: 'bilhetes',
        label: 'Bilhetes',
        icon: 'pi pi-ticket',
        items: [
            {
                question: 'Onde recebo o meu bilhete?',
                answer:
                    'Logo após a compra, o bilhete aparece na página de confirmação e pode ser descarregado. Enviamos também por email e, quando possível, por WhatsApp para o número indicado.'
            },
            {
                question: 'Como funciona a entrada no evento?',
                answer:
                    'Cada bilhete tem um QR Code único. Basta apresentá-lo na portaria, no telemóvel ou impresso, para ser validado.'
            },
            {
                question: 'Perdi o email com o bilhete. Como recupero?',
                answer:
                    'Se compraste com conta iniciada, abre "Meus Bilhetes" e verás todos os bilhetes com o respetivo QR Code. Caso contrário, contacta o suporte com o email e telemóvel usados na compra.'
            },
            {
                question: 'Posso comprar bilhetes fora da plataforma?',
                answer:
                    'Só são aceites bilhetes adquiridos através da Mticket. Bilhetes obtidos por outros meios não são válidos para entrada.'
            },
            {
                question: 'O bilhete é transmissível?',
                answer:
                    'O bilhete é pessoal e o QR Code só pode ser validado uma vez. Depois de usado, não pode ser reutilizado por outra pessoa.'
            }
        ]
    },
    {
        key: 'cashless',
        label: 'Cashless',
        icon: 'pi pi-wallet',
        items: [
            {
                question: 'O que é o cashless da Mticket?',
                answer:
                    'É uma pulseira ou cartão recarregável que usas para consumir dentro do evento, sem precisares de dinheiro físico.'
            },
            {
                question: 'Como recarrego a minha pulseira?',
                answer:
                    'Vai a "Cashless", introduz o número da pulseira ou cartão, escolhe o valor e paga com M-Pesa. O saldo é atualizado assim que o pagamento é confirmado.'
            },
            {
                question: 'Onde vejo o saldo e os movimentos?',
                answer:
                    'Depois de introduzires o número da pulseira, vês o saldo disponível no topo e a lista de recargas, compras e devoluções logo abaixo.'
            },
            {
                question: 'A minha pulseira aparece como desativada. O que significa?',
                answer:
                    'Pulseiras desativadas não podem ser recarregadas nem usadas. Contacta a equipa Mticket ou o staff do evento para verificar a situação.'
            }
        ]
    },
    {
        key: 'eventos',
        label: 'Eventos',
        icon: 'pi pi-calendar',
        items: [
            {
                question: 'Como encontro eventos perto de mim?',
                answer:
                    'Na página de eventos podes pesquisar por nome e filtrar por categoria e província. Também podes explorar por categoria a partir da página inicial.'
            },
            {
                question: 'O evento foi cancelado ou adiado. E agora?',
                answer:
                    'Em caso de cancelamento ou adiamento, o promotor do evento informa sobre a nova data ou sobre o processo de reembolso.'
            },
            {
                question: 'O que significa "Encerrado" num evento?',
                answer:
                    'Significa que o período de venda terminou e já não é possível comprar bilhetes para esse evento.'
            }
        ]
    },
    {
        key: 'promotores',
        label: 'Promotores',
        icon: 'pi pi-megaphone',
        items: [
            {
                question: 'Como me torno promotor?',
                answer:
                    'Cria uma conta escolhendo o tipo "Promotor" no registo. Depois tens acesso ao painel onde podes criar e gerir os teus eventos.'
            },
            {
                question: 'O que posso gerir no painel de promotor?',
                answer:
                    'Podes publicar eventos, criar bilhetes e pacotes, adicionar line-up e convites, acompanhar vendas, gerir bares e protocolos, e emitir relatórios.'
            },
            {
                question: 'Como é feito o controlo de entradas?',
                answer:
                    'A validação é feita por leitura do QR Code de cada bilhete, permitindo acompanhar as entradas ao longo do evento.'
            }
        ]
    }
];

const topicOptions = computed(() => [
    { label: 'Todos', value: 'todos' },
    ...faqGroups.map((group) => ({ label: group.label, value: group.key }))
]);

const normalize = (value) =>
    (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const filteredGroups = computed(() => {
    const term = normalize(searchQuery.value.trim());

    return faqGroups
        .filter((group) => selectedTopic.value === 'todos' || group.key === selectedTopic.value)
        .map((group) => ({
            ...group,
            items: term
                ? group.items.filter(
                      (item) => normalize(item.question).includes(term) || normalize(item.answer).includes(term)
                  )
                : group.items
        }))
        .filter((group) => group.items.length > 0);
});

const totalResults = computed(() =>
    filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0)
);

const hasResults = computed(() => totalResults.value > 0);
const hasActiveFilters = computed(() => !!searchQuery.value.trim() || selectedTopic.value !== 'todos');

const clearFilters = () => {
    searchQuery.value = '';
    selectedTopic.value = 'todos';
};
</script>

<template>
    <div class="faq-page">
        <section class="faq-hero">
            <div class="faq-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="faq-hero__eyebrow">Ajuda</p>
                <h1 class="faq-hero__title">Perguntas frequentes</h1>
                <p class="faq-hero__subtitle">Respostas rápidas sobre compras, bilhetes, cashless e eventos.</p>

                <IconField iconPosition="left" class="faq-hero__search">
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Pesquisar uma dúvida..." class="w-full faq-input" />
                </IconField>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="topic-bar">
                <button
                    v-for="topic in topicOptions"
                    :key="topic.value"
                    type="button"
                    class="topic-chip"
                    :class="{ 'topic-chip--active': selectedTopic === topic.value }"
                    @click="selectedTopic = topic.value"
                >
                    {{ topic.label }}
                </button>
            </div>

            <p v-if="hasActiveFilters && hasResults" class="faq-count">
                {{ totalResults }} {{ totalResults === 1 ? 'resultado' : 'resultados' }}
            </p>

            <div v-if="hasResults" class="faq-groups">
                <section v-for="group in filteredGroups" :key="group.key" class="faq-group">
                    <h2 class="faq-group__title">
                        <i :class="group.icon" />
                        {{ group.label }}
                    </h2>

                    <Accordion :multiple="true">
                        <AccordionTab v-for="item in group.items" :key="item.question" :header="item.question">
                            <p class="faq-answer">{{ item.answer }}</p>
                        </AccordionTab>
                    </Accordion>
                </section>
            </div>

            <div v-else class="empty-block">
                <h3 class="text-900 mt-0 mb-2">Sem resultados</h3>
                <p class="text-600 mb-3">Não encontrámos respostas para essa pesquisa. Tenta outras palavras ou fala com o suporte.</p>
                <Button
                    label="Limpar pesquisa"
                    class="p-button-rounded border-none font-medium text-white bg-blue-500"
                    @click="clearFilters"
                />
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 pb-6">
            <div class="faq-cta">
                <div>
                    <h2 class="faq-cta__title">Não encontraste a resposta?</h2>
                    <p class="faq-cta__text">Fala com a nossa equipa de suporte. Respondemos o mais rápido possível.</p>
                    <div class="faq-cta__contacts">
                        <a href="mailto:suporte@mticket.co.mz"><i class="pi pi-envelope mr-2" />suporte@mticket.co.mz</a>
                        <a href="tel:+258842280974"><i class="pi pi-phone mr-2" />+258 842280974</a>
                        <a href="tel:+258842648618"><i class="pi pi-phone mr-2" />+258 842648618</a>
                    </div>
                </div>
                <router-link to="/sobre-nos">
                    <Button label="Sobre a Mticket" class="p-button-rounded border-none font-medium text-white bg-blue-500 white-space-nowrap" />
                </router-link>
            </div>
        </section>
    </div>
</template>

<style scoped>
.faq-hero {
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.6s ease-out;
}

.faq-hero__content {
    padding-top: 2.75rem;
    padding-bottom: 2.5rem;
}

.faq-hero__eyebrow {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.faq-hero__title {
    margin: 0 0 0.6rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
}

.faq-hero__subtitle {
    margin: 0 0 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    max-width: 38rem;
    line-height: 1.5;
}

.faq-hero__search {
    display: block;
    width: 100%;
    max-width: 30rem;
}

.faq-input {
    min-height: 3rem;
    font-size: 1rem !important;
}

.topic-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
}

.topic-chip {
    border: 1px solid var(--surface-border);
    background: var(--surface-0);
    color: #334155;
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.topic-chip:hover {
    border-color: #93c5fd;
}

.topic-chip--active {
    border-color: #2563eb;
    background: #eff6ff;
    color: #1d4ed8;
}

.faq-count {
    margin: 0 0 1rem;
    color: #64748b;
}

.faq-groups {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.faq-group__title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0 0 0.9rem;
    color: #0f172a;
    font-size: 1.35rem;
    font-weight: 600;
}

.faq-group__title i {
    color: #2563eb;
}

.faq-answer {
    margin: 0;
    color: #475569;
    line-height: 1.6;
}

.empty-block {
    border: 1px dashed var(--surface-border);
    border-radius: 1rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: var(--surface-50, #f8fafc);
}

.faq-cta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1.25rem;
    border-radius: 1.25rem;
    padding: 2rem;
    background:
        linear-gradient(0deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)),
        radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%);
}

.faq-cta__title {
    margin: 0 0 0.5rem;
    color: #0f172a;
    font-size: 1.5rem;
}

.faq-cta__text {
    margin: 0 0 0.85rem;
    color: #334155;
    font-size: 1.05rem;
    line-height: 1.5;
}

.faq-cta__contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
}

.faq-cta__contacts a {
    color: #1d4ed8;
    font-weight: 600;
    text-decoration: none;
}

.faq-cta__contacts a:hover {
    text-decoration: underline;
}

@keyframes hero-fade {
    from {
        opacity: 0.65;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 640px) {
    .faq-cta {
        padding: 1.5rem;
    }
}
</style>
