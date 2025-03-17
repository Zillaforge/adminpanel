<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp :title="title" />
        <GeneralDataTable
          :has-click-row-handler="false"
          :items="flavorList"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="[
            {
              label: $t('basic.create'),
              action: () => (showCreateDialog = true),
            },
          ]"
          :more-action-list="moreActionList"
          :no-data-setting="noDataSettingAfter"
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
          @update-search="searchStr = $event"
        >
          <template #item="{item}">
            <TD
              v-for="(header, index) in headers"
              :key="index"
              :disable-status-label="true"
              :item="extractData(item, header.key)"
              :isCursorPointer="false"
              :isStatus="header.key === 'permission'"
              :search="searchStr"
              :useDateFilter="header.key === 'createdAt'"
              :state-icon-style="'margin-right: 21px;'"
              :is-align-center="header.key === 'permission'"
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <FlavorCreateDialog
      :showDialog="showCreateDialog"
      :headers="headers"
      :flavorType="flavorType"
      @triggerFetch="fetchData"
      @closeDialog="showCreateDialog = false"
    />
    <PermissionEditDialog
      v-model:show="showPermissionDialog"
      v-model:item="editFlavor"
      :submit-callback="handleEditPermission"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {getDeepObj} from '@/utils/utils';
import {useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useFlavors from '@/composables/useFlavors';
import {FLAVOR_TYPE} from '@/constants/Constants';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';
import FlavorCreateDialog from '@/components/flavor/FlavorCreateDialog.vue';
import PermissionEditDialog from '@/components/common/PermissionEditDialog.vue';

const {t, confirmDeleteTableItemDialog, handleCopyToClipboard} = useBasics();

const editFlavor = ref<TableItem>({});
const searchStr = ref('');
const isLoading = ref(false);
const showCreateDialog = ref(false);
const showPermissionDialog = ref(false);
const lastUpdatedTime = ref<Date | string>('');

const props = defineProps({
  flavorType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const {
  headers,
  noDataSetting,
  flavorList,
  execFetchVmFlavors,
  execFetchRemoteDesktopFlavors,

  execDeleteFlavor,
  execUpdateFlavor,
} = useFlavors(route.name as string);

const moreActionList = computed(() => {
  return [
    {
      visible: () => props.flavorType === FLAVOR_TYPE.VM,
      label: t('table.action.config.permission'),
      action: (item: TableItem) => {
        showPermissionDialog.value = true;
        editFlavor.value = Object.assign({}, item);
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.id),
    },
    {
      // visible: () => props.projectType === PROJECT_TYPE.GENERAL,
      label: t('basic.delete'),
      action: (item: TableItem) => {
        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('basic.flavor').toLowerCase(),
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
            await handleDelete(item);
            fetchData();
          },
        );
      },
    },
  ];
});

const title = computed(() => props.title);
const flavorPrefix = computed(() =>
  props.flavorType === FLAVOR_TYPE.VM ? 'vps' : 'rds',
);
const noDataSettingAfter = computed(() => {
  return {
    ...noDataSetting.value,
    action: () => (showCreateDialog.value = true),
  };
});

const fetchData = async () => {
  isLoading.value = true;

  if (props.flavorType === FLAVOR_TYPE.VM) {
    await execFetchVmFlavors();
  } else {
    await execFetchRemoteDesktopFlavors();
  }

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleDelete = async (item: TableItem) => {
  execDeleteFlavor(item.id, flavorPrefix.value).then(() => fetchData());
};

const extractData = (item: TableItem, headerKey: string) => {
  return getDeepObj(item, headerKey);
};

const handleEditPermission = (isPublic: boolean, selectionList: string[]) => {
  showPermissionDialog.value = false;
  execUpdateFlavor(editFlavor.value.id, flavorPrefix.value, {
    public: isPublic,
    project_ids: isPublic ? [] : selectionList,
  }).then(() => fetchData());
};

onMounted(() => {
  fetchData();
});
</script>
