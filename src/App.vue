<script setup lang="ts">
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {ENV} from '@/constants/Constants';
import {useRoute} from 'vue-router';
import {useGlobal, useConfig} from '@/store';
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';

import type MenuItem from '@/interfaces/MenuItemInterface';
import {type BreadcrumbItem} from '@/interfaces/DataTypeInterface';

import {useTheme} from 'vuetify';
import useBasics from '@/composables/useBasics';
// Components
import MenuLeft from '@/components/MenuLeft.vue';
import AppBar from '@/components/AppBar.vue';
import GlobalDialog from '@/components/common/GlobalDialog.vue';
import ProgressDialog from '@/components/common/ProgressDialog.vue';
import Breadcrumbs from '@/components/common/BreadcrumbsComponent.vue';
import getBreadcrumbs from '@/utils/getBreadcrumbs';
import getMenuContent from '@/utils/getMenuContent';

const route = useRoute();
const {i18n} = useBasics();
/** Vuetify Theme */
const theme = useTheme();

/** Global Store */
const globalStore = useGlobal();

/** Config Store */
const configStore = useConfig();

const breadcrumbs = ref<BreadcrumbItem[]>([]);
const menuContent = ref<MenuItem[]>([]);
const updateBreadcrumbs = () => {
  try {
    let routeName: string = route.name as string;
    if (
      ENV.DASHBOARD_ROUTE_NAME !== PAGE_TYPES.DASHBOARD &&
      routeName === ENV.DASHBOARD_ROUTE_NAME
    ) {
      routeName = PAGE_TYPES.DASHBOARD;
    }
    breadcrumbs.value = getBreadcrumbs(
      routeName,
      globalStore.getBreadcrumbsParams,
    );
  } catch (e) {}
};

const updateMenuContent = () => {
  try {
    menuContent.value = getMenuContent();
  } catch (e) {}
};

updateBreadcrumbs();
updateMenuContent();

globalStore.setBreadcrumbsValue(breadcrumbs.value);
/** Title */
const title =
  import.meta.env.VITE_APP_SERVICE_NAME ?? 'Trusted Cloud Admin Panel';

/** Snackbar visibility */
const snackbarVisibility: Ref<boolean> = ref(false);

/** Snackbar text */
const snackbarText: ComputedRef<string> = computed(() => globalStore.message);

const language: ComputedRef<string> = computed(() =>
  localStorage.getItem('locale'),
);
console.log('locale: ', language.value);

/** Toggle Dark mode */
const isDark: ComputedRef<string> = computed(() =>
  configStore.theme ? 'dark' : 'light',
);

watch(
  () => route.name,
  () => {
    updateBreadcrumbs();
    updateLayoutStyle();
  },
);
// When snackbar text has been set, show snackbar.
watch(
  () => globalStore.message,
  (message) => (snackbarVisibility.value = message !== ''),
);
watch(
  () => i18n.global.locale,
  () => {
    document.documentElement.setAttribute('lang', i18n.global.locale);
    updateBreadcrumbs();
    updateMenuContent();
  },
);
watch(
  () => globalStore.currentRegion,
  () => {
    updateMenuContent();
  },
);

watch(
  () => globalStore.getBreadcrumbsParams,
  () => updateBreadcrumbs(),
);

/** Clear store when snackbar hide */
const onSnackbarChanged = async () => {
  globalStore.setMessage();
  await nextTick();
};

const updateLayoutStyle = () => {
  const el = document.getElementById('app');
  const html = el.getRootNode().childNodes[1];
  if (route.name !== PAGE_TYPES.LOGIN_PAGE) {
    html.style = 'overflow-y: hidden !important';
  } else {
    html.style = 'overflow: auto !important';
  }
};

onMounted(() => {
  document.title = title;
});
updateLayoutStyle();
</script>

<template>
  <!-- eslint-disable -->
  <!-- TODO fix eslint -->
  <v-app id="app" :lang="language" :theme="theme.global.name.value">
    <v-main class="main">
      <router-view v-slot="{Component, route}">
        <AppBar v-if="!route.meta.disableBars" />
        <div v-if="!route.meta.disableBars" class="left-menu">
          <MenuLeft :menu-content="menuContent" />
        </div>
        <div v-if="!route.meta.disableBars" class="right-content">
          <div class="content">
            <div
              v-if="!(route.meta.disableBars || route.meta.disableBreadcrumbs)"
              class="breadcrumbs-content"
            >
              <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </div>
            <component :is="Component" :key="route.name" />
          </div>
        </div>
        <component v-else :is="Component" :key="route.name" />
      </router-view>
    </v-main>
    <GlobalDialog />
    <ProgressDialog />
    <!-- <v-overlay v-model="loading" app class="justify-center align-center">
      <v-progress-circular indeterminate size="64" />
    </v-overlay> -->
    <v-snackbar
      v-model="snackbarVisibility"
      color="primary"
      rounded="pill"
      :timeout="1500"
      :min-width="'100px'"
      @update:model-value="onSnackbarChanged"
    >
      <div class="text-center">{{ snackbarText }}</div>
    </v-snackbar>
  </v-app>
  <teleport to="head">
    <meta
      name="theme-color"
      :content="theme.computedThemes.value[isDark].colors.primary"
    />
    <!-- <link rel="icon" :href="logo" type="image/svg+xml" /> -->
  </teleport>
</template>

<style lang="scss">
@use 'vuetify/settings';

.main {
  background-color: rgb(var(--v-theme-page-container-bg));
}

// Fix app-bar's progress-bar
.v-app-bar .v-progress-linear {
  position: absolute;
  bottom: 0;
}
</style>

<style lang="scss" scoped>
.breadcrumbs-content {
  min-width: calc(var(--v-content-min-width) - var(--v-menu-width));
  margin: 0px !important;
  padding: 12px 0px;
  align-content: flex-start;
  height: auto;
  overflow: hidden;
}
</style>
