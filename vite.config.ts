import {writeFileSync} from 'node:fs';
import {fileURLToPath, URL} from 'node:url';

import vue from '@vitejs/plugin-vue';
import {defineConfig, loadEnv} from 'vite';
import type {UserConfig} from 'vite';
import path from 'path';
import {checker} from 'vite-plugin-checker';
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons';

const getViteEnv = (mode: string, target: string) => {
  return loadEnv(mode, process.cwd())[target];
};
/**
 * Vite Configure
 *
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig(({command, mode}): UserConfig => {
  console.log('defineConfig(command, mode): ', command, mode);
  console.log(
    'defineConfig(VITE_APP_OUTPUT_PATH): ',
    getViteEnv(mode, 'VITE_APP_OUTPUT_PATH'),
    path.join(__dirname, getViteEnv(mode, 'VITE_APP_OUTPUT_PATH')),
    getViteEnv(mode, 'VITE_APP_API_URL'),
    getViteEnv(mode, 'VITE_APP_SERVICE_NAME'),
  );

  const faviconName = 'src/assets/images/favicon.ico';
  console.log('faviconName', faviconName);
  const config: UserConfig = {
    // https://vitejs.dev/config/shared-options.html#base
    base: '/',
    // https://vitejs.dev/config/shared-options.html#define
    define: {
      'process.env': {},
      // enable hydration mismatch details in production build
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
    optimizeDeps: {
      exclude: ['vuetify'],
      include: ['lodash'],
    },
    plugins: [
      // Vue3
      vue({
        template: {
          // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin#image-loading
          transformAssetUrls,
        },
        script: {
          defineModel: true,
        },
      }),
      // Vuetify Loader
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
      vuetify({
        autoImport: true,
        styles: {configFile: 'src/styles/settings.scss'},
      }),
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: true,
        // vueTsc: true,
        eslint: {
          // for example, lint .ts and .tsx
          lintCommand: 'eslint "./src/**/*.{ts,tsx,vue}"',
        },
        // stylelint: {
        //   // for example, lint .css and .vue
        //   lintCommand: 'stylelint ./src/**/*.{css,scss,vue}',
        // },
        overlay: false,
      }),
      createSvgIconsPlugin({
        iconDirs: [
          fileURLToPath(
            new URL('./src/assets/images/menuIcon', import.meta.url),
          ),
        ],
        symbolId: 'icon-[name]',
        svgoOptions: {
          plugins: [
            {
              name: 'removeAttributesBySelector',
              params: {
                selector: ":not([fill='none'])",
                attributes: 'fill',
              },
            },
            {
              name: 'removeAttrs',
              params: {
                attrs: 'class',
              },
            },
          ],
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: './portalConfig.json',
            dest: './',
          },
        ],
      }),
    ],
    // https://vitejs.dev/config/server-options.html
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
      port: Number(getViteEnv(mode, 'VITE_APP_BASE_PORT')),
    },
    // Resolver
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@img': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
        // https://github.com/intlify/vue-i18n-next/issues/789#issuecomment-1138210323
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
        Source: path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    // Build Options
    // https://vitejs.dev/config/build-options.html
    build: {
      outDir: path.join(__dirname, getViteEnv(mode, 'VITE_APP_OUTPUT_PATH')),
      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: 'esnext',
      // Minify option
      // https://vitejs.dev/config/build-options.html#build-minify
      minify: 'terser',
      terserOptions: {
        compress: {
          // drop_console: ['log', 'info', 'debug', 'warn'],
          drop_debugger: true,
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.warn',
          ],
        },
      },
      // Rollup Options
      // https://vitejs.dev/config/build-options.html#build-rollupoptions
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          manualChunks: {
            // Split external library from transpiled code.
            vue: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
            vuetify: [
              'vuetify',
              'vuetify/components',
              'vuetify/directives',
              // 'vuetify/lib/labs',
              'webfontloader',
            ],
            materialdesignicons: ['@mdi/font/css/materialdesignicons.css'],
          },
        },
        // output: {
        //   plugins: [
        //     mode === 'analyze'
        //       ? // rollup-plugin-visualizer
        //         // https://github.com/btd/rollup-plugin-visualizer
        //         visualizer({
        //           open: true,
        //           filename: 'dist/stats.html',
        //         })
        //       : undefined,
        //   ],
        // },
      },
    },
    esbuild: {
      // Drop console when production build.
      drop: command === 'serve' ? [] : ['console'],
      // drop: command === 'serve' ? [] : [],
    },
  };

  // Write meta data.
  writeFileSync(
    fileURLToPath(new URL('./src/Meta.ts', import.meta.url)),
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `import type MetaInterface from '@/interfaces/MetaInterface';

// This file is auto-generated by the build system.
const meta: MetaInterface = {
  version: '${require('./package.json').version}',
  date: '${new Date().toISOString()}',
};
export default meta;
`,
  );
  return config;
});
