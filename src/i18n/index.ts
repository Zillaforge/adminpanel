import {createI18n} from 'vue-i18n';

import en from '@/i18n/en/lang';

import tw from '@/i18n/tw/lang';

import {APP_VERSION} from '@/constants/Constants';
const locale = localStorage.getItem('locale');
let language = locale ?? 'tw';

if (locale === 'tw' || locale === 'en') {
  language = locale;
} else {
  language = APP_VERSION.includes('trusted-cloud-system') ? 'en' : 'tw';
  localStorage.setItem('locale', language);
}

const i18n = createI18n({
  locale: language, // set locale
  messages: {en, tw},
});
export default i18n;
