<script lang="ts" setup>
import {useGlobal} from '@/store';
import {ref, onBeforeMount, type Ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {getDeepObj} from '@/utils/utils';
import useBasics from '@/composables/useBasics';
import useAppService from '@/composables/useAppService';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import PermissionEditDialog from '@/components/common/PermissionEditDialog.vue';
import ModuleLocationInfoDialog from '@/components/appService/ModuleInfoDialog.vue';

import {fetchApsModuleAcl} from '@/api';
import {makeApiCall} from '@/api/apiCallFunctions';
const route = useRoute();
const {t, confirmDeleteTableItemDialog, handleCopyToClipboard} = useBasics();
const globalStore = useGlobal();
const {
  headers,
  execFetchModuleList,
  execUpdateApsModule,
  execUpdateApsModuleAcl,
  execDeleteApsModule,
} = useAppService(PAGE_TYPES.APPLICATION_DETAIL_LIST);

const isLoading: Ref<boolean> = ref(false);
const showPermissionDialog = ref(false);
const showInfoDialog = ref(false);

const editItem = ref<TableItem>({});
const lastUpdatedTime: Ref<Date | string> = ref('');
const moduleVersions: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

onBeforeMount(() => {
  globalStore.setBreadcrumbsParams({
    name: route.params.name,
  });
});

const fetchData = async () => {
  isLoading.value = true;

  moduleVersions.value = await execFetchModuleList(
    route.params.categoryId as string,
  );

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleEditPermission = async (
  isPublic: boolean,
  selectionList: string[],
) => {
  showPermissionDialog.value = false;

  await execUpdateApsModule(editItem.value.id, {public: isPublic});
  await execUpdateApsModuleAcl(
    editItem.value.id,
    isPublic ? [] : selectionList,
  ).then(() => fetchData());
};

const appModuleList = computed(() => {
  return moduleVersions.value.map((module: TableItem) => ({
    ...module,
    permission: module.public ? 'permit-public' : '',
  }));
});

const moreActionList = computed(() => [
  {
    label: t('table.action.config.permission'),
    action: async (item: TableItem) => {
      await makeApiCall({
        apiCallFn: fetchApsModuleAcl,
        payload: item.id,
        actionName: 'fetchApsModuleAcl',
        actionType: t('basic.get.data'),
        successCallback: (res) => {
          editItem.value = Object.assign(
            {},
            {...item, project_ids: res?.projectIds},
          );
          editItem.value.name = `${editItem.value?.moduleCategory?.name} ${editItem.value.name}`;
          showPermissionDialog.value = true;
        },
      });
    },
  },
  {
    label: t('label.location'),
    action: (item: TableItem) => {
      editItem.value = Object.assign({}, item);
      editItem.value.name = `${editItem.value?.moduleCategory?.name} ${editItem.value.name}`;
      showInfoDialog.value = true;
    },
  },
  {
    label: t('basic.copy.type', {type: 'ID'}),
    action: (item: TableItem) => handleCopyToClipboard(item?.id),
  },
  {
    label: t('basic.delete'),
    action: (item: TableItem) => {
      confirmDeleteTableItemDialog(
        item,
        {
          title: t('dialog.delete.title', {
            resource: t('label.version').toLowerCase(),
          }),
          message: '',
          resourceInfo: [
            {
              title: t('label.version'),
              keyOfvalue: 'name',
            },
          ],
        },
        async (item: TableItem) => {
          execDeleteApsModule(item?.id).then(() => fetchData());
        },
      );
    },
  },
]);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="`${route.params.name}`" />

      <GeneralDataTable
        :items="appModuleList"
        :more-action-list="moreActionList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'createdAt',
          isDescending: true,
        }"
        :table-headers="headers"
        :table-item-key="'name'"
        :has-click-row-handler="false"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
      >
        <template #item="{item}">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'permission'"
            :use-date-filter="header.key === 'createdAt'"
            :state-icon-style="'margin-right: 21px;'"
            :is-align-center="header.key === 'permission'"
            :disable-status-label="header.key === 'permission'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <PermissionEditDialog
      v-model:show="showPermissionDialog"
      v-model:item="editItem"
      :dialog-title="
        $t('basic.config.permission.type', {type: $t('services.application')})
      "
      :submit-callback="handleEditPermission"
    />
    <ModuleLocationInfoDialog
      v-model:show="showInfoDialog"
      :title="t('label.location', {type: editItem?.name})"
      :config="{
        creation: false,
        itemTitle: t('label.location'),
        data: editItem?.location,
      }"
    />
  </UiContainer>
</template>
