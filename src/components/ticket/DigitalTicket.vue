<script setup>
import { computed } from 'vue';
import moment from 'moment';
import QrcodeVue from 'qrcode.vue';
import { storageURL, baseURL } from '@/service/ApiConstant';

const props = defineProps({
    event: { type: Object, default: null },
    image: { type: String, default: '' },
    code: { type: String, default: '—' },
    qrValue: { type: String, default: '' },
    typeName: { type: String, default: '—' },
    buyerName: { type: String, default: '—' },
    price: { type: [String, Number], default: 0 },
    status: { type: [String, Number], default: 'valid' }
});

const normalizeTicketStatus = (status) => {
    const key = status === 0 || status === '0' ? 'used' : String(status ?? 'valid').toLowerCase();
    if (key === 'used' || key === 'expired' || key === 'cancelled' || key === 'canceled') {
        return key === 'canceled' ? 'cancelled' : key;
    }
    return 'valid';
};

const PT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const mediaUrl = (value) => {
    if (!value) return '';
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    let path = value;
    if (value.startsWith('http://') || value.startsWith('https://')) {
        const marker = '/storage/';
        const idx = value.indexOf(marker);
        if (idx === -1) return value;
        path = value.slice(idx + marker.length);
    }
    path = String(path).replace(/^\/+/, '');
    return `${baseURL}/media/${path.split('/').filter(Boolean).map(encodeURIComponent).join('/')}`;
};

const imageSrc = computed(() => {
    if (props.image) {
        return props.image.startsWith('data:') || props.image.startsWith('blob:')
            ? props.image
            : mediaUrl(props.image.startsWith('http') ? props.image : storageURL + props.image);
    }
    if (!props.event?.image) return '';
    return mediaUrl(storageURL + props.event.image);
});

const eventImageStyle = computed(() => {
    if (!imageSrc.value) return {};
    return { '--event-image': `url("${imageSrc.value}")` };
});

const formatTicketDate = (date) => {
    if (!date) return '—';
    const parsed = moment(date);
    if (!parsed.isValid()) return '—';
    return `${parsed.format('DD')} ${PT_MONTHS[parsed.month()]} ${parsed.format('YYYY')}`;
};

const formatTicketTime = (evt) => {
    if (!evt?.start_time) return '—';
    const start = moment(evt.start_time, 'HH:mm:ss').format('HH:mm');
    if (!evt.end_time) return start;
    return `${start} – ${moment(evt.end_time, 'HH:mm:ss').format('HH:mm')}`;
};

const ticketLocation = (evt) => {
    if (!evt) return 'Local a anunciar';
    const parts = [evt.address, evt.city?.name, evt.province?.name, 'Moçambique'].filter(Boolean);
    return parts.join(', ');
};

const formatMoney = (value) =>
    typeof value === 'string' && value.includes('MT')
        ? value
        : `${Number(value || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MT`;

const statusMeta = computed(() => {
    const key = normalizeTicketStatus(props.status);
    if (key === 'used') return { label: 'BILHETE UTILIZADO', className: 'used' };
    if (key === 'expired') return { label: 'BILHETE EXPIRADO', className: 'expired' };
    if (key === 'cancelled') return { label: 'BILHETE CANCELADO', className: 'cancelled' };
    return { label: 'BILHETE VÁLIDO', className: '' };
});
</script>

<template>
    <article class="ticket">
        <div class="ticket-image" :style="eventImageStyle">
            <img v-if="imageSrc" class="ticket-image__photo" :src="imageSrc" alt="" />
            <div class="brand-mark"><span class="dot"></span>MTicket</div>
            <div class="event-title">
                <h1>{{ event?.name }}</h1>
            </div>
        </div>

        <div class="perforation left">
            <span></span><span></span><span></span><span></span><span></span>
        </div>

        <div class="ticket-info">
            <div class="mticket-logo">
                <div class="logo-icon">M</div>
                <div class="logo-text">M<span>Ticket</span></div>
            </div>
            <div class="mticket-slogan">Crie Momentos e Aproxime Pessoas.</div>

            <div class="event-heading">
                <div class="eyebrow">EVENTO</div>
                <h2>{{ event?.name }}</h2>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">📅 Data</div>
                    <div class="info-value">{{ formatTicketDate(event?.start_date) }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">🕐 Hora</div>
                    <div class="info-value">{{ formatTicketTime(event) }}</div>
                </div>
                <div class="info-item full-width">
                    <div class="info-label">📍 Local</div>
                    <div class="info-value">{{ ticketLocation(event) }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">🎟 Tipo de bilhete</div>
                    <div class="info-value">{{ typeName || '—' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">👤 Comprador</div>
                    <div class="info-value">{{ buyerName || '—' }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">💰 Preço</div>
                    <div class="info-value">{{ formatMoney(price) }}</div>
                </div>
                <div class="info-item">
                    <span class="status-badge" :class="statusMeta.className">
                        <span class="status-dot"></span>
                        {{ statusMeta.label }}
                    </span>
                </div>
            </div>
        </div>

        <div class="dashed-divider"></div>
        <div class="perforation right">
            <span></span><span></span><span></span><span></span><span></span>
        </div>

        <div class="ticket-qr">
            <div class="qr-caption">CÓDIGO DO BILHETE</div>
            <div class="qr-code-id">{{ code }}</div>
            <div class="qr-box">
                <qrcode-vue :value="qrValue" :size="132" level="H" render-as="svg" />
            </div>
            <div class="qr-instruction">APONTE O QR CODE NA ENTRADA</div>
            <div class="qr-subtext">Bilhete digital<br />Apresente o QR Code na entrada</div>
        </div>
    </article>
</template>

<style scoped>
.ticket {
    --mt-blue: #08a9e6;
    --mt-blue-dark: #0678a8;
    --mt-navy: #0a2540;
    --mt-text-secondary: #5b6472;
    --mt-white: #ffffff;
    --mt-line: #e3e9ef;
    --shadow-soft: 0 20px 45px rgba(10, 37, 64, 0.14);
    --radius-lg: 26px;
    --ticket-page-bg: #eaf3f9;
    position: relative;
    display: flex;
    width: 100%;
    background: var(--mt-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
    isolation: isolate;
    color: var(--mt-navy);
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.perforation {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 26px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    pointer-events: none;
}

.perforation span {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--ticket-page-bg, #eaf3f9);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.perforation.left {
    left: -13px;
}

.perforation.right {
    right: -13px;
}

.dashed-divider {
    position: absolute;
    top: 18px;
    bottom: 18px;
    right: 24%;
    width: 0;
    border-left: 2px dashed #c9d8e4;
    z-index: 3;
}

.ticket-image {
    position: relative;
    flex: 0 0 30%;
    min-height: 280px;
    background-color: var(--mt-navy);
    background-image: var(--event-image, none);
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 26px 22px;
}

.ticket-image::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(165deg, rgba(8, 169, 230, 0.55) 0%, rgba(10, 37, 64, 0.78) 100%);
    z-index: 1;
}

.ticket-image__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.ticket-image > *:not(.ticket-image__photo) {
    position: relative;
    z-index: 2;
}

.ticket-image .brand-mark {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--mt-white);
    display: flex;
    align-items: center;
    gap: 8px;
}

.ticket-image .brand-mark .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mt-white);
}

.ticket-image .event-title h1 {
    margin: 0;
    font-size: 26px;
    line-height: 1.18;
    font-weight: 800;
    color: var(--mt-white);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.ticket-info {
    flex: 1 1 46%;
    padding: 30px 34px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.mticket-logo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.mticket-logo .logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--mt-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 15px;
}

.mticket-logo .logo-text {
    font-size: 19px;
    font-weight: 800;
    color: var(--mt-navy);
}

.mticket-logo .logo-text span {
    color: var(--mt-blue);
}

.mticket-slogan {
    font-size: 12px;
    color: var(--mt-text-secondary);
    font-style: italic;
    margin-top: -10px;
}

.event-heading .eyebrow {
    font-size: 11px;
    font-weight: 700;
    color: var(--mt-blue);
    letter-spacing: 1px;
}

.event-heading h2 {
    margin: 4px 0 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--mt-navy);
    line-height: 1.3;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 20px;
    padding-top: 6px;
    border-top: 1px dashed var(--mt-line);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-item .info-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--mt-text-secondary);
}

.info-item .info-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--mt-navy);
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: #e7f8ee;
    color: #159a52;
}

.status-badge .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
}

.status-badge.used {
    background: #efefef;
    color: #6b7280;
}

.status-badge.expired,
.status-badge.cancelled {
    background: #fdebeb;
    color: #d94141;
}

.ticket-qr {
    flex: 0 0 24%;
    background-image: linear-gradient(160deg, var(--mt-blue) 0%, var(--mt-blue-dark) 100%);
    padding: 28px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    color: #fff;
}

.ticket-qr .qr-caption {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    opacity: 0.85;
}

.ticket-qr .qr-code-id {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.5px;
    word-break: break-all;
}

.qr-box {
    background: #fff;
    padding: 10px;
    border-radius: 14px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.qr-box :deep(svg),
.qr-box :deep(canvas),
.qr-box :deep(img) {
    display: block;
}

.qr-instruction {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.qr-subtext {
    font-size: 11px;
    opacity: 0.85;
    line-height: 1.4;
}

@media (max-width: 800px) {
    .ticket {
        flex-direction: column;
    }

    .ticket-image {
        flex: 0 0 220px;
        min-height: 220px;
    }

    .ticket-info {
        padding: 26px 24px;
    }

    .ticket-qr {
        flex: 1 1 auto;
        padding: 30px 24px;
    }

    .dashed-divider,
    .perforation {
        display: none;
    }
}

@media (max-width: 480px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}

.ticket.exporting {
    flex-direction: row !important;
    width: 980px !important;
    max-width: 980px !important;
    box-shadow: none;
}

.ticket.exporting .ticket-image {
    flex: 0 0 30%;
    min-height: 280px;
    background-size: cover !important;
    background-position: center !important;
}

.ticket.exporting .ticket-info {
    padding: 30px 34px;
}

.ticket.exporting .ticket-qr {
    flex: 0 0 24%;
    padding: 28px 18px;
}

.ticket.exporting .dashed-divider {
    display: block !important;
}

.ticket.exporting .perforation {
    display: flex !important;
}

.ticket.exporting .perforation span {
    background: #ffffff;
}

.ticket.exporting .info-grid {
    grid-template-columns: 1fr 1fr;
}
</style>
