import {computed, ref, watch, type Ref} from 'vue';
import router from '@/router';
import iconNetwork from '@/assets/images/icon_network.svg';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';
import {
  type NetworkItemInterface,
  type NetworkProviderItemInterface,
  type SecurityGroupInterface,
} from '@/interfaces/DataTypeInterface';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

import useBasics from '@/composables/useBasics';
import getTableHeaders from '@/utils/getTableHeaders';

import {
  createExternalNetwork,
  createProviderNetwork,
  deleteProviderNetwork,
  deleteProviderNetworkServerAttachment,
  fetchExtNetworkList,
  fetchUnusedExtNetworkList,
  fetchProviderNetworkDetail,
  fetchProviderNetworkList,
  fetchProviderNetworkServerAttachments,
  fetchProviderNetworkUsage,
  fetchExtNetworkProjectAssociations,
  updateExtNetworkProjectAssociation,
  updateProviderNetwork,
  updateProviderNetworkServerAttachment,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';

const {t, i18n} = useBasics();
let currentPage: string = '';
const projExtNetworkAssociationList = ref<Array<Record<string, any>>>([]);
const networkList = ref<NetworkItemInterface[]>([]);
const networkProviderList = ref<NetworkProviderItemInterface[]>([]);
const securityGroupList = ref<SecurityGroupInterface[]>([]);
const providerDetailItem = ref({
  id: '',
  name: '',
  description: '',
  cidr: '',
  providerNetworkId: '',
  securityGroupId: '',
  security_groups: [],
});
const securityGroupDetail = ref<SecurityGroupInterface>({
  uuid: '',
  name: '',
  ingress: [],
  egress: [],
});
const projNetworkConfigList = ref<Array<Record<string, any>>>([]);
const providerNetworkAssociatedList = ref<Array<Record<string, any>>>([]);
const defPublicExtNetwork = ref<Record<string, any>>({});
const defPrivateExtNetwork = ref<Record<string, any>>({});
const headers: Ref<DataTableHeader[]> = ref([]);
const sgRulesHeader: Ref<DataTableHeader[]> = computed(() => [
  {
    title: t('network.direction'),
    key: 'direction',
  },
  {
    title: t('network.type'),
    key: 'networkType',
  },
  {
    title: t('network.port.from'),
    key: 'port_min',
  },
  {
    title: t('network.port.to'),
    key: 'port_max',
  },
  {
    title: t('network.protocol'),
    key: 'protocol',
  },
  {
    title: t('network.cidr'),
    key: 'remote_cidr',
  },
]);

const associatedHeader: Ref<DataTableHeader[]> = computed(() => [
  {
    title: t('basic.name.type', {type: t('basic.project')}),
    key: 'displayName',
  },
  {
    title: t('basic.code.name.type', {type: t('basic.project')}),
    key: 'codeName',
  },
  {
    title: t('basic.type.type', {type: t('basic.project')}),
    key: 'type',
  },
  {
    title: t('network.provider.ip'),
    key: 'providerIP',
  },
  {
    title: t('service.vm.name'),
    key: 'vmName',
  },
]);
const noDataSetting = ref<NoDataSetting>({
  image: iconNetwork,
  buttonTitle: t('basic.import'),
  message1: t('basic.noData.less.type', {type: t('network.external')}),
  message2: '',
});

const updateI18nStrings = (pageType: string) => {
  currentPage = pageType || currentPage;

  if (currentPage) {
    headers.value = getTableHeaders(currentPage);

    if (currentPage === PAGE_TYPES.NETWORK_EXTERNAL_LIST) {
      noDataSetting.value = {
        ...noDataSetting.value,
        message1: t('basic.noData.less.type', {type: t('network.external')}),
      };
    } else if (currentPage === PAGE_TYPES.NETWORK_PROVIDER_LIST) {
      noDataSetting.value = {
        ...noDataSetting.value,
        buttonTitle: t('basic.create'),
        message1: t('basic.noData.less.type', {type: t('network.provider')}),
      };
    }
  }
};

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage);
  },
);

const execFetchNetworkList = async () => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchExtNetworkList,
    actionName: 'fetchExtNetworkList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      networkList.value = res.map(
        (item: {default: string; is_default: boolean; namespace: string}) => ({
          ...item,
          default: item.is_default ? 'active' : '',
        }),
      );
    },
  });
};

const execFetchUnusedExtNetworkList = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchUnusedExtNetworkList,
    actionName: 'fetchUnusedExtNetworkList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      return res
        .filter(
          (extNetwork: {status: string}) => extNetwork.status === 'ACTIVE',
        )
        .map((extNetwork: {id: string; name: string}) => {
          return {title: extNetwork.name, id: extNetwork.id};
        });
    },
  });
};

const execFetchProviderNetworkList = async () => {
  networkProviderList.value = [];
  await makeApiCallWithoutProgress({
    apiCallFn: fetchProviderNetworkList,
    actionName: 'fetchProviderNetworkList',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      networkProviderList.value = res;
    },
  });
};

const execCreateProviderNetwork = async (data: Record<string, any>) => {
  await makeApiCall({
    apiCallFn: createProviderNetwork,
    payload: data,
    actionName: 'createProviderNetwork',
    actionType: t('basic.create'),
  });
};

const execDeleteProviderNetwork = async (id: string) => {
  await makeApiCall({
    apiCallFn: deleteProviderNetwork,
    payload: id,
    actionName: 'deleteProviderNetwork',
    actionType: t('basic.delete'),
  });
};

const execUpdateProviderNetwork = async (
  id: string,
  data: Record<string, any>,
) => {
  await makeApiCall({
    apiCallFn: updateProviderNetwork,
    payload: {
      networkId: id,
      data,
    },
    actionName: 'updateProviderNetwork',
    actionType: t('basic.update'),
  });
};

const execFetchProviderNetworkDetail = async (id: string) => {
  await makeApiCall({
    apiCallFn: fetchProviderNetworkDetail,
    payload: id,
    actionName: 'fetchProviderNetworkDetail',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      res.security_groups = res.security_groups.map(
        (sgGroup: Record<string, any>) => ({
          ...sgGroup,
          rules: sgGroup.rules.map((item: any) => ({
            ...item,
            networkType: 'IPv4',
          })),
        }),
      );
      providerDetailItem.value = res;
    },
  });
};

const execImportExternalNetworkItem = (params: Record<string, any>) => {
  return makeApiCall({
    apiCallFn: createExternalNetwork,
    payload: params,
    actionName: 'createExternalNetwork',
    actionType: t('basic.import'),
  });
};

const execFetchProjectNetworkConfigList = async () => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchExtNetworkProjectAssociations,
    actionName: 'fetchExtNetworkProjectAssociations',
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      defPublicExtNetwork.value =
        res?.extnetworks[res?.default_extnetworks.public];
      defPrivateExtNetwork.value =
        res?.extnetworks[res?.default_extnetworks.private];

      projNetworkConfigList.value = res?.associations ?? {};
      projExtNetworkAssociationList.value = {...res.extnetworks};
    },
  });

  return projNetworkConfigList.value;
};

const execUpdateExtNetworkProjectAssociation = async (
  extNetId: string,
  projectId: string,
) => {
  await makeApiCall({
    apiCallFn: updateExtNetworkProjectAssociation,
    actionName: 'updateExtNetworkProjectAssociation',
    payload: {
      extNetId,
      projectId,
    },
    actionType: t('basic.update'),
  });
};

const execUpdateProviderNetworkServerAttachment = async (
  providerNetId: string,
  vmServerId: string,
) => {
  await makeApiCall({
    apiCallFn: updateProviderNetworkServerAttachment,
    actionName: 'updateProviderNetworkServerAttachment',
    payload: {
      id: providerNetId,
      server_id: vmServerId,
    },
    actionType: t('basic.add.type', {
      type: t('basic.association'),
    }),
  });
};

const execFetchProviderNetworkServerAttachments = async (extNetId: string) => {
  await makeApiCall({
    apiCallFn: fetchProviderNetworkServerAttachments,
    actionName: 'fetchProviderNetworkServerAttachments',
    payload: extNetId,
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      providerNetworkAssociatedList.value = res;
    },
  });
};

const execDeleteProviderNetworkServerAttachment = async (
  networkId: string,
  portId: string,
) => {
  await makeApiCall({
    apiCallFn: deleteProviderNetworkServerAttachment,
    payload: {
      networkId,
      portId,
    },
    actionName: 'deleteProviderNetworkServerAttachment',
    actionType: t('basic.delete'),
  });
};

const execFetchProviderNetworkUsage = (networkId: string) => {
  return makeApiCall({
    apiCallFn: fetchProviderNetworkUsage,
    actionName: 'fetchProviderNetworkUsage',
    payload: networkId,
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      return res.total - res.used;
    },
  });
};

const toDetailPage = (id: string) => {
  void router.push({
    name: PAGE_TYPES.NETWORK_PROVIDER_DETAIL,
    params: {
      id,
    },
  });
};

const useComposable = (pageType: string) => {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    defPublicExtNetwork,
    defPrivateExtNetwork,
    providerDetailItem,
    headers,
    associatedHeader,
    sgRulesHeader,
    noDataSetting,
    networkList,
    networkProviderList,
    projExtNetworkAssociationList,
    providerNetworkAssociatedList,

    securityGroupList,
    securityGroupDetail,
    projNetworkConfigList,

    execImportExternalNetworkItem,

    execCreateProviderNetwork,
    execDeleteProviderNetwork,
    execDeleteProviderNetworkServerAttachment,
    execFetchNetworkList,
    execFetchProviderNetworkList,
    execFetchProviderNetworkDetail,
    execFetchProviderNetworkServerAttachments,
    execFetchProjectNetworkConfigList,
    execFetchProviderNetworkUsage,
    execFetchUnusedExtNetworkList,

    execUpdateExtNetworkProjectAssociation,
    execUpdateProviderNetwork,
    execUpdateProviderNetworkServerAttachment,

    toDetailPage,
  };
};
export default useComposable;
