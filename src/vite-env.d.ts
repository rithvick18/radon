/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MISTRAL_API_KEY: string
  readonly more: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
