<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);

const isLoggedIn = computed(() => !!user.value);
const isPromotor = computed(() => Number(user.value?.is_promotor) === 1);

const primaryCtaLabel = computed(() => {
    if (isPromotor.value) return 'Criar evento';
    if (isLoggedIn.value) return 'Ir ao perfil';
    return 'Criar conta de promotor';
});

const goPrimary = () => {
    if (isPromotor.value) {
        router.push('/promotor/eventos/create');
        return;
    }
    if (isLoggedIn.value) {
        router.push('/perfil');
        return;
    }
    router.push('/register');
};

const goSecondary = () => {
    if (isPromotor.value) {
        router.push('/promotor/dashboard');
        return;
    }
    router.push('/login');
};

const benefits = [
    {
        icon: 'pi pi-calendar-plus',
        title: 'Cria e publica',
        text: 'Monta o evento, define bilhetes e publica em minutos.'
    },
    {
        icon: 'pi pi-credit-card',
        title: 'Vende online',
        text: 'Recebe pagamentos M-Pesa e entrega bilhetes por email e WhatsApp.'
    },
    {
        icon: 'pi pi-qrcode',
        title: 'Controla a entrada',
        text: 'Check-in com QR Code e acompanhamento em tempo real.'
    },
    {
        icon: 'pi pi-chart-bar',
        title: 'Acompanha resultados',
        text: 'Vê vendas, bilhetes e desempenho no painel do promotor.'
    }
];

const steps = [
    {
        step: '01',
        title: 'Cria a tua conta',
        text: 'Regista-te como promotor e configura o perfil da empresa.'
    },
    {
        step: '02',
        title: 'Publica o evento',
        text: 'Adiciona imagem, data, local, bilhetes e line-up.'
    },
    {
        step: '03',
        title: 'Vende e gere',
        text: 'Partilha o link, acompanha vendas e faz o check-in no dia.'
    }
];

const formats = [
    { icon: 'pi pi-microphone', label: 'Shows e concertos' },
    { icon: 'pi pi-users', label: 'Festas e festivais' },
    { icon: 'pi pi-briefcase', label: 'Conferências' },
    { icon: 'pi pi-heart', label: 'Eventos culturais' },
    { icon: 'pi pi-sitemap', label: 'Eventos empresariais' },
    { icon: 'pi pi-star', label: 'Experiências digitais' }
];

onMounted(() => {
    user.value = JSON.parse(localStorage.getItem('user'));
});
</script>

<template>
    <div class="promotor-page">
        <section class="promotor-hero">
            <div class="promotor-hero__veil" />
            <div class="promotor-hero__content px-4 lg:px-8 mx-0 lg:mx-8">
                <p class="promotor-hero__brand">MTICKET</p>
                <h1 class="promotor-hero__title">Produz eventos com bilheteira completa</h1>
                <p class="promotor-hero__subtitle">
                    Cria, vende e gere ingressos numa só plataforma — do anúncio ao check-in.
                </p>
                <div class="promotor-hero__actions">
                    <Button
                        :label="primaryCtaLabel"
                        class="p-button-rounded border-none font-medium text-white bg-blue-500"
                        @click="goPrimary"
                    />
                    <Button
                        :label="isPromotor ? 'Abrir painel' : 'Já tenho conta'"
                        class="p-button-rounded p-button-outlined border-none font-medium text-white promotor-hero__ghost"
                        @click="goSecondary"
                    />
                </div>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-5">
            <div class="section-head">
                <h2 class="section-title">Tudo o que precisas para promover</h2>
                <p class="section-subtitle">Ferramentas simples para vender mais e organizar melhor.</p>
            </div>

            <div class="benefits-grid">
                <article v-for="item in benefits" :key="item.title" class="benefit-item">
                    <div class="benefit-item__icon">
                        <i :class="item.icon" />
                    </div>
                    <h3 class="benefit-item__title">{{ item.title }}</h3>
                    <p class="benefit-item__text">{{ item.text }}</p>
                </article>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="section-head">
                <h2 class="section-title">Como funciona</h2>
                <p class="section-subtitle">Três passos para começares a vender.</p>
            </div>

            <div class="steps-grid">
                <article v-for="item in steps" :key="item.step" class="step-item">
                    <span class="step-item__number">{{ item.step }}</span>
                    <h3 class="step-item__title">{{ item.title }}</h3>
                    <p class="step-item__text">{{ item.text }}</p>
                </article>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 py-4">
            <div class="section-head">
                <h2 class="section-title">Vários formatos, um só lugar</h2>
                <p class="section-subtitle">Alcance o teu público a partir da Mticket.</p>
            </div>

            <div class="formats-grid">
                <div v-for="item in formats" :key="item.label" class="format-item">
                    <i :class="item.icon" />
                    <span>{{ item.label }}</span>
                </div>
            </div>
        </section>

        <section class="px-4 lg:px-8 mx-0 lg:mx-8 pb-6">
            <div class="promotor-cta">
                <div>
                    <h2 class="promotor-cta__title">Pronto para ser promotor?</h2>
                    <p class="promotor-cta__text">
                        Entra com a tua conta Mticket e começa a publicar eventos com bilheteira, check-in e relatórios.
                    </p>
                </div>
                <div class="promotor-cta__actions">
                    <Button
                        :label="primaryCtaLabel"
                        class="p-button-rounded border-none font-medium text-white bg-blue-500 white-space-nowrap"
                        @click="goPrimary"
                    />
                    <router-link to="/eventos">
                        <Button label="Ver eventos" class="p-button-rounded p-button-outlined white-space-nowrap" />
                    </router-link>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.promotor-hero {
    position: relative;
    min-height: min(68vh, 32rem);
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background: linear-gradient(135deg, #0b3d91 0%, #1e6fe3 55%, #4f9cf8 100%);
    animation: hero-fade 0.65s ease-out;
}

.promotor-hero__veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(8, 28, 68, 0.15) 0%, rgba(8, 28, 68, 0.45) 100%);
}

.promotor-hero__content {
    position: relative;
    z-index: 1;
    width: 100%;
    padding-top: 4.5rem;
    padding-bottom: 3.25rem;
}

.promotor-hero__brand {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(2.4rem, 6vw, 4.25rem);
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1;
    animation: rise-in 0.65s ease-out both;
}

.promotor-hero__title {
    margin: 0 0 0.75rem;
    color: #fff;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 500;
    max-width: 18ch;
    line-height: 1.2;
    animation: rise-in 0.75s ease-out 0.08s both;
}

.promotor-hero__subtitle {
    margin: 0 0 1.75rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.125rem;
    line-height: 1.5;
    max-width: 34rem;
    animation: rise-in 0.75s ease-out 0.16s both;
}

.promotor-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    animation: rise-in 0.75s ease-out 0.24s both;
}

.promotor-hero__ghost {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.65) !important;
}

.section-head {
    margin-bottom: 1.75rem;
    max-width: 40rem;
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
    line-height: 1.5;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.benefit-item {
    padding: 1.25rem 1.1rem;
    border-top: 2px solid #2563eb;
}

.benefit-item__icon {
    width: 2.5rem;
    height: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.85rem;
    color: #2563eb;
    font-size: 1.35rem;
}

.benefit-item__title {
    margin: 0 0 0.4rem;
    color: #0f172a;
    font-size: 1.15rem;
}

.benefit-item__text {
    margin: 0;
    color: #64748b;
    line-height: 1.5;
}

.steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
}

.step-item {
    padding: 0.25rem 0;
}

.step-item__number {
    display: block;
    margin-bottom: 0.65rem;
    color: #2563eb;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.04em;
}

.step-item__title {
    margin: 0 0 0.4rem;
    color: #0f172a;
    font-size: 1.2rem;
}

.step-item__text {
    margin: 0;
    color: #64748b;
    line-height: 1.5;
}

.formats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
}

.format-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--surface-border);
    border-radius: 0.9rem;
    color: #1e293b;
    background: var(--surface-0);
    transition: transform 0.25s ease, border-color 0.25s ease;
}

.format-item:hover {
    transform: translateY(-2px);
    border-color: #93c5fd;
}

.format-item i {
    color: #2563eb;
    font-size: 1.2rem;
}

.promotor-cta {
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

.promotor-cta__title {
    margin: 0 0 0.5rem;
    color: #0f172a;
    font-size: 1.5rem;
}

.promotor-cta__text {
    margin: 0;
    color: #334155;
    font-size: 1.1rem;
    max-width: 36rem;
    line-height: 1.5;
}

.promotor-cta__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
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
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 991px) {
    .benefits-grid,
    .steps-grid,
    .formats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .promotor-hero {
        min-height: 24rem;
    }

    .benefits-grid,
    .steps-grid,
    .formats-grid {
        grid-template-columns: 1fr;
    }

    .promotor-cta {
        padding: 1.5rem;
    }
}
</style>
