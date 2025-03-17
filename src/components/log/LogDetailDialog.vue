<script setup lang="ts">
import useBasics from '@/composables/useBasics';
import {type PropType} from 'vue';

import CommonDialog from '@/components/common/CommonDialog.vue';

defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

const emits = defineEmits(['closeDialog']);

const {handleCopyToClipboard} = useBasics();
</script>

<template>
  <CommonDialog
    :show-dialog="showDialog"
    :title="$t('logMgnt.originalData')"
    :show-cancel-btn="false"
    @submit="emits('closeDialog')"
  >
    <div class="border pa-4">
      <pre>{{ data }}</pre>
      <div class="text-end cursor-pointer">
        <v-icon @click="handleCopyToClipboard(JSON.stringify(data))">
          mdi-content-copy
        </v-icon>
      </div>
    </div>
  </CommonDialog>
</template>
