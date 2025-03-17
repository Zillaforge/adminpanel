<template>
  <div>
    <CommonDialog
      :title="$t('mfa.setting.title')"
      :showDialog="showDialog"
      :showCancelBtn="true"
      @close="closeDialog"
      @update:modelValue="closeDialog"
      @submit="handleSubmit"
    >
      <v-row>
        <v-col cols="12" class="des-title-padding">
          <span class="des-title-style">
            {{ $t('mfa.dialog.description.title') }}
          </span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          {{ $t('mfa.dialog.description') }}
        </v-col>
      </v-row>
      <v-row class="setup-padding">
        <v-col cols="4" class="mt-2 input-required">
          {{ $t('mfa.dialog.title') }}
        </v-col>
        <v-col cols="6">
          <v-radio-group v-model="setupEnable" inline>
            <v-radio
              :label="$t('mfa.dialog.enable')"
              :value="true"
              color="primary"
              class="radio-style1"
            />
            <v-radio
              :label="$t('mfa.dialog.disable')"
              :value="false"
              color="primary"
            />
          </v-radio-group>
        </v-col>
      </v-row>
    </CommonDialog>
    <EnableDialog
      :showDialog="showMfaEnableDialog"
      :mfaUrl="MFAURL"
      :mfaSecret="MFASecret"
      :mfaToken="MFAToken"
      @closeDialog="showMfaEnableDialog = false"
      @successEnabled="handleMfaSuccessEnabled"
    />
    <MessageDialog
      :showDialog="showMfaMsgDialog"
      :type="msgDlgType"
      :submitBtnText="msgDlgSubmitBtnText"
      :showCancelBtn="msgDlgShowCancelBtn"
      @onMfaMsgDlgSubmit="handleMfaMsgDlgSubmit"
      @cancelDialog="showMfaMsgDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useLogin} from '@/store';
import useBasics from '@/composables/useBasics';
import useMfa from '@/composables/useMfa';
import useUsers from '@/composables/useUsers';

import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';

import CommonDialog from '@/components/common/CommonDialog.vue';
import EnableDialog from '@/components/mfa/EnableDialog.vue';
import MessageDialog from '@/components/mfa/MessageDialog.vue';
const loginStore = useLogin();
const emit = defineEmits(['closeDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
});

const {t} = useBasics();
const {execGetMfaAuth, execDisableMfaAuth} = useMfa();
const {execFetchUserInfo} = useUsers();
const closeDialog = () => emit('closeDialog');

const userInfo = ref({});

const mfa = ref(false);
const setupEnable = ref(false);

const showMfaMsgDialog = ref(false);
const msgDlgType = ref(0);
const msgDlgShowCancelBtn = ref(false);
const msgDlgSubmitBtnText = ref('');
const showMfaEnableDialog = ref(false);
const MFAURL = ref('');
const MFAToken = ref('');
const MFASecret = ref('');
const initValue = () => {
  userInfo.value = loginStore.getUserInfo;
  mfa.value = userInfo.value ? userInfo.value.mfa : false;
  setupEnable.value = userInfo.value ? userInfo.value.mfa : false;
};
initValue();
const mfaGetAuth = async () => {
  const mfaData = await execGetMfaAuth();
  if (!mfaData) {
    alert(t('system.error'));
  } else {
    MFAURL.value = mfaData.url;
    MFAToken.value = mfaData.mfaToken;
    MFASecret.value = mfaData.mfaSecret;
  }
};

const handleMfaSuccessEnabled = () => {
  showMfaMsgDialog.value = true;
  msgDlgType.value = 0;
  msgDlgShowCancelBtn.value = false;
  msgDlgSubmitBtnText.value = '';
};
const handleMfaMsgDlgSubmit = () => {
  showMfaMsgDialog.value = false;
  if (!setupEnable.value && mfa.value) {
    disableMFA();
  }
};

const disableMFA = async () => {
  uiShowProgress(t('mfa.progress.disable'));
  const disableSuccess = await execDisableMfaAuth(userInfo.value?.userId);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (disableSuccess) {
    await execFetchUserInfo();
  }
  uiHideProgress();
};

const handleSubmit = async () => {
  if (setupEnable.value && !mfa.value) {
    await mfaGetAuth();
    showMfaEnableDialog.value = true;
    closeDialog();
  } else if (!setupEnable.value && mfa.value) {
    showMfaMsgDialog.value = true;
    msgDlgType.value = 1;
    msgDlgShowCancelBtn.value = true;
    msgDlgSubmitBtnText.value = t('basic.ok');
  }
};
watch(
  () => props.showDialog,
  (val) => {
    if (val) {
      initValue();
    }
  },
);
</script>

<style media="screen" scoped>
.des-title-style {
  font-size: 16px !important;
  font-weight: bold;
}
.des-title-padding {
  padding-top: 0px;
  padding-bottom: 0px;
}
.setup-padding {
  padding-top: 28px;
}
.radio-style1 {
  margin-right: 100px;
}
</style>
