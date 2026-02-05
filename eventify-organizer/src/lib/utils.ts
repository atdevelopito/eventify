import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getImageUrl(url: string | null | undefined): string {
    // Type check to prevent startsWith error
    if (!url || typeof url !== 'string') return '';

    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Prepend backend URL for relative paths
    // Use VITE_BACKEND_URL if available, otherwise default localhost
    // Note: In Vite, we use import.meta.env
    const backendUrl = 'http://127.0.0.1:5000';
    // Ideally we'd use import.meta.env.VITE_BACKEND_URL but need to ensure it's accessible here or pass it in.
    // hardcoding standard flask port for now as per app.py

    // Ensure url starts with / if not present (unless backendUrl ends with /)
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;

    return `${backendUrl}${normalizedPath}`;
}
