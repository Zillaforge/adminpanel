<script setup lang="ts">
import {type PropType} from 'vue';
import {useRouter} from 'vue-router';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import CommonDialog from '@/components/common/CommonDialog.vue';

const router = useRouter();
interface InfoDlgConfig {
  creation?: boolean;
  itemTitle?: string;
  data: string;
}

const showDialog = defineModel<boolean>('show', {required: true});
defineProps({
  title: {
    type: String,
    default: '',
  },
  config: {
    type: Object as PropType<InfoDlgConfig>,
    required: true,
  },
});

const handleLocationLinkClick = (location: string) => {
  if (!location) return;
  const subpathArray = location.split('/').filter((path: string) => path);
  const subpath =
    subpathArray.slice(1).length > 0
      ? `${subpathArray.slice(1).join('/')}/`
      : '';
  router.push({
    name: PAGE_TYPES.S3_OBJECT_LIST,
    params: {
      bucketName: subpathArray[0],
      pathMatch: subpath,
    },
  });
};
</script>

<template>
  <CommonDialog
    :show-dialog="showDialog"
    :title="title"
    :show-cancel-btn="false"
    @submit="showDialog = false"
  >
    <div v-if="config.creation" class="pb-4">
      <div>
        {{ $t('dialog.aps.module.creation.msg') }}
      </div>
      <div
        class="location-text-format cursor-pointer pt-1"
        @click="handleLocationLinkClick(config.data)"
      >
        {{ config.data }}
      </div>
    </div>
    <div v-else class="resource-confirm">
      <v-row class="mb-4" no-gutters>
        <v-col cols="3">{{ config.itemTitle }}</v-col>
        <v-col cols="9">
          <div
            class="location-text-format cursor-pointer"
            @click="handleLocationLinkClick(config.data)"
          >
            {{ config.data }}
          </div>
        </v-col>
      </v-row>
    </div>
  </CommonDialog>
</template>

<style lang="scss" scoped>
.resource-confirm {
  padding: 16px 0px 32px;
}

.location-text-format {
  color: #1b74ed !important;
}
</style>
