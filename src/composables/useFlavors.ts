import {ref, watch, type Ref} from 'vue';
import useBasics from '@/composables/useBasics';
import {
  createFlavor,
  createRdsFlavor,
  deleteFlavor,
  deleteRdsFlavor,
  fetchFlavors,
  updateFlavor,
  fetchGpuModelList,
  fetchRdsSystemScopes,
  fetchAvailabilityZones,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';
import {FLAVOR_TYPE} from '@/constants/Constants';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';
import {type FlavorInterface} from '@/interfaces/DataTypeInterface';
import getTableHeaders from '@/utils/getTableHeaders';

import iconFlavor from '@/assets/images/icon_flavor.svg';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

const {t, tc, i18n} = useBasics();
let currentPage: string = '';
const headers: Ref<DataTableHeader[]> = ref([]);
const noDataSetting = ref<NoDataSetting>({
  image: iconFlavor,
  buttonTitle: t('basic.create.type', {type: t('basic.flavor')}),
  message1: t('basic.noData.less.type', {type: t('basic.flavor')}),
  message2: t('basic.noData.emptyMsg'),
});
const rdsSystemScopes: Record<string, any> = ref({});

const updateI18nStrings = (pageType: string) => {
  currentPage = pageType || currentPage;
  if (currentPage) {
    headers.value = getTableHeaders(currentPage);
    noDataSetting.value = {
      ...noDataSetting.value,
      message1: t('basic.noData.less.type', {
        type:
          currentPage === PAGE_TYPES.FLAVOR_VM
            ? tc('flavor.vm', 2)
            : tc('flavor.remote.delivery', 2),
      }),
    };
  }
};

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage);
  },
);

const flavorList = ref<FlavorInterface[]>([]);
const prjFlavorList = ref([]);
const gpuList = ref<
  Array<{
    title: string;
    id: string;
    vgpu: boolean;
  }>
>([]);

const azList = ref<Array<Record<string, any>>>([]);
const getFlavors = async (flavorType: string) => {
  let flavorPrefix: string = 'vps';
  if (flavorType === FLAVOR_TYPE.REMOTE_DELIVERY) {
    flavorPrefix = 'rds';
  }

  await makeApiCallWithoutProgress({
    apiCallFn: fetchFlavors,
    payload: flavorPrefix,
    actionName: 'fetchFlavors',
    actionType: t('basic.get.data'),
    successCallback: (flavors) => {
      if (flavorType === FLAVOR_TYPE.VM) {
        flavorList.value = flavors.map((flavor: Record<string, any>) => ({
          ...flavor,
          cpu: flavor.vcpu,
          memory: flavor.memory / 1024,
          gpuType: '-',
          gpu: flavor.gpu ?? '0',
          permission: flavor.public ? 'active' : '',
          // environment: 'T1',
        }));
      } else {
        flavorList.value = flavors.map((flavor: Record<string, any>) => ({
          ...flavor,
          metadata: {
            ...flavor.metadata,
            memory_per_cpu: flavor.metadata.memory_per_cpu / 1024,
            gpus_per_node: flavor.metadata.gpus_per_node ?? 0,
          },
        }));
      }
    },
  });

  console.log('Result: ', flavorList.value);
};

const execFetchVmFlavors = async () => {
  flavorList.value = [];
  await makeApiCallWithoutProgress({
    apiCallFn: fetchFlavors,
    payload: 'vps',
    actionName: 'fetchFlavors',
    actionType: t('basic.get.data'),
    successCallback: (flavors) => {
      flavorList.value = flavors.map((flavor: Record<string, any>) => ({
        ...flavor,
        cpu: flavor.vcpu,
        memory: flavor.memory / 1024,
        gpuType: flavor?.gpu?.model ?? '-',
        gpu: flavor?.gpu?.count ?? '0',
        permission: flavor.public ? 'active' : '',
      }));
    },
  });
};

const execFetchRemoteDesktopFlavors = () => {
  flavorList.value = [];
  return makeApiCallWithoutProgress({
    apiCallFn: fetchFlavors,
    payload: 'rds',
    actionName: 'fetchFlavors',
    actionType: t('basic.get.data'),
    successCallback: (flavors) => {
      flavorList.value = flavors.map((flavor: Record<string, any>) => ({
        ...flavor,
        metadata: {
          ...flavor.metadata,
          memory_per_cpu: flavor.metadata.memory_per_cpu / 1024,
          gpus_per_node: flavor.metadata.gpus_per_node ?? 0,
        },
      }));
    },
  });
};

const execCreateFlavor = async (flavor: any, flavorType: string) => {
  return makeApiCall({
    apiCallFn: flavorType === 'rds' ? createRdsFlavor : createFlavor,
    payload: {
      flavorType,
      data: flavor,
    },
    actionName: 'createFlavor',
    actionType: t('basic.create'),
  });
};

const execDeleteFlavor = (flavorId: string, flavorType: string) => {
  return makeApiCall({
    apiCallFn: flavorType === 'rds' ? deleteRdsFlavor : deleteFlavor,
    payload: {
      flavorType,
      id: flavorId,
    },
    actionName: 'deleteFlavor',
    actionType: t('basic.delete'),
  });
};

const execUpdateFlavor = async (
  flavorId: string,
  flavorType: string,
  data: Record<string, any>,
) =>
  makeApiCall({
    apiCallFn: updateFlavor,
    payload: {
      flavorType,
      id: flavorId,
      data,
    },
    actionName: 'updateFlavor',
    actionType: t('basic.update'),
  });

const execFetchRdsSystemScopes = async () => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchRdsSystemScopes,
    actionName: 'fetchRdsSystemScopes',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      rdsSystemScopes.value = res;
    },
  });
};

const execFetchGpuModelList = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchGpuModelList,
    actionName: 'fetchGpuModelList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      gpuList.value = [];
      if (res?.vgpu) {
        res?.vgpu.forEach((gpuMode: string) =>
          gpuList.value.push({
            title: gpuMode,
            id: gpuMode,
            vgpu: true,
          }),
        );
      }
      if (res?.passthrough) {
        res?.passthrough.forEach((gpuMode: string) =>
          gpuList.value.push({
            title: gpuMode,
            id: gpuMode,
            vgpu: false,
          }),
        );
      }
    },
  });
};

const execFetchAvailabilityZones = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchAvailabilityZones,
    actionName: 'fetchAvailabilityZones',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      azList.value = [];
      azList.value = res
        .filter((az: {available: boolean}) => az.available)
        .map((az: {name: string}) => az.name);
      return azList.value;
    },
  });
};

const useComposable = (pageType: string) => {
  if (pageType && pageType !== 'FlavorManagement') {
    updateI18nStrings(pageType);
  }
  return {
    headers,
    noDataSetting,

    gpuList,
    flavorList,
    prjFlavorList,
    rdsSystemScopes,

    getFlavors,
    execCreateFlavor,
    execDeleteFlavor,
    execFetchGpuModelList,
    execFetchVmFlavors,
    execFetchRemoteDesktopFlavors,
    execUpdateFlavor,

    execFetchRdsSystemScopes,
    execFetchAvailabilityZones,
  };
};
export default useComposable;
