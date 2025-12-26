/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
    readonly VITE_USE_REAL_PAYMENTS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
