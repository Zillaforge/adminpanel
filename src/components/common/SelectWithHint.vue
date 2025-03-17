<template>
  <v-row
    :class="{'select-with-hint': isHideDetails === true}"
    :no-gutters="noGutters"
  >
    <v-col v-if="!hideTitle" cols="3" class="form-title">
      <div>
        <span :class="isRequired ? 'input-required' : ''">
          {{ inputTitle }}
        </span>
        <InfoTooltip
          v-if="inputTooltip"
          :tooltip="inputTooltip"
          location="right"
        />
      </div>
    </v-col>
    <v-col :id="customID" :cols="columnNumber" :style="'padding-top:10px'">
      <v-tooltip :model-value="showHint" location="right" offset="29">
        <template #activator="{props}">
          <v-select
            ref="refSelection"
            v-bind="showHint ? props : ''"
            :model-value="modelValue === '' ? null : modelValue"
            :items="items"
            :item-title="itemText"
            :item-value="itemValue"
            :item-props="showItemProps"
            :placeholder="inputLabel ? inputLabel : inputTitle"
            :rules="rules"
            :color="'primary'"
            density="compact"
            variant="solo"
            single-line
            :no-data-text="noDataText || $t('table.noData')"
            :return-object="isReturnObject"
            :hide-details="isHideDetails"
            :hint="underLineHint"
            :disabled="disabled"
            persistent-hint
            @click="$emit('clickSelect')"
            @update:modelValue="inputChange($event)"
            @blur="showHint = false"
          />
        </template>
        <InputHint :showHint="showHint" :hints="inputHints" textFieldWithHint />
      </v-tooltip>
    </v-col>
    <slot />
    <v-spacer />
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import InputHint from '@/components/common/InputHint.vue';
import {contentValueRule} from '@/utils/formRules';
import useBasics from '@/composables/useBasics';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const {t} = useBasics();
const showHint = ref(false);
const inputHints = ref([]);
const refSelection = ref<any>(null);
const emit = defineEmits([
  'checkRules',
  'clickSelect',
  'update:modelValue',
  'formError',
]);
const props = defineProps({
  modelValue: {
    type: [String, Object, Number, Boolean],
    default: '',
  },
  items: {
    type: Array,
    required: true,
  },
  itemText: {
    type: String,
    default: 'name',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  inputTitle: {
    type: String,
    default: '',
  },
  inputTooltip: {
    type: String,
    default: '',
  },
  inputLabel: {
    type: String,
    default: '',
    required: false,
  },
  hintType: {
    type: String,
    default: '',
  },
  isReturnObject: {
    type: Boolean,
    default: false,
  },
  isHideDetails: {
    type: Boolean,
    default: false,
  },
  underLineHint: {
    type: String,
    default: '',
  },
  fillLayout: {
    type: Boolean,
    default: false,
  },
  noGutters: {
    type: Boolean,
    default: false,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  customID: {
    type: String,
    default: '',
  },
  showItemProps: {
    type: Boolean,
    default: false,
  },
  noDataText: {
    type: String,
    default: '',
  },
});

const inputChange = (value) => {
  inputHints.value = hintFunction.value(value);
  if (inputHints.value.length > 0) {
    showHint.value = true;
  }
  emit('update:modelValue', value);
  emit(
    'checkRules',
    rules.value.every((rule) => rule(value) === true),
  );
};

const hintFunction = computed(() => {
  return () => [];
});
const columnNumber = computed(() => {
  if (props.fillLayout) {
    if (props.hideTitle) {
      return 12;
    } else {
      return 8;
    }
  } else {
    return 6;
  }
});
const rules = computed(() => {
  if (props.isRequired) {
    return [contentValueRule(t('form.required'))];
  } else {
    return [];
  }
});

const validate = () => {
  refSelection.value?.validate().then((res: any) => {
    const errMessage = Array.isArray(res) && res.length ? res[0] : '';
    emit('formError', errMessage);
  });
};
defineExpose({validate});
</script>
<style scoped>
.select-with-hint {
  align-items: center;
}
</style>
