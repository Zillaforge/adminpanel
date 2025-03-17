<template>
  <v-dialog
    :model-value="showDialog"
    :width="width"
    :min-width="360"
    scrollable
    :persistent="persistent"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-3">
      <v-card-title class="headline-style">
        {{ title }}
        <ExternalLink v-if="externalLink" :link="externalLink" />
        <InfoTooltip v-if="titleTooltip" :tooltip="titleTooltip" />
      </v-card-title>
      <slot name="between-title-and-text-no-paddings" />
      <div class="px-4">
        <slot name="between-title-and-text" />
      </div>

      <v-card-text class="pt-2 content-padding-setting">
        <slot />
        <v-alert
          class="dialog-alert"
          :model-value="alertMsg.length > 0"
          :type="alertType"
          :icon="alertIcon"
        >
          {{ alertMsg }}
        </v-alert>
      </v-card-text>
      <slot name="custom-alert" />
      <v-card-actions class="mt-3">
        <slot name="actions-prepend" />
        <v-spacer />
        <TextBtn
          v-show="showCancelBtn"
          :text="cancelBtnText ? cancelBtnText : $t('basic.cancel')"
          @click="handleClose"
        />
        <slot name="more-actions" />
        <TextBtn
          :text="submitBtnText ? submitBtnText : $t('basic.ok')"
          :disabled="disableSubmit"
          @click="handleSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import ExternalLink from '@/components/common/ExternalLink.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const emit = defineEmits(['update:modelValue', 'submit', 'close']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  disableSubmit: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  showCancelBtn: {
    type: Boolean,
    default: true,
  },
  submitBtnText: {
    type: String,
    default: '',
  },
  cancelBtnText: {
    type: String,
    default: '',
  },
  alertMsg: {
    type: String,
    default: '',
  },
  alertType: {
    type: String,
    default: 'error', // [success, info, warning, error]
  },
  disableAutoCloseDialog: {
    type: Boolean,
    default: false,
  },
  externalLink: {
    type: Object,
    default: null,
  },
  fixCardTextHeight: {
    type: String,
    default: '',
  },
  titleTooltip: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: 800,
  },
});

const alertIcon = computed(() => {
  if (props.alertType === 'error') return 'mdi-alert';
  else if (props.alertType === 'success') return 'mdi-check-circle';
  else if (props.alertType === 'info') return 'mdi-alert-circle';
  else if (props.alertType === 'warning') return 'mdi-exclamation';
  else return 'mdi-alert';
});

const handleSubmit = () => {
  if (!props.disableAutoCloseDialog) {
    emit('update:modelValue', false);
  }
  emit('submit');
};
const handleClose = () => {
  if (!props.disableAutoCloseDialog) {
    emit('update:modelValue', false);
  }
  emit('close');
};
</script>

<style lang="scss" scoped>
.dialog-alert {
  background-color: transparent !important;
  color: rgb(var(--v-theme-alert-color)) !important;
  height: 48px;
  margin: 0;
  padding: 10px 0px;
  border-width: 0;
}
.error--text .v-stepper__label {
  color: rgb(var(--v-theme-alert-color)) !important;
}
.v-alert.dialog-alert.v-alert--outline {
  border: 0 #ff4f9a29 !important;
}

.content-padding-setting {
  padding: 0px 16px !important;
}
</style>
