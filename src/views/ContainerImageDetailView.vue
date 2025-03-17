<script lang="ts" setup>
import {useGlobal, usePortalConfig} from '@/store';
import {ref, onBeforeMount, type Ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import {ADMIN_PROJECT_ID} from '@/constants/Constants';
import {
  makeApiCall,
  fetchContainerImageTags,
  deleteContainerImageTag,
} from '@/api';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {ActionType, type TableItem} from '@/interfaces/InfraDataTableInterface';
import getTableHeaders from '@/utils/getTableHeaders';
import {formatBytes, getDeepObj} from '@/utils/utils';

const route = useRoute();
const {handleCopyToClipboard} = useBasics();
const globalStore = useGlobal();
const {portalConfig} = usePortalConfig();
const {projectDetail, getProjectDetail} = useProjects();

const headers = computed(() =>
  getTableHeaders(PAGE_TYPES.CONTAINER_IMAGE_DETAIL),
);
const projectSysCode = computed(() =>
  projectDetail.value.extra?.iservice?.projectSysCode.toLowerCase(),
);
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const imageVersions: Ref<Record<string, any>[]> = ref([]);
const searchStr: Ref<string> = ref('');

onBeforeMount(() => {
  globalStore.setBreadcrumbsParams({
    imageName: route.params.imageName,
  });
});

const fetchData = async () => {
  isLoading.value = true;
  await getProjectDetail(ADMIN_PROJECT_ID);
  imageVersions.value = await makeApiCall({
    apiCallFn: fetchContainerImageTags,
    payload: route.params.imageName as string,
    successCallback: (res) => {
      return res.map((tag: {size: number}) => ({
        ...tag,
        tagSize: formatBytes(tag.size),
      }));
    },
  });

  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const handleCopy = (key: string, item: TableItem) => {
  let command = '';
  const imageName = route.params.imageName as string;
  const prjSysCode = projectSysCode.value;
  if (key === 'pushCommand') {
    command = `docker push ${portalConfig.IMAGE_REGISTRY}/${prjSysCode}/${imageName}:${item.name}`;
  } else if (key === 'pullCommand') {
    command = `docker pull ${portalConfig.IMAGE_REGISTRY}/${prjSysCode}/${imageName}:${item.name}`;
  }
  handleCopyToClipboard(command);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="`${route.params.imageName}`" />

      <GeneralDataTable
        :items="imageVersions"
        :more-action-list="[
          {
            type: ActionType.DELETE,
            action: (item: any) =>
              makeApiCall({
                apiCallFn: deleteContainerImageTag,
                payload: {
                  projectId: ADMIN_PROJECT_ID,
                  imageName: route.params.imageName as string,
                  tagName: item.name,
                },
                successCallback: fetchData,
              }),
          },
        ]"
        :last-updated-time="lastUpdatedTime"
        :loading="isLoading"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'udpate_time',
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
            v-for="(header, index) in headers.slice(0, 2)"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
          />
          <TD :item="''" :search="searchStr">
            <v-icon
              class="cursor-pointer mr-1"
              @click="handleCopy('pushCommand', item)"
            >
              mdi-content-copy
            </v-icon>
          </TD>
          <TD :item="''" :search="searchStr">
            <v-icon
              class="cursor-pointer mr-1"
              @click="handleCopy('pullCommand', item)"
            >
              mdi-content-copy
            </v-icon>
          </TD>
          <TD
            v-for="(header, index) in headers.slice(4)"
            :key="index"
            :item="getDeepObj(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :is-status="header.key === 'status'"
            :use-date-filter="header.key === 'pushAt'"
          />
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
</template>
