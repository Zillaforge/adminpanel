<template>
  <v-row class="justify-center">
    <CommonDialog
      :key="createKey"
      :title="title"
      :showDialog="showDialog"
      :disableSubmit="!isCreateValid"
      @submit="handleCreate"
      @update:modelValue="closeDialog"
      @close="closeDialog"
    >
      <v-col cols="12">
        <v-form v-model="isCreateValid">
          <TextFieldWithHint
            v-for="(field, index) in supportFields"
            :key="index"
            v-model="userInput[field.key as keyof UserEditInterface]"
            :inputTitle="field.title"
            :isRequired="field.isRequired"
            :isTextArea="field.isTextArea"
            :fillLayout="true"
            :hintType="field.hintType"
          />
          <PasswordWithConfirm
            v-model:password="userInput['password']"
            :showPwdCheckHint="true"
            :fillLayout="true"
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref, watch, type PropType} from 'vue';
import useBasics from '@/composables/useBasics';
import useUsers from '@/composables/useUsers';
import {USER_TYPE} from '@/constants/Constants';
import {
  type UserFieldConfigInterface,
  type UserEditInterface,
} from '@/interfaces/DataTypeInterface';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import PasswordWithConfirm from '@/components/common/PasswordWithConfirm.vue';
const {execCreateUser} = useUsers();

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  supportFields: {
    type: Array as PropType<UserFieldConfigInterface[]>,
    required: true,
  },
});
const {t} = useBasics();

const emit = defineEmits(['closeDialog', 'triggerFetch']);

const userInput = ref<UserEditInterface>({
  account: '',
  displayName: '',
  email: '',
  description: '',
  department: '',
  title: '',
  telephone: '',
  password: '',
});

const title = computed(() => {
  return t('basic.add.type', {
    type: t('basic.user.type', {type: t('basic.testing')}),
  });
});

const isCreateValid = ref(false);
const createKey = ref(0);
watch(
  () => props.showDialog,
  (val) => {
    if (val) {
      userInput.value.password = '';
      props.supportFields.forEach((field: UserFieldConfigInterface) => {
        userInput.value[field.key as keyof UserEditInterface] = '';
      });
      createKey.value++;
    }
  },
);

const handleCreate = async () => {
  let newUser = {
    password: userInput.value.password,
  };
  props.supportFields.forEach((field: UserFieldConfigInterface) => {
    newUser = {
      ...newUser,
      [field.key]: userInput.value[field.key as keyof UserEditInterface],
    };
  });

  await execCreateUser(newUser, USER_TYPE.GENERAL);
  emit('triggerFetch');
};

const closeDialog = () => {
  emit('closeDialog');
};
</script>
