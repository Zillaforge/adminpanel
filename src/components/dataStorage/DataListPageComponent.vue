<script lang="ts">
import {ref, computed, onMounted, type Ref, type PropType} from 'vue';
import useBasics from '@/composables/useBasics';

import AccessControlDialog from '@/components/dataStorage/S3BucketAccessControlDialog.vue';
import CreateDialog from '@/components/dataStorage/S3BucketCreateDialog.vue';
import UsageDialog from '@/components/dataStorage/S3UsageDialog.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import {showStorageFullDialog} from '@/composables/useCloudStorage';
import {
  ActionType,
  MainActionType,
  type NoDataSetting,
  type TableItem,
  type MoreAction,
} from '@/interfaces/InfraDataTableInterface';
import {getDeepObj} from '@/utils/utils';

export default {
  name: 'DataListPageComponent',
};
</script>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  headers: {
    type: Array<any>,
    default: () => [],
  },
  linkUrl: {
    type: String,
    default: '',
  },
  dataList: {
    type: Array<TableItem>,
    default: () => [],
  },
  noDataSetting: {
    type: Object as PropType<NoDataSetting>,
    default: null,
  },
  endpoint: {
    type: String,
    default: '',
  },
  allocatedBytes: {
    type: Number,
    default: 0,
  },
  usedBytes: {
    type: Number,
    default: 0,
  },
  moreActionList: {
    type: Array<MoreAction>,
    default: undefined,
  },
});

const emits = defineEmits([
  'createAction',
  'deleteAction',
  'getUsage',
  'toDetailPage',
  'fetchData',
]);

const {handleCopyToClipboard} = useBasics();

const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const showCreateDialog: Ref<boolean> = ref(false);
const showUsageDialog: Ref<boolean> = ref(false);
const showAccessControlDialog: Ref<boolean> = ref(false);
const selectedName: Ref<string> = ref('');

const filterS3Endpoint = computed(() => {
  const urlReg = /(http(s)?:\/\/)*/g;
  let value = props.endpoint;
  if (urlReg.test(value)) {
    value = value.substring(urlReg.lastIndex);
  }

  if (value.endsWith('/')) {
    value = value.slice(0, value.length - 1);
  }
  return value;
});

const isQuotaFull = computed(() => {
  if (props.allocatedBytes === -1) {
    return false;
  } else if (props.usedBytes >= props.allocatedBytes) {
    return true;
  }
  return false;
});

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  emits('fetchData', () => {
    lastUpdatedTime.value = new Date();
    isLoading.value = false;
  });
};

const openCreateDialog = () => {
  if (isQuotaFull.value) {
    showStorageFullDialog();
  } else {
    showCreateDialog.value = true;
  }
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
};

const createAction = (name: string) => {
  closeCreateDialog();
  isLoading.value = true;
  emits('createAction', name, () => (isLoading.value = false));
};

const deleteAction = (name: string) => {
  isLoading.value = true;
  emits('deleteAction', name, () => (isLoading.value = false));
};

const getUsage = () => {
  emits('getUsage', () => (showUsageDialog.value = true));
};

const closeAccessControlDialog = (reFetchData: boolean = false) => {
  if (reFetchData) {
    fetchData();
  }
  selectedName.value = '';
  showAccessControlDialog.value = false;
};
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="title" :link-url="linkUrl" />
      <GeneralDataTable
        :main-action-list="[
          {
            type: MainActionType.CREATE,
            action: openCreateDialog,
          },
        ]"
        :more-action-list="
          moreActionList ?? [
            {
              label: $t('s3.accessControl'),
              action: (item) => {
                selectedName = item.Name;
                showAccessControlDialog = true;
              },
            },
            {
              type: ActionType.DELETE,
              action: (item) => deleteAction(String(item.Name)),
            },
          ]
        "
        :resource-info="[
          {
            title: $t('basic.name'),
            keyOfvalue: 'Name',
          },
        ]"
        :custom-btn-list="[
          {
            label: $t('s3.usage'),
            action: getUsage,
          },
        ]"
        :items="dataList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'Name'"
        :loading="isLoading"
        :no-data-setting="{...noDataSetting, action: openCreateDialog}"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'Name',
          isDescending: false,
        }"
        @fetch-data="fetchData"
        @on-row-click="(item) => emits('toDetailPage', item)"
        @update-search="searchStr = $event"
      >
        <template #item="{item}">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
          />
        </template>
        <template #message>
          <span class="text-end">
            {{ $t('s3.plugin.service.endpoint') }}:
            <span>{{ filterS3Endpoint }}</span>
            <v-icon
              class="ml-2"
              @click="handleCopyToClipboard(filterS3Endpoint)"
            >
              mdi-content-copy
            </v-icon>
          </span>
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <AccessControlDialog
    :show="showAccessControlDialog"
    :bucket-name="selectedName"
    @close-dialog="closeAccessControlDialog"
  />
  <CreateDialog
    :show="showCreateDialog"
    @create-bucket="createAction"
    @close-dialog="closeCreateDialog"
  />
  <UsageDialog
    :show="showUsageDialog"
    :used-bytes="usedBytes"
    :allocated-bytes="allocatedBytes"
    @close-dialog="showUsageDialog = false"
  />
</template>
