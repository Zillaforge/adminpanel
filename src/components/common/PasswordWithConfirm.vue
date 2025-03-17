<template>
  <div>
    <Password
      v-model:password="inputPwd"
      :fillLayout="fillLayout"
      :maxLength="maxLength"
      :showPwdCheckHint="showPwdCheckHint"
      :errorMessage="strApiResponseMsg"
      @update:password="handleInput"
      @formError="$emit('formError', $event)"
    />
    <Password
      v-model:password="confirmPassword"
      :confirmValue="inputPwd"
      :fillLayout="fillLayout"
      :maxLength="maxLength"
      confirmType
      @formError="$emit('formConfirmError', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, watch} from 'vue';
import Password from '@/components/common/PasswordComponment.vue';

const inputPwd = ref('');
const confirmPassword = ref('');
const emit = defineEmits(['formError', 'formConfirmError', 'update:password']);
const props = defineProps({
  password: {
    type: String,
    default: '',
  },
  fillLayout: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: 72,
  },
  showPwdCheckHint: {
    type: Boolean,
    default: false,
  },
  strApiResponseMsg: {
    type: String,
    default: '',
  },
});

const handleInput = (event) => {
  emit('update:password', event);
};

const init = () => {
  inputPwd.value = props.password;
  confirmPassword.value = props.password;
};
init();

watch(
  () => props.password,
  () => {
    if (confirmPassword.value) {
      const tmp = confirmPassword.value;
      confirmPassword.value = '';
      nextTick(() => {
        confirmPassword.value = tmp;
      });
    }
  },
);
</script>
