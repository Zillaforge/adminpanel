<template>
  <v-row justify-center>
    <CommonDialog
      :key="editKey"
      :title="$t('basic.password.change')"
      :showDialog="showDialog"
      disableAutoCloseDialog
      :disableSubmit="!isEditValid"
      @submit="handleEditPassword"
      @close="closeDialog"
    >
      <v-col cols="12">
        <TextFieldWithHint
          class="pb-6"
          disabled
          :model-value="userInfo.account"
          :inputTitle="$t('label.account')"
          :isRequired="false"
          :fillLayout="true"
          :showBoarder="false"
        />
        <v-form v-model="isEditValid">
          <PasswordWithConfirm
            v-model:password="passwordInput"
            :showPwdCheckHint="true"
            :strApiResponseMsg="strPwdDuplicatedErrorMsg"
            :fillLayout="true"
            @update:password="handleInput4Edit"
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref, watch, type PropType} from 'vue';

import useUsers from '@/composables/useUsers';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import PasswordWithConfirm from '@/components/common/PasswordWithConfirm.vue';
import {type UserInfoInterface} from '@/interfaces/DataTypeInterface';

const emit = defineEmits(['closeDialog', 'triggerShowDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  userInfo: {
    type: Object as PropType<UserInfoInterface>,
    required: true,
  },
});

const {strPwdDuplicatedErrorMsg, execUpdatePassword} = useUsers();

const passwordInput = ref('');
const isEditValid = ref(false);
const editKey = ref(0);
watch(
  () => props.showDialog,
  (val) => {
    if (val) {
      editKey.value++;
      passwordInput.value = '';
    }
  },
);

const handleInput4Edit = () => {
  strPwdDuplicatedErrorMsg.value = '';
};
const handleEditPassword = () => {
  return execUpdatePassword(props.userInfo.userId, passwordInput.value).then(
    () => {
      if (!strPwdDuplicatedErrorMsg.value) {
        closeDialog();
      }
    },
  );
};
const closeDialog = () => {
  emit('closeDialog');
  strPwdDuplicatedErrorMsg.value = '';
};
</script>
