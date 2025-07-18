/// <reference types="vite/client" />

// if use color
// declare module 'vuetify/lib/util/colors.mjs';

interface ImportMetaEnv {
  // see https://vitejs.dev/guide/env-and-mode.html#env-files
  // add .env variables.
  readonly VITE_APP_IMAGE_REGISTRY: string;
  readonly VITE_APP_SERVICE_NAME: string;
  readonly VITE_APP_WEBSTORAGE_NAMESPACE: string;
  readonly VITE_APP_ADMIN_PROJECT_ID: string;
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

