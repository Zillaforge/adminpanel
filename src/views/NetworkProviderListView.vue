<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="$t('basic.management.type', {type: $t('network.provider')})"
        />
      </v-col>
      <GeneralDataTable
        :items="networkProviderList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :main-action-list="[
          {
            label: $t('basic.create'),
            action: () => (showCreateDialog = true),
          },
        ]"
        :more-action-list="moreActionList"
        :no-data-setting="{
          ...noDataSetting,
          action: () => (showCreateDialog = true),
        }"
        :resource-info="[
          {
            title: $t('basic.name'),
            keyOfvalue: 'name',
          },
        ]"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'name',
          isDescending: false,
        }"
        :table-headers="headers"
        :table-item-key="'name'"
        @fetch-data="fetchData"
        @on-row-click="routeToDetail"
        @update-search="searchStr = $event"
      >
        <template #item="{item}">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :search="searchStr"
            :useDateFilter="header.key === 'createdTime'"
            :str-slice-length="48"
            :truncate-id="false"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <NetworkProviderCreateDialog
      :show-dialog="showCreateDialog"
      :submit-callback="fetchData"
      @close-dialog="showCreateDialog = false"
    />
    <EditDescriptionDialog
      v-model:item="editItem"
      v-model:show="showEditDialog"
      :submit-callback="handleEdit"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, watch, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';
import useNetworks from '@/composables/useNetworks';
import {getDeepObj} from '@/utils/utils';

import {type NetworkProviderItemInterface} from '@/interfaces/DataTypeInterface';
import {
  type MoreAction,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';

// components
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import NetworkProviderCreateDialog from '@/components/network/NetworkProviderCreateDialog.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const isLoading = ref(false);
const searchStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const editItem = ref<TableItem>({});
const route = useRoute();
const globalStore = useGlobal();
const {t, i18n, confirmDeleteTableItemDialog, handleCopyToClipboard} =
  useBasics();
const {
  headers,
  noDataSetting,
  networkProviderList,
  providerNetworkAssociatedList,
  execDeleteProviderNetwork,
  execFetchProviderNetworkList,
  execFetchProviderNetworkServerAttachments,
  execUpdateProviderNetwork,
  toDetailPage,
} = useNetworks(route.name as string);

const moreActionList = ref<MoreAction[]>([]);
const init = () => {
  moreActionList.value = [
    {
      label: t('basic.edit.type', {type: t('basic.desc')}),
      action: (item: TableItem) => {
        editItem.value = Object.assign({}, item);
        showEditDialog.value = true;
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.id),
    },
    {
      label: t('basic.delete'),
      action: async (item: TableItem) => {
        await execFetchProviderNetworkServerAttachments(item.id);
        const serverList = providerNetworkAssociatedList.value.filter(
          (elem) => elem.server,
        );
        if (serverList?.length > 0) {
          console.log('List: ', serverList);
          globalStore.uiShowDialog({
            title: t('dialog.unable.delete.title', {
              resource: t('network.provider').toLowerCase(),
            }),
            type: 'delete',
            message: t('error.delete.network.still.inuse', {
              resource: t('service.vm.name'),
              network: t('network.provider'),
            }),
            isResourceConfirm: true,
            resourceInfo: [
              {
                title: t('basic.name') + ':',
                value: item.name,
              },
            ],
          });
          return;
        }

        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('network.provider').toLowerCase(),
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
            handleDelete(item.id);
          },
        );
      },
    },
  ];
};

const handleDelete = async (id: string) => {
  await execDeleteProviderNetwork(id).then(() => {
    fetchData();
  });
};

const fetchData = async () => {
  isLoading.value = true;
  await execFetchProviderNetworkList();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleEdit = async () => {
  showEditDialog.value = false;
  await execUpdateProviderNetwork(editItem.value.id, {
    description: editItem.value.description,
  }).then(() => {
    fetchData();
  });
};

const routeToDetail = (item: TableItem) => {
  console.log('routeToDetail: ', item);
  const networkItem = item as NetworkProviderItemInterface;
  toDetailPage(networkItem.id);
};

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
</script>

<style lang="scss" scoped></style>
