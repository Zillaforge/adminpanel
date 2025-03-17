<template>
  <v-row :class="alignment">
    <v-icon :style="getIconStyle" size="16" :color="statusIconColor()">
      {{ statusIcon() }}
    </v-icon>
    <div v-if="label" class="pl-1" v-text="lowerCase(label)" />

    <InfoTooltip
      v-if="hint !== undefined && hint.trim() !== ''"
      :tooltip="hint"
      location="right"
      class="ml-1"
    />
  </v-row>
</template>

<script setup lang="ts">
import i18n from '@/i18n';
import {computed} from 'vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  stateIconStyle: {
    type: String,
    default: '',
  },
  isAlignCenter: {
    type: Boolean,
    default: false,
  },
});
const {t} = i18n.global;
const getIconStyle = computed(() => {
  if (props.label.length) return `margin-top: 4px; height: inherit;`;
  else return `margin-top: 4px; height: inherit; ${props.stateIconStyle}`;
});
const alignment = computed(() => {
  if (props.isAlignCenter) {
    return {'justify-center': true};
  } else {
    return {'justify-center': false};
  }
});
const getI18nString = (strId: string) => {
  return t(strId);
};
const lowerCase = (strStatus: string) => {
  if (strStatus === 'used') {
    return 'in-use';
  } else if (strStatus === 'activated') {
    return 'active';
  } else if (strStatus === 'deactivated') {
    return 'inactive';
  }
  return strStatus.toLowerCase();
};
const statusIcon = () => {
  const status = props.status ? props.status.toLowerCase() : '';
  switch (status) {
    case 'processing':
    case 'releasing':
    case 'initializing':
    case 'building':
    case 'used':
    case 'deactivated':
      return 'mdi-autorenew';
    case 'created':
    case 'completed':
    case 'enabled':
    case 'success':
    case 'succeeded':
    case 'active':
    case 'activated':
    case 'ready':
    case 'released':
    case 'normal':
    case 'available':
    case 'permit-public':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'deleted':
    case 'deleting':
      return 'mdi-delete';
    case 'failed':
    case 'not-ready':
      return 'mdi-close-circle';
    case 'locked':
      return 'mdi-lock-outline';
    case 'running':
    case 'pending':
      return 'mdi-autorenew';
    case getI18nString('basic.disabled').toLowerCase():
    default:
      return 'mdi-minus-circle';
  }
};
const statusIconColor = () => {
  const status = props.status ? props.status.toLowerCase() : '';
  switch (status) {
    case 'processing':
    case 'releasing':
    case 'deleting':
    case 'initializing':
    case 'building':
    case 'deactivated':
      return 'icon_initialize_color';

    case 'active':
    case 'activated':
    case 'created':
    case 'completed':
    case 'enabled':
    case 'success':
    case 'succeeded':
    case 'ready':
    case 'released':
    case 'normal':
    case 'available':
    case 'used':
    case 'locked':
    case 'permit-public':
      return 'icon_check_circle_color';

    case 'error':
    case 'failed':
    case 'not-ready':
    case getI18nString('basic.disabled').toLowerCase():
      return 'icon_error_color';

    case 'running':
    case 'pending':
      return 'icon_running_color';

    case 'deleted':
      return 'icon_default_color';
    default:
      return 'icon_default_color';
  }
};
</script>
