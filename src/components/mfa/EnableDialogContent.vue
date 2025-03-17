<template>
  <v-card>
    <!-- eslint-disable vuetify/no-deprecated-components, vue/no-v-html -->
    <v-stepper v-model="step" hide-actions :items="items" class="mfa-config">
      <template #item.1>
        <v-card class="card-step1-style" variant="flat">
          <div>
            <h3 class="headline-style pb-2">{{ $t('mfa.title') }}</h3>
            <br />
            <span>
              {{ $t('mfa.firsttime') }}
            </span>
            <br />
            <br />
            <span class="step-title-style">
              {{ $t('mfa.enable.step1.title') }}
            </span>
            <v-col class="pb-4 pt-2 pl-0">
              <span v-html="$t('mfa.enable.step1.msg')" />
            </v-col>
            <br />
            <span>{{ $t('mfa.enable.step1.msg.done') }}</span>
          </div>
          <v-row class="pt-4 justify-end mt-0 pb-4">
            <TextBtn
              v-show="showCancelBtn"
              :text="$t('basic.cancel')"
              @click="handleClose"
            />
            <TextBtn :text="$t('basic.next')" @click="step = 2" />
          </v-row>
        </v-card>
      </template>
      <template #item.2>
        <div>
          <h3 class="headline-style pb-2">{{ $t('mfa.title') }}</h3>
          <br />
        </div>
        <v-card class="card-step2-style">
          <div>
            <span class="step-title-style">
              {{ $t('mfa.enable.step2.title') }}
            </span>
            <v-col class="pt-2 pl-0">
              <span v-html="$t('mfa.enable.step2.msg')" />
            </v-col>
            <v-row column class="align-center">
              <br />
              <v-col cols="12" class="align-center pb-0">
                <div
                  class="qrcode-style"
                  :style="`width: ${sizeQrcodeBorder}px;
                    height: ${sizeQrcodeBorder}px; padding-top: 5px;`"
                >
                  <QrcodeVue :value="mfaUrl" :size="size" level="L" />
                </div>
              </v-col>
              <v-col cols="12" class="align-center">
                <span>{{ mfaSecret }}</span>
              </v-col>
              <br />
            </v-row>
            <br />
            <span class="step-title-style">
              {{ $t('mfa.enable.step3.title') }}
            </span>
            <v-col class="pt-2 pl-0">
              <span v-html="$t('mfa.enable.step3.msg')" />
            </v-col>
          </div>
          <v-row class="pt-3 pl-3 pr-3">
            <v-text-field
              v-model="verifyCode"
              variant="solo"
              density="compact"
              maxlength="6"
              autofocus
              :placeholder="$t('mfa.verifyCode')"
              :error-messages="getError"
              @keypress.enter="
                () => {
                  if (!disableMFABtn) onSubmit();
                }
              "
            />
          </v-row>
          <br />
          <div>
            <span>{{ $t('mfa.enable.info') }}</span>
          </div>
          <br />
          <v-card-actions>
            <v-row class="align-center justify-end">
              <TextBtn :text="$t('basic.back')" @click="step = 1" />
              <ContainedBtn
                :text="$t('mfa.enable')"
                :disabled="disableMFABtn"
                @click="onSubmit"
              />
            </v-row>
          </v-card-actions>
        </v-card>
      </template>
    </v-stepper>
  </v-card>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
// import {VStepper} from 'vuetify/labs/VStepper';
import useBasics from '@/composables/useBasics';
import QrcodeVue from 'qrcode.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';

const emit = defineEmits(['closeDialog', 'mfaEnabling']);
const props = defineProps({
  size: {
    type: Number,
    default: 180,
  },
  enableStep: {
    type: Number,
    default: 1,
  },
  lastVerifyCode: {
    type: String,
    default: '',
  },
  mfaUrl: {
    type: String,
    required: true,
  },
  mfaSecret: {
    type: String,
    required: true,
  },
  showCancelBtn: {
    type: Boolean,
    default: false,
  },
  showError: {
    type: Boolean,
    default: false,
  },
});
const {t} = useBasics();

const getError = computed(() => {
  return showErrorMsg.value ? [t('mfa.verify.failed')] : [];
});

const items = ref(['', '']);
const step = ref(1);
const verifyCode = ref('');
const sizeQrcodeBorder = ref(0);
// eslint-disable-next-line vue/no-setup-props-destructure
step.value = props.enableStep;
if (props.lastVerifyCode) {
  // eslint-disable-next-line vue/no-setup-props-destructure
  verifyCode.value = props.lastVerifyCode;
}

const disableMFABtn = ref(true);
const showErrorMsg = ref(false);
const fetchData = () => {
  showErrorMsg.value = props.showError;
  sizeQrcodeBorder.value = props.size + 10;
};
fetchData();

watch(
  () => verifyCode.value,
  (val) => {
    disableMFABtn.value = !(val.length === 6);
    showErrorMsg.value = false;
  },
);
watch(
  () => props.enableStep,
  (val) => {
    step.value = val;
  },
);

const onSubmit = () => {
  emit('mfaEnabling', verifyCode.value);
};
const handleClose = () => {
  emit('closeDialog');
};
</script>
<style lang="scss" scoped>
.qrcode-style {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(var(--v-theme-white-color));
}
//
</style>
//
<style media="screen" scoped>
.stepper-step-padding {
  padding: 0px;
}
.title-style {
  font-size: 20px !important;
  font-weight: bold;
}
.step-title-style {
  font-size: 16px !important;
  font-weight: bold;
}
.v-card {
  display: flex !important;
  flex-direction: column;
}
.v-card__text {
  flex-grow: 1;
  overflow: auto;
}
.card-step1-style {
  background-color: rgb(var(--v-theme-card-creation-footer-bg)) !important;
}
.card-step2-style {
  max-height: calc(100vh - var(--v-app-bar-height-px) - 100px);
  overflow-y: auto;
  background-color: rgb(var(--v-theme-card-creation-footer-bg)) !important;
}
.v-text-field :deep(.v-field__field input) {
  color: rgb(var(--v-theme-text-highlight)) !important;
  font-size: 18px !important;
}
</style>
