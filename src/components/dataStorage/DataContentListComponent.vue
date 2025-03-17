<script lang="ts">
import {useGlobal} from '@/store';
import {ref, computed, watch, onMounted, type Ref, type PropType} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import useBasics from '@/composables/useBasics';

import CreateFolderDialog from '@/components/dataStorage/S3ObjectCreateFolderDialog.vue';
import UploadDialog from '@/components/dataStorage/S3ObjectUploadDialog.vue';
import UsageDialog from '@/components/dataStorage/S3UsageDialog.vue';
import TdHighlight from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import {showStorageFullDialog} from '@/composables/useCloudStorage';
import {
  ActionType,
  type NoDataSetting,
  type TableItem,
  type MoreAction,
} from '@/interfaces/InfraDataTableInterface';

export default {
  name: 'DataContentListComponent',
};
</script>

<script lang="ts" setup>
const globalStore = useGlobal();
const route = useRoute();
const router = useRouter();
const {handleCopyToClipboard} = useBasics();

const props = defineProps({
  headers: {
    type: Array<any>,
    default: () => [],
  },
  contentList: {
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
  isTruncated: {
    type: Boolean,
    default: false,
  },
  enableDelete: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits([
  'createFolderAction',
  'deleteAction',
  'downloadAction',
  'getUsage',
  'toDetailPage',
  'fetchData',
]);

const tableId = ref(0);
const pageTitle: Ref<string> = ref('');
const loading: Ref<boolean> = ref(false);
const isFetchOngoing: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const prefix: Ref<string> = ref('');
const bucketName: Ref<string> = ref('');
const showCreateFolderDialog: Ref<boolean> = ref(false);
const showUploadDialog: Ref<boolean> = ref(false);
const showUsageDialog: Ref<boolean> = ref(false);

const isQuotaFull = computed(() => {
  if (props.allocatedBytes === -1) {
    return false;
  } else if (props.usedBytes >= props.allocatedBytes) {
    return true;
  }
  return false;
});

onMounted(() => {
  init();
  fetchData();
});

const init = () => {
  const pathMatch = route.params.pathMatch
    ? typeof route.params.pathMatch === 'string'
      ? route.params.pathMatch
      : route.params.pathMatch[0]
    : '';

  bucketName.value = route.params.bucketName
    ? typeof route.params.bucketName === 'string'
      ? route.params.bucketName
      : route.params.bucketName[0]
    : '';

  globalStore.setBreadcrumbsParams({
    bucketName: bucketName.value,
    path: pathMatch,
  });

  prefix.value = pathMatch;

  if (!prefix.value) {
    pageTitle.value = bucketName.value;
    return;
  }
  const path = prefix.value.split('/');
  pageTitle.value = path[path.length - 2];
};

const fetchData = async (
  showLoading: boolean = true,
  isFetchMoreAction: boolean = false,
) => {
  loading.value = showLoading;

  if (isFetchOngoing.value) {
    return;
  } else {
    isFetchOngoing.value = true;
  }

  emits(
    'fetchData',
    {bucketName: bucketName.value, prefix: prefix.value, isFetchMoreAction},
    () => {
      lastUpdatedTime.value = new Date();
      loading.value = false;
      isFetchOngoing.value = false;
    },
  );
};

const gotoObjectDetail = async (item: any) => {
  if (!route.name) {
    return;
  }

  return await router.push({
    name: route.name,
    params: {
      bucketName: item.Name,
      pathMatch: item.Prefix || '',
    },
  });
};

const handleCopy = (e: {stopPropagation: () => void}, item: TableItem) => {
  e.stopPropagation();
  handleCopyToClipboard(item.Key as string);
};

const createFolder = (folderName: string) => {
  closeCreateFolderDialog();
  loading.value = true;
  emits(
    'createFolderAction',
    bucketName.value,
    `${prefix.value}${folderName}/`,
    () => {
      fetchData();
    },
    () => {
      loading.value = false;
    },
  );
};

const closeCreateFolderDialog = () => {
  showCreateFolderDialog.value = false;
};

const closeUploadDialog = (reFetchData: boolean = false) => {
  if (reFetchData) {
    fetchData();
  }
  showUploadDialog.value = false;
};

const deleteItem = (item: TableItem) => {
  const deleteObjects = [
    {
      Key: item.Key,
      isFolder: !!item.Prefix,
    },
  ];
  loading.value = true;

  emits(
    'deleteAction',
    bucketName.value,
    deleteObjects,
    () => {
      fetchData();
    },
    () => {
      loading.value = false;
    },
  );
};

const createFolderAction = () => {
  if (isQuotaFull.value) {
    showStorageFullDialog();
  } else {
    showCreateFolderDialog.value = true;
  }
};

const uploadAction = () => {
  if (isQuotaFull.value) {
    showStorageFullDialog();
  } else {
    showUploadDialog.value = true;
  }
};

const downloadItem = (item: TableItem) => {
  const downloadParams = {
    Bucket: bucketName.value,
    Key: item.Key,
  };
  emits('downloadAction', downloadParams, (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', '');
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  });
};

const getUsage = () => {
  emits('getUsage', () => (showUsageDialog.value = true));
};

watch(route, () => {
  init();
  fetchData();
  tableId.value += 1;
});
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="pageTitle" />
      <GeneralDataTable
        :key="tableId"
        :table-action-list="[
          {
            icon: 'mdi-folder-plus-outline',
            tips: $t('basic.create.type', {
              type: $t('basic.folder'),
            }),
            action: createFolderAction,
          },
          {
            icon: 'mdi-tray-arrow-up',
            tips: $t('basic.upload'),
            action: uploadAction,
          },
        ]"
        :more-action-list="[
          {
            visible: (item) => !item.Prefix,
            label: $t('basic.download'),
            action: (item) => downloadItem(item),
          },
          {
            visible: (item) => enableDelete,
            type: ActionType.DELETE,
            action: (item) => {
              deleteItem(item);
            },
          },
        ]"
        :resource-info="[
          {
            title: $t('basic.name'),
            keyOfvalue: 'name',
          },
        ]"
        :custom-btn-list="[
          {
            label: $t('s3.usage'),
            action: getUsage,
          },
        ]"
        :items="contentList"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'name'"
        :loading="loading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'lastModified',
          isDescending: true,
        }"
        :show-fetch-more-data="isTruncated"
        :has-click-row-handler="(item: any) => !!item.Prefix"
        @fetch-data="fetchData"
        @fetch-more-data="fetchData(true, true)"
        @on-row-click="gotoObjectDetail"
        @update-search="searchStr = $event"
      >
        <template #item="{item}">
          <TdHighlight
            :item="item.name"
            :search="searchStr"
            :icon="
              item.name.endsWith('/')
                ? 'mdi-folder-outline'
                : 'mdi-file-document-outline'
            "
          >
            <v-icon class="ml-4" @click="handleCopy($event, item)">
              mdi-content-copy
            </v-icon>
          </TdHighlight>
          <TdHighlight
            v-if="headers.findIndex((h) => h.key === 'size') >= 0"
            :item="item.size"
            :search="searchStr"
          />
          <TdHighlight
            v-if="headers.findIndex((h) => h.key === 'lastModified') >= 0"
            :item="item.lastModified"
            :search="searchStr"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <CreateFolderDialog
    :show="showCreateFolderDialog"
    @create-folder="createFolder"
    @close-dialog="closeCreateFolderDialog"
  />
  <UploadDialog
    :show="showUploadDialog"
    :bucket-name="bucketName"
    :path="prefix"
    @close-dialog="closeUploadDialog"
  />
  <UsageDialog
    :show="showUsageDialog"
    :used-bytes="usedBytes"
    :allocated-bytes="allocatedBytes"
    @close-dialog="showUsageDialog = false"
  />
</template>
