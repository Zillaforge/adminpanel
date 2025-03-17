import {fileURLToPath} from 'node:url';

import vue from '@vitejs/plugin-vue';
import {configDefaults, defineConfig, mergeConfig} from 'vitest/config';

import viteConfig from './vite.config';

/**
 * Vitest Configure
 *
 * @see {@link https://vitest.dev/config/}
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [vue() as any],
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      globals: true,
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      deps: {
        inline: [/vuetify/],
      },
    },
  }),
);
