<template>
  <v-row class="align-center" no-gutters>
    <v-col :cols="colTitleWidth" class="form-title">
      <span :class="{'input-required': isRequired}">
        {{ title }}
      </span>
      <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
    </v-col>
    <v-col :cols="colRadioBtnWidth">
      <v-radio-group
        :model-value="initValue"
        :disabled="disabled"
        :hide-details="isHideDetails"
        :inline="isInline"
        @update:model-value="handleSelect"
      >
        <v-radio
          v-for="(option, index) in options"
          :key="index"
          :class="index === 0 ? 'mr-8' : ''"
          :label="option.label"
          :value="option.value"
          :disabled="option.disabled"
          color="primary"
        />
      </v-radio-group>
    </v-col>
    <v-col cols="3" />
  </v-row>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {type RadioButtonOptions} from '@/interfaces/LayoutItemInterface';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const emit = defineEmits(['select']);
const props = defineProps({
  isRequired: {
    type: Boolean,
    default: false,
  },
  initValue: {
    type: [String, Boolean],
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  options: {
    type: Array<RadioButtonOptions>,
    default: () => [],
  },
  isHideDetails: {
    type: Boolean,
    default: true,
  },
  tooltip: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  colTitleWidth: {
    type: Number,
    default: 3,
  },
  isInline: {
    type: Boolean,
    default: false,
  },
});

const handleSelect = (value: string | boolean | null) => {
  emit('select', value);
};

const colRadioBtnWidth = computed(() => 12 - 3 - props.colTitleWidth);
</script>

<style lang="scss" scoped>
.v-input--selection-controls {
  &.v-input--hide-details {
    margin-top: 0px;
    padding-top: 0px;
  }
}
</style>
