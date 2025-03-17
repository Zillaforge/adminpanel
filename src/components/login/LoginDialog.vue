<template>
  <v-row class="align-center justify-center">
    <div v-show="showLoginOption">
      <v-card class="login-card" :width="500">
        <div class="text-center pt-16 px-7 login-header">
          <div class="logo-container justify-center align-center pb-8 pb-16">
            <v-row class="w-100" no-gutters>
              <v-col cols="12">
                <v-img :src="`/images/login_logo_${$i18n.locale}.svg`" />
              </v-col>
              <v-col cols="12">
                <v-chip
                  v-show="isPrivateSite || isSystemSite"
                  class="private-chip pa-4"
                  :class="isSystemSite ? 'system' : ''"
                  density="comfortable"
                  variant="text"
                >
                  {{ siteName }}
                </v-chip>
              </v-col>
            </v-row>
          </div>
        </div>
        <div v-if="checkSource" class="px-7 py-11 bg-white h-100">
          <v-btn class="login-btn w-100 mb-9" @click="gotoIServiceLogin">
            {{ $t('action.login.user', {type: 'iService '}) }}
          </v-btn>
          <v-btn class="login-btn other-btn w-100" @click="checkSource = false">
            {{ $t('action.login.user', {type: $t('basic.other')}) }}
          </v-btn>
        </div>
        <div v-else class="px-7 pt-6 pb-4 bg-white h-100">
          <v-icon
            v-if="checkSource"
            icon="mdi-keyboard-backspace"
            class="mb-6"
            @click="checkSource = true"
          />
          <div class="mb-6">
            <div class="input-required pb-2">
              {{ $t('label.account.type') }}
            </div>
            <v-text-field
              v-model="account"
              class="text-input"
              :rules="allRules"
              :placeholder="$t('label.account.hint')"
              density="compact"
              variant="solo"
              hide-details
              @keyup.enter="onLogin"
            />
          </div>
          <div>
            <div class="input-required pb-2">
              {{ $t('label.password.type') }}
            </div>
            <v-text-field
              v-model="password"
              :append-inner-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="allRules"
              :type="showPwd ? 'text' : 'password'"
              :placeholder="$t('label.password.hint')"
              density="compact"
              variant="solo"
              focused
              hide-details
              @keyup.enter="onLogin"
              @click:append-inner="showPwd = !showPwd"
            />
          </div>
          <v-btn
            class="login-btn w-100 mt-12 mb-7"
            :disabled="!password || !account"
            @click="onLogin"
          >
            {{ $t('label.login') }}
          </v-btn>
        </div>
      </v-card>
    </div>
    <MfaVerifyCard
      v-show="showMfaVerifyCard"
      :showError="mfaFailed"
      @mfa-code-verify="handleMfaCodeVerify"
    />
    <LoginInfoDialog
      :show="showInfoDialog"
      :type="infoDlgType"
      :errorMsg="loginErrMsg"
      :metaData="loginMetaData"
      @closeDialog="showInfoDialog = false"
    />
  </v-row>
</template>

<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useLogin, useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import useMonitors from '@/composables/useMonitors';
import useMfa from '@/composables/useMfa';
import {
  ENV,
  LOGIN_STATUS,
  enableLoginPage,
  ADMIN_PROJECT_ID,
} from '@/constants/Constants';
import {isEmptyObject, toHomePage, clearSessionAndLogout} from '@/utils/utils';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';
import {adminPermissionChecker} from '@/utils/utilsFunctions';
import validation from '@/utils/validation';

import MfaVerifyCard from '@/components/mfa/MfaVerifyCard.vue';
import LoginInfoDialog from '@/components/login/LoginInfoDialog.vue';

const {t, isPrivateSite, isSystemSite, verifyAdminPermission} = useBasics();
const {execFetchProjectMembership} = useProjects('');
const showPwd = ref(false);
const showInfoDialog = ref(false);
const infoDlgType = ref(LOGIN_STATUS.PROCESSING);
const loginErrMsg = ref('');
const loginMetaData = ref({});
const showLoginOption = ref(enableLoginPage);
const checkSource = ref(!isSystemSite.value);
const account = ref('');
const password = ref('');
const siteName = computed(() =>
  isSystemSite.value
    ? t('basic.system.site')
    : isPrivateSite.value
    ? t('basic.private.site')
    : '',
);

const loginStore = useLogin();
const globalStore = useGlobal();
const router = useRouter();
const route = useRoute();

const isLoggedIn = ref(false);
const mfaToken = ref('');
const mfaFailed = ref(false);
const showMfaVerifyCard = ref(false);

const {execVerifyMfaAuth} = useMfa();
const {execFetchOpenStackToken, execFetchCephToken} = useMonitors();

const onBeforeInit = () => {
  sessionStorage.removeItem('mfaToken');
  if (route?.query?.mfa_token ?? '') {
    sessionStorage.setItem('mfaToken', String(route.query.mfa_token));
    router.replace('/');
  }
};

const onInit = () => {
  mfaToken.value = sessionStorage.getItem('mfaToken') ?? '';
  if (mfaToken.value) {
    showInfoDialog.value = false;
    showLoginOption.value = false;
    showMfaVerifyCard.value = true;
  }

  // check session for login status
  const loginMember = useLogin().getUserInfo;
  isLoggedIn.value = !!loginMember && isEmptyObject(loginMember);
};

onMounted(() => {
  if (isLoggedIn.value) {
    toHomePage();
  }

  onBeforeInit();
  onInit();
});

const handleMfaCodeVerify = async (verifyCode: string) => {
  mfaFailed.value = false;
  showInfoDialog.value = true;
  const conditions = {
    verificationCode: verifyCode,
    mfaToken: mfaToken.value,
  };
  const verifySuccess = await execVerifyMfaAuth(conditions);
  if (!verifySuccess) {
    mfaFailed.value = true;
    showInfoDialog.value = false;
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  showInfoDialog.value = false;
  toHomePage();
};
const onLogin = async () => {
  if (account.value === '' && password.value === '') {
    return;
  }

  showInfoDialog.value = false;
  infoDlgType.value = LOGIN_STATUS.PROCESSING;
  loginErrMsg.value = '';
  uiShowProgress(t('system.process'));

  const loginData: any = await loginStore.login({
    account: account.value,
    password: password.value,
  });

  if (!loginData.result) {
    infoDlgType.value = LOGIN_STATUS.LOGIN_FAILED;
    if (adminPermissionChecker(loginData?.err)) {
      infoDlgType.value = LOGIN_STATUS.LOGIN_FAILED_NOT_ADMIN;
    }
    uiHideProgress();
    showInfoDialog.value = true;
    return;
  }
  if (loginData.status && loginData.status === 205) {
    window.location.assign(loginData.location);
  } else {
    if (isSystemSite.value) {
      const memberShip = await execFetchProjectMembership(
        ADMIN_PROJECT_ID,
        loginStore.userInfo?.userId,
      );
      if (!verifyAdminPermission(memberShip?.extra?.opUserMode)) {
        showLoginOption.value = false;
        globalStore.uiShowDialog({
          title: t('system.error.not.system.admin.title'),
          type: '',
          message: t('system.error.not.system.admin'),
          width: 400,
          hideCancelBtn: true,
          callback: () => {
            clearSessionAndLogout();
            showLoginOption.value = true;
          },
        });
        return;
      }

      await execFetchOpenStackToken().catch(() => {
        console.log('execFetchOpenStackToken/error');
      });

      await execFetchCephToken().catch(() => {
        console.log('execFetchCephToken/error');
      });
    }
    toHomePage();
    uiHideProgress();
  }
};

const gotoIServiceLogin = () => {
  window.location.href = `${ENV.API_URL}/saml/nchciservice`;
};

const allRules = computed(() => {
  const rules = [];
  rules.push(validation.ruleRequired());
  return rules;
});
</script>

<style lang="scss" scoped>
.login-card {
  background: #f5f7f8 0% 0% no-repeat padding-box;
  border: 0.5px solid #c1c1c1;
  border-radius: 8px;
  opacity: 1;
  .login-header {
    background-color: #282626;
  }
  .logo-container {
    padding-top: 0px;
  }
  .login-btn {
    color: #ffffff;
    height: 48px;
    background: #0a61ff;
    border-radius: 8px;
    opacity: 1;
    &:disabled {
      background: #00000029 0% 0% no-repeat padding-box;
    }
    &.other-btn {
      background: #5f21a8ed;
    }
  }
  .login-title {
    font-size: 42px !important;
    color: #ffffff;
  }
  .login-subtitle {
    font-size: 30px !important;
    color: #00cff8;
  }
  .private-chip {
    background-color: white;
    font-weight: bold;
    color: #dc0d15;
    height: 32px;
    cursor: default;
    &.system {
      color: rgb(var(--v-theme-primary)) !important;
      height: 48px !important;
      :deep(.v-chip__content) {
        font-size: 24px !important;
      }
    }
    &:hover {
      background-color: white !important;
    }
  }
}
</style>
