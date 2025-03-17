<script setup lang="ts">
import {onMounted} from 'vue';
import {useLogin, useGlobal} from '@/store';
import {useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import useUsers from '@/composables/useUsers';
import {toHomePage, toUserPortal, clearSessionAndLogout} from '@/utils/utils';

import {ADMIN_PROJECT_ID} from '@/constants/Constants';
import UiContainer from '@/components/common/UiContainer.vue';

const globalStore = useGlobal();
const userStore = useLogin();
const {execFetchProjectMembership} = useProjects('');
const {t, isSystemSite, verifyAdminPermission} = useBasics();
const {execFetchUserMemberships} = useUsers();
const route = useRoute();
onMounted(async () => {
  if (route.query.type === 'permission') {
    const memberShip = await execFetchProjectMembership(
      ADMIN_PROJECT_ID,
      userStore.userInfo?.userId,
    );
    if (!verifyAdminPermission(memberShip?.extra?.opUserMode)) {
      globalStore.uiShowDialog({
        title: isSystemSite.value
          ? t('system.error.not.system.admin.title')
          : t('system.error.not.site.admin.title'),
        type: '',
        message: isSystemSite.value
          ? t('system.error.not.system.admin')
          : t('system.error.not.site.admin'),
        width: 400,
        hideCancelBtn: true,
        callback: async () => {
          if (isSystemSite.value) {
            clearSessionAndLogout();
          } else {
            const userMemberships = await execFetchUserMemberships(
              userStore.userInfo?.userId,
              true,
            );
            if (Array.isArray(userMemberships) && userMemberships.length > 0) {
              toUserPortal();
            } else {
              clearSessionAndLogout();
            }
          }
        },
      });
      return;
    }

    if (route.query.to === 'home') {
      toHomePage();
    }
  }
});
</script>

<template>
  <UiContainer>
    <div class="background" />
  </UiContainer>
</template>

<style lang="scss" scoped>
.background {
  height: 100vh;
  background-color: #eceff1;
  background-image: url('../assets/images/admin_bg.png');
  background-size: cover;
}
</style>
