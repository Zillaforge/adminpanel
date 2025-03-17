<template>
  <CommonDialog
    :title="title"
    :showDialog="showDialog"
    :disableSubmit="!isValid"
    @submit="handleEdit"
    @close="closeDialog"
  >
    <v-form v-model="isValid">
      <TextFieldWithHint
        v-for="(quota, index) in quotaKeyList"
        :key="index"
        v-model="quotaValues[quota.key]"
        type="number"
        class="quota-padding"
        :numberMin="getQuotaMinAmount()"
        :hintType="'minValue'"
        :inputTitle="`${quota.title}${quota.subTitle}`"
        is-required
        fill-layout
      />
    </v-form>
  </CommonDialog>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import cloneDeep from 'lodash/cloneDeep';
import useResource from '@/composables/useResource';
import {BYTES_GIB} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const route = useRoute();
const {t} = useBasics();
const isValid = ref(false);
const emit = defineEmits(['closeDialog', 'successCallback']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  quotaKeyList: {
    type: Array<Record<string, any>>,
    default: () => [],
  },
  quotaObj: {
    type: Object,
    default: () => ({}),
  },
  editProjectDefault: {
    type: Boolean,
    default: false,
  },
});
const {
  isQuotaUnitMb,
  execUpdateContainerImageQuota,
  execUpdateProjectStorageQuota,
  execUpdateVirtualImageQuota,
  execUpdateVirtualPlatformProjectQuota,
  execUpdateVirtualPlatformDefaultQuota,
} = useResource();

const quotaValues: Record<string, any> = ref({});

const title = computed(() => {
  return props.editProjectDefault
    ? t('quota.project.default')
    : t('basic.edit.type', {type: t('basic.quota')});
});
watch(
  () => props.quotaObj,
  () => {
    quotaValues.value = cloneDeep(props.quotaObj?.quota);
  },
  {deep: true},
);

const getQuotaMinAmount = () => {
  return '-1';
};

const handleEdit = () => {
  const promiseArray: any = [];

  const pageType = route.name as string;
  if (pageType === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    let body = {};
    props.quotaKeyList.forEach((quota: Record<string, any>) => {
      body = {
        ...body,
        [quota.key]: isQuotaUnitMb(quota.key)
          ? parseInt(quotaValues.value[quota.key]) !== -1
            ? parseInt(quotaValues.value[quota.key]) * 1024
            : -1
          : parseInt(quotaValues.value[quota.key]),
      };
    });
    if (props.editProjectDefault) {
      promiseArray.push(execUpdateVirtualPlatformDefaultQuota(body));
    } else {
      promiseArray.push(
        execUpdateVirtualPlatformProjectQuota(props.quotaObj.id, body),
      );
    }
  } else if (pageType === PAGE_TYPES.QUOTA_STORAGE_LIST) {
    props.quotaKeyList.forEach((quota: Record<string, any>) => {
      const quotaValue =
        parseFloat(quotaValues.value[quota.key]) !== -1
          ? parseFloat(quotaValues.value[quota.key]) * BYTES_GIB
          : -1;

      promiseArray.push(
        execUpdateProjectStorageQuota(props.quotaObj.id, quotaValue, quota.key),
      );
    });
  } else if (pageType === PAGE_TYPES.QUOTA_IMAGE_LIST) {
    const keyList = props.quotaKeyList.map(
      (quota: Record<string, any>) => quota.key,
    );
    promiseArray.push(
      execUpdateVirtualImageQuota(props.quotaObj.id, {
        softLimitCount: Number(quotaValues.value.imageVmCounts),
        softLimitSize:
          parseFloat(quotaValues.value.imageVmSize) !== -1
            ? parseFloat(quotaValues.value.imageVmSize) * BYTES_GIB
            : -1,
      }),
    );
    if (keyList.includes('imageCtnSize')) {
      promiseArray.push(
        execUpdateContainerImageQuota(props.quotaObj.id, {
          storageLimit:
            parseFloat(quotaValues.value.imageCtnSize) !== -1
              ? parseFloat(quotaValues.value.imageCtnSize) * BYTES_GIB
              : -1,
        }),
      );
    }
  }
  uiShowProgress();
  return Promise.allSettled(promiseArray)
    .then(() => {
      emit('successCallback');
    })
    .finally(() => {
      uiHideProgress();
      closeDialog();
    });
};
const closeDialog = () => {
  emit('closeDialog');
};
</script>

<style lang="scss" scoped>
.quota-padding {
  padding-left: 10px;
}
</style>
