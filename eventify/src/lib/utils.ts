import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getImageUrl(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') return '';

    const cleanUrl = url.trim();
    if (!cleanUrl) return '';

    if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return cleanUrl;

    // Determine the best backend URL
    let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If we are accessing via localhost, force backend to localhost too
        // regardless of what .env says (unless it's a production URL)
        if ((hostname === 'localhost' || hostname === '127.0.0.1') && !backendUrl.includes('eventify.fun')) {
            backendUrl = 'http://localhost:5000';
        }
        // If we are on a network IP, and VITE_BACKEND_URL is also a local IP but might be old
        else if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !backendUrl.includes('eventify.fun')) {
            backendUrl = `http://${hostname}:5000`;
        }
    }

    // Standardize path - ensure exactly one leading slash
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

    // Remove trailing slash from backendUrl if present to avoid double slashes
    const base = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    return `${base}${path}`;
}
