<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="
            $t('basic.management.type', {
              type: $t('basic.project.type', {type: projectTypeName}),
            })
          "
        />
        <GeneralDataTable
          :has-click-row-handler="true"
          :items="afterProjects"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="
            projectType === PROJECT_TYPE.GENERAL
              ? [
                  {
                    label: $t('basic.add.type'),
                    action: () => routeToCreate(),
                  },
                ]
              : []
          "
          :more-action-list="moreActionList"
          :no-data-setting="noDataSetting"
          :resource-info="[
            {
              title: $t('basic.name'),
              keyOfvalue: 'displayName',
            },
          ]"
          :search="searchStr"
          :sorting-options="{
            sortBy: 'createdAt',
            isDescending: true,
          }"
          :table-headers="headers"
          :table-item-key="'projectId'"
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
              :useDateFilter="header.key === 'createdAt'"
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <ProjectUsageReportDialog
      v-model:show="showReportDlg"
      :projectInfo="selectedProject"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue';
import {useGlobal} from '@/store';
import {useRoute} from 'vue-router';

import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import {getDeepObj} from '@/utils/utils';

import {PROJECT_TYPE, ADMIN_PROJECT_ID} from '@/constants/Constants';

import {type ProjectInfoInterface} from '@/interfaces/DataTypeInterface';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import TitleComp from '@/components/common/TitleComponent.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import ProjectUsageReportDialog from '@/components/project/ProjectUsageReportDialog.vue';

const route = useRoute();
const props = defineProps({
  projectType: {
    type: String,
    required: true,
  },
  namespace: {
    type: String,
    required: true,
  },
});
const {
  headers,
  noDataSetting,
  projectList,
  getProjectType,
  getProjectTypeName,

  getProjects,
  execDeleteProject,

  toCreatePage,
  toDetailPage,
  toEditPage,
} = useProjects(route.name as string);

const {
  t,
  isSystemProject,
  confirmDeleteTableItemDialog,
  handleCopyToClipboard,
} = useBasics();
const globalStore = useGlobal();

const isLoading = ref(false);
const showReportDlg = ref(false);
const searchStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const selectedProject = ref<Record<string, any>>({});
const moreActionList = computed(() => {
  return [
    {
      visible: () => props.projectType === PROJECT_TYPE.GENERAL,
      label: t('basic.edit.type', {type: t('basic.project')}),
      action: (item: TableItem) => {
        globalStore.setBreadcrumbsParams({
          projectId: item.projectId,
          displayName: item.displayName,
          isDetailPage: true,
          projectTypeName: getProjectTypeName(getProjectType(item.namespace)),
        });
        toEditPage(item.projectId, true);
      },
    },
    {
      label: t('report.project.usage'),
      action: (item: TableItem) => {
        selectedProject.value = Object.assign(selectedProject.value, item);
        showReportDlg.value = true;
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.projectId),
    },
    {
      visible: () => props.projectType === PROJECT_TYPE.GENERAL,
      disabled: (item: TableItem) => isSystemProject(item.displayName),
      label: t('basic.delete'),
      action: (item: TableItem) => {
        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('basic.project').toLowerCase(),
            }),
            message: '',
            resourceInfo: [
              {
                title: t('basic.name'),
                keyOfvalue: 'displayName',
              },
            ],
          },
          async (item) => {
            await execDeleteProject(item.projectId);
            fetchData();
          },
        );
      },
    },
  ];
});

const fetchData = () => {
  isLoading.value = true;
  return getProjects().then(() => {
    lastUpdatedTime.value = new Date();
    isLoading.value = false;
  });
};

const projectTypeName = computed(() => {
  return props.projectType === PROJECT_TYPE.GENERAL
    ? t('basic.testing')
    : 'iService';
});

const afterProjects = computed(() => {
  if (Array.isArray(projectList.value)) {
    return projectList.value.filter(
      (proj: ProjectInfoInterface) =>
        proj.namespace === props.namespace &&
        proj.projectId !== ADMIN_PROJECT_ID,
    );
  }
  return [];
});

onMounted(() => {
  fetchData();
});

const routeToDetail = (item: ProjectInfoInterface) => {
  toDetailPage(item.projectId, props.projectType);
};

const routeToCreate = () => {
  globalStore.setBreadcrumbsParams({
    projectType: props.projectType,
    projectTypeName: getProjectTypeName(props.projectType),
  });
  toCreatePage();
};

watch(() => globalStore.getIsPilotRegion, fetchData);
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
