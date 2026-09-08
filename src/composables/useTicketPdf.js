import { ref } from 'vue';
import axios from 'axios';
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

const mediaUrlsFromSrc = (src) => {
    const path = storagePathFromUrl(src);
    if (!path) return null;
    const encoded = path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return {
        path,
        dataUrl: `${baseURL}/media?path=${encodeURIComponent(path)}`,
        // trailing slash: nginx 404s /api/media/event/foto.jpg (static .jpg rule)
        fileUrl: `${baseURL}/media/${encoded}/`
    };
};

const fetchAsDataUrl = async (src) => {
    if (imageDataUrlCache.has(src)) return imageDataUrlCache.get(src);

    const urls = mediaUrlsFromSrc(src);
    if (!urls) throw new Error('image path missing');

    try {
        const { data } = await axios.get(urls.dataUrl, {
            params: { as: 'data' },
            timeout: 20000
        });
        if (typeof data?.data_uri === 'string' && data.data_uri.startsWith('data:')) {
            imageDataUrlCache.set(src, data.data_uri);
            return data.data_uri;
        }
    } catch {
        /* same file via blob — works on current nginx with trailing slash */
    }

    const response = await axios.get(urls.fileUrl, {
        responseType: 'blob',
        timeout: 20000
    });
    const blob = response.data;
    if (!isImageBlob(blob)) throw new Error('image fetch failed');
    const dataUrl = await blobToDataUrl(blob);
    imageDataUrlCache.set(src, dataUrl);
    return dataUrl;
};

const applyTicketImageDataUrl = (img, dataUrl) => {
    img.src = dataUrl;
    img.removeAttribute('crossorigin');
    const panel = img.closest('.ticket-image');
    if (panel) {
        panel.style.setProperty('--event-image', `url("${dataUrl}")`);
        panel.style.setProperty('background-image', `url("${dataUrl}")`, 'important');
        panel.style.backgroundSize = 'cover';
        panel.style.backgroundPosition = 'center';
    }
};

const paintClonedTicketImage = (panel) => {
    const img = panel.querySelector('.ticket-image__photo');
    const src = img?.currentSrc || img?.src || '';
    if (!src.startsWith('data:')) return;
    panel.style.setProperty('background-image', `url("${src}")`, 'important');
    panel.style.backgroundSize = 'cover';
    panel.style.backgroundPosition = 'center';
};

const inlineTicketImages = async (root) => {
    const imgs = [...root.querySelectorAll('.ticket-image__photo')];
    await Promise.all(
        imgs.map(async (img) => {
            const src = img.getAttribute('src') || img.src;
            if (!src || src.startsWith('data:')) return;
            try {
                applyTicketImageDataUrl(img, await fetchAsDataUrl(src));
            } catch {
                /* html2canvas cannot paint cross-origin /storage images */
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
                cloned.querySelectorAll('.ticket-image').forEach(paintClonedTicketImage);
            }
        });
    } finally {
        ticketEl.classList.remove('exporting');
    }
};

const safeFileName = (name) => (name || 'bilhete').replace(/[\\/:*?"<>|]+/g, '').trim() || 'bilhete';

const addTicketPage = (pdf, canvas) => {
    const pageWidth = (canvas.width / 3) * PX_TO_MM;
    const pageHeight = (canvas.height / 3) * PX_TO_MM;
    const orientation = pageWidth >= pageHeight ? 'l' : 'p';
    const image = canvas.toDataURL('image/jpeg', 0.92);

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

    pdf.addImage(image, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    return pdf;
};

export function useTicketPdf() {
    const isDownloading = ref(false);

    const downloadTicketElements = async (ticketEls, fileName) => {
        const tickets = [...ticketEls].filter(Boolean);
        if (!tickets.length) return;

        isDownloading.value = true;
        try {
            let pdf = null;

            for (const ticketEl of tickets) {
                pdf = addTicketPage(pdf, await captureTicketEl(ticketEl));
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
            pdf = addTicketPage(pdf, await captureTicketEl(ticketEl));
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
