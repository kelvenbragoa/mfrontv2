<script setup>
import { computed } from 'vue';
import moment from 'moment';
import QrcodeVue from 'qrcode.vue';
import { storageURL } from '@/service/ApiConstant';

const MTICKET_LOGO = '/demo/images/mticketlogo.png';

const props = defineProps({
    event: { type: Object, default: null },
    code: { type: String, default: '—' },
    qrValue: { type: String, default: '' },
    typeName: { type: String, default: '—' },
    price: { type: [String, Number], default: 0 }
});

const PT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const PT_WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const promoterName = computed(() => {
    const user = props.event?.user;
    return user?.company_name || user?.name || 'MTicket';
});

const promoterLogo = computed(() => {
    const path = String(props.event?.user?.image || '').trim();
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    return storageURL + path.replace(/^\/+/, '');
});

const eventName = computed(() => props.event?.name || '—');

const dateParts = computed(() => {
    const parsed = props.event?.start_date ? moment(props.event.start_date) : null;
    if (!parsed?.isValid()) {
        return { value: '—', sub: '' };
    }
    return {
        value: `${parsed.format('DD')} ${PT_MONTHS[parsed.month()]} ${parsed.format('YYYY')}`,
        sub: PT_WEEKDAYS[parsed.day()]
    };
});

const timeLabel = computed(() => {
    if (!props.event?.start_time) return '—';
    return moment(props.event.start_time, 'HH:mm:ss').format('HH:mm');
});

const locationMain = computed(() => props.event?.address || props.event?.city?.name || 'Local a anunciar');

const locationSub = computed(() => {
    const parts = [props.event?.city?.name, props.event?.province?.name, 'Moçambique'].filter(Boolean);
    return parts.join(', ');
});

const edition = computed(() => {
    const year = props.event?.start_date ? moment(props.event.start_date).format('YYYY') : '';
    const place = props.event?.city?.name || props.event?.province?.name || '';
    return [place, year].filter(Boolean).join(' ') || '—';
});

const priceLabel = computed(() => {
    const value = props.price;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed.includes('MT') || Number.isNaN(Number(trimmed))) {
            return trimmed || '—';
        }
    }
    return `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
});
</script>

<template>
    <article class="thermal-ticket">
        <aside class="side">
            <div class="side-promo">
                <span class="lbl">Promotora</span>
                <div class="promo-box">
                    <img v-if="promoterLogo" class="thermal-promo-photo" :src="promoterLogo" alt="" />
                    <span v-else class="promo-name">{{ promoterName }}</span>
                </div>
            </div>
            <div class="side-bottom">
                <h2 class="side-name">{{ eventName }}</h2>
                <span class="side-edition">{{ edition }}</span>
                <span class="side-rule"></span>
                <span class="side-meta">BILHETE N.º</span>
                <span class="side-meta strong">{{ code }}</span>
                <span class="side-meta">www.mticket.co.mz</span>
            </div>
        </aside>

        <section class="main">
            <header class="brand">
                <img :src="MTICKET_LOGO" alt="MTicket" />
                <span class="slogan">Crie Momentos e Aproxime Pessoas.</span>
            </header>
            <div class="m-title">
                <span class="kicker">Evento</span>
                <h1 class="m-name">{{ eventName }}</h1>
            </div>
            <div class="m-rule"></div>
            <div class="fields">
                <div class="field">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round">
                            <rect x="3" y="5" width="18" height="16" rx="2.5" />
                            <path d="M3 10h18M8 2.5v5M16 2.5v5" stroke-linecap="round" />
                        </svg>
                        Data
                    </span>
                    <span class="val">{{ dateParts.value }}</span>
                    <span class="sub">{{ dateParts.sub }}</span>
                </div>
                <div class="field">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
                            <circle cx="12" cy="12" r="9.5" />
                            <path d="M12 6.5V12l4 2.5" />
                        </svg>
                        Hora
                    </span>
                    <span class="val">{{ timeLabel }}</span>
                    <span class="sub">Abertura</span>
                </div>
                <div class="field span-2">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 1.5a7.8 7.8 0 0 0-7.8 7.8c0 5.6 7.8 13.2 7.8 13.2s7.8-7.6 7.8-13.2A7.8 7.8 0 0 0 12 1.5Zm0 10.8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                        </svg>
                        Local
                    </span>
                    <span class="val">{{ locationMain }}</span>
                    <span class="sub">{{ locationSub }}</span>
                </div>
                <div class="field">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M2 6.5A1.5 1.5 0 0 1 3.5 5h17A1.5 1.5 0 0 1 22 6.5V9a3 3 0 0 0 0 6v2.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5V15a3 3 0 0 0 0-6Z" />
                        </svg>
                        Tipo de bilhete
                    </span>
                    <span class="val">{{ typeName || '—' }}</span>
                </div>
                <div class="field">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round">
                            <rect x="2.5" y="6" width="19" height="12" rx="2" />
                            <circle cx="12" cy="12" r="2.6" />
                        </svg>
                        Preço
                    </span>
                    <span class="val">{{ priceLabel }}</span>
                </div>
                <div class="field span-2">
                    <span class="lbl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round">
                            <path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6" />
                        </svg>
                        Promotora
                    </span>
                    <span class="val">{{ promoterName }}</span>
                </div>
            </div>
        </section>

        <aside class="stub">
            <div>
                <span class="stub-lbl">Código do bilhete</span>
                <div class="stub-code">{{ code }}</div>
            </div>
            <div class="qr-card">
                <qrcode-vue class="qr" :value="qrValue || code" :size="110" level="H" render-as="svg" />
            </div>
            <div>
                <div class="stub-cta">Aponte o QR Code<br />na entrada</div>
                <div class="stub-sub">Entrada única<br />Válido para um acesso</div>
            </div>
            <div class="seats">
                <div>
                    <span class="lbl">Secção</span>
                    <span class="val">—</span>
                </div>
                <div>
                    <span class="lbl">Assento</span>
                    <span class="val">—</span>
                </div>
            </div>
        </aside>
    </article>
</template>

<style scoped>
.thermal-ticket {
    --ink: #000;
    --paper: #fff;
    --ticket-w: 152.4mm;
    --ticket-h: 82.6mm;
    --side-w: 34mm;
    --stub-w: 44mm;
    --logo-h: 7mm;
    --pad: 4mm;
    width: var(--ticket-w);
    height: var(--ticket-h);
    background: var(--paper);
    color: var(--ink);
    display: flex;
    overflow: hidden;
    font-family: 'Montserrat', Arial, 'Helvetica Neue', Helvetica, sans-serif;
    font-weight: 700;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.lbl {
    display: flex;
    align-items: center;
    gap: 1mm;
    font-size: 5.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2pt;
    line-height: 1.2;
}

.lbl svg {
    width: 2.8mm;
    height: 2.8mm;
    flex: 0 0 2.8mm;
    color: #000;
}

.val {
    display: block;
    font-size: 10.5pt;
    font-weight: 900;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sub {
    display: block;
    font-size: 6pt;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.side {
    flex: 0 0 var(--side-w);
    width: var(--side-w);
    border-right: 0.5mm solid var(--ink);
    padding: var(--pad) 3.6mm 3.6mm var(--pad);
    display: flex;
    flex-direction: column;
    gap: 3mm;
    min-width: 0;
}

.side-promo {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5mm;
}

.promo-box {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.promo-box img {
    display: block;
    max-width: 100%;
    max-height: 28mm;
    object-fit: contain;
}

.promo-name {
    width: 100%;
    font-size: 11pt;
    font-weight: 800;
    line-height: 1.1;
    text-align: center;
    text-transform: uppercase;
}

.side-bottom {
    display: flex;
    flex-direction: column;
    gap: 1.2mm;
}

.side-name {
    margin: 0;
    font-size: 13pt;
    font-weight: 900;
    line-height: 1.02;
    text-transform: uppercase;
}

.side-edition {
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.4mm;
}

.side-rule {
    height: 0.35mm;
    background: var(--ink);
    width: 9mm;
    margin: 0.8mm 0 0.4mm;
}

.side-meta {
    font-size: 5.5pt;
    line-height: 1.35;
    font-weight: 700;
}

.side-meta.strong {
    font-size: 6.5pt;
    font-weight: 800;
}

.main {
    flex: 1 1 auto;
    min-width: 0;
    padding: var(--pad) 4.5mm 3.6mm 5mm;
    display: flex;
    flex-direction: column;
}

.brand img {
    display: block;
    height: var(--logo-h);
    width: auto;
    /* PNG a cores → preto sólido na BOCA térmica (como ticket (2).html) */
    filter: brightness(0);
}

.slogan {
    font-size: 5.5pt;
    font-weight: 700;
}

.m-title {
    margin-top: 2.6mm;
}

.kicker {
    display: block;
    font-size: 6pt;
    font-weight: 700;
    letter-spacing: 0.5mm;
    text-transform: uppercase;
}

.m-name {
    margin: 0.4mm 0 0;
    font-size: 14pt;
    font-weight: 900;
    text-transform: uppercase;
    line-height: 1.08;
}

.m-rule {
    height: 0.3mm;
    background: var(--ink);
    margin: 2mm 0 0;
}

.fields {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 4mm;
    row-gap: 1.2mm;
    align-content: space-evenly;
}

.field {
    min-width: 0;
}

.field.span-2 {
    grid-column: span 2;
}

.stub {
    flex: 0 0 var(--stub-w);
    width: var(--stub-w);
    border-left: 0.5mm dashed var(--ink);
    padding: var(--pad) 3.5mm 3.4mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    text-align: center;
}

.stub-lbl {
    font-size: 5.5pt;
    letter-spacing: 0.4mm;
    text-transform: uppercase;
    font-weight: 700;
}

.stub-code {
    font-size: 8pt;
    font-weight: 900;
    margin-top: 0.6mm;
    word-break: break-all;
}

.qr-card {
    border: 0.4mm solid var(--ink);
    border-radius: 2.2mm;
    padding: 1mm;
    line-height: 0;
    background: #fff;
}

.qr,
.qr :deep(svg) {
    display: block;
    width: 29mm;
    height: 29mm;
}

.stub-cta {
    font-size: 6.5pt;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 1.2;
}

.stub-sub {
    font-size: 5.5pt;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 0.4mm;
}

.seats {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 0.35mm solid var(--ink);
    padding-top: 1.2mm;
}

.seats > div + div {
    border-left: 0.35mm solid var(--ink);
}

.seats .lbl {
    justify-content: center;
    font-size: 5.3pt;
}

.seats .val {
    font-size: 11pt;
    text-align: center;
}
</style>
