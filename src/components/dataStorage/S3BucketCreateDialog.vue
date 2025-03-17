<template>
  <CommonDialog
    :show-dialog="show"
    :title="$t('basic.create.type', {type: $t('s3.bucket')})"
    :disable-submit="disableCreate"
    @submit="$emit('create-bucket', bucketName)"
    @close="$emit('close-dialog')"
  >
    <TextFieldWithHint
      v-model="bucketName"
      :input-title="$t('basic.name')"
      :hint-type="'bucket'"
      is-required
      no-gutters
    />
  </CommonDialog>
</template>

<script setup lang="ts">
import {computed, ref, type Ref, watch} from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const bucketName: Ref<string> = ref('');
const error: Ref<string> = ref('');
defineEmits(['create-bucket', 'close-dialog']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const disableCreate = computed(() => {
  return Boolean(!bucketName.value || error.value);
});
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      bucketName.value = 'bucket' + Math.floor(Date.now() / 1000);
    }
  },
);
</script>
