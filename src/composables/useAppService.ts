import {ref, watch, type Ref} from 'vue';
import useSvgIcons from '@/composables/useSvgIcons';
import useBasics from '@/composables/useBasics';
import getTableHeaders from '@/utils/getTableHeaders';

import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';

import {
  createModule,
  createModuleCategory,
  deleteApsModule,
  deleteModuleCategory,
  fetchApsModuleAcl,
  fetchModuleCategoryList,
  fetchModuleList,
  updateApsModule,
  updateApsModuleAcl,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';

const {t, i18n} = useBasics();
const {IconKeys, ServiceIcons} = useSvgIcons();
let currentPage: string = '';
const headers: Ref<DataTableHeader[]> = ref([]);
const categoryList = ref<Array<Record<string, any>>>([]);
const noDataSetting: NoDataSetting = {
  svgIcon: ServiceIcons[IconKeys.application].svg,
  buttonTitle: t('basic.create.type', {
    type: t('services.application'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('services.application'),
  }),
  message2: t('basic.noData.emptyMsg'),
};
const updateI18nStrings = (pageType: string) => {
  currentPage = pageType || currentPage;
  if (currentPage) {
    headers.value = getTableHeaders(currentPage);
  }
};

const execFetchModuleCategoryList = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchModuleCategoryList,
    actionName: 'fetchModuleCategoryList',
    actionType: t('basic.get.data'),
  }).then((res: Array<Record<string, any>>) => {
    categoryList.value = res;
    return categoryList.value;
  });
};

const execFetchModuleList = (categoryId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchModuleList,
    payload: categoryId,
    actionName: 'fetchModuleList',
    actionType: t('basic.get.data'),
  }).then((res: Record<string, any>) => {
    return res;
  });
};

const execCreateModuleCategory = (payload: Record<string, any>) => {
  return makeApiCall({
    apiCallFn: createModuleCategory,
    payload,
    actionName: 'createModuleCategory',
    actionType: t('basic.create'),
  }).then((res: any) => {
    return res;
  });
};

const execDeleteModuleCategory = async (id: string) => {
  await makeApiCall({
    apiCallFn: deleteModuleCategory,
    payload: id,
    actionName: 'deleteModuleCategory',
    actionType: t('basic.delete'),
  });
};

const execCreateApsModule = (payload: any) => {
  return makeApiCall({
    apiCallFn: createModule,
    payload,
    actionName: 'createModule',
    actionType: t('basic.create'),
    successCallback: (module) => {
      return module;
    },
  });
};

const execFetchApsModuleAcl = async (id: string) => {
  await makeApiCall({
    apiCallFn: fetchApsModuleAcl,
    payload: id,
    actionName: 'fetchApsModuleAcl',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      return res;
    },
  });
};

const execDeleteApsModule = async (id: string) => {
  await makeApiCall({
    apiCallFn: deleteApsModule,
    payload: id,
    actionName: 'deleteApsModule',
    actionType: t('basic.delete'),
  });
};
const execUpdateApsModule = async (
  id: string,
  data: Record<string, string | boolean>,
) => {
  await makeApiCall({
    apiCallFn: updateApsModule,
    payload: {
      id,
      data,
    },
    actionName: 'updateApsModule',
    actionType: t('basic.update'),
  });
};

const execUpdateApsModuleAcl = async (id: string, projectIds: string[]) => {
  await makeApiCall({
    apiCallFn: updateApsModuleAcl,
    payload: {
      id,
      projectIds,
    },
    actionName: 'updateApsModule',
    actionType: t('basic.update'),
  });
};

watch(
  () => i18n.global.locale,
  () => updateI18nStrings(currentPage),
);
const useComposable = (pageType: string) => {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    headers,
    noDataSetting,
    categoryList,

    execCreateApsModule,
    execCreateModuleCategory,
    execDeleteApsModule,
    execDeleteModuleCategory,
    execFetchApsModuleAcl,
    execFetchModuleCategoryList,
    execFetchModuleList,
    execUpdateApsModule,
    execUpdateApsModuleAcl,
  };
};
export default useComposable;
