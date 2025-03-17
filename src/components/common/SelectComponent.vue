<script setup lang="ts">
import {ref} from 'vue';

defineEmits(['update:model-value', 'click', 'blur']);
defineProps({
  selectedValue: {
    type: [String, Object, Number, Boolean],
    default: '',
  },
  items: {
    type: Array,
    required: true,
  },
  itemText: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    required: false,
    default: null,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
  noDataSetting: {
    type: Object,
    default: null,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  customItem: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  error: {
    type: Boolean,
    default: false,
  },
});

const selectComponentRef = ref();

defineExpose({
  selectComponentRef,
});
</script>

<template>
  <v-select
    ref="selectComponentRef"
    :model-value="selectedValue"
    :items="items"
    :item-title="itemText"
    :item-value="itemValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    color="primary"
    density="compact"
    variant="solo"
    single-line
    hide-details
    :rules="rules"
    :no-data-text="$t('table.noData')"
    :return-object="returnObject"
    :error="error"
    @click="$emit('click')"
    @blur="$emit('blur')"
    @update:model-value="(val: any) => $emit('update:model-value', val)"
  >
    <template v-if="customItem" #item="{item}">
      <slot name="customItem" :item="item" />
    </template>
    <template v-if="noDataSetting" #no-data>
      <v-list>
        <v-list-item>
          {{ $t('table.noData') }}
        </v-list-item>
        <v-list-item class="cursor-pointer" @click="noDataSetting.action">
          {{ noDataSetting.text }}
        </v-list-item>
      </v-list>
    </template>
  </v-select>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
