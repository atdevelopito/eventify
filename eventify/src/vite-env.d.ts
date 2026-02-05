/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    // Add other env variables here as needed
    // readonly VITE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
