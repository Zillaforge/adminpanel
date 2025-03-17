<template>
  <v-row v-resize="onResize" :no-gutters="noGutters">
    <v-col v-if="!hideTitle" :cols="titleFieldCol" class="form-title">
      <div>
        <span :class="isRequired ? 'input-required' : ''">
          {{ inputTitle }}
        </span>
        <InfoTooltip
          v-if="inputTooltip"
          :tooltip="inputTooltip"
          location="top"
        />
      </div>
    </v-col>
    <v-col
      :cols="contentColNumber"
      :style="hidePaddingTop ? '' : 'padding-top:10px'"
    >
      <v-tooltip
        v-model="showHint"
        :disabled="!showHint"
        location="right"
        offset="5"
      >
        <template #activator="{props}">
          <v-textarea
            v-if="isTextArea"
            v-bind="props"
            :model-value="modelValue"
            :rows="rowOfTextArea"
            variant="solo"
            :maxlength="getLengthLimit"
            :hide-details="isHideDetails"
            :error="highlightError ? isValueError : false"
            :disabled="disabled"
            :placeholder="inputLabel ? inputLabel : inputTitle"
            @update:modelValue="inputChange($event)"
          />
          <v-row v-else v-bind="props" :no-gutters="noGutters">
            <v-col
              v-if="!showBoarder"
              :style="'padding: 16px 16px;'"
              :class="`text-left pr-2 ${noGutters ? '' : ''} form-content${
                disabled ? '-gray' : ''
              }`"
            >
              <span>{{ modelValue }}</span>
            </v-col>
            <v-col v-else :class="`${noGutters ? 'pt-2' : ''}`">
              <div
                v-if="prefixLabel !== ''"
                :class="'text-xs-right pr-2 pt-2'"
                style="width: auto"
              >
                <v-label>{{ prefixLabel }}</v-label>
              </div>
              <div style="width: 100%">
                <v-text-field
                  ref="refTextField"
                  :model-value="modelValue"
                  :type="type"
                  :error-messages="[]"
                  :persistent-hint="persistentHint"
                  v-bind="
                    type === 'number'
                      ? {
                          min: numberMin,
                          max: numberMax,
                        }
                      : {}
                  "
                  :placeholder="inputLabel ? inputLabel : inputTitle"
                  :rules="allRules"
                  color="primary"
                  variant="solo"
                  single-line
                  density="compact"
                  :disabled="disabled"
                  :maxlength="getLengthLimit"
                  :hide-details="isHideDetails"
                  :prefix="prefix"
                  :suffix="suffixInner"
                  :hint="underLineHint"
                  :error="highlightError && isRequired ? !modelValue : false"
                  v-on="
                    type === 'number' && keyOnlyDigit
                      ? {keypress: onlyDigit}
                      : {}
                  "
                  @update:modelValue="inputChange($event)"
                  @blur="handleBlur"
                />
              </div>
            </v-col>
          </v-row>
        </template>
        <InputHint :showHint="showHint" :hints="hints" textFieldWithHint />
      </v-tooltip>
    </v-col>
    <v-spacer />
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed, nextTick, watch} from 'vue';
import i18n from '@/i18n';
import validation from '@/utils/validation';
import {
  bucketMaxLengthRule,
  contentFirstAlphabetRule,
  contentOnlyLowercaseAndNumberWithMinusRule,
  contentValueRule,
  emailRule,
  emailRuleAllowEmpty,
  integerRegexRule,
  integerRule,
  maxNumberRule,
  minNumberRule,
  minValueRule,
  minValueRuleWithException,
} from '@/utils/formRules';
import {
  updBucketHints,
  updEmailHints,
  updInputHints,
  updIntegerHints,
  updMinValueHints,
  updMinValueWithExceptionHints,
  updNameHints,
  updIServiceProjectSysCodeHints,
} from '@/utils/utils';
import {
  type HintContentInterface,
  type ValidationResult,
} from '@/interfaces/DataTypeInterface';
import InputHint from '@/components/common/InputHint.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const {t} = i18n.global;
const basicRules = ref<Array<(value: string) => ValidationResult>>([]);
const hints = ref<HintContentInterface[]>([]);
const showHint = ref(false);
const isValueError = ref(false);
const refTextField = ref<any>(null);
const windowHeight = ref(window.innerHeight);
const emit = defineEmits([
  'blur',
  'checkRules',
  'formError',
  'input',
  'update:modelValue',
]);
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  inputTitle: {
    type: String,
    required: true,
  },
  inputTooltip: {
    type: String,
    default: '',
  },
  inputLabel: {
    type: String,
    required: false,
    default: '',
  },
  inputRules: {
    type: Array<(val: string) => string | boolean>,
    default: () => [],
  },
  hintType: {
    type: String,
    default: 'N/A',
  },
  inputHints: {
    type: Function,
    default: () => [],
  },
  hasLengthLimit: {
    type: Boolean,
    default: false,
  },
  maxLengthLimit: {
    type: Number,
    default: 0,
  },
  fillLayout: {
    type: Boolean,
    default: false,
  },
  noGutters: {
    type: Boolean,
    default: false,
  },
  titleFieldCol: {
    type: Number,
    default: 3,
  },
  columnWidth: {
    type: Number,
    default: 8,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'text',
  },
  numberMin: {
    type: [String, Number],
    default: '',
  },
  numberMax: {
    type: [String, Number],
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  suffixInner: {
    type: String,
    default: '',
  },
  prefix: {
    type: String,
    default: '',
  },
  prefixLabel: {
    type: String,
    default: '',
  },
  isHideDetails: {
    type: Boolean,
    default: false,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  hidePaddingTop: {
    type: Boolean,
    default: true,
  },
  isTextArea: {
    type: Boolean,
    default: false,
  },
  rowOfTextArea: {
    type: Number,
    default: 8,
  },
  highlightError: {
    type: Boolean,
    default: false,
  },
  showBoarder: {
    type: Boolean,
    default: true,
  },
  underLineHint: {
    type: String,
    default: '',
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  exceptionAry: {
    type: Array<any>,
    default: () => [],
  },
  keyOnlyDigit: {
    type: Boolean,
    default: true,
  },
});

const getLengthLimit = computed(() => {
  if (props.maxLengthLimit === 0) {
    return props.hasLengthLimit ? 16 : 999;
  } else {
    return props.maxLengthLimit;
  }
});
const allRules = computed(() => {
  return basicRules.value.concat(props.inputRules);
});
const contentColNumber = computed(() => {
  if (props.fillLayout) {
    if (props.hideTitle) {
      return 12;
    } else {
      return 8;
    }
  } else {
    return props.columnWidth;
  }
});

const handleBlur = () => {
  showHint.value = false;
  emit('blur');
};

// For <v-text-field> type="number" @keypress
// charCode: digit0-9: 48~57, dot: 46, minus: 45
const onlyDigit = (event: any) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (
    ((props.numberMin as number) < 0 && charCode === 45) ||
    (charCode >= 48 && charCode <= 57)
  ) {
    return true;
  } else {
    event.preventDefault();
  }
};

const inputChange = (value: string) => {
  emit('update:modelValue', value);

  hints.value = getHints(value);
  if (hints.value.length > 0) {
    showHint.value = true;
  } else {
    showHint.value = false;
  }
  emit(
    'checkRules',
    allRules.value.every((rule) => rule(value) === true),
  );

  for (const rule of allRules.value) {
    if (rule(value) !== true) {
      emit('formError', rule(value));
      break;
    }
  }
  if (allRules.value.every((rule) => rule(value) === true)) {
    emit('formError', '');
  }
};

const checkValue = () => {
  emit(
    'checkRules',
    allRules.value.every((rule) => rule(props.modelValue as string) === true),
  );
  if (
    allRules.value.every((rule) => rule(props.modelValue as string) === true)
  ) {
    emit('formError', '');
    isValueError.value = false;
  } else {
    for (const rule of allRules.value) {
      if (rule(props.modelValue as string) !== true) {
        emit('formError', rule(props.modelValue as string));
        isValueError.value = true;
        break;
      }
    }
  }
};
const initRules = () => {
  basicRules.value = [];
  switch (props.hintType) {
    case 'name':
      basicRules.value = [
        contentFirstAlphabetRule(),
        contentOnlyLowercaseAndNumberWithMinusRule(),
      ];
      break;
    case 'isvcCodeName':
      basicRules.value = [validation.ruleIServiceProjectSysCodeName()];
      break;
    case 'email':
      basicRules.value = [props.isRequired ? emailRule : emailRuleAllowEmpty];
      break;
    case 'bucket':
      basicRules.value = [
        contentOnlyLowercaseAndNumberWithMinusRule(),
        bucketMaxLengthRule(t('tips.required.bucketName.maxLength')),
      ];
      break;
    case 'number':
      if (props.numberMin) {
        basicRules.value = [
          minNumberRule(
            t('form.error.number.type', {
              type: t('basic.greater.than'),
              number: props.numberMin,
            }),
            props.numberMin,
          ),
        ];
      }
      if (props.numberMax) {
        basicRules.value = [
          maxNumberRule(
            t('form.error.number.type', {
              type: t('basic.less.than'),
              number: props.numberMax,
            }),
            props.numberMax,
          ),
        ];
      }
      break;
    case 'minValue':
      basicRules.value =
        props.exceptionAry && props.exceptionAry.length > 0
          ? [
              integerRule(),
              minValueRuleWithException(
                t('tips.number.min.value.with.exception', {
                  min: props.numberMin,
                }),
                props.numberMin as number,
                props.exceptionAry,
              ),
            ]
          : [
              minValueRule(
                t('tips.number.min.or.equal.value', {
                  min: props.numberMin,
                }),
                props.numberMin as number,
              ),
            ];
      break;
    case 'integer':
      basicRules.value = [integerRegexRule()];
      break;
  }
  if (props.isRequired) {
    basicRules.value = [contentValueRule(t('form.required'))].concat(
      basicRules.value,
    );
  }
};

const getHints = (value: string) => {
  let messages = [];
  if (props.isRequired) {
    messages.push({
      icon: value ? 'mdi-check-circle' : 'mdi-close-circle',
      color: value ? 'hint-success' : 'hint-error',
      text: t('form.required'),
    });
  } else if (!value) {
    return [];
  }

  switch (props.hintType) {
    case 'name':
      messages = messages.concat(updNameHints(value));
      break;
    case 'isvcCodeName':
      messages = messages.concat(updIServiceProjectSysCodeHints(value));
      break;
    case 'bucket':
      messages = messages.concat(updBucketHints(value));
      break;
    case 'email':
      messages = messages.concat(updEmailHints(value));
      break;
    case 'number':
      if (props.numberMin) {
        messages = messages.concat(
          updInputHints(
            Boolean(Number(value) > Number(props.numberMin)),
            t('form.error.number.type', {
              type: t('basic.greater.than'),
              number: props.numberMin,
            }),
          ),
        );
        break;
      }
      if (props.numberMax) {
        messages = messages.concat(
          updInputHints(
            Boolean(Number(value) < Number(props.numberMax)),
            t('form.error.number.type', {
              type: t('basic.less.than'),
              number: props.numberMax,
            }),
          ),
        );
        break;
      }
      break;
    case 'minValue':
      if (props.exceptionAry && props.exceptionAry.length > 0) {
        messages = messages.concat(
          updMinValueWithExceptionHints(
            value,
            props.numberMin,
            props.exceptionAry,
          ),
        );
      } else
        messages = messages.concat(updMinValueHints(value, props.numberMin));
      break;
    case 'integer':
      messages = messages.concat(updIntegerHints(value));
      break;
    default:
      break;
  }

  if (props.inputHints) {
    return messages.concat(props.inputHints(value));
  }

  return messages;
};

const updateRules = () => {
  initRules();
  if (refTextField.value) {
    nextTick(() => {
      emit('formError', refTextField.value.validate());
      checkValue();
    });
  }
};
const onResize = () => {
  windowHeight.value = window.innerHeight;
};

if (!props.disabled) initRules();
if (props.modelValue) {
  emit('update:modelValue', props.modelValue);
}

watch(
  () => refTextField.value,
  () => {
    if (refTextField.value?.modelValue) {
      nextTick(() => {
        emit('formError', refTextField.value.validate());
        checkValue();
      });
    }
  },
);

watch(
  () => [i18n.global, props.prefixLabel],
  () => initRules(),
);
watch(
  () => [props.numberMin, props.numberMax],
  () => {
    const supportTypes = ['number', 'minValue', 'maxValue', 'vGpu'];
    if (supportTypes.indexOf(props.hintType) !== -1) {
      updateRules();
    }
  },
);
watch(
  () => props.isRequired,
  () => updateRules(),
);
watch(
  () => props.modelValue,
  () => {
    checkValue();
  },
);
watch(
  () => allRules.value,
  () => checkValue(),
);

const validate = () => {
  refTextField.value?.validate().then((res: any) => {
    emit('formError', res);
  });
};

defineExpose({validate});
</script>
