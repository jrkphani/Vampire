/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_DB_HOST: string;
  readonly VITE_DB_NAME: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_PRINT_SERVICE_URL: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ANALYTICS_ENABLED: string;
  readonly VITE_ERROR_REPORTING_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
