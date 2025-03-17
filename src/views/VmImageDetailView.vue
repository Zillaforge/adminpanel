<script lang="ts" setup>
import {useGlobal} from '@/store';
import {ref, type Ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useImages from '@/composables/useImages';

import {type TableItem} from '@/interfaces/InfraDataTableInterface';

import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import PermissionEditDialog from '@/components/common/PermissionEditDialog.vue';
import {getDeepObj} from '@/utils/utils';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';

import {deleteVirtualImageTag} from '@/api';
import {makeApiCallWithoutProgress} from '@/api/apiCallFunctions';

const globalStore = useGlobal();
const route = useRoute();
const {t, confirmDeleteTableItemDialog, handleCopyToClipboard} = useBasics();
const {
  headers,
  vmImageTagList,
  vmImageTagProjectAcls,
  execCreateVirtualImageTagProjectAcl,
  execDeleteVirtualImageTagProjectAcl,
  execFetchVirtualImageDetail,
  execFetchVirtualImageTagList,
  execFetchVirtualImageTagProjectAcls,
} = useImages(route.name as string);
const showDialog = ref(false);
const imageDetail = ref<Record<string, any>>({});
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const editItem = ref<TableItem>({});

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  imageDetail.value = await execFetchVirtualImageDetail(
    route.params.imageId as string,
  );
  globalStore.setBreadcrumbsParams({
    imageName: imageDetail.value?.name ?? '',
  });
  await fetchImageTagInfo();
  isLoading.value = false;
};

const fetchImageTagInfo = async () => {
  await execFetchVirtualImageTagProjectAcls(undefined);
  await execFetchVirtualImageTagList(
    imageDetail.value?.project?.id,
    route.params.imageId as string,
  );
  lastUpdatedTime.value = new Date();
};
const title = computed(() => imageDetail.value?.name ?? '');

const imageTagList = computed(() => {
  if (Array.isArray(vmImageTagList.value) && !isLoading.value) {
    return vmImageTagList.value.map((tag: TableItem) => ({
      ...tag,
      type:
        tag.type === 'increase'
          ? t('image.type.incremental')
          : t('image.type.common'),
    }));
  }
  return [];
});

const moreActionList = computed(() => {
  return [
    {
      label: t('table.action.config.permission'),
      action: async (item: TableItem) => {
        editItem.value = Object.assign({}, item);
        editItem.value.name = title.value + ' ' + editItem.value.name;
        showDialog.value = true;
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.id),
    },
    {
      label: t('basic.delete'),
      action: (item) => {
        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('label.version').toLowerCase(),
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
            console.log('handleDelete: ', item);
            handleDelete(item);
          },
        );
      },
    },
  ];
});
const handleEditPermission = async (
  isPublic: boolean,
  selectionList: string[],
) => {
  const tagProjectAcls = vmImageTagProjectAcls.value.filter(
    (projAcl: Record<string, any>) => projAcl?.tag?.id === editItem.value.id,
  );
  showDialog.value = false;
  const toRemoveList = isPublic
    ? tagProjectAcls.map((projAcl: Record<string, any>) => projAcl.id)
    : tagProjectAcls
        .filter(
          (projAcl: Record<string, any>) =>
            !selectionList.includes(projAcl?.project?.id),
        )
        .map((projAcl: Record<string, any>) => projAcl.id);

  const curSelectedList = tagProjectAcls.map(
    (projAcl: Record<string, any>) => projAcl?.project?.id,
  );
  const toCreateList = !isPublic
    ? selectionList.filter(
        (select: string) => !curSelectedList.includes(select),
      )
    : [''];

  const promiseArray: any = [];
  if (toRemoveList.length > 0) {
    toRemoveList.forEach((projAclId: string) => {
      promiseArray.push(execDeleteVirtualImageTagProjectAcl(projAclId));
    });
  }
  if (toCreateList.length > 0) {
    toCreateList.forEach((projectId: string) => {
      promiseArray.push(
        execCreateVirtualImageTagProjectAcl(editItem.value.id, projectId),
      );
    });
  }
  uiShowProgress();
  Promise.allSettled(promiseArray)
    .then(() => {
      fetchData();
    })
    .finally(() => {
      uiHideProgress();
    });
};

const handleDelete = async (item: TableItem) => {
  isLoading.value = true;
  await makeApiCallWithoutProgress({
    apiCallFn: deleteVirtualImageTag,
    payload: item?.id,
    actionName: 'deleteVirtualImageTag',
    actionType: t('basic.delete'),
    successCallback: async () => {
      await fetchImageTagInfo();
      isLoading.value = false;
    },
  });
};
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="title" />

      <GeneralDataTable
        :items="imageTagList"
        :more-action-list="moreActionList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
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
            :item="getDeepObj(item, header.key) || ''"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status' || header.key === 'permission'"
            :state-icon-style="'margin-right: 21px;'"
            :is-align-center="header.key === 'permission'"
            :disable-status-label="header.key === 'permission'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <PermissionEditDialog
      v-model:show="showDialog"
      v-model:item="editItem"
      :dialog-title="
        $t('basic.config.permission.type', {type: $t('image.virtual.machine')})
      "
      :submit-callback="handleEditPermission"
    />
  </UiContainer>
</template>
