<script setup lang="ts">
import CommonDialog from '@/components/common/CommonDialog.vue';
import {formatBytes} from '@/utils/utils';

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  usedBytes: {
    type: Number,
    default: 0,
  },
  allocatedBytes: {
    type: Number,
    default: -1,
  },
});

defineEmits(['close-dialog']);
</script>

<template>
  <CommonDialog
    :show-dialog="show"
    :title="$t('s3.usage')"
    :alert="$t('s3.usage.warning')"
    :show-cancel-btn="false"
    @submit="$emit('close-dialog')"
    @close="$emit('close-dialog')"
  >
    <v-row no-gutters>
      <span class="content-key">
        {{ $t('s3.usage.quota') }}
      </span>
      <span class="content-value mr-3">
        {{
          `${formatBytes(usedBytes)} / ${
            allocatedBytes === -1
              ? $t('quota.unlimited')
              : formatBytes(allocatedBytes)
          }`
        }}
      </span>
    </v-row>
  </CommonDialog>
</template>
