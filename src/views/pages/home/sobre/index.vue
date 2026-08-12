<script setup>
const highlights = [
    {
        icon: 'pi pi-ticket',
        title: 'Bilheteira online',
        text: 'Criação, venda e entrega de bilhetes num único fluxo, do anúncio à entrada.'
    },
    {
        icon: 'pi pi-credit-card',
        title: 'Pagamento M-Pesa',
        text: 'Compras confirmadas no telemóvel, sem filas nem dinheiro à porta.'
    },
    {
        icon: 'pi pi-qrcode',
        title: 'Entrada com QR Code',
        text: 'Cada bilhete tem um código único, validado na portaria em segundos.'
    },
    {
        icon: 'pi pi-wallet',
        title: 'Cashless no evento',
        text: 'Pulseiras recarregáveis para consumo rápido dentro do recinto.'
    }
];

const audiences = [
    {
        icon: 'pi pi-users',
        title: 'Para quem vai ao evento',
        points: [
            'Descobre eventos por categoria, cidade e data',
            'Compra bilhetes em poucos passos',
            'Recebe o bilhete por email e WhatsApp',
            'Consulta o histórico em Meus Bilhetes'
        ],
        to: '/eventos',
        cta: 'Explorar eventos'
    },
    {
        icon: 'pi pi-megaphone',
        title: 'Para promotores',
        points: [
            'Publica eventos com bilhetes e line-up',
            'Acompanha vendas em tempo real',
            'Faz check-in com leitura de QR Code',
            'Gere bares, protocolos e relatórios'
        ],
        to: '/ser-promotor',
        cta: 'Ser promotor'
    }
];

const values = [
    {
        icon: 'pi pi-shield',
        title: 'Confiança',
        text: 'Bilhetes válidos só quando comprados na plataforma, com códigos únicos e rastreáveis.'
    },
    {
        icon: 'pi pi-bolt',
        title: 'Simplicidade',
        text: 'Menos passos para comprar e menos trabalho para organizar.'
    },
    {
        icon: 'pi pi-map',
        title: 'Proximidade',
        text: 'Feito para o contexto moçambicano, com meios de pagamento locais.'
    }
];
</script>

<template>
    <div class="about-page">
        <section class="about-hero">
            <div class="about-hero__veil" />
            <div class="about-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="about-hero__eyebrow">Sobre nós</p>
                <h1 class="about-hero__title">A plataforma de bilhetes de Moçambique</h1>
                <p class="about-hero__subtitle">
                    A Mticket liga quem organiza eventos a quem quer estar lá — com bilheteira online, pagamentos
                    M-Pesa e entrada por QR Code.
                </p>
                <div class="about-hero__actions">
                    <router-link to="/eventos">
                        <Button label="Explorar eventos" class="p-button-rounded border-none font-medium text-white bg-blue-500" />
                    </router-link>
                    <router-link to="/ser-promotor">
                        <Button label="Ser promotor" class="p-button-rounded p-button-outlined border-none font-medium text-white about-hero__ghost" />
                    </router-link>
                </div>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-5">
            <div class="section-head">
                <h2 class="section-title">A nossa missão</h2>
                <p class="section-subtitle">
                    Tornar simples descobrir, comprar e organizar eventos. Queremos que o bilhete deixe de ser um
                    problema — para quem compra e para quem promove.
                </p>
            </div>

            <div class="highlight-grid">
                <article v-for="item in highlights" :key="item.title" class="highlight-item">
                    <div class="highlight-item__icon">
                        <i :class="item.icon" />
                    </div>
                    <h3 class="highlight-item__title">{{ item.title }}</h3>
                    <p class="highlight-item__text">{{ item.text }}</p>
                </article>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="section-head">
                <h2 class="section-title">Para quem é a Mticket</h2>
                <p class="section-subtitle">Uma plataforma, dois lados da mesma experiência.</p>
            </div>

            <div class="audience-grid">
                <article v-for="item in audiences" :key="item.title" class="audience-card">
                    <div class="audience-card__icon">
                        <i :class="item.icon" />
                    </div>
                    <h3 class="audience-card__title">{{ item.title }}</h3>
                    <ul class="audience-card__list">
                        <li v-for="point in item.points" :key="point">
                            <i class="pi pi-check" />
                            {{ point }}
                        </li>
                    </ul>
                    <router-link :to="item.to">
                        <Button :label="item.cta" class="p-button-rounded p-button-outlined" />
                    </router-link>
                </article>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="section-head">
                <h2 class="section-title">O que nos guia</h2>
                <p class="section-subtitle">Princípios que definem como construímos o produto.</p>
            </div>

            <div class="values-grid">
                <article v-for="item in values" :key="item.title" class="value-item">
                    <i :class="item.icon" />
                    <div>
                        <h3 class="value-item__title">{{ item.title }}</h3>
                        <p class="value-item__text">{{ item.text }}</p>
                    </div>
                </article>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 pb-6">
            <div class="about-cta">
                <div>
                    <h2 class="about-cta__title">Precisas de ajuda?</h2>
                    <p class="about-cta__text">
                        A nossa equipa de suporte responde a dúvidas sobre bilhetes, pagamentos e eventos.
                    </p>
                    <div class="about-cta__contacts">
                        <a href="mailto:suporte@mticket.co.mz"><i class="pi pi-envelope mr-2" />suporte@mticket.co.mz</a>
                        <a href="tel:+258842280974"><i class="pi pi-phone mr-2" />+258 842280974</a>
                    </div>
                </div>
                <router-link to="/faq">
                    <Button label="Ver perguntas frequentes" class="p-button-rounded border-none font-medium text-white bg-blue-500 white-space-nowrap" />
                </router-link>
            </div>
        </section>
    </div>
</template>

<style scoped>
.about-hero {
    position: relative;
    overflow: hidden;
    background-color: #0b3d91;
    background-image: url('/demo/images/mticket.jpg');
    background-size: cover;
    background-position: center;
    animation: hero-fade 0.6s ease-out;
}

.about-hero__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(11, 61, 145, 0.92) 0%, rgba(30, 111, 227, 0.86) 55%, rgba(79, 156, 248, 0.8) 100%);
}

.about-hero__content {
    position: relative;
    z-index: 1;
    padding-top: 3.25rem;
    padding-bottom: 3rem;
}

.about-hero__eyebrow {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: rise-in 0.6s ease-out both;
}

.about-hero__title {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1.15;
    max-width: 20ch;
    animation: rise-in 0.65s ease-out 0.06s both;
}

.about-hero__subtitle {
    margin: 0 0 1.75rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    line-height: 1.55;
    max-width: 40rem;
    animation: rise-in 0.65s ease-out 0.12s both;
}

.about-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    animation: rise-in 0.65s ease-out 0.18s both;
}

.about-hero__ghost {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.65) !important;
}

.section-head {
    margin-bottom: 1.75rem;
    max-width: 44rem;
}

.section-title {
    margin: 0 0 0.5rem;
    color: #0f172a;
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    font-weight: 600;
}

.section-subtitle {
    margin: 0;
    color: #64748b;
    font-size: 1.1rem;
    line-height: 1.55;
}

.highlight-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.highlight-item {
    padding: 1.25rem 1.1rem;
    border-top: 2px solid #2563eb;
}

.highlight-item__icon {
    margin-bottom: 0.75rem;
    color: #2563eb;
    font-size: 1.35rem;
}

.highlight-item__title {
    margin: 0 0 0.4rem;
    color: #0f172a;
    font-size: 1.15rem;
}

.highlight-item__text {
    margin: 0;
    color: #64748b;
    line-height: 1.5;
}

.audience-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.audience-card {
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.35rem;
    background: var(--surface-0);
}

.audience-card__icon {
    color: #2563eb;
    font-size: 1.5rem;
    margin-bottom: 0.6rem;
}

.audience-card__title {
    margin: 0 0 0.85rem;
    color: #0f172a;
    font-size: 1.25rem;
}

.audience-card__list {
    list-style: none;
    margin: 0 0 1.15rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    color: #475569;
}

.audience-card__list li {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    line-height: 1.45;
}

.audience-card__list i {
    color: #16a34a;
    margin-top: 0.25rem;
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
}

.value-item {
    display: flex;
    gap: 0.85rem;
    padding: 1.1rem;
    border: 1px solid var(--surface-border);
    border-radius: 0.9rem;
    background: var(--surface-0);
}

.value-item i {
    color: #2563eb;
    font-size: 1.3rem;
    margin-top: 0.2rem;
}

.value-item__title {
    margin: 0 0 0.3rem;
    color: #0f172a;
    font-size: 1.1rem;
}

.value-item__text {
    margin: 0;
    color: #64748b;
    line-height: 1.5;
}

.about-cta {
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

.about-cta__title {
    margin: 0 0 0.5rem;
    color: #0f172a;
    font-size: 1.5rem;
}

.about-cta__text {
    margin: 0 0 0.85rem;
    color: #334155;
    font-size: 1.05rem;
    max-width: 36rem;
    line-height: 1.5;
}

.about-cta__contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
}

.about-cta__contacts a {
    color: #1d4ed8;
    font-weight: 600;
    text-decoration: none;
}

.about-cta__contacts a:hover {
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

@keyframes rise-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 991px) {
    .highlight-grid,
    .values-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .audience-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .highlight-grid,
    .values-grid {
        grid-template-columns: 1fr;
    }

    .about-cta {
        padding: 1.5rem;
    }
}
</style>
