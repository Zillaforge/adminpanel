<script setup lang="ts">
import {ref, computed} from 'vue';

import TextareaComponent from '@/components/common/TextareaComponent.vue';
const props = defineProps({
  keyName: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  errorMsg: {
    type: String,
    default: '',
  },
  alert: {
    type: Boolean,
    default: false,
  },
  money: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  suffix: {
    type: String,
    default: '',
  },
  useFormTitleClass: {
    type: Boolean,
    default: false,
  },
  isTextArea: {
    type: Boolean,
    default: false,
  },
  rowOfTextArea: {
    type: Number,
    default: 1,
  },
  password: {
    type: Boolean,
    default: false,
  },
});

const showAlert = computed(() => props.alert || props.errorMsg);
const valueTextColor = computed(() => {
  let classString;
  if (showAlert.value) {
    classString = 'alert';
  } else if (props.money) {
    classString = 'money-text';
  } else {
    classString = 'check-item-content';
  }
  return classString;
});
const displayValue = computed(() => {
  const text = props.value ? props.value + props.suffix : '';
  if (props.errorMsg) {
    return text + ` (${props.errorMsg})`;
  } else {
    return text;
  }
});
const showPwd = ref(false);
</script>
<template>
  <v-col cols="12">
    <v-row no-gutters>
      <v-col
        cols="3"
        :class="[useFormTitleClass ? 'form-title' : 'check-item-header']"
      >
        <v-text-field :model-value="keyName" variant="plain" hide-details />
      </v-col>
      <slot />
      <v-col v-if="isTextArea" cols="9" class="pt-2">
        <TextareaComponent
          v-model="displayValue"
          :rows="rowOfTextArea"
          auto-grow
          readonly
        />
      </v-col>
      <v-col v-else-if="password" cols="9">
        <v-text-field
          v-if="value"
          :class="valueTextColor"
          :model-value="value"
          :append-icon="value ? (showPwd ? 'mdi-eye' : 'mdi-eye-off') : ''"
          :type="showPwd ? 'text' : 'password'"
          variant="plain"
          readonly
          :width="`${value.length + 2}rem`"
          hide-details
          @click:append="showPwd = !showPwd"
        />
        <v-text-field
          v-if="errorMsg"
          :class="valueTextColor"
          :model-value="`(${errorMsg})`"
          variant="plain"
          readonly
          hide-details
        />
      </v-col>
      <v-col
        v-else-if="value || errorMsg"
        cols="9"
        :class="`${valueTextColor} ${
          useFormTitleClass ? '' : 'check-item-header'
        }`"
      >
        <v-text-field
          :model-value="displayValue"
          variant="plain"
          readonly
          hide-details
        />
      </v-col>
      <v-col v-if="money" cols="9" offset="3" class="money-text">
        <v-icon size="24">mdi-alert</v-icon>
        {{ $t('tips.credit.estimate.hint') }}
      </v-col>
    </v-row>
  </v-col>
</template>

<style scoped>
.check-area {
  background-color: rgb(var(--v-theme-bg-readonly-textarea));
}

.money-text {
  color: rgb(var(--v-theme-error));
}
.alert {
  color: rgb(var(--v-theme-error));
}
</style>
