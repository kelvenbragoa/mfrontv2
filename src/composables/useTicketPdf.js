import { ref } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { baseURL } from '@/service/ApiConstant';

const PX_TO_MM = 25.4 / 96;
const imageDataUrlCache = new Map();

const waitForImage = (img) =>
    new Promise((resolve) => {
        if (img.complete && img.naturalWidth) {
            resolve();
            return;
        }
        img.onload = () => resolve();
        img.onerror = () => resolve();
    });

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const storagePathFromUrl = (src) => {
    if (!src || src.startsWith('data:')) return '';
    const marker = '/storage/';
    const idx = src.indexOf(marker);
    if (idx !== -1) return src.slice(idx + marker.length).replace(/^\/+/, '');
    if (src.startsWith('http://') || src.startsWith('https://')) return '';
    return src.replace(/^\/+/, '');
};

const isImageBlob = (blob) => {
    if (!blob || !blob.size) return false;
    if (!blob.type) return true;
    return blob.type.startsWith('image/') || blob.type === 'application/octet-stream';
};

const fetchAsDataUrl = async (src) => {
    if (imageDataUrlCache.has(src)) return imageDataUrlCache.get(src);

    const path = storagePathFromUrl(src);
    const candidates = [];
    if (path) {
        candidates.push(`${baseURL}/media/${path}`);
        candidates.push(`/storage/${path}`);
    }
    candidates.push(src);

    let lastError = null;
    for (const url of candidates) {
        try {
            const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) continue;
            const blob = await response.blob();
            if (!isImageBlob(blob)) continue;
            const dataUrl = await blobToDataUrl(blob);
            imageDataUrlCache.set(src, dataUrl);
            return dataUrl;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('image fetch failed');
};

const applyTicketImageDataUrl = (img, dataUrl) => {
    img.src = dataUrl;
    const panel = img.closest('.ticket-image');
    if (panel) {
        panel.style.setProperty('--event-image', `url("${dataUrl}")`);
        panel.style.backgroundImage = `url("${dataUrl}")`;
    }
};

const inlineTicketImages = async (root) => {
    const imgs = [...root.querySelectorAll('.ticket-image__photo')];
    await Promise.all(
        imgs.map(async (img) => {
            const src = img.getAttribute('src');
            if (!src || src.startsWith('data:')) return;
            try {
                applyTicketImageDataUrl(img, await fetchAsDataUrl(src));
            } catch {
                /* html2canvas cannot paint cross-origin storage images */
            }
            await waitForImage(img);
        })
    );
};

const captureTicketEl = async (ticketEl) => {
    await inlineTicketImages(ticketEl);
    ticketEl.classList.add('exporting');
    try {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return await html2canvas(ticketEl, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            imageTimeout: 15000,
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            onclone: (_doc, cloned) => {
                cloned.querySelectorAll('.ticket-image__photo').forEach((img) => {
                    if (!img.src?.startsWith('data:')) return;
                    const panel = img.closest('.ticket-image');
                    if (panel) {
                        panel.style.backgroundImage = `url("${img.src}")`;
                        panel.style.backgroundSize = 'cover';
                        panel.style.backgroundPosition = 'center';
                    }
                });
            }
        });
    } finally {
        ticketEl.classList.remove('exporting');
    }
};

const safeFileName = (name) => (name || 'bilhete').replace(/[\\/:*?"<>|]+/g, '').trim() || 'bilhete';

export function useTicketPdf() {
    const isDownloading = ref(false);

    const downloadTicketElements = async (ticketEls, fileName) => {
        const tickets = [...ticketEls].filter(Boolean);
        if (!tickets.length) return;

        isDownloading.value = true;
        try {
            let pdf = null;

            for (const ticketEl of tickets) {
                const canvas = await captureTicketEl(ticketEl);
                const pageWidth = (canvas.width / 3) * PX_TO_MM;
                const pageHeight = (canvas.height / 3) * PX_TO_MM;
                const orientation = pageWidth >= pageHeight ? 'l' : 'p';
                const image = canvas.toDataURL('image/png');

                if (!pdf) {
                    pdf = new jsPDF({
                        orientation,
                        unit: 'mm',
                        format: [pageWidth, pageHeight],
                        compress: true
                    });
                } else {
                    pdf.addPage([pageWidth, pageHeight], orientation);
                }

                pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            }

            pdf?.save(`MTicket-${safeFileName(fileName)}.pdf`);
        } finally {
            isDownloading.value = false;
        }
    };

    const buildPdfBlobFromElements = async (ticketEls) => {
        const tickets = [...ticketEls].filter(Boolean);
        if (!tickets.length) return null;

        let pdf = null;

        for (const ticketEl of tickets) {
            const canvas = await captureTicketEl(ticketEl);
            const pageWidth = (canvas.width / 3) * PX_TO_MM;
            const pageHeight = (canvas.height / 3) * PX_TO_MM;
            const orientation = pageWidth >= pageHeight ? 'l' : 'p';
            const image = canvas.toDataURL('image/png');

            if (!pdf) {
                pdf = new jsPDF({
                    orientation,
                    unit: 'mm',
                    format: [pageWidth, pageHeight],
                    compress: true
                });
            } else {
                pdf.addPage([pageWidth, pageHeight], orientation);
            }

            pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
        }

        return pdf ? pdf.output('blob') : null;
    };

    const downloadTicketsBySelector = async (selector, fileName) => {
        await downloadTicketElements(document.querySelectorAll(selector), fileName);
    };

    return {
        isDownloading,
        downloadTicketElements,
        downloadTicketsBySelector,
        buildPdfBlobFromElements
    };
}
