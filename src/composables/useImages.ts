import {ref, watch, type Ref} from 'vue';
import router from '@/router';
import useBasics from '@/composables/useBasics';
import useSvgIcons from '@/composables/useSvgIcons';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import getTableHeaders from '@/utils/getTableHeaders';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';
import {
  createVirtualImage,
  createVirtualImageTagProjectAcl,
  fetchContainerImageList,
  fetchVirtualImageDetail,
  fetchVirtualImageList,
  fetchVirtualImageTagList,
  fetchVirtualImageTagProjectAcls,
  deleteContainerImage,
  deleteVirtualImage,
  deleteVirtualImageTagProjectAcl,
  updateContainerImage,
  updateVirtualImageDetail,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';
import {formatBytes} from '@/utils/utils';
const {t, i18n} = useBasics();

let currentPage: string = '';
const {IconKeys, ServiceIcons} = useSvgIcons();
const headers: Ref<DataTableHeader[]> = ref([]);
const vmImageList = ref<Array<Record<string, any>>>([]);
const vmImageTagList = ref<Array<Record<string, any>>>([]);
const containerImageList = ref<Array<Record<string, any>>>([]);
const vmImageTagProjectAcls = ref<Array<Record<string, any>>>([]);
let noDataSetting: NoDataSetting = {
  buttonTitle: t('basic.create.type', {
    type: t('image.virtual.machine'),
  }),
  message1: t('basic.noData.less.type', {
    type: t('image.virtual.machine'),
  }),
  message2: t('basic.noData.emptyMsg'),
};

const getServiceName = (pageType: string) => {
  switch (pageType) {
    case PAGE_TYPES.VM_IMAGE_LIST:
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      return t('image.virtual.machine');
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      return t('image.container');
    default:
      return '';
  }
};
const getServiceIcon = (pageType: string) => {
  switch (pageType) {
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      return ServiceIcons[IconKeys.ctr_image].svg;
    case PAGE_TYPES.VM_IMAGE_LIST:
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      return ServiceIcons[IconKeys.vm_image].svg;
    default:
      return undefined;
  }
};

const getButtonTitle = (pageType: string) => {
  switch (pageType) {
    case PAGE_TYPES.VM_IMAGE_LIST:
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      return t('basic.create.type', {
        type: getServiceName(pageType),
      });
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
    default:
      return undefined;
  }
};

const updateI18nStrings = (pageType: string) => {
  currentPage = pageType || currentPage;
  if (
    pageType === PAGE_TYPES.VM_IMAGE_LIST ||
    pageType === PAGE_TYPES.VM_IMAGE_DETAIL ||
    pageType === PAGE_TYPES.CONTAINER_IMAGE_LIST ||
    pageType === PAGE_TYPES.CONTAINER_IMAGE_DETAIL
  ) {
    headers.value = getTableHeaders(currentPage);
    noDataSetting = {
      ...noDataSetting,
      svgIcon: getServiceIcon(pageType),
      buttonTitle: getButtonTitle(pageType),
      message1: t('basic.noData.less.type', {
        type: getServiceName(pageType),
      }),
    };
  }
};

const execFetchVirtualImageList = async (projectId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualImageList,
    payload: projectId,
    actionName: 'fetchVirtualImageList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      vmImageList.value = res;
    },
  });
};
const execFetchVirtualImageTagList = async (
  projectId: string,
  imageId: string,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualImageTagList,
    payload: {
      projectId,
      imageId,
    },
    actionName: 'fetchVirtualImageTagList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      vmImageTagList.value = res.map(
        (tag: {
          id: string;
          size: number;
          type: string;
          extra: Record<string, string>;
        }) => {
          return {
            ...tag,
            diskFormat: tag.extra?.diskFormat || 'raw',
            size: formatBytes(tag.size),
            permission:
              vmImageTagProjectAcls.value.filter(
                (projAcl) =>
                  projAcl?.tag?.id === tag.id &&
                  !Object.prototype.hasOwnProperty.call(projAcl, 'project'),
              )?.length > 0
                ? 'active'
                : '',
            project_ids: vmImageTagProjectAcls.value
              .filter(
                (projAcl) => projAcl?.tag?.id === tag.id && projAcl?.project,
              )
              .map((projAcl) => projAcl?.project?.id),
          };
        },
      );
    },
  });
};

const execFetchVirtualImageDetail = async (imageId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualImageDetail,
    payload: imageId,
    actionName: 'fetchVirtualImageDetail',
    actionType: t('basic.get.data'),
  });
};

const execFetchVirtualImageTagProjectAcls = async (
  imageId: string | undefined,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchVirtualImageTagProjectAcls,
    payload: imageId ?? undefined,
    actionName: 'fetchVirtualImageTagProjectAcls',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      vmImageTagProjectAcls.value = res;
    },
  });
};

const execUpdateVirtualImageDetail = async (payload: Record<string, any>) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateVirtualImageDetail,
    payload,
    actionName: 'updateVirtualImageDetail',
    actionType: t('basic.update'),
  });
};

const execCreateVirtualImage = async (payload: any) => {
  return makeApiCall({
    apiCallFn: createVirtualImage,
    payload,
    actionName: 'createVirtualImage',
    actionType: t('basic.create'),
    successCallback: async () =>
      await router.push({name: PAGE_TYPES.VM_IMAGE_LIST}),
  });
};

const execCreateVirtualImageTagProjectAcl = async (
  tagId: string,
  projectId: string,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: createVirtualImageTagProjectAcl,
    payload: {
      tagId,
      projectId,
    },
    actionName: 'createVirtualImageTagProjectAcl',
    actionType: t('basic.create'),
  });
};

const execDeleteVirtualImage = async (imageId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: deleteVirtualImage,
    payload: imageId,
    actionName: 'deleteVirtualImage',
    actionType: t('basic.delete'),
  });
};

const execFetchContainerImageList = async (projectId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchContainerImageList,
    payload: projectId,
    actionName: 'fetchContainerImageList',
    actionType: t('basic.get.data'),
  }).then((res: any) => (containerImageList.value = res));
};

const execUpdateContainerImage = async (payload: any) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateContainerImage,
    payload,
    actionName: 'updateContainerImage',
    actionType: t('basic.get.data'),
  });
};

const execDeleteContainerImage = async (
  imageName: string,
  projectId: string,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: deleteContainerImage,
    payload: {
      imageName,
      projectId,
    },
    actionName: 'deleteContainerImage',
    actionType: t('basic.delete'),
  });
};

const execDeleteVirtualImageTagProjectAcl = async (projectAclId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: deleteVirtualImageTagProjectAcl,
    payload: projectAclId,
    actionName: 'deleteVirtualImageTagProjectAcl',
    actionType: t('basic.delete'),
  });
};

export const getSiteStorageSchema = () => {
  return 'sss';
};

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage);
  },
);

const useComposable = (pageType: string) => {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    headers,
    noDataSetting,
    containerImageList,
    getSiteStorageSchema,
    vmImageList,
    vmImageTagList,
    vmImageTagProjectAcls,

    execCreateVirtualImage,
    execCreateVirtualImageTagProjectAcl,
    execDeleteContainerImage,
    execFetchContainerImageList,
    execFetchVirtualImageDetail,
    execFetchVirtualImageList,
    execFetchVirtualImageTagList,
    execFetchVirtualImageTagProjectAcls,
    execUpdateContainerImage,
    execUpdateVirtualImageDetail,
    execDeleteVirtualImage,
    execDeleteVirtualImageTagProjectAcl,
  };
};
export default useComposable;
