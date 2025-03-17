<template>
  <CommonDialog
    :show-dialog="show"
    :title="$t('basic.create.type', {type: $t('basic.folder')})"
    :disable-submit="disableCreate"
    @submit="$emit('create-folder', folderName)"
    @close="$emit('close-dialog')"
  >
    <TextFieldWithHint
      v-model="folderName"
      :input-title="$t('basic.name')"
      is-required
      no-gutters
    />
  </CommonDialog>
</template>

<script setup lang="ts">
import {computed, ref, type Ref, watch} from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const folderName: Ref<string> = ref('');
const error: Ref<string> = ref('');

defineEmits(['create-folder', 'close-dialog']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const disableCreate = computed(() => {
  return Boolean(!folderName.value || error.value);
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      folderName.value = 'folder' + Math.floor(Date.now() / 1000);
    }
  },
);
</script>
