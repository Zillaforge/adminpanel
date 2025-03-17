<script lang="ts" setup>
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import useSvgIcons from '@/composables/useSvgIcons';
import {ref, watch, computed, onMounted, type Ref} from 'vue';

import {VSelect} from 'vuetify/components';

import {makeApiCallWithoutProgress, fetchProjectLogs} from '@/api';
import LogDetailDialog from '@/components/log/LogDetailDialog.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';
import SelectCustomPeriodDialog from '@/components/common/SelectCustomPeriodDialog.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import i18n from '@/i18n';
import {
  type TableHeader,
  type TableItem,
} from '@/interfaces/InfraDataTableInterface';
import getTableHeaders from '@/utils/getTableHeaders';
import {getDeepObj, getTimePeriodOptions, formatDate} from '@/utils/utils';
import {LOG_TYPES, RESOURCE_REGION_TYPE} from '@/constants/Constants';
import {useRoute} from 'vue-router';
import {useGlobal} from '@/store';

const props = defineProps({
  logType: {
    type: String,
    default: LOG_TYPES.PROJECT,
  },
});

const FETCH_SIZE = 100;

const route = useRoute();
const globalStore = useGlobal();
const {projectList, getProjects} = useProjects();
const {IconKeys, ServiceIcons} = useSvgIcons();
const {handleCopyToClipboard, getDocumentTagLink} = useBasics();

const {t} = i18n.global;
const isLoading: Ref<boolean> = ref(false);
const lastUpdatedTime: Ref<Date | string> = ref('');
const searchStr: Ref<string> = ref('');
const showDetailDialog: Ref<boolean> = ref(false);
const logs: Ref<Record<string, any>[]> = ref([]);
const headers = ref<TableHeader[]>([]);
const detailData: Ref<Record<string, any>> = ref({});
const selectedTimePeriod: Ref<number | undefined> = ref();
const endTime: Ref<number | undefined> = ref();
const startTime: Ref<number | undefined> = ref();
const totalCount: Ref<number> = ref(0);
const fetchMoreCount: Ref<number> = ref(0);
const showtCustomPeriodDialog: Ref<boolean> = ref(false);
const selectedTimePeriodRef: Ref<InstanceType<typeof VSelect> | undefined> =
  ref();
const selectedProjectId = ref<string>();
const linkUrl = computed(() => {
  return {
    text: t('basic.understand'),
    linkTo: getDocumentTagLink(
      props.logType === LOG_TYPES.ADMIN ? 'LOG_MANAGEMENT' : 'LOG_PROJECT',
    ),
  };
});

const noDataSetting = computed(() => ({
  svgIcon: ServiceIcons[IconKeys.log].svg,
  message1: t('basic.noData.less.type', {type: t('logMgnt')}),
}));

const hasMoreData = computed(() => totalCount.value > logs.value.length);

const pageTitle = computed(() =>
  props.logType === LOG_TYPES.ADMIN
    ? t('logMgnt.adminLog')
    : t('logMgnt.projectLog'),
);

onMounted(async () => {
  init();
  initValue();
  if (props.logType === LOG_TYPES.PROJECT) {
    getProjects();
  }
  fetchData();
});

const init = () => {
  headers.value = getTableHeaders(PAGE_TYPES.LOGS);
  selectedProjectId.value = undefined;
};

const initValue = () => {
  selectedTimePeriod.value = getTimePeriodOptions()?.[0]?.value;
  endTime.value = Date.now();
  startTime.value = endTime.value - selectedTimePeriod.value;
  totalCount.value = 0;
  fetchMoreCount.value = 0;
  logs.value = [];
  globalStore.setBreadcrumbsParams({logType: props.logType});
};

const fetchData = async (offestCount: number = 0) => {
  if (offestCount === 0) {
    fetchMoreCount.value = 0;
  }
  isLoading.value = true;
  await makeApiCallWithoutProgress({
    apiCallFn: fetchProjectLogs,
    payload: {
      offset: offestCount * FETCH_SIZE,
      size: FETCH_SIZE,
      from: startTime.value,
      to: endTime.value,
      projectId: selectedProjectId.value,
      language: i18n.global.locale,
      op: props.logType === LOG_TYPES.ADMIN ? 'admin' : undefined,
    },
    successCallback: (res) => {
      totalCount.value = res.total ?? 0;
      const history = res.accessLogs ?? [];
      logs.value =
        offestCount === 0 ? [...history] : [...logs.value, ...history];
      logs.value.forEach((element: Record<string, any>) => {
        element.rawData = JSON.parse(JSON.stringify(element));
        element.uiType = element.service?.displayName;
        element.uiAction = element.action?.displayName;
        element.userName = element.user?.displayName;
      });
      lastUpdatedTime.value = new Date();
    },
  });
  isLoading.value = false;
};

const openDetailDialog = (data: Record<string, any>) => {
  detailData.value = data;
  showDetailDialog.value = true;
};

const closeDialog = () => {
  showDetailDialog.value = false;
};

const getItemValue = (item: TableItem, headerKey: string) => {
  if (headerKey === 'userName' && item.saatUser?.id) {
    return getDeepObj(item, headerKey) + ` (${t('logMgnt.simulated.user')})`;
  }

  if (headerKey === 'meta.ad') {
    const value = getDeepObj(item, headerKey);

    if (!value) {
      return '-';
    }

    switch (value) {
      case RESOURCE_REGION_TYPE.PILOT:
        return t('appBar.pilotResource');
      case RESOURCE_REGION_TYPE.TRUSTED_PLATFORM:
        return t('appBar.trustyPlatformResource');
      default:
        return value;
    }
  }

  return getDeepObj(item, headerKey).toString().length
    ? getDeepObj(item, headerKey)
    : '-';
};

const updateTimePeriod = (value: number) => {
  selectedTimePeriodRef.value?.selectComponentRef?.blur();

  if (value === -1) {
    showtCustomPeriodDialog.value = true;
    return;
  }
  selectedTimePeriod.value = value;
  endTime.value = Date.now();
  startTime.value = endTime.value - value;
  fetchData();
};

const updateCustomTimePeriod = (start: number, end: number) => {
  selectedTimePeriod.value = -1;
  endTime.value = end;
  startTime.value = start;
  fetchData();
};

watch(selectedProjectId, () => {
  initValue();
  fetchData();
});

watch(
  () => i18n.global.locale,
  () => {
    init();
    initValue();
    fetchData();
  },
);

watch(route, () => {
  init();
  initValue();
  fetchData();
});
</script>

<template>
  <UiContainer>
    <v-row class="main-content">
      <TitleComp :title="pageTitle" :link="linkUrl" />
      <GeneralDataTable
        :more-action-list="[
          {
            label: $t('logMgnt.copy'),
            action: (item) => handleCopyToClipboard(item.meta?.requestID),
          },
          {
            label: $t('logMgnt.originalData'),
            action: (item) => openDetailDialog(item.rawData),
          },
        ]"
        :items="logs"
        :last-updated-time="lastUpdatedTime"
        :table-headers="headers"
        :table-item-key="'name'"
        :loading="isLoading"
        :no-data-setting="noDataSetting"
        :search="searchStr"
        :sorting-options="{
          sortBy: 'name',
          isDescending: false,
        }"
        :show-search-wrapper="false"
        :show-fetch-more-data="hasMoreData"
        :has-click-row-handler="false"
        @fetch-data="fetchData()"
        @fetch-more-data="fetchData(++fetchMoreCount)"
        @update-search="searchStr = $event"
      >
        <template #item="{item}">
          <TD
            v-for="(header, index) in headers"
            :key="index"
            :item="getItemValue(item, header.key)"
            :is-cursor-pointer="false"
            :search="searchStr"
            :use-date-filter="header.useDateFilter"
          />
        </template>
        <template #customSearch>
          <v-row no-gutters class="px-6 py-2 align-center">
            <v-col
              v-if="props.logType === LOG_TYPES.PROJECT"
              cols="4"
              class="pr-4"
            >
              <SelectComponent
                v-model="selectedProjectId"
                :items="projectList"
                :placeholder="$t('logMgnt.selectProject')"
                item-text="displayName"
                item-value="projectId"
                clearable
              />
            </v-col>
            <v-col cols="3" class="pr-4">
              <SelectComponent
                ref="selectedTimePeriodRef"
                :selected-value="selectedTimePeriod"
                :items="getTimePeriodOptions()"
                :custom-item="true"
              >
                <template #customItem="{item}">
                  <v-list-item
                    :active="selectedTimePeriod === item.value"
                    @click="updateTimePeriod(item.value)"
                  >
                    {{ item.title }}
                  </v-list-item>
                </template>
              </SelectComponent>
            </v-col>
            <v-col cols="5">
              <span class="text-primary">
                {{
                  `${$t('usage.period')}: ${formatDate(
                    startTime,
                  )} ~ ${formatDate(endTime)}`
                }}
              </span>
            </v-col>
            <v-spacer />
          </v-row>
        </template>
      </GeneralDataTable>
    </v-row>
  </UiContainer>
  <LogDetailDialog
    :show-dialog="showDetailDialog"
    :data="detailData"
    @close-dialog="closeDialog"
  />
  <SelectCustomPeriodDialog
    :show-dialog="showtCustomPeriodDialog"
    :reset-value="selectedTimePeriod !== -1"
    @close-dialog="showtCustomPeriodDialog = false"
    @submit="updateCustomTimePeriod"
  />
</template>
