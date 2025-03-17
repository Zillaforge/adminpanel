<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="
            $t('basic.management.type', {
              type: $t('resource.review.mechanism'),
            })
          "
        />
        <GeneralDataTable
          :hasClickRowHandler="false"
          :items="projectReviewList"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="[]"
          :more-action-list="moreActionList"
          :search="searchStr"
          :sorting-options="{
            sortBy: 'name',
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
              :disable-status-label="true"
              :is-cursor-pointer="false"
              :is-status="!FILTER_OUT_KEYS.includes(header.key)"
              :item="getDeepObj(item, header.key)"
              :search="searchStr"
              :state-icon-style="'margin-right: 21px;'"
              :is-align-center="!FILTER_OUT_KEYS.includes(header.key)"
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <ResourceReviewEditDialog
      :show-dialog="showEditDlg"
      :resource-list="
        headers.filter((header) => !FILTER_OUT_KEYS.includes(header.key))
      "
      :item="editItem"
      @close-dialog="showEditDlg = false"
      @after-submit="fetchData"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {
  CLOUDINFRA_NAMESPACE,
  PROJECT_TYPE_ISERVICE,
} from '@/constants/Constants';
import {useRoute} from 'vue-router';
import useResource from '@/composables/useResource';
import useProjects from '@/composables/useProjects';
import useBasics from '@/composables/useBasics';
import {type ProjectInfoInterface} from '@/interfaces/DataTypeInterface';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';
import {getDeepObj} from '@/utils/utils';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';
import ResourceReviewEditDialog from '@/components/resource/ResourceReviewEditDialog.vue';

const route = useRoute();
const {t} = useBasics();

const {FILTER_OUT_KEYS, headers} = useResource(route.name as string);

const {projectList, getProjects} = useProjects('');

const searchStr = ref('');
const isLoading = ref(false);
const showEditDlg = ref(false);
const lastUpdatedTime = ref<Date | string>('');
const editItem: Record<string, any> = ref({});

const fetchData = async () => {
  isLoading.value = true;
  await getProjects();

  isLoading.value = false;
  lastUpdatedTime.value = new Date();
};

const projectReviewList = computed(() => {
  return projectList.value.map((proj: ProjectInfoInterface) => {
    let item: Record<string, any> = {
      ...proj,
      type:
        proj.namespace === CLOUDINFRA_NAMESPACE
          ? t('basic.project.type', {type: t('basic.testing')})
          : PROJECT_TYPE_ISERVICE,
    };

    headers.value
      .filter((header) => !FILTER_OUT_KEYS.includes(header.key))
      .forEach((header) => {
        item = {
          ...item,
          [header.key]: getDeepObj(proj, `extra.resourceReview.${header.key}`)
            ? 'enabled'
            : '',
        };
      });

    return item;
  });
});

const moreActionList = computed(() => {
  return [
    {
      label: t('basic.setting.type', {type: t('resource.review.mechanism')}),
      action: (item: TableItem) => {
        showEditDlg.value = true;
        editItem.value = Object.assign({}, item);
      },
    },
  ];
});

onMounted(() => {
  fetchData();
});
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

.quota-title {
  padding-top: 16px;
  padding-bottom: 16px;
}

.slot-divider {
  margin-left: -24px;
  margin-right: -24px;
  max-width: none !important;
}

.gray-background {
  background-color: #f5f6fa;
}

.align-vertical-horizontal-center {
  text-align: center;
  align-self: center;
}
</style>
