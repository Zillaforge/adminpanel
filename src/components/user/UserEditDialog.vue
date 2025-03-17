<template>
  <v-row class="justify-center">
    <CommonDialog
      :key="editMetaKey"
      :title="$t('basic.edit.type', {type: $t('basic.users')})"
      :showDialog="showDialog"
      :disableSubmit="!editMetaValid"
      @submit="handleEditMeta"
      @close="handleCloseEdit"
    >
      <v-col cols="12">
        <v-form ref="formEditMeta" v-model="editMetaValid">
          <TextFieldWithHint
            v-for="(field, index) in supportFields"
            :key="index"
            v-model="editUser[field.key]"
            :disabled="!field.isEditable"
            :fillLayout="true"
            :hintType="field.hintType"
            :inputTitle="field.title"
            :isRequired="field.isRequired && field.isEditable"
            :isTextArea="field.isTextArea"
            :showBoarder="field.isEditable"
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref, watch, type PropType} from 'vue';
import {
  type UserFieldConfigInterface,
  type UserEditInterface,
} from '@/interfaces/DataTypeInterface';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import useUsers from '@/composables/useUsers';

const {execUpdateUser} = useUsers();
const editUser = ref<Record<string, any>>({});
const editMetaValid = ref(false);
const editMetaKey = ref(0);
const emit = defineEmits(['closeDialog', 'afterSubmit']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  userInfo: {
    type: Object as PropType<UserEditInterface>,
    required: true,
  },
  supportFields: {
    type: Array as PropType<UserFieldConfigInterface[]>,
    required: true,
  },
});

watch(
  () => props.showDialog,
  () => {
    editMetaKey.value++;
    editUser.value = Object.assign({}, props.userInfo);
  },
);

const handleEditMeta = async () => {
  await execUpdateUser(editUser.value);
  emit('afterSubmit');
};
const handleCloseEdit = () => {
  emit('closeDialog');
};
</script>
