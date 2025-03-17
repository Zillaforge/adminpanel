<template>
  <v-row class="main-content align-center justify-center">
    <v-col cols="7">
      <TitleComp :title="$t('basic.password.change')" />

      <v-card class="pa-3">
        <v-card-text>
          <v-form v-model="valid">
            <PasswordWithConfirm
              v-model:password="newPassword"
              class="pa-3"
              :showPwdCheckHint="true"
              :strApiResponseMsg="strPwdDuplicatedErrorMsg"
              @update:password="handleInput"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="mt-3">
          <v-spacer />
          <TextBtn :text="$t('basic.cancel')" @click="toHomePage" />
          <TextBtn
            :text="$t('basic.ok')"
            :disabled="!valid"
            @click="handleSubmit"
          />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import useUsers from '@/composables/useUsers';
import {toHomePage} from '@/utils/utils';

// components
import PasswordWithConfirm from '@/components/common/PasswordWithConfirm.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import {useLogin} from '@/store';

const {execUpdatePassword, strPwdDuplicatedErrorMsg} = useUsers();

const valid = ref(false);
const user = useLogin().getUserInfo;

const newPassword = ref('');
const handleSubmit = () => {
  return execUpdatePassword(user.userId, newPassword.value).then(() => {
    if (!strPwdDuplicatedErrorMsg.value) {
      toHomePage();
    }
  });
};

const handleInput = () => {
  strPwdDuplicatedErrorMsg.value = '';
};
</script>
