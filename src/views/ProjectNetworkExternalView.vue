<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="
            t('basic.management.type', {type: t('project.network.external')})
          "
        />
        <GeneralDataTable
          :enableToggle="true"
          :hasClickRowHandler="false"
          :items="projExternalNetworkList"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="[]"
          :more-action-list="moreActionList"
          :search="searchStr"
          :sorting-options="{
            sortBy: 'codeName',
            isDescending: false,
          }"
          :table-headers="headers"
          :table-item-key="'codeName'"
          @fetch-data="fetchData"
          @update-search="searchStr = $event"
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
      </v-col>
    </v-row>
    <ProjectNetworkConfigDialog
      :showDialog="showConfigDlg"
      :item="editProject"
      @afterSubmit="fetchData"
      @closeDialog="showConfigDlg = false"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue';

import useProjects from '@/composables/useProjects';
import useBasics from '@/composables/useBasics';
import useNetworks from '@/composables/useNetworks';

import {getDeepObj} from '@/utils/utils';
import cloneDeep from 'lodash/cloneDeep';
import {type ProjectInfoInterface} from '@/interfaces/DataTypeInterface';
import {
  type MoreAction,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import ProjectNetworkConfigDialog from '@/components/network/ProjectNetworkConfigDialog.vue';

import {
  CLOUDINFRA_NAMESPACE,
  PROJECT_TYPE_ISERVICE,
} from '@/constants/Constants';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
const {t, i18n} = useBasics();

const {projectList, getProjects} = useProjects('');
const {
  headers,
  defPublicExtNetwork,
  defPrivateExtNetwork,
  projExtNetworkAssociationList,
  projNetworkConfigList,
  execFetchProjectNetworkConfigList,
} = useNetworks(PAGE_TYPES.PROJECT_EXTERNAL_NETWORK_LIST);

const isLoading = ref(false);
const showConfigDlg = ref(false);
const searchStr = ref('');
const lastUpdatedTime = ref<Date | string>('');
const moreActionList = ref<MoreAction[]>([]);
const editProject = ref({});

const fetchData = async () => {
  isLoading.value = true;
  await execFetchProjectNetworkConfigList();
  await getProjects();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const init = () => {
  moreActionList.value = [
    {
      label: t('basic.setting.type', {type: t('basic.network')}),
      action: (item: TableItem) => {
        showConfigDlg.value = true;
        editProject.value = cloneDeep(item);
      },
    },
  ];
};

const projExternalNetworkList = computed(() => {
  return projectList.value.map((proj: ProjectInfoInterface) => {
    const extNetwork = {
      public: {...defPublicExtNetwork.value},
      private: {...defPrivateExtNetwork.value},
    };
    if (
      Object.prototype.hasOwnProperty.call(
        projNetworkConfigList.value,
        proj.projectId,
      )
    ) {
      extNetwork.public = {
        ...getDeepObj(
          projExtNetworkAssociationList.value,
          getDeepObj(projNetworkConfigList.value, proj.projectId).public,
        ),
      };

      extNetwork.private = {
        ...getDeepObj(
          projExtNetworkAssociationList.value,
          getDeepObj(projNetworkConfigList.value, proj.projectId).private,
        ),
      };
    }

    return {
      projectId: proj.projectId,
      name: proj.displayName,
      codeName: proj.extra?.iservice?.projectSysCode ?? '',
      namespace: proj.namespace,
      type:
        proj.namespace === CLOUDINFRA_NAMESPACE
          ? t('basic.project.type', {type: t('basic.testing')})
          : PROJECT_TYPE_ISERVICE,

      ...extNetwork,
    };
  });
});

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
