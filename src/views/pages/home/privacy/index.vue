<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}

const lastUpdated = ref('21 de Novembro de 2025');
</script>

<template>
    <div class="surface-0 flex justify-content-center">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div id="privacy" class="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                <div class="grid justify-content-center">
                    <div class="col-12 md:col-10 lg:col-8">
                        <!-- Header -->
                        <div class="text-center mt-8 mb-6">
                            <h1 class="text-900 font-normal mb-2">Política de Privacidade</h1>
                            <span class="text-600 text-xl">Mticket - Plataforma de Venda de Bilhetes</span>
                            <p class="text-500 mt-3">Última atualização: {{ lastUpdated }}</p>
                        </div>

                        <!-- Content Tabs -->
                        <div class="card">
                            <TabView>
                                <TabPanel header="Informações Gerais">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">1. Introdução</h3>
                                        <p class="mb-4">
                                            A Mticket está comprometida com a proteção da sua privacidade e dos seus dados pessoais. Esta política de privacidade explica como coletamos, usamos, armazenamos e protegemos as suas informações quando
                                            utiliza a nossa plataforma de venda de bilhetes para eventos.
                                        </p>

                                        <h3 class="text-900 mb-3">2. Responsável pelo Tratamento</h3>
                                        <p class="mb-4">A Mticket, sociedade comercial, é a responsável pelo tratamento dos seus dados pessoais, de acordo com as leis de proteção de dados aplicáveis.</p>

                                        <h3 class="text-900 mb-3">3. Âmbito de Aplicação</h3>
                                        <p class="mb-4">Esta política aplica-se a todos os utilizadores da plataforma Mticket, incluindo:</p>
                                        <ul class="mb-4 pl-4">
                                            <li>Compradores de bilhetes</li>
                                            <li>Promotores de eventos</li>
                                            <li>Visitantes do website</li>
                                            <li>Utilizadores da aplicação móvel</li>
                                        </ul>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Recolha de Dados">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Dados que Coletamos</h3>
                                        
                                        <h4 class="text-800 mb-2">Dados de Identificação</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Nome completo</li>
                                            <li>Endereço de email</li>
                                            <li>Número de telefone</li>
                                            <li>Data de nascimento</li>
                                            <li>Documento de identificação (quando necessário)</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Dados de Pagamento</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Informações do cartão de crédito/débito (processadas de forma segura)</li>
                                            <li>Histórico de transações</li>
                                            <li>Dados de faturação</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Dados de Utilização</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Endereço IP</li>
                                            <li>Tipo de navegador e dispositivo</li>
                                            <li>Páginas visitadas e tempo de permanência</li>
                                            <li>Preferências de eventos</li>
                                            <li>Localização geográfica (quando autorizada)</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Dados de Eventos (Para Promotores)</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Informações da empresa</li>
                                            <li>Dados bancários para transferências</li>
                                            <li>Documentos fiscais</li>
                                            <li>Detalhes dos eventos criados</li>
                                        </ul>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Utilização dos Dados">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Como Utilizamos os Seus Dados</h3>
                                        
                                        <h4 class="text-800 mb-2">Prestação de Serviços</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Processar compras de bilhetes</li>
                                            <li>Emitir bilhetes eletrónicos</li>
                                            <li>Gerir contas de utilizador</li>
                                            <li>Fornecer suporte ao cliente</li>
                                            <li>Validar identidade para eventos específicos</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Marketing e Comunicação</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Enviar newsletters sobre eventos</li>
                                            <li>Notificações sobre eventos do seu interesse</li>
                                            <li>Promoções e ofertas especiais</li>
                                            <li>Pesquisas de satisfação</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Melhoramento dos Serviços</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Análise de utilização da plataforma</li>
                                            <li>Personalização da experiência do utilizador</li>
                                            <li>Desenvolvimento de novas funcionalidades</li>
                                            <li>Prevenção de fraudes</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Obrigações Legais</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Cumprimento de requisitos fiscais</li>
                                            <li>Cooperação com autoridades competentes</li>
                                            <li>Prevenção de atividades ilícitas</li>
                                        </ul>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Partilha de Dados">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Com Quem Partilhamos os Seus Dados</h3>
                                        
                                        <h4 class="text-800 mb-2">Promotores de Eventos</h4>
                                        <p class="mb-3">Partilhamos dados necessários com os promotores de eventos para permitir a organização e gestão dos eventos, incluindo listas de participantes quando aplicável.</p>

                                        <h4 class="text-800 mb-2">Parceiros de Pagamento</h4>
                                        <p class="mb-3">Utilizamos processadores de pagamento seguros e certificados para processar transações. Estes parceiros têm acesso apenas às informações necessárias para completar os pagamentos.</p>

                                        <h4 class="text-800 mb-2">Prestadores de Serviços</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Serviços de alojamento de dados</li>
                                            <li>Serviços de email marketing</li>
                                            <li>Análise de dados e estatísticas</li>
                                            <li>Suporte técnico</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Autoridades Legais</h4>
                                        <p class="mb-3">Podemos partilhar dados quando exigido por lei ou para proteger os direitos, propriedade ou segurança da Mticket, dos nossos utilizadores ou do público.</p>

                                        <div class="p-3 bg-yellow-50 border-round mt-4">
                                            <p class="m-0 text-yellow-800">
                                                <i class="pi pi-exclamation-triangle mr-2"></i>
                                                <strong>Importante:</strong> Nunca vendemos ou alugamos os seus dados pessoais a terceiros para fins comerciais.
                                            </p>
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Seus Direitos">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Os Seus Direitos</h3>
                                        
                                        <div class="grid">
                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-blue-50">
                                                    <h4 class="text-blue-900 mb-2"><i class="pi pi-eye mr-2"></i>Direito de Acesso</h4>
                                                    <p class="text-blue-800 m-0">Pode solicitar acesso aos dados pessoais que temos sobre si.</p>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-green-50">
                                                    <h4 class="text-green-900 mb-2"><i class="pi pi-pencil mr-2"></i>Direito de Retificação</h4>
                                                    <p class="text-green-800 m-0">Pode solicitar a correção de dados inexatos ou incompletos.</p>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-orange-50">
                                                    <h4 class="text-orange-900 mb-2"><i class="pi pi-trash mr-2"></i>Direito de Apagamento</h4>
                                                    <p class="text-orange-800 m-0">Pode solicitar a eliminação dos seus dados pessoais.</p>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-purple-50">
                                                    <h4 class="text-purple-900 mb-2"><i class="pi pi-download mr-2"></i>Direito de Portabilidade</h4>
                                                    <p class="text-purple-800 m-0">Pode solicitar os seus dados num formato estruturado.</p>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-red-50">
                                                    <h4 class="text-red-900 mb-2"><i class="pi pi-times mr-2"></i>Direito de Oposição</h4>
                                                    <p class="text-red-800 m-0">Pode opor-se ao processamento dos seus dados para marketing.</p>
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6 mb-3">
                                                <div class="p-3 border-round bg-teal-50">
                                                    <h4 class="text-teal-900 mb-2"><i class="pi pi-pause mr-2"></i>Direito de Limitação</h4>
                                                    <p class="text-teal-800 m-0">Pode solicitar a limitação do processamento dos seus dados.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="mt-4 p-3 bg-blue-50 border-round">
                                            <h4 class="text-blue-900 mb-2">Como Exercer os Seus Direitos</h4>
                                            <p class="text-blue-800 mb-2">Para exercer qualquer destes direitos, pode contactar-nos através de:</p>
                                            <ul class="text-blue-800 mb-0 pl-4">
                                                <li>Email: privacidade@mticket.co.ao</li>
                                                <li>Telefone: (+244) 923 000 000</li>
                                                <li>Formulário de contacto no website</li>
                                            </ul>
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Segurança e Cookies">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Segurança dos Dados</h3>
                                        
                                        <h4 class="text-800 mb-2">Medidas de Segurança</h4>
                                        <ul class="mb-4 pl-4">
                                            <li>Encriptação SSL/TLS para todas as transmissões</li>
                                            <li>Servidores seguros com certificação ISO 27001</li>
                                            <li>Controlo de acesso rigoroso aos dados</li>
                                            <li>Monitorização contínua de segurança</li>
                                            <li>Backups regulares e seguros</li>
                                        </ul>

                                        <h4 class="text-800 mb-2">Retenção de Dados</h4>
                                        <p class="mb-4">
                                            Conservamos os seus dados apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados ou conforme exigido por lei. Dados de faturação são mantidos por períodos fiscais
                                            obrigatórios.
                                        </p>

                                        <Divider />

                                        <h3 class="text-900 mb-3">Política de Cookies</h3>
                                        
                                        <h4 class="text-800 mb-2">O que são Cookies</h4>
                                        <p class="mb-4">Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita o nosso website. Ajudam-nos a melhorar a sua experiência e fornecer serviços personalizados.</p>

                                        <h4 class="text-800 mb-2">Tipos de Cookies que Utilizamos</h4>
                                        
                                        <div class="grid mt-3">
                                            <div class="col-12 md:col-6 mb-3">
                                                <Panel header="Cookies Essenciais" :toggleable="true">
                                                    <p>Necessários para o funcionamento básico do website, incluindo segurança e navegação.</p>
                                                </Panel>
                                            </div>
                                            
                                            <div class="col-12 md:col-6 mb-3">
                                                <Panel header="Cookies de Performance" :toggleable="true">
                                                    <p>Coletam informações sobre como os visitantes utilizam o site para melhorarmos o desempenho.</p>
                                                </Panel>
                                            </div>
                                            
                                            <div class="col-12 md:col-6 mb-3">
                                                <Panel header="Cookies de Funcionalidade" :toggleable="true">
                                                    <p>Permitem que o website se lembre das suas escolhas e forneça funcionalidades melhoradas.</p>
                                                </Panel>
                                            </div>
                                            
                                            <div class="col-12 md:col-6 mb-3">
                                                <Panel header="Cookies de Marketing" :toggleable="true">
                                                    <p>Utilizados para entregar anúncios mais relevantes para si e para medir a eficácia das campanhas.</p>
                                                </Panel>
                                            </div>
                                        </div>

                                        <div class="mt-4 p-3 bg-yellow-50 border-round">
                                            <p class="m-0 text-yellow-800">
                                                <i class="pi pi-info-circle mr-2"></i>
                                                <strong>Gestão de Cookies:</strong> Pode gerir as suas preferências de cookies através das definições do seu navegador ou através do nosso centro de preferências.
                                            </p>
                                        </div>
                                    </div>
                                </TabPanel>

                                <TabPanel header="Contactos">
                                    <div class="line-height-3">
                                        <h3 class="text-900 mb-3">Contacte-nos</h3>
                                        
                                        <div class="grid">
                                            <div class="col-12 md:col-6">
                                                <Card>
                                                    <template #title>
                                                        <div class="flex align-items-center">
                                                            <i class="pi pi-shield text-2xl mr-3 text-blue-500"></i>
                                                            <span>Proteção de Dados</span>
                                                        </div>
                                                    </template>
                                                    <template #content>
                                                        <p class="mb-2"><strong>Email:</strong> privacidade@mticket.co.ao</p>
                                                        <p class="mb-2"><strong>Telefone:</strong> (+244) 923 000 000</p>
                                                        <p class="mb-0">Para questões relacionadas com privacidade e proteção de dados.</p>
                                                    </template>
                                                </Card>
                                            </div>
                                            
                                            <div class="col-12 md:col-6">
                                                <Card>
                                                    <template #title>
                                                        <div class="flex align-items-center">
                                                            <i class="pi pi-headphones text-2xl mr-3 text-green-500"></i>
                                                            <span>Suporte Geral</span>
                                                        </div>
                                                    </template>
                                                    <template #content>
                                                        <p class="mb-2"><strong>Email:</strong> suporte@mticket.co.ao</p>
                                                        <p class="mb-2"><strong>Telefone:</strong> (+244) 923 000 001</p>
                                                        <p class="mb-0">Para questões gerais e suporte técnico.</p>
                                                    </template>
                                                </Card>
                                            </div>
                                        </div>

                                        <div class="mt-4">
                                            <h4 class="text-800 mb-3">Endereço Postal</h4>
                                            <div class="p-3 bg-gray-50 border-round">
                                                <p class="mb-1"><strong>Mticket, Lda.</strong></p>
                                                <p class="mb-1">Rua Principal, Nº 123</p>
                                                <p class="mb-1">Luanda, Angola</p>
                                                <p class="mb-0">CP: 1000-001</p>
                                            </div>
                                        </div>

                                        <div class="mt-4">
                                            <h4 class="text-800 mb-3">Horários de Atendimento</h4>
                                            <div class="p-3 bg-blue-50 border-round">
                                                <p class="mb-1"><strong>Segunda a Sexta:</strong> 08:00 - 18:00</p>
                                                <p class="mb-1"><strong>Sábado:</strong> 09:00 - 13:00</p>
                                                <p class="mb-0"><strong>Domingo:</strong> Fechado</p>
                                            </div>
                                        </div>

                                        <Divider />

                                        <h3 class="text-900 mb-3">Alterações a Esta Política</h3>
                                        <p class="mb-3">Podemos atualizar esta política de privacidade periodicamente para refletir alterações nos nossos serviços ou requisitos legais. Notificaremos sobre alterações significativas através de:</p>
                                        <ul class="mb-4 pl-4">
                                            <li>Email para utilizadores registados</li>
                                            <li>Notificação no website</li>
                                            <li>Notificação na aplicação móvel</li>
                                        </ul>

                                        <div class="mt-4 p-3 bg-green-50 border-round">
                                            <p class="m-0 text-green-800">
                                                <i class="pi pi-check-circle mr-2"></i>
                                                <strong>Compromisso:</strong> Estamos empenhados em proteger a sua privacidade e em ser transparentes sobre como utilizamos os seus dados.
                                            </p>
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabView>
                        </div>

                        <!-- Back Button -->
                        <div class="text-center mt-6">
                            <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-outlined" @click="goBackUsingBack()" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
