/**
 * Vue3 Main script
 */

// Load vue core
import store from './store';
import {createApp} from 'vue';
import dayjs from 'dayjs';

import App from '@/App.vue';
import vuetify from '@/plugins/vuetify';
import '@/styles/main.scss';
import router from '@/router';
import i18n from './i18n';
import cookies from 'vue-cookies';
import 'virtual:svg-icons-register';

/** Register Vue */
const vue = createApp(App);
vue.config.globalProperties.$filters = {
  formatDate(date: any) {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  },
  formatDateSec(date: any) {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  },
};

vue.use(router);
vue.use(store);
vue.use(i18n);
vue.use(vuetify);
vue.use(cookies);

// Run!
router
  .isReady()
  .then(() => vue.mount('#app'))
  .catch((e: any) => console.error(e));
