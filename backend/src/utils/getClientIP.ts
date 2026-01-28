import { Request } from 'express';

/*
 * Extrae la IP real del cliente desde headers de proxy o conexión directa.
 * Orden de prioridad: X-Real-IP → X-Forwarded-For → CF-Connecting-IP → req.ip
 */
export const getClientIP = (req: Request): string => {
    /*
     * X-Real-IP: header estándar en proxies simples (Nginx, Apache).
     * Es más confiable que X-Forwarded-For cuando solo hay un proxy.
     */
    const xRealIP = req.headers['x-real-ip'];
    if (xRealIP && typeof xRealIP === 'string') {
        return normalizeIP(xRealIP);
    }

    /*
     * X-Forwarded-For: lista de IPs separadas por coma (cliente, proxy1, proxy2...).
     * La primera IP es la del cliente original antes de entrar a proxies.
     */
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        const forwardedIPs = (typeof xForwardedFor === 'string' 
            ? xForwardedFor 
            : xForwardedFor[0]
        ).split(',').map(ip => ip.trim());
        
        if (forwardedIPs.length > 0 && forwardedIPs[0]) {
            return normalizeIP(forwardedIPs[0]);
        }
    }

    /*
     * CF-Connecting-IP: header específico de Cloudflare.
     * Contiene la IP real del cliente cuando pasa por CDN de Cloudflare.
     */
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    if (cfConnectingIP && typeof cfConnectingIP === 'string') {
        return normalizeIP(cfConnectingIP);
    }

    /*
     * Fallback a IP directa de Express.
     * Se usa cuando no hay proxies o en desarrollo local.
     */
    const directIP = req.ip || req.socket.remoteAddress || 'unknown';
    return normalizeIP(directIP);
};

/*
 * Normaliza formato de IP para consistencia en base de datos.
 * Convierte IPv6 mapeado (::ffff:192.168.1.1) a IPv4 simple.
 */
const normalizeIP = (ip: string): string => {
    /*
     * Remover prefijo IPv6-mapped-IPv4 cuando aplica.
     * ::ffff:192.168.1.1 → 192.168.1.1
     */
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    
    /*
     * Remover espacios y caracteres extraños.
     * Mantiene formato limpio para comparaciones.
     */
    return ip.trim();
};
