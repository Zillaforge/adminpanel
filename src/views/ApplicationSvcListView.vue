<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="
            $t('basic.management.type', {type: $t('services.application')})
          "
        />
        <GeneralDataTable
          :items="appServiceList"
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
          :search="searchStr"
          :sorting-options="{
            sortBy: 'name',
            isDescending: false,
          }"
          :table-headers="headers"
          :table-item-key="'name'"
          @fetch-data="fetchData"
          @update-search="searchStr = $event"
          @on-row-click="(item: any) => toDetailPage(item)"
        >
          <template #item="{item}">
            <TD
              v-for="(header, index) in headers"
              :key="index"
              :is-cursor-pointer="false"
              :item="getDeepObj(item, header.key)"
              :search="searchStr"
              :use-date-filter="header.key === 'createdAt'"
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <AppSvcCreateDialog
      v-model:show="showCreateDialog"
      :dialog-title="
        $t('basic.create.type', {type: $t('services.application')})
      "
      :submit-callback="afterModuleCreated"
    />
    <ModuleCreateResultDialog
      v-model:show="showResultDialog"
      :title="t('dialog.aps.module.creation.title')"
      :config="{
        creation: true,
        data: locationStr,
      }"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useGlobal} from '@/store';
import {useRouter} from 'vue-router';

import useBasics from '@/composables/useBasics';
import useAppService from '@/composables/useAppService';
import {getDeepObj} from '@/utils/utils';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import AppSvcCreateDialog from '@/components/appService/AppSvcCreateDialog.vue';
import ModuleCreateResultDialog from '@/components/appService/ModuleInfoDialog.vue';

const {t, confirmDeleteTableItemDialog, handleCopyToClipboard} = useBasics();
const {
  headers,
  noDataSetting,
  execFetchModuleCategoryList,
  execDeleteModuleCategory,
} = useAppService(PAGE_TYPES.APPLICATION_SERVICE_LIST);

const router = useRouter();
const globalStore = useGlobal();
const isLoading = ref(false);
const showCreateDialog = ref(false);
const showResultDialog = ref(false);
const searchStr = ref('');
const locationStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const categoryList = ref<Array<Record<string, any>>>([]);

const fetchData = async () => {
  isLoading.value = true;
  categoryList.value = await execFetchModuleCategoryList();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const toDetailPage = async (item: TableItem) => {
  await router.push({
    name: PAGE_TYPES.APPLICATION_DETAIL_LIST,
    params: {
      categoryId: item.id,
      name: item.name,
    },
  });
};

const appServiceList = computed(() => {
  return categoryList.value;
});

const moreActionList = computed(() => [
  {
    label: t('basic.copy.type', {type: 'ID'}),
    action: (item: TableItem) => handleCopyToClipboard(item?.id),
  },
  {
    label: t('basic.delete'),
    action: (item) => {
      if (item.moduleCount > 0) {
        globalStore.uiShowDialog({
          title: t('dialog.unable.delete.title', {
            resource: t('services.application').toLowerCase(),
          }),
          type: 'delete',
          message: t('tips.aps.module.category.delete'),
          isResourceConfirm: false,
          hideCancelBtn: true,
        });
        return;
      }

      confirmDeleteTableItemDialog(
        item,
        {
          title: t('dialog.delete.title', {
            resource: t('services.application').toLowerCase(),
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
          execDeleteModuleCategory(item?.id).then(() => fetchData());
        },
      );
    },
  },
]);

const afterModuleCreated = (module: Record<string, any>) => {
  locationStr.value = module.location;
  showResultDialog.value = true;
};

onMounted(() => {
  fetchData();
});
</script>
