<script setup lang="ts">
import useBasics from '@/composables/useBasics';
import CommonDialog from '@/components/common/CommonDialog.vue';

const showDialog = defineModel<boolean>('show', {required: false});
defineProps({
  data: {
    type: String,
    default: '',
  },
  account: {
    type: String,
    default: '',
  },
});

const {handleCopyToClipboard} = useBasics();
</script>

<template>
  <CommonDialog
    :show-dialog="showDialog"
    :title="$t('simulation.user.result.title')"
    :show-cancel-btn="false"
    @submit="showDialog = false"
  >
    <div class="pb-4">
      <div class="pb-4">
        {{ `${$t('basic.users')}: ${account}` }}
      </div>
      <div class="pb-4">
        {{ $t('simulation.user.result.hint') }}
      </div>
      <div>
        <v-text-field
          :model-value="data"
          :append-inner-icon="'mdi-content-copy'"
          density="compact"
          variant="solo"
          class="url-link"
          readonly
          hide-details
          @click:append-inner="handleCopyToClipboard(data)"
        />
      </div>
    </div>
  </CommonDialog>
</template>

<style lang="scss" scoped>
.url-link {
  line-height: 40px;
}
</style>
