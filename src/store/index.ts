import {createPinia} from 'pinia';
import type {Pinia} from 'pinia';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Pinia Stores
import useConfig from '@/store/ConfigStore';
import useGlobal from '@/store/GlobalStore';
import useLogin from '@/store/LoginStore';
import usePortalConfig from '@/store/PortalConfig';
import useNavigationDrawerStore from '@/store/NavigationDrawerStore';
import useStorage from '@/store/StorageStore';

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export {
  useConfig,
  useGlobal,
  useLogin,
  useNavigationDrawerStore,
  usePortalConfig,
  useStorage,
};
