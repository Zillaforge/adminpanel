<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <TitleComp
        :title="t('basic.management.type', {type: t('image.container')})"
        :link-url="linkUrl"
      />
      <v-col cols="12" class="px-0 d-flex align-end justify-space-between">
        <CmdReferenceBtn
          :title="$t('image.docker.pushButton.title')"
          :description="$t('image.docker.pushButton.message')"
          :items="[
            {
              name: $t('image.docker.pushButton.tagCommand'),
              content: `docker tag {Source Image Name}:{Tag} ${portalConfig.IMAGE_REGISTRY}/${projectSysCode}/{Image Name}:{Tag}`,
            },
            {
              name: $t('image.docker.pushButton.pushCommand'),
              content: `docker push ${portalConfig.IMAGE_REGISTRY}/${projectSysCode}/{Image Name}:{Tag}`,
            },
          ]"
        />
        <div class="message">
          {{ `${$t('image.serviceEndpoint')}: ${portalConfig.IMAGE_REGISTRY}` }}
          <v-icon
            class="ml-2"
            @click="handleCopyToClipboard(portalConfig.IMAGE_REGISTRY)"
          >
            mdi-content-copy
          </v-icon>
        </div>
      </v-col>
      <GeneralDataTable
        :items="containerImageList"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :main-action-list="[]"
        :more-action-list="moreActionList"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'name',
          isDescending: false,
        }"
        :table-headers="headers"
        :table-item-key="'name'"
        @fetch-data="fetchData"
        @update-search="searchStr = $event"
        @on-row-click="(item: any) => toDetailPage(item.name)"
      >
        <template #item="{item}">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :is-cursor-pointer="false"
            :item="getDeepObj(item, header.key)"
            :search="searchStr"
          />
        </template>
      </GeneralDataTable>
    </v-row>
    <EditDescriptionDialog
      v-model:item="editItem"
      v-model:show="showEditDialog"
      :submit-callback="handleEdit"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';

import {usePortalConfig} from '@/store';
import useBasics from '@/composables/useBasics';
import useImages from '@/composables/useImages';
import useProjects from '@/composables/useProjects';

import {getDeepObj} from '@/utils/utils';
import {ADMIN_PROJECT_ID} from '@/constants/Constants';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import CmdReferenceBtn from '@/components/common/CmdReferenceBtn.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
const router = useRouter();
const {
  t,
  confirmDeleteTableItemDialog,
  handleCopyToClipboard,
  getDocumentTagLink,
} = useBasics();

const {portalConfig} = usePortalConfig();
const {
  headers,
  noDataSetting,
  containerImageList,
  execDeleteContainerImage,
  execFetchContainerImageList,
  execUpdateContainerImage,
} = useImages(PAGE_TYPES.CONTAINER_IMAGE_LIST);
const {projectDetail, getProjectDetail} = useProjects();

const isLoading = ref(false);
const searchStr = ref('');
const showEditDialog = ref(false);
const lastUpdatedTime = ref<Date | string>('');
const editItem = ref<TableItem>({});

const handleEdit = async () => {
  showEditDialog.value = false;

  await execUpdateContainerImage({
    imageName: editItem.value.name,
    projectId: ADMIN_PROJECT_ID,
    data: {
      description: editItem.value.description,
    },
  }).then(() => fetchData());
};

const fetchData = async () => {
  isLoading.value = true;

  await getProjectDetail(ADMIN_PROJECT_ID);
  await execFetchContainerImageList(ADMIN_PROJECT_ID);

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleDelete = async (item: TableItem) => {
  await execDeleteContainerImage(item.name, ADMIN_PROJECT_ID).then(() =>
    fetchData(),
  );
};

const linkUrl = computed(() => getDocumentTagLink('CONTAINER_IMAGE'));
const moreActionList = computed(() => [
  {
    label: t('basic.edit.type', {type: t('basic.desc')}),
    action: (item: TableItem) => {
      editItem.value = Object.assign({}, item);
      editItem.value.description = editItem.value.description ?? undefined;
      showEditDialog.value = true;
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
          handleDelete(item);
        },
      );
    },
  },
]);

const toDetailPage = async (imageName: string) => {
  await router.push({
    name: PAGE_TYPES.CONTAINER_IMAGE_DETAIL,
    params: {imageName},
  });
};

const projectSysCode = computed(() =>
  projectDetail.value.extra?.iservice?.projectSysCode.toLowerCase(),
);

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped></style>
