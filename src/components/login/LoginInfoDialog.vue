<template>
  <v-dialog v-model="isShow" width="350" scrollable persistent>
    <v-card v-if="isProcessingType">
      <v-card-text class="text-center">
        {{ getTypeString() }}
        <v-progress-linear
          indeterminate
          height="8"
          color="primary"
          class="mb-0 mt-3"
        />
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-title class="headline-style">
        {{ getTypeStringTitle() }}
      </v-card-title>

      <v-card-text class="content content-boarder-style">
        <v-col cols="12" class="text-center content-msg-style">
          {{ getTypeString() }}
        </v-col>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <TextBtn :text="$t('basic.ok')" @click="onCancel" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import {ref, computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import {LOGIN_STATUS} from '@/constants/Constants';
import TextBtn from '@/components/common/button/TextBtn.vue';

const {t} = useBasics();
const isShow = ref(false);
const emit = defineEmits(['closeDialog']);
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: [Number, String],
    default: 0, // LOGIN_STATUS
  },
  errorMsg: {
    type: String,
    default: '',
  },
  metaData: {
    type: Object,
    default: () => ({}),
  },
});

const isProcessingType = computed(
  () => Number(props.type) === LOGIN_STATUS.PROCESSING,
);

watch(
  () => props.show,
  (newVal) => (isShow.value = newVal),
);
const onCancel = () => {
  emit('closeDialog');
};

const getTypeStringTitle = () => {
  switch (Number(props.type)) {
    case LOGIN_STATUS.MFA_VERIFY_DONE:
    case LOGIN_STATUS.MFA_ENABLE_DONE:
      return '';
    default:
      return t('system.login.fail');
  }
};
const getTypeString = () => {
  if (props.errorMsg) {
    return props.errorMsg;
  }
  switch (Number(props.type)) {
    case LOGIN_STATUS.PROCESSING:
      return t('system.process');
    case LOGIN_STATUS.NO_PROJECT:
    case LOGIN_STATUS.LOGIN_FAILED:
      return t('system.login.fail.message');
    case LOGIN_STATUS.MFA_VERIFY_FAILED:
      return t('login.fail.id.incorrect');
    case LOGIN_STATUS.MFA_VERIFY_DONE:
    case LOGIN_STATUS.MFA_ENABLE_DONE:
      return t('mfa.enable.success');
    case LOGIN_STATUS.LOGIN_FAILED_NOT_ADMIN:
      return t('system.error.notAdmin.msg');
    default:
      return t('system.process');
  }
};
</script>

<style lang="scss" scoped>
.content-boarder-style {
  padding: 16px !important;
}

.content-msg-style {
  padding: 0px !important;
}
</style>
