<template>
  <v-row class="justify-center">
    <CommonDialog
      :title="$t('basic.edit.type', {type: $t('basic.desc')})"
      :showDialog="showDialog"
      :disableSubmit="!isValid"
      @close="showDialog = false"
      @submit="handleEdit"
    >
      <v-col cols="12">
        <v-form v-model="isValid">
          <TextFieldWithHint
            v-model="editItem.name"
            :disable="true"
            :inputTitle="$t('basic.name')"
            :fillLayout="true"
            :showBoarder="false"
          />
          <TextFieldWithHint
            v-model="editItem.description"
            :inputTitle="$t('basic.desc')"
            :fillLayout="true"
            is-text-area
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const editItem = defineModel<Record<string, any>>('item', {required: true});
const showDialog = defineModel<boolean>('show', {required: true});
const props = defineProps({
  submitCallback: {
    type: Function,
    default: undefined,
  },
});
const isValid = ref(false);

const handleEdit = async () => {
  await props.submitCallback?.();
};
</script>
