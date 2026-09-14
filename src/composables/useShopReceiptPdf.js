import { ref } from 'vue';
import axios from 'axios';
import { baseURL } from '@/service/ApiConstant';

const filenameFromHeader = (header, fallback) => {
    const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(header || '');
    if (!match?.[1]) return fallback;
    try {
        return decodeURIComponent(match[1].replace(/"/g, ''));
    } catch {
        return match[1].replace(/"/g, '');
    }
};

const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const receiptErrorMessage = async (error, fallback = 'Não foi possível baixar o recibo.') => {
    const data = error?.response?.data;
    if (data instanceof Blob) {
        try {
            const payload = JSON.parse(await data.text());
            return payload.message || payload.error || fallback;
        } catch {
            return fallback;
        }
    }
    return error?.response?.data?.message || error?.response?.data?.error || fallback;
};

export function useShopReceiptPdf() {
    const downloadingId = ref(null);

    const saveResponse = (response, fallbackName) => {
        const filename = filenameFromHeader(response.headers?.['content-disposition'], fallbackName);
        triggerDownload(new Blob([response.data], { type: 'application/pdf' }), filename);
    };

    const downloadGuestReceipt = async (order) => {
        downloadingId.value = order.id;
        try {
            const response = await axios.post(
                `${baseURL}/shop-checkout/recibo`,
                { id: order.id, qrcode: order.qrcode },
                { responseType: 'blob' }
            );
            saveResponse(response, `MTicket-recibo-${order.qrcode || order.id}.pdf`);
        } finally {
            downloadingId.value = null;
        }
    };

    const downloadMyReceipt = async (order) => {
        downloadingId.value = order.id;
        try {
            const response = await axios.get(`${baseURL}/meus-recibos/${order.id}/pdf`, { responseType: 'blob' });
            saveResponse(response, `MTicket-recibo-${order.qrcode || order.id}.pdf`);
        } finally {
            downloadingId.value = null;
        }
    };

    return { downloadingId, downloadGuestReceipt, downloadMyReceipt };
}
