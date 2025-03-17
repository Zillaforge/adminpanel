<template>
  <v-row :no-gutters="noGutters">
    <v-col
      v-if="readOnly"
      key="password-read-only"
      cols="3"
      class="form-title pt-1"
    >
      <p>
        <span>{{ title ? title : $t('form.password') }}</span>
      </p>
    </v-col>
    <v-col v-else key="password-input" cols="3" class="form-title pt-1">
      <p>
        <span class="input-required">{{ passwordTitle }}</span>
      </p>
    </v-col>
    <v-col cols="8" :class="`${noGutters ? 'pt-3' : ''}`">
      <v-tooltip
        v-model="showHint"
        :disabled="!showHint"
        location="right"
        offset="50"
      >
        <template #activator="{props}">
          <v-text-field
            v-bind="props"
            ref="refPassword"
            :model-value="password"
            :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            :placeholder="passwordTitle"
            :counter="maxLength > 0 ? true : false"
            :maxlength="maxLength > 0 ? maxLength : undefined"
            :rules="rules"
            density="compact"
            color="primary"
            variant="solo"
            autocomplete="new-password"
            :readonly="readOnly"
            :error-messages="showErrorMsg"
            @click:appendInner="show = !show"
            @update:modelValue="handleInput($event)"
            @blur="handleBlur"
            @keypress.space.prevent
          />
        </template>
        <InputHint :show-hint="showHint" :hints="hints" text-field-with-hint />
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import type {Ref} from 'vue';
import i18n from '@/i18n';
import {contentValueRule, atLeastOne, checkPwdLength} from '@/utils/formRules';
import {updPwdHints} from '@/utils/utils';

import InputHint from '@/components/common/InputHint.vue';

const {t} = i18n.global;
const show = ref(false);
const showHint = ref(false);
const rules: Ref<Array<any>> = ref([]);
const hints: Ref<Array<any>> = ref([]);
const refPassword = ref<any>(null); // for component refs use
const emit = defineEmits(['formError', 'update:password']);
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
  confirmType: {
    type: Boolean,
    default: false,
  },
  confirmValue: {
    type: String,
    default: '',
  },
  maxLength: {
    type: Number,
    default: 72,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  showPwdCheckHint: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  noGutters: {
    type: Boolean,
    default: false,
  },
});

const passwordTitle = computed(() => {
  if (props.title) {
    return props.title;
  } else if (props.confirmType) {
    return t('form.confirm.password');
  } else {
    return t('form.password');
  }
});
const showErrorMsg = computed(() =>
  props.errorMessage ? [props.errorMessage] : [],
);

const validateRules = (strToBeValidated: string) => {
  // check if password format fulfill requirements.
  for (const rule of rules.value) {
    if (rule(strToBeValidated) !== true) {
      emit('formError', rule(strToBeValidated));
      break;
    }
  }
  if (rules.value.every((rule) => rule(strToBeValidated) === true)) {
    // reset if fulfill all rules.
    emit('formError', '');
  }
};
const handleBlur = () => {
  showHint.value = false;
  validateRules(props.password);
};
const handleInput = (value: any) => {
  const hint = [];
  hint.push({
    icon: value ? 'mdi-check-circle' : 'mdi-close-circle',
    color: value ? 'hint-success' : 'hint-error',
    text: t('form.required'),
  });
  if (!props.confirmType) {
    if (props.showPwdCheckHint) {
      hints.value = hint.concat(updPwdHints(value));
    } else {
      hints.value = hint;
    }
  }
  if (hints.value && hints.value.length > 0) {
    showHint.value = true;
  }
  emit('update:password', value);
  validateRules(value);
};
const checkPwdConsistent = (val: any) => {
  if (val === props.confirmValue) {
    return true;
  } else {
    return t('form.password.inconsistent');
  }
};
const getExtraRules = () => {
  const extraRules = [
    atLeastOne.upperCaseEngLetter,
    atLeastOne.lowerCaseEngLetter,
    atLeastOne.digit,
    atLeastOne.specialCharacter,
    checkPwdLength,
  ];
  return props.showPwdCheckHint ? extraRules : [];
};
const initRules = () => {
  if (props.confirmType) {
    rules.value = [
      contentValueRule(
        t('form.required.type', {type: t('form.confirm.password')}),
      ),
      checkPwdConsistent,
    ];
  } else {
    rules.value = [
      contentValueRule(t('form.required.type', {type: t('form.password')})),
      ...getExtraRules(),
    ];
  }
};
initRules();

watch(
  () => i18n.global.locale,
  () => initRules(),
);
watch(
  () => props.confirmValue,
  // (newValue) => validateRules(newValue),
  () => refPassword.value?.validate(),
);
</script>

<style lang="scss" scoped></style>
