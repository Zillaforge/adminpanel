<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp :title="title" :tooltip="tooltip" />
        <GeneralDataTable
          :enableToggle="true"
          :custom-btn-list="customBtnList"
          :hasClickRowHandler="false"
          :items="projectQuotaList"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="[]"
          :more-action-list="moreActionList"
          :no-data-setting="noDataSetting"
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
          <template #message>
            <span>
              {{ `${$t('basic.unit')}: ${$t('quota.notes')}` }}
            </span>
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <ProjectQuotaEditDialog
      :show-dialog="showQuotaEditDlg"
      :quota-key-list="
        headers.filter((header) => !FILTER_OUT_KEYS.includes(header.key))
      "
      :quotaObj="editQuotaItem"
      :edit-project-default="editProjectDefault"
      @close-dialog="showQuotaEditDlg = false"
      @success-callback="fetchData"
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
import {ImageRegistryType} from '@/interfaces/QuotaInterface';
import {S3ServiceType} from '@/interfaces/CloudStorageInterface';
import {exportCSVFile, getDeepObj} from '@/utils/utils';
import cloneDeep from 'lodash/cloneDeep';
import getTableHeaders from '@/utils/getTableHeaders';

// utils
import PAGE_TYPES from '@/constants/PAGE_TYPES';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import TD from '@/components/common/TdHighlight.vue';
import ProjectQuotaEditDialog from '@/components/resource/ProjectQuotaEditDialog.vue';

const route = useRoute();
const {t, handleCopyToClipboard} = useBasics();

const {
  FILTER_OUT_KEYS,
  headers,
  noDataSetting,
  quotaKeyName,
  usageKeyName,
  quotaImageList,
  quotaStorageList,
  quotaVpsList,
  quotaVpsProjectDefault,

  getQuotaRatio,
  execFetchSupportedFeatures,
  execFetchImageQuotaList,
  execFetchStorageQuotaList,
  execFetchVirtualPlatformQuotaList,
  execFetchVirtualPlatformDefaultQuota,
} = useResource(route.name as string);
const {projectList, getProjects} = useProjects('');

const searchStr = ref('');
const isLoading = ref(false);
const showQuotaEditDlg = ref(false);
const editProjectDefault = ref(false);
const features = ref({});
const lastUpdatedTime = ref<Date | string>('');
const editQuotaItem: Record<string, any> = ref({});
const pageType = computed(() => route.name as string);
const tooltip = computed(() => {
  if (pageType.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    return t('tips.quota.vps.service');
  } else return '';
});
const title = computed(() => {
  if (pageType.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    return t('basic.management.type', {
      type: t('basic.quota.type', {
        type: t('service.virtual.platform'),
      }),
    });
  } else if (pageType.value === PAGE_TYPES.QUOTA_STORAGE_LIST) {
    return t('basic.management.type', {
      type: t('basic.quota.type', {
        type: t('service.storage'),
      }),
    });
  } else if (pageType.value === PAGE_TYPES.QUOTA_IMAGE_LIST) {
    return t('basic.management.type', {
      type: t('basic.quota.type', {
        type: t('basic.image'),
      }),
    });
  } else return '';
});
const fetchData = async () => {
  isLoading.value = true;
  quotaStorageList.value = [];
  quotaImageList.value = [];
  projectList.value = [];
  await getProjects();

  features.value = await execFetchSupportedFeatures();
  headers.value = getTableHeaders(route.name as string, features.value);

  const keyList = headers.value.map((header: {key: string}) => header.key);
  if (pageType.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    await execFetchVirtualPlatformQuotaList();
    await execFetchVirtualPlatformDefaultQuota();
  } else if (pageType.value === PAGE_TYPES.QUOTA_STORAGE_LIST) {
    await execFetchStorageQuotaList(
      [
        S3ServiceType.STORAGE_PUBLIC,
        S3ServiceType.STORAGE_PRIVATE,
        S3ServiceType.EXCHANGE,
        S3ServiceType.RELEASE,
      ].filter((type: string) => keyList.includes(type)),
    );
  } else if (pageType.value === PAGE_TYPES.QUOTA_IMAGE_LIST) {
    await execFetchImageQuotaList(
      keyList.includes('imageCtnSize')
        ? [
            ImageRegistryType.VM_REGISTRY_SVC,
            ImageRegistryType.CTN_REGISTRY_SVC,
          ]
        : [ImageRegistryType.VM_REGISTRY_SVC],
    );
  }
  isLoading.value = false;
  lastUpdatedTime.value = new Date();
};
const findMatchItem = (proj: {projectId: string}) => {
  let match: Record<string, any> | undefined = {};
  if (pageType.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    match = getDeepObj(quotaVpsList.value, proj.projectId);
  } else if (pageType.value === PAGE_TYPES.QUOTA_STORAGE_LIST) {
    if (Array.isArray(quotaStorageList.value)) {
      match = quotaStorageList.value.find(
        (quota: any) => quota.projectId === proj.projectId,
      );
    }
  } else if (pageType.value === PAGE_TYPES.QUOTA_IMAGE_LIST) {
    if (Array.isArray(quotaImageList.value)) {
      match = quotaImageList.value.find(
        (quota: any) => quota.projectId === proj.projectId,
      );
    }
  }
  return match;
};

const projectQuotaList = computed(() => {
  return projectList.value.map((proj: ProjectInfoInterface) => {
    let quotaItem: Record<string, any> = {};
    const match = findMatchItem(proj);

    quotaItem = {
      id: proj.projectId,
      name: proj.displayName,
      codeName: proj.extra?.iservice?.projectSysCode ?? '',
      namespace: proj.namespace,
      type:
        proj.namespace === CLOUDINFRA_NAMESPACE
          ? t('basic.project.type', {type: t('basic.testing')})
          : PROJECT_TYPE_ISERVICE,
    };

    headers.value
      .filter((header) => !FILTER_OUT_KEYS.includes(header.key))
      .forEach((header) => {
        quotaItem = {
          ...quotaItem,
          quota: {
            ...quotaItem.quota,
            [header.key]: match
              ? getDeepObj(match, `${header.key}.${quotaKeyName.value}`)
              : '-',
          },
          [header.key]: match ? getQuotaRatio(match, header.key) : '-',
        };
      });

    return quotaItem;
  });
});

const customBtnList = computed(() => {
  const btnList = [
    {
      disabled: isLoading.value,
      label: t('basic.export.type', {type: t('basic.report')}),
      action: () => {
        const quotaCsvHeader: string[] = [];
        headers.value.forEach((header) => {
          if (FILTER_OUT_KEYS.includes(header.key)) {
            quotaCsvHeader.push(header.title);
          } else {
            quotaCsvHeader.push(`${header.title}(${t('basic.quota.used')})`);
            quotaCsvHeader.push(`${header.title}(${t('basic.quota')})`);
          }
        });

        const quotaReportArray = projectList.value.map(
          (proj: ProjectInfoInterface) => {
            const type =
              proj.namespace === CLOUDINFRA_NAMESPACE
                ? t('basic.project.type', {type: t('basic.testing')})
                : PROJECT_TYPE_ISERVICE;
            const quotaItem: string[] = [
              proj.displayName,
              proj.codeName as string,
              type,
            ];
            const match = findMatchItem(proj);

            headers.value
              .filter((header) => !FILTER_OUT_KEYS.includes(header.key))
              .forEach((header) => {
                if (match) {
                  quotaItem.push(
                    getDeepObj(match, `${header.key}.${usageKeyName.value}`),
                  );
                  quotaItem.push(
                    getDeepObj(match, `${header.key}.${quotaKeyName.value}`),
                  );
                } else {
                  quotaItem.push('-');
                  quotaItem.push('-');
                }
              });
            return quotaItem;
          },
        );
        exportCSVFile(quotaCsvHeader, quotaReportArray);
      },
    },
    {
      label: t('quota.project.default'),
      action: () => {
        showQuotaEditDlg.value = true;
        editProjectDefault.value = true;
        editQuotaItem.value = cloneDeep(quotaVpsProjectDefault.value);
      },
    },
  ];

  return pageType.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST
    ? btnList
    : btnList.slice(0, -1);
});

const moreActionList = computed(() => {
  return [
    {
      label: t('basic.edit.type', {type: t('basic.quota')}),
      action: (item: TableItem) => {
        editProjectDefault.value = false;
        showQuotaEditDlg.value = true;
        editQuotaItem.value = cloneDeep(item);
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.id),
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
