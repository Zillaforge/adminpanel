<template>
  <GeneralDataTable
    :main-action-list="[]"
    :more-action-list="moreActionList"
    :items="imageZoneList"
    :last-updated-time="lastUpdatedTime"
    :loading="isLoading"
    :no-data-setting="{
      ...noDataSetting,
      action: () => execCreateCallback(),
    }"
    :search="searchStr"
    :sorting-options="{
      sortBy: 'name',
      isDescending: false,
    }"
    :table-headers="headers"
    :table-item-key="'id'"
    @fetch-data="fetchData"
    @update-search="searchStr = $event"
    @on-row-click="
          (item: any) => {
            toDetailPage(item.id);
          }
        "
  >
    <template #item="{item}">
      <TD
        v-for="(header, index) in headers"
        :key="index"
        :item="getDeepObj(item, header.key)"
        :is-cursor-pointer="false"
        :search="searchStr"
        :is-status="header.key === 'status'"
      />
    </template>
  </GeneralDataTable>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useImages from '@/composables/useImages';
import {getDeepObj} from '@/utils/utils';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';
import {TRUSTED_CLOUD_NAMESPACE} from '@/constants/Constants';

// components
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
const route = useRoute();
const router = useRouter();
const props = defineProps({
  zoneType: {
    type: String,
    required: true,
  },
  vmImageList: {
    type: Array<TableItem>,
    required: true,
  },
  execFetchDataCallback: {
    type: Function,
    required: true,
  },
  execCreateCallback: {
    type: Function,
    required: true,
  },
  launchEditDialogCallback: {
    type: Function,
    required: true,
  },
});
const {t, confirmDeleteTableItemDialog} = useBasics();
const {headers, noDataSetting, execDeleteVirtualImage} = useImages(
  route.name as string,
);

const isLoading = ref(false);
const searchStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const fetchData = async () => {
  isLoading.value = true;
  await props.execFetchDataCallback?.();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const toDetailPage = async (imageId: string) => {
  await router.push({
    name: PAGE_TYPES.VM_IMAGE_DETAIL,
    params: {imageId},
  });
};

const handleDelete = async (item: TableItem) => {
  await execDeleteVirtualImage(item.id);
};

const moreActionList = computed(() => {
  return [
    {
      label: t('basic.edit.type', {type: t('basic.desc')}),
      action: (item: TableItem) => {
        props.launchEditDialogCallback?.(item);
      },
    },
    {
      label: t('basic.delete'),
      action: (item) => {
        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('basic.image').toLowerCase(),
            }),
            message: '',
            resourceInfo: [
              {
                title: t('basic.name'),
                keyOfvalue: 'name',
              },
            ],
          },
          async (item: TableItem) => {
            isLoading.value = true;
            await handleDelete(item).then(() => fetchData());
          },
        );
      },
    },
  ];
});

const imageZoneList = computed(() => {
  if (Array.isArray(props.vmImageList) && !isLoading.value) {
    return props.vmImageList
      .filter((vmImg: TableItem) => vmImg.namespace === props.zoneType)
      .map((vmImg: TableItem) => ({
        ...vmImg,
        zone:
          vmImg.namespace === TRUSTED_CLOUD_NAMESPACE.PUBLIC
            ? t('basic.zone.public')
            : t('basic.zone.private'),
      }));
  }
  return [];
});

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped></style>
