/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_PAYFAST_MERCHANT_ID?: string
  readonly VITE_PAYFAST_MERCHANT_KEY?: string
  readonly VITE_PAYFAST_PASSPHRASE?: string
  readonly VITE_N8N_NEW_ORDER?: string
  readonly VITE_N8N_STATUS_CHANGE?: string
  readonly VITE_N8N_SIGNUP?: string
  readonly VITE_PWA_INSTALL_PASSWORD?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  readonly VITE_GEOAPIFY_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
