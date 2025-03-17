<script setup lang="ts">
import {ref, computed} from 'vue';

import validation from '@/utils/validation';

const emit = defineEmits(['update:modelValue', 'formError']);
const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: '',
  },
  items: {
    type: Array<string | Record<string, unknown>>,
    default: () => [],
  },
  itemTitle: {
    type: String,
    default: 'label',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  required: {
    type: Boolean,
    default: false,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
  showItemProps: {
    type: Boolean,
    default: false,
  },
});

const refCombobox = ref<any>(null);

const selectOptions = computed(() =>
  props.items.map((item) => {
    if (typeof item === 'string') {
      return item;
    } else if (props.showItemProps) {
      return {
        title: item[props.itemTitle],
        value: item[props.itemValue],
        subtitle: item.subtitle,
      };
    }
    return {
      title: item[props.itemTitle],
      value: item[props.itemValue],
    };
  }),
);
const allRules = computed(() => {
  const rules = [];
  if (props.required) {
    rules.push(
      props.returnObject
        ? validation.ruleComboboxObjectRequired()
        : validation.ruleRequired(),
    );
  }
  return rules;
});

const validate = () => {
  refCombobox.value?.validate().then((res: any) => {
    const errMessage = Array.isArray(res) && res.length ? res[0] : '';
    emit('formError', errMessage);
  });
};

const handleFocusChange = (event: boolean) => {
  if (!event) validate();
};

defineExpose({validate});
</script>

<template>
  <v-combobox
    ref="refCombobox"
    :model-value="modelValue"
    :item-props="showItemProps"
    variant="solo"
    density="compact"
    :rules="allRules"
    :items="selectOptions"
    hide-details="auto"
    color="primary"
    :return-object="returnObject"
    @update:model-value="($event) => $emit('update:modelValue', $event)"
    @update:focused="($event) => handleFocusChange($event)"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
