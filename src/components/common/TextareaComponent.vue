<script lang="ts">
export default {
  name: 'TextareaComponent',
};
</script>
<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 5,
  },
  autoGrow: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['update:model-value']);
</script>

<template>
  <v-textarea
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    :readonly="readonly"
    :rows="rows"
    :auto-grow="autoGrow"
    variant="solo"
    no-resize
    hide-details
    @update:model-value="(value: string) => $emit('update:model-value', value)"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
.v-input {
  :deep(textarea) {
    mask-image: none !important;
    -webkit-mask-image: none !important;
  }
  &.v-input--readonly {
    :deep(.v-input__control) {
      .v-field {
        background-color: rgb(var(--v-theme-bg-readonly-textarea)) !important;
        textarea {
          cursor: default !important;
          .v-field__input {
            mask-image: none !important;
            -webkit-mask-image: none !important;
          }
        }
      }
    }
  }
}
</style>
