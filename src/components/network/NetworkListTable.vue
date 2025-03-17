<template>
  <GeneralDataTable
    :has-click-row-handler="false"
    :items="networkZoneList"
    :last-updated-time="lastUpdatedTime"
    :loading="isLoading"
    :main-action-list="[]"
    :more-action-list="moreActionList"
    :no-data-setting="{
      ...noDataSetting,
      action: () => execImportCallback(),
    }"
    :resource-info="[
      {
        title: $t('basic.name'),
        keyOfvalue: 'name',
      },
    ]"
    :search="searchStr"
    :sorting-options="{
      sortBy: 'createdAt',
      isDescending: false,
    }"
    :table-headers="headers"
    :table-item-key="'id'"
    @fetch-data="fetchData"
    @update-search="searchStr = $event"
  >
    <template #item="{item}">
      <TD
        v-for="(header, index) in headers"
        :key="index"
        :disable-status-label="true"
        :isCursorPointer="false"
        :isStatus="header.key === 'default'"
        :item="getDeepObj(item, header.key)"
        :search="searchStr"
        :useDateFilter="header.key === 'createdAt'"
        :state-icon-style="'margin-right: 21px;'"
        :is-align-center="header.key === 'default'"
      />
    </template>
  </GeneralDataTable>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';
import useNetworks from '@/composables/useNetworks';
import {getDeepObj} from '@/utils/utils';
import {TRUSTED_CLOUD_NAMESPACE} from '@/constants/Constants';
import get from 'lodash/get';

import {
  type MoreAction,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import {type ResourceInfo} from '@/interfaces/LayoutItemInterface';
import {
  deleteExtNetwork,
  fetchExtNetworkUsage,
  updateDefaultExternalNetwork,
} from '@/api';
import {makeApiCall} from '@/api/apiCallFunctions';

// components
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';

const props = defineProps({
  zoneType: {
    type: String,
    required: true,
  },
  networkList: {
    type: Array<TableItem>,
    required: true,
  },
  execFetchDataCallback: {
    type: Function,
    required: true,
  },
  execImportCallback: {
    type: Function,
    required: true,
  },
});

const globalStore = useGlobal();
const isLoading = ref(false);
const searchStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const route = useRoute();

const {t, i18n, confirmDeleteTableItemDialog, handleCopyToClipboard} =
  useBasics();
const {
  headers,
  noDataSetting,
  projNetworkConfigList,
  execFetchProjectNetworkConfigList,
} = useNetworks(route.name as string);

const moreActionList = ref<MoreAction[]>([]);

const init = () => {
  moreActionList.value = [
    {
      label: t('network.ip.usage'),
      action: async (item: TableItem) => {
        const resourceInfo: ResourceInfo[] = [
          {
            title: t('basic.usage.notes.type', {type: 'IP'}),
            value: '- / -',
          },
        ];
        await makeApiCall({
          apiCallFn: fetchExtNetworkUsage,
          actionName: 'fetchExtNetworkUsage',
          payload: item.id,
          actionType: t('basic.get.data'),
          successCallback: (res) => {
            resourceInfo[0].value = `${res?.used} / ${res?.total}`;
            globalStore.uiShowDialog({
              title: t('network.ip.usage'),
              type: 'information',
              message: '',
              btnText: t('basic.close'),
              isResourceConfirm: true,
              resourceInfo,
            });
          },
        });
      },
    },
    {
      disabled: (item: TableItem) => item.is_default,
      label: t('basic.setting.type', {type: t('network.default')}),
      action: (item: TableItem) => {
        const resourceInfo = [
          {
            title: t('basic.name') + ':',
            value: get(item, 'name'),
          },
        ];

        globalStore.uiShowDialog({
          title: t('dialog.network.set.as.default.title'),
          type: 'delete',
          message: '',
          isResourceConfirm: true,
          resourceInfo,
          callback: () => {
            handleSetDefaultExtNetwork(item);
          },
        });
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.id),
    },
    {
      disabled: (item: TableItem) => item.is_default,
      label: t('basic.delete'),
      action: async (item) => {
        await execFetchProjectNetworkConfigList();
        const inuseSet = new Set();
        Object.keys(projNetworkConfigList.value).forEach((key: string) => {
          inuseSet.add(projNetworkConfigList.value[key]?.private);
          inuseSet.add(projNetworkConfigList.value[key]?.public);
        });

        const networkInuseList = Array.from(inuseSet);

        if (networkInuseList.includes(item.id)) {
          globalStore.uiShowDialog({
            title: t('dialog.unable.delete.title', {
              resource: t('network.external').toLowerCase(),
            }),
            type: 'delete',
            message: t('error.delete.network.still.inuse', {
              resource: t('basic.project'),
              network: t('network.external'),
            }),
            isResourceConfirm: true,
            resourceInfo: [
              {
                title: t('basic.name') + ':',
                value: item.name,
              },
            ],
            hideCancelBtn: true,
          });
          return;
        }

        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('network.external').toLowerCase(),
            }),
            message: '',
            resourceInfo: [
              {
                title: t('basic.name'),
                keyOfvalue: 'name',
              },
            ],
          },
          (item: TableItem) => {
            handleDelete(item);
          },
        );
      },
    },
  ];
};

const fetchData = async () => {
  isLoading.value = true;
  await props.execFetchDataCallback?.();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleDelete = async (item: TableItem) => {
  await makeApiCall({
    apiCallFn: deleteExtNetwork,
    actionName: 'deleteExtNetwork',
    payload: item.id,
    actionType: t('basic.delete'),
    successCallback: () => fetchData(),
  });
};

const handleSetDefaultExtNetwork = async (item: TableItem) => {
  await makeApiCall({
    apiCallFn: updateDefaultExternalNetwork,
    actionName: 'updateDefaultExternalNetwork',
    payload: item.id,
    actionType: t('basic.update'),
    successCallback: () => fetchData(),
  });
};

const networkZoneList = computed(() => {
  if (Array.isArray(props.networkList) && !isLoading.value) {
    return props.networkList
      .filter((network: TableItem) => network.namespace === props.zoneType)
      .map((network: TableItem) => ({
        ...network,
        zone:
          network.namespace === TRUSTED_CLOUD_NAMESPACE.PUBLIC
            ? t('basic.zone.public')
            : t('basic.zone.private'),
      }));
  }
  return [];
});

onMounted(() => {
  init();
  fetchData();
});

watch(
  () => i18n.global.locale,
  () => {
    init();
  },
);

defineExpose({fetchData});
</script>

<style lang="scss" scoped>
span .v-icon {
  vertical-align: unset;
}
td.text-xs-left {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
