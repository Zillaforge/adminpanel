import {computed, ref, watch, type Ref} from 'vue';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';

import getTableHeaders from '@/utils/getTableHeaders';
import {formatBytesGbNoUnit, getDeepObj} from '@/utils/utils';
import {BYTES_GIB} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import iconProjectQuota from '@/assets/images/icon_project_quota.svg';
import {type QuotaTitlesInterface} from '@/interfaces/DataTypeInterface';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';
import {ImageRegistryType} from '@/interfaces/QuotaInterface';

import {
  fetchSupportedFeatures,
  fetchCtnImageQuotaList,
  fetchStorageQuotaList,
  fetchVirtualImageQuotaList,
  fetchVirtualPlatformQuotaList,
  fetchVirtualPlatformDefaultQuota,
  downloadProjectUsageReport,
  fetchUsageReportResourceList,
  updateContainerImageQuota,
  updateProjectStorageQuota,
  updateVirtualImageQuota,
  updateVirtualPlatformProjectQuota,
  updateVirtualPlatformDefaultQuota,
} from '@/api';
import {makeApiCallWithoutProgress, makeApiCall} from '@/api/apiCallFunctions';

const {t, i18n} = useBasics();
const {projectFullList} = useProjects('');
const headers: Ref<DataTableHeader[]> = ref([]);
const noDataSetting = ref<NoDataSetting>({
  image: iconProjectQuota,
  message1: t('table.noData.quota'),
});
const quotaTitles: Ref<QuotaTitlesInterface[]> = ref([]);
const currentPage: Ref<string> = ref('');
const QUOTA_CUR_USAGE_KEY = 'current';
const USAGE_KEY: string = 'used';
const QUOTA_KEY: string = 'quota';
const FILTER_OUT_KEYS = [
  'id',
  'projectId',
  'name',
  'displayName',
  'extra.iservice.projectSysCode',
  'codeName',
  'type',
];

const quotaVpsList = ref<Array<Record<string, any>>>([]);
const quotaStorageList = ref<Array<Record<string, any>>>([]);
const quotaImageList = ref<Array<Record<string, any>>>([]);
const resourceReviewStateList = ref<Array<Record<string, any>>>([]);

const quotaVpsProjectDefault = ref({});
const updateI18nStrings = (pageType: string) => {
  currentPage.value = pageType || currentPage.value;
  headers.value = getTableHeaders(pageType);
  noDataSetting.value = {
    image: iconProjectQuota,
    message1: t('table.noData.quota'),
  };
};

const mergeArrays = (
  arr1: Array<Record<string, any>>,
  arr2: Array<Record<string, any>>,
) => {
  return arr1.reduce(
    (acc: Array<Record<string, any>>, b: Record<string, any>) => {
      const idx = acc.findIndex(
        (item: Record<string, any>) => item.projectId === b.projectId,
      ); // look for the acc has the same id while iterating array1
      if (idx > -1) {
        // if found need to merge with value of array2
        acc[idx] = Object.assign(b, acc[idx]);
        return acc;
      }
      return [...acc, b]; // if we don't find anything so "b" is an unique entry
    },
    arr2,
  );
};

const quotaKeyName = computed(() => {
  if (currentPage.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    return 'limit';
  } else {
    return QUOTA_KEY;
  }
});

const usageKeyName = computed(() => {
  if (currentPage.value === PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST) {
    return 'usage';
  } else {
    return USAGE_KEY;
  }
});

const getQuotaRatio = (
  item: Record<string, any>,
  headerKey: string,
  svcType: string = '',
) => {
  if (headerKey === 'id' || headerKey === 'name') {
    return getDeepObj(item, headerKey);
  }

  const current = getDeepObj(item, `${headerKey}.${usageKeyName.value}`);
  const quota = getDeepObj(item, `${headerKey}.${quotaKeyName.value}`);
  const strQuota = quota === -1 ? t('quota.unlimited') : String(quota);

  if (current === undefined && quota === undefined) return '-';
  return `${String(current)} / ${strQuota}`;
};

const execFetchSupportedFeatures = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchSupportedFeatures,
    actionName: 'fetchSupportedFeatures',
    actionType: t('basic.get.data'),
  });
};

const execUpdateProjectStorageQuota = (
  id: string,
  quota: number,
  typeSvc: string = '',
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateProjectStorageQuota,
    payload: {
      projectId: id,
      quota,
      typeSvc,
    },
    actionName: 'updateProjectStorageQuota',
    actionType: t('basic.edit.type', {type: t('basic.quota')}),
  });
};

const execFetchVirtualPlatformQuotaList = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualPlatformQuotaList,
    actionName: 'fetchStorageQuotaList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      Object.keys(res).forEach((projId: string) => {
        const quotaByProject = getDeepObj(res, projId);
        if (quotaByProject.ram) {
          quotaByProject.ram = {
            ...quotaByProject.ram,
            usage: quotaByProject.ram.usage / 1024,
            limit:
              quotaByProject.ram.limit !== -1
                ? quotaByProject.ram.limit / 1024
                : -1,
          };
        }
        res.projId = quotaByProject;
      });
      quotaVpsList.value = res;
    },
  });
};

const execFetchVirtualPlatformDefaultQuota = async () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualPlatformDefaultQuota,
    actionName: 'fetchVirtualPlatformDefaultQuota',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      let quotaObj = {};

      if (res.ram) {
        res.ram = {
          ...res.ram,
          usage: res.ram.usage / 1024,
          limit: res.ram.limit !== -1 ? res.ram.limit / 1024 : -1,
        };
      }
      Object.keys(res).forEach((quotaKey: string) => {
        quotaObj = {
          ...quotaObj,
          [quotaKey]: res[quotaKey].limit,
        };
      });
      quotaVpsProjectDefault.value = {...res, quota: {...quotaObj}};
    },
  });
};

const execFetchStorageQuotaByService = (typeSvc: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchStorageQuotaList,
    payload: typeSvc,
    actionName: 'fetchStorageQuotaList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      const quotaList: Array<Record<string, any>> = res.map(
        (quota: Record<string, any>) => {
          return {
            projectId: quota.projectId,
            [typeSvc]: {
              quota:
                quota.hardLimitBytes !== -1
                  ? quota.hardLimitBytes / BYTES_GIB
                  : -1,
              used: formatBytesGbNoUnit(quota.sizeBytes),
            },
          };
        },
      );
      return quotaList;
    },
  });
};

const execFetchStorageQuotaList = async (typeSvcList: string[]) => {
  const promiseArray: any = [];
  typeSvcList.forEach((typeSvc: string) => {
    promiseArray.push(execFetchStorageQuotaByService(typeSvc));
  });
  await Promise.allSettled(promiseArray)
    .then((resArray: any[]) => {
      let quotaList: Array<Record<string, any>> = [];
      resArray.forEach((res: any) => {
        if (Array.isArray(res.value)) {
          if (quotaList.length > 0) {
            quotaList = mergeArrays(quotaList, res.value);
          } else {
            quotaList = res.value;
          }
        }
      });
      quotaStorageList.value = quotaList;
    })
    .finally(() => {});
};

const execFetchVmImageQuotaList = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualImageQuotaList,
    actionName: 'fetchVirtualImageQuotaList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      const quotaList: Array<Record<string, any>> = res.map(
        (quota: Record<string, any>) => {
          return {
            projectId: quota.id,
            imageVmSize: {
              quota:
                quota.softLimitSize !== -1
                  ? quota.softLimitSize / BYTES_GIB
                  : -1,
              used: formatBytesGbNoUnit(quota.usedSize),
            },
            imageVmCounts: {
              quota: quota.softLimitCount ?? -1,
              used: quota.usedCount,
            },
          };
        },
      );
      return quotaList;
    },
  });
};

const execFetchCtnImageQuotaList = () => {
  const projIdMap = new Map(
    projectFullList.value.map((proj: Record<string, any>) => [
      proj.codeName.toLocaleLowerCase(),
      proj.projectId,
    ]),
  );
  return makeApiCallWithoutProgress({
    apiCallFn: fetchCtnImageQuotaList,
    actionName: 'fetchCtnImageQuotaList',
    actionType: t('basic.get.data'),
    showErrorDlg: false,
    successCallback: (res) => {
      const quotaList: Array<Record<string, any>> = res.map(
        (quota: Record<string, any>) => {
          return {
            projectId: projIdMap.get(quota?.name),
            imageCtnSize: {
              quota:
                quota.storageLimit !== -1 ? quota.storageLimit / BYTES_GIB : -1,
              used: formatBytesGbNoUnit(quota.storageUsed),
            },
          };
        },
      );
      return quotaList;
    },
  });
};

const execFetchImageQuotaList = async (typeSvcList: string[]) => {
  const promiseArray: any = [];
  typeSvcList.forEach((typeSvc: string) => {
    if (typeSvc === ImageRegistryType.VM_REGISTRY_SVC) {
      promiseArray.push(execFetchVmImageQuotaList());
    } else if (typeSvc === ImageRegistryType.CTN_REGISTRY_SVC) {
      promiseArray.push(execFetchCtnImageQuotaList());
    }
  });

  await Promise.allSettled(promiseArray)
    .then((resArray: any[]) => {
      let quotaList: Array<Record<string, any>> = [];
      resArray.forEach((res: any) => {
        if (Array.isArray(res.value)) {
          if (quotaList.length > 0) {
            quotaList = mergeArrays(quotaList, res.value);
          } else {
            quotaList = res.value;
          }
        }
      });
      quotaImageList.value = quotaList;
    })
    .finally(() => {});
};

const execUpdateVirtualPlatformProjectQuota = (
  id: string,
  data: Record<string, any>,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateVirtualPlatformProjectQuota,
    payload: {
      projectId: id,
      data,
    },
    actionName: 'updateVirtualPlatformProjectQuota',
    actionType: t('basic.edit.type', {type: t('basic.quota')}),
  });
};

const execUpdateVirtualPlatformDefaultQuota = (data: Record<string, any>) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateVirtualPlatformDefaultQuota,
    payload: data,
    actionName: 'updateVirtualPlatformDefaultQuota',
    actionType: t('basic.edit.type', {type: t('basic.quota')}),
  });
};

const execUpdateContainerImageQuota = (
  id: string,
  quota: Record<string, any>,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateContainerImageQuota,
    payload: {
      projectId: id,
      data: quota,
    },
    actionName: 'updateContainerImageQuota',
    actionType: t('basic.edit.type', {type: t('basic.quota')}),
  });
};

const execUpdateVirtualImageQuota = (
  id: string,
  quota: Record<string, any>,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateVirtualImageQuota,
    payload: {
      projectId: id,
      data: quota,
    },
    actionName: 'updateVirtualImageQuota',
    actionType: t('basic.edit.type', {type: t('basic.quota')}),
  });
};

const execFetchUsageReportResourceList = () => {
  return makeApiCall({
    apiCallFn: fetchUsageReportResourceList,
    actionName: 'fetchUsageReportResourceList',
    actionType: t('basic.get.data'),
  });
};

const execDownloadProjectUsageReport = (data: {
  projectId: string;
  month: string;
  resources: string[];
}) => {
  return makeApiCall({
    apiCallFn: downloadProjectUsageReport,
    payload: data,
    actionName: 'downloadProjectUsageReport',
    actionType: t('basic.download'),
  });
};

const isQuotaUnitMb = (quotaKey: string) => {
  return quotaKey.includes('ram');
};

const isImageQuota = (quotaKey: string) => {
  return quotaKey.includes('image');
};

const quotaDlgWidth = computed(() => {
  if (quotaTitles.value.length === 4) return 1200;
  else return 1200 - (4 - quotaTitles.value.length) * 200;
});

const quotaTitleColWidth = computed(() => {
  if (quotaTitles.value.length === 4) return 2;
  else if (quotaTitles.value.length === 1) return 4;
  else return 3;
});

const quotaColWidth = computed(() => {
  return 12 - quotaTitleColWidth.value;
});

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage.value);
  },
);

const useComposable = (pageType: string = '') => {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    quotaKeyName,
    usageKeyName,
    quotaTitles,
    quotaImageList,
    quotaStorageList,
    quotaVpsList,
    quotaVpsProjectDefault,
    quotaDlgWidth,
    quotaTitleColWidth,
    quotaColWidth,
    resourceReviewStateList,
    headers,
    noDataSetting,

    FILTER_OUT_KEYS,
    QUOTA_CUR_USAGE_KEY,
    QUOTA_KEY,
    isImageQuota,
    isQuotaUnitMb,
    getQuotaRatio,

    execFetchSupportedFeatures,
    execFetchUsageReportResourceList,
    execDownloadProjectUsageReport,
    execUpdateContainerImageQuota,
    execUpdateProjectStorageQuota,
    execUpdateVirtualImageQuota,
    execUpdateVirtualPlatformProjectQuota,
    execUpdateVirtualPlatformDefaultQuota,

    execFetchImageQuotaList,
    execFetchStorageQuotaList,
    execFetchVirtualPlatformDefaultQuota,
    execFetchVirtualPlatformQuotaList,

    updateI18nStrings,
  };
};
export default useComposable;
