<script setup lang="ts">
import {ref, computed, type ComputedRef} from 'vue';

import validation from '@/utils/validation';
import {type ValidationResult} from '@/interfaces/DataTypeInterface';

const refCombobox = ref<any>(null);
const emit = defineEmits(['update:modelValue', 'formError']);

const props = defineProps({
  modelValue: {
    type: Array<string | Record<string, unknown>>,
    default: () => [],
  },
  items: {
    type: Array<string | Record<string, unknown>>,
    default: () => [],
  },
  itemTitle: {
    type: String,
    default: 'title',
  },
  itemSubTitle: {
    type: String,
    default: 'subtitle',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  allowCustomValue: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  showItemProps: {
    type: Boolean,
    default: false,
  },
});

const selectOptions: ComputedRef<(string | Record<string, unknown>)[]> =
  computed(() =>
    props.items.map((item: string | Record<string, unknown>) => {
      if (typeof item === 'string') {
        return item;
      } else if (props.showItemProps) {
        return {
          title: item[props.itemTitle],
          value: item[props.itemValue],
          subtitle: item[props.itemSubTitle],
        };
      }
      return {
        title: item[props.itemTitle],
        value: item[props.itemValue],
      };
    }),
  );
const allRules = computed(() => {
  const rules: ((value: any) => ValidationResult)[] = [];

  if (props.required) {
    if (Array.isArray(rules)) {
      rules.push(validation.ruleComboboxRequired());
    }
  }
  return rules;
});

const selectedValues: ComputedRef<(string | Record<string, unknown>)[]> =
  computed(() => props.modelValue);
const updateValues = ($event: (string | Record<string, unknown>)[]) => {
  let newValues = [];
  if (props.allowCustomValue) {
    newValues = $event;
  } else {
    newValues = $event.filter((item) => props.items.includes(item));
  }
  emit('update:modelValue', newValues);
};

const validate = () => {
  refCombobox.value?.validate().then((res: any) => {
    const errMessage = Array.isArray(res) && res.length ? res[0] : '';
    emit('formError', errMessage);
  });
};

const handleRemoveMember = (itemDelete: any) => {
  let newValues = [];
  newValues = props.modelValue.filter(
    (item: string | Record<string, unknown>) =>
      item[props.itemValue] !== itemDelete.item[props.itemValue],
  );
  updateValues(newValues);
};

defineExpose({validate});
</script>

<template>
  <v-combobox
    ref="refCombobox"
    :items="selectOptions"
    :item-props="showItemProps"
    :model-value="selectedValues"
    :rules="allRules"
    chips
    closable-chips
    density="compact"
    hide-details="auto"
    multiple
    variant="solo"
    color="primary"
    :list-props="{class: 'ocis-combobox-menu'}"
    @update:model-value="updateValues"
  >
    <template #chip="item">
      <v-chip
        :key="JSON.stringify(item.item.props[itemValue])"
        size="small"
        @click:close="handleRemoveMember(item)"
      >
        {{ item.item.props[itemTitle] }}
        <v-tooltip location="top" activator="parent">
          {{ item.item.props[itemSubTitle] }}
        </v-tooltip>
      </v-chip>
    </template>
  </v-combobox>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
@use '@/styles/common/v-chip';
</style>
