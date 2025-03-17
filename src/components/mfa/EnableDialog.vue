<template>
  <div>
    <v-dialog
      :key="key"
      :model-value="showDialog"
      :width="800"
      scrollable
      :persistent="true"
    >
      <EnableDialogContent
        v-if="showMfaEnableDlg"
        :showError="mfaEnableFailed"
        :mfaUrl="mfaUrl"
        :size="120"
        :mfaSecret="mfaSecret"
        :showCancelBtn="true"
        :enableStep="enableStep"
        :lastVerifyCode="lastVerifyCode"
        @mfaEnabling="handleMfaEnabling"
        @closeDialog="handleMFADialogClose"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import useBasics from '@/composables/useBasics';
import useMfa from '@/composables/useMfa';
import useUsers from '@/composables/useUsers';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';
import EnableDialogContent from '@/components/mfa/EnableDialogContent.vue';

const {t} = useBasics();
const {execEnableMfaAuth} = useMfa();
const {execFetchUserInfo} = useUsers();
const emit = defineEmits(['closeDialog', 'successEnabled']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  mfaUrl: {
    type: String,
    default: '',
  },
  mfaToken: {
    type: String,
    default: '',
  },
  mfaSecret: {
    type: String,
    default: '',
  },
});
const closeDialog = () => emit('closeDialog');

const showMfaEnableDlg = ref(true);
const mfaEnableFailed = ref(false);
const key = ref(0);
const enableStep = ref(1);
const lastVerifyCode = ref('');

const handleMfaEnabling = async (verifyCode) => {
  showMfaEnableDlg.value = false;
  mfaEnableFailed.value = false;
  uiShowProgress(t('mfa.progress.enable'));

  const enableSuccess = await execEnableMfaAuth(
    verifyCode,
    props.mfaSecret,
    props.mfaToken,
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (enableSuccess) {
    await execFetchUserInfo();
    closeDialog();
    key.value++;
    lastVerifyCode.value = '';
    emit('successEnabled');
    showMfaEnableDlg.value = true;
  } else {
    showMfaEnableDlg.value = true;
    enableStep.value = 2;
    lastVerifyCode.value = verifyCode;
    mfaEnableFailed.value = true;
  }
  uiHideProgress();
};
const handleMFADialogClose = () => {
  closeDialog();
  mfaEnableFailed.value = false;
  enableStep.value = 1;
  key.value++;
  lastVerifyCode.value = '';
};
</script>

<style media="screen" scoped>
.stepper-step-padding {
  padding: 0px;
}
</style>
