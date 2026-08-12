const PRODUCTION_ROOT = 'mticket.co.mz';

const RESERVED_SUBDOMAINS = new Set([
    'www',
    'backend',
    'api',
    'admin',
    'app',
    'mail',
    'cdn',
    'static',
    'promotores',
    'p',
    'ftp',
    'smtp',
    'ns1',
    'ns2',
    'webmail',
    'cpanel',
    'autoconfig',
    'autodiscover'
]);

export function getHostname() {
    if (typeof window === 'undefined') return '';
    return window.location.hostname.toLowerCase();
}

export function isProductionFamilyHost(hostname = getHostname()) {
    return hostname === PRODUCTION_ROOT || hostname.endsWith(`.${PRODUCTION_ROOT}`);
}

export function extractSubdomain(hostname = getHostname()) {
    if (!hostname.endsWith(`.${PRODUCTION_ROOT}`)) return null;

    const sub = hostname.slice(0, -(PRODUCTION_ROOT.length + 1));
    if (!sub || sub.includes('.')) return null;

    return sub;
}

export function getCurrentPromotorSlug(hostname = getHostname()) {
    const sub = extractSubdomain(hostname);
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
}

export function isPromotorSubdomain(hostname = getHostname()) {
    return !!getCurrentPromotorSlug(hostname);
}

export function shouldUseSubdomainUrls(hostname = getHostname()) {
    return isProductionFamilyHost(hostname);
}

export function getPromotorPublicUrl(slug, hostname = getHostname()) {
    if (!slug) return null;

    if (shouldUseSubdomainUrls(hostname)) {
        return `https://${slug}.${PRODUCTION_ROOT}`;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/p/${slug}`;
}

export function getPromotorPublicLabel(slug) {
    if (!slug) return '';
    if (shouldUseSubdomainUrls()) {
        return `${slug}.${PRODUCTION_ROOT}`;
    }
    return `/p/${slug}`;
}

/**
 * Navigate to a promoter public page (subdomain hard-nav in production).
 */
export function openPromotorPage(slug, router) {
    if (!slug) return;

    if (shouldUseSubdomainUrls()) {
        const current = getCurrentPromotorSlug();
        if (current === slug) {
            router?.push('/') ;
            return;
        }
        window.location.href = getPromotorPublicUrl(slug);
        return;
    }

    router?.push(`/p/${slug}`);
}

export { PRODUCTION_ROOT, RESERVED_SUBDOMAINS };
