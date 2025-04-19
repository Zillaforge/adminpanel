<template>
  <v-app-bar class="app-bar" :height="64" density="comfortable">
    <v-app-bar-nav-icon
      v-if="smAndDown && !route.meta.disableMenu"
      @click="toggleNavigationDrawer"
    />

    <v-tooltip location="bottom" open-delay="5000">
      <template #activator="{props}">
        <v-img
          v-bind="props"
          :src="logoNCHC"
          alt="logo image"
          max-width="150px"
          width="150"
          class="cursor-pointer"
          :class="smAndDown ? '' : 'ml-4'"
          @click="isSystemSite ? toHomePage() : toLoginPage()"
        />
      </template>
      <span>{{ versionInfo }}</span>
    </v-tooltip>

    <v-app-bar-title class="ml-2">
      <v-chip
        v-if="isPrivateSite || isSystemSite"
        class="private-chip ml-4"
        :class="isSystemSite ? 'system' : ''"
        density="comfortable"
        variant="text"
      >
        {{ siteName }}
      </v-chip>
    </v-app-bar-title>
    <v-spacer />

    <v-btn
      v-if="enableTheme"
      icon="mdi-theme-light-dark"
      @click="configStore.toggleTheme"
    />

    <AppBarBtnMenu
      v-if="!hideLanguage"
      :id="'settings'"
      :menuItems="settingsMenu"
      :btnIcon="'mdi-cog'"
      :showMenuItemIcon="false"
      :displayCondition="'hidden-xs'"
    />
    <AppBarBtnMenu
      v-if="!isSystemSite"
      :id="'faq'"
      :menuItems="faqMenu"
      :btnIcon="'mdi-help-circle-outline'"
      :showMenuItemIcon="false"
      :displayCondition="'hidden-xs'"
    />
    <AppBarBtnMenu
      v-if="ENABLE_SWITCH_REGION"
      :id="'region'"
      :menuItems="regionMenu"
      :btnIcon="'mdi-cloud-outline'"
      :btnText="getCurrentRegionText"
      :showMenuItemIcon="false"
      :displayCondition="'hidden-xs'"
    />
    <AppBarBtnMenu
      :id="'account'"
      :menuItems="accountMenu"
      :btnText="loginStore.getUserInfo?.displayName"
      :btnIcon="'mdi-account-outline'"
      :displayCondition="'hidden-sm-and-down'"
      chip-style
    />
    <template #append>
      <div class="pr-6">
        <AppBarBtnMenu
          :id="'account-shrink'"
          class="shrink-menu"
          :menuItems="getShrinkMenu"
          :btnIcon="'mdi-dots-vertical'"
          :displayCondition="'hidden-md-and-up'"
        />
      </div>
    </template>
  </v-app-bar>
  <MfaSettingDialog
    :showDialog="showMFADialog"
    @closeDialog="showMFADialog = false"
  />
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import logoNCHC from '@/assets/images/nchc/NCHCLogo.svg';

import {useRouter, useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useNavigationDrawerStore from '@/store/NavigationDrawerStore';
import useLogin from '@/store/LoginStore';
import verInfo from '@/constants/Version';
import {getDocumentLink} from '@/constants/Document';
import {useDisplay} from 'vuetify';
import {clearSessionAndLogout, toLoginPage, toHomePage} from '@/utils/utils';
import type BtnMenuItem from '@/interfaces/BtnMenuItemInterface';
import AppBarBtnMenu from '@/components/common/AppBarBtnMenu.vue';
import MfaSettingDialog from '@/components/mfa/MfaSettingDialog.vue';

import {ENABLE_SWITCH_REGION} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {useGlobal, useConfig} from '@/store';

const enableTheme = computed(() => {
  return import.meta.env.VITE_APP_ENABLE_THEME === 'true';
});

const route = useRoute();
const globalStore = useGlobal();
const configStore = useConfig();
const {name: windowSizeName, smAndDown} = useDisplay();

const showMFADialog = ref(false);
const loginStore = useLogin();
const {t, i18n, isCloudInfraUser, isPrivateSite, isSystemSite} = useBasics();

const hideLanguage = ref(isSystemSite.value);
const siteName = computed(() =>
  isSystemSite.value
    ? t('basic.system.site')
    : isPrivateSite.value
    ? t('basic.private.site')
    : '',
);
const versionInfo = computed(() => {
  return verInfo.verNo;
});

const resourceRegion = computed(() => globalStore.getResourceRegion);

const currentRegion = computed(() => globalStore.getCurrentRegion);

const getCurrentRegionText = computed(() => {
  const title = resourceRegion.value.find(
    (el) => el.value === currentRegion.value,
  )?.title;
  return title ? t(title) : '';
});

const getShrinkMenu = computed((): BtnMenuItem[] => {
  const region = resourceRegion.value.map((region) => ({
    text: t(region.title),
    icon: null,
    id: `region${region.value}`,
    link: () => {
      globalStore.updateResourceRegion(region.value);
      toHomePage();
    },
    hide: windowSizeName.value !== 'xs' || !ENABLE_SWITCH_REGION,
    isSelected: currentRegion.value === region.value,
  }));

  return [
    {
      title: 'basic.documentation',
      id: 'documentation',
      icon: 'mdi-help-circle-outline',
      iconSize: 24,
      link: () => {
        goUrl(getDocumentLink());
      },
      hide: windowSizeName.value !== 'xs' || isSystemSite.value,
    },
    {
      title: 'menu.language',
      icon: 'mdi-cog',
      iconSize: 24,
      id: 'language',
      topDivider: true,
      hide: windowSizeName.value !== 'xs' || hideLanguage.value,
    },
    {
      title: 'language.option.zh',
      icon: null,
      id: 'language-tw',
      link: () => switchLang('language-tw'),
      isSelected: i18n.global.locale === 'tw',
      hide: windowSizeName.value !== 'xs' || hideLanguage.value,
    },
    {
      title: 'language.option.en',
      icon: null,
      id: 'language-en',
      link: () => switchLang('language-en'),
      isSelected: i18n.global.locale === 'en',
      hide: windowSizeName.value !== 'xs' || hideLanguage.value,
    },
    {
      title: 'basic.resource',
      icon: 'mdi-cloud-outline',
      iconSize: 24,
      id: 'region',
      hide: windowSizeName.value !== 'xs' || !ENABLE_SWITCH_REGION,
    },
    ...region,
    {
      text: t('label.account') + ' ： ' + loginStore.getUserInfo?.displayName,
      id: 'account',
      icon: 'mdi-account',
      iconSize: 24,
      topDivider: true,
    },
    {
      title: 'keyMgnt.s3',
      id: 's3-key',
      link: () => gotoRouteName(PAGE_TYPES.S3_KEY),
      hide: isSystemSite.value,
    },
    {
      title: 'basic.password.change',
      id: 'password-change',
      link: () => gotoRouteName(PAGE_TYPES.CHANGE_PASSWORD),
      hide: !isCloudInfraUser(),
    },
    {
      title: 'basic.sign.out',
      id: 'signout-btn',
      link: () => {
        onLogout();
      },
    },
    {
      text: versionInfo.value,
      id: 'version',
    },
  ];
});

const router = useRouter();

const accountMenu: BtnMenuItem[] = [
  {
    title: 'keyMgnt.s3',
    id: 's3-key',
    icon: 'mdi-key-variant',
    link: () => gotoRouteName(PAGE_TYPES.S3_KEY),
    hide: isSystemSite.value,
  },
  {
    title: 'basic.password.change',
    id: 'password-change',
    icon: 'mdi-lock',
    link: () => gotoRouteName(PAGE_TYPES.CHANGE_PASSWORD),
    hide: !isCloudInfraUser(),
  },
  {
    title: 'basic.sign.out',
    id: 'signout-btn',
    icon: 'mdi-exit-to-app',
    link: () => {
      onLogout();
    },
  },
  {
    text: versionInfo.value,
    id: 'version',
    icon: 'mdi-book-clock-outline',
  },
];

const faqMenu: BtnMenuItem[] = [
  {
    title: 'basic.documentation',
    id: 'documentation',
    icon: null,
    link: () => {
      goUrl(getDocumentLink());
    },
  },
];

const settingsMenu: BtnMenuItem[] = [
  {
    title: 'language.option.zh',
    icon: null,
    id: 'language-tw',
    link: () => switchLang('language-tw'),
    isSelected: i18n.global.locale === 'tw',
  },
  {
    title: 'language.option.en',
    icon: null,
    id: 'language-en',
    link: () => switchLang('language-en'),
    isSelected: i18n.global.locale === 'en',
  },
];

const regionMenu = computed((): BtnMenuItem[] =>
  resourceRegion.value.map((region) => ({
    title: region.title,
    icon: null,
    id: `region${region.value}`,
    link: () => {
      globalStore.updateResourceRegion(region.value);
      toHomePage();
    },
    isSelected: currentRegion.value === region.value,
  })),
);

const gotoRouteName = (name: string) => {
  router.push({name});
};
const goUrl = (url: Record<string, string>) => {
  window.open(i18n.global.locale in url ? url[i18n.global.locale] : url.en);
};

const toggleNavigationDrawer = () => {
  const navigationDrawerStore = useNavigationDrawerStore();
  navigationDrawerStore.toggleNavigationDrawer();
};

const switchLang = (languageID: string) => {
  const newLang = languageID.split('-')[1];
  if (newLang === 'tw' || newLang === 'en') {
    i18n.global.locale = newLang;
    localStorage.setItem('locale', newLang);

    settingsMenu.forEach((item) => {
      item.isSelected = item.id === languageID;
    });
  }
};

const onLogout = () => {
  clearSessionAndLogout();
};
</script>

<style lang="scss" scoped>
.app-bar {
  background-color: rgb(var(--v-theme-bg-dashboard-header)) !important;
  color: white !important;
}

.private-chip {
  background-color: white;
  font-weight: bold;
  color: #dc0d15;
  height: 32px;
  cursor: default;
  &.system {
    color: rgb(var(--v-theme-primary)) !important;
  }
  &:hover {
    background-color: white !important;
  }
}

.shrink-menu {
  width: 36px;
  height: 36px;
}
</style>
