import {useGlobal} from '@/store';
import i18n from '@/i18n';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {S3ServiceType} from '@/interfaces/CloudStorageInterface';

const {t, tc} = i18n.global;
let globalStore: any;
export default (type: string, params = {}) => {
  globalStore ??= useGlobal();
  let headers: DataTableHeader[] = [];
  switch (type) {
    case PAGE_TYPES.USER_LIST:
      headers = getUserListHeaders();
      break;
    case PAGE_TYPES.USER_ADMIN_LIST:
      headers = getAdminUserListHeaders();
      break;

    case PAGE_TYPES.PROJECT_LIST:
      headers = getTrustedCloudProjectListHeaders();
      break;
    case PAGE_TYPES.PROJECT_ISERVICE_LIST:
      headers = getTrustedCloudIServiceProjectListHeaders();
      break;
    case PAGE_TYPES.PROJECT_DETAIL:
    case PAGE_TYPES.PROJECT_ISERVICE_DETAIL:
      headers = getProjectDetailHeaders(params);
      break;

    case PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST:
      headers = getProjectVirtualPlatformQuotaListHeaders(params);
      break;
    case PAGE_TYPES.QUOTA_STORAGE_LIST:
      headers = getProjectStorageQuotaListHeaders();
      break;
    case PAGE_TYPES.QUOTA_IMAGE_LIST:
      headers = getProjectImageQuotaListHeaders();
      break;
    case PAGE_TYPES.RESOURCE_REVIEW_LIST:
      headers = getProjectResourceReviewManagementListHeaders();
      break;

    case PAGE_TYPES.FLAVOR_VM:
      headers = getVmFlavorListHeaders();
      break;
    case PAGE_TYPES.FLAVOR_REMOTE_DELIVERY:
      headers = getRemoteDeliveryFlavorListHeaders();
      break;

    case PAGE_TYPES.NETWORK_EXTERNAL_LIST:
      headers = getExternalNetworkListHeaders();
      break;
    case PAGE_TYPES.PROJECT_EXTERNAL_NETWORK_LIST:
      headers = getProjectExternalNetworkListHeaders();
      break;
    case PAGE_TYPES.NETWORK_PROVIDER_LIST:
      headers = getProviderNetworkListHeaders();
      break;
    case PAGE_TYPES.VM_IMAGE_LIST:
      headers = getVmImageListHeaders();
      break;
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      headers = getVmImageDetailHeaders();
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
      headers = getContainerImageListHeaders();
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      headers = getContainerImageDetailHeaders();
      break;
    case PAGE_TYPES.APPLICATION_SERVICE_LIST:
      headers = getApplicationServiceListHeaders();
      break;
    case PAGE_TYPES.APPLICATION_DETAIL_LIST:
      headers = getApplicationServiceDetailHeaders();
      break;

    case PAGE_TYPES.S3_BUCKET_LIST:
      headers = getS3BucketListHeaders();
      break;
    case PAGE_TYPES.S3_OBJECT_LIST:
      headers = getS3ObjectListHeaders();
      break;

    case PAGE_TYPES.LOGS:
      headers = getLogsHeaders();
      break;
  }
  if (headers === null) {
    throw new Error(
      'Whoops, you are trying to get table headers with unknown type',
    );
  }
  return headers;
};

const getUserListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: 'ID',
      key: 'userId',
      optional: true,
    },
    {
      title: t('label.account'),
      key: 'account',
      optional: false,
    },
    {
      title: t('basic.name'),
      key: 'displayName',
      optional: false,
    },
    {
      title: t('basic.user.email'),
      key: 'email',
      optional: false,
    },
  ];
  return headers.concat([
    {
      title: t('basic.system.admin'),
      key: 'admin',
      optional: true,
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
      optional: false,
    },
    {
      title: t('basic.last.login.date'),
      key: 'lastLoginAt',
      optional: false,
    },
  ]);
};

const getAdminUserListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('label.account'),
      key: 'user.account',
    },
    {
      title: t('basic.name'),
      key: 'user.displayName',
    },
    {
      title: t('basic.user.email'),
      key: 'user.email',
    },
    {
      title: t('basic.site.admin'),
      key: 'site-admin',
      align: 'center',
    },
    {
      title: t('basic.system.admin'),
      key: 'sys-admin',
      align: 'center',
    },
    {
      title: t('basic.create.date'),
      key: 'user.createdAt',
    },
    {
      title: t('basic.last.login.date'),
      key: 'user.lastLoginAt',
    },
  ];
  return headers;
};

const getTrustedCloudProjectListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'displayName',
    },
    {
      title: t('basic.code.name'),
      key: 'extra.iservice.projectSysCode',
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
    },
  ];
  return headers;
};

const getTrustedCloudIServiceProjectListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'displayName',
    },
    {
      title: t('basic.code.name'),
      key: 'extra.iservice.projectSysCode',
    },
  ];
  return headers;
};

const getProjectDetailHeaders = (params: any) => {
  return [
    {
      title: t('label.account'),
      key: 'user.account',
    },
    {
      title: t('basic.name'),
      key: 'user.displayName',
    },
    {
      title: t('basic.identity'),
      key: 'userPermission',
    },
  ];
};

const getProjectVirtualPlatformQuotaListHeaders = (
  params: Record<string, any>,
) => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'name',
      sortable: true,
    },
    {
      title: t('basic.code.name'),
      key: 'codeName',
      sortable: true,
    },
    {
      title: t('basic.type'),
      key: 'type',
      sortable: true,
    },
    {
      title: t('service.vm.name'),
      key: 'vm',
      subTitle: `(${tc('basic.pcs', 2)})`,
      sortable: true,
    },
  ];

  if (params?.iaas?.gpu_quota ?? false) {
    headers.push({
      title: t('flavor.gpu'),
      key: 'gpu',
      subTitle: `(${t('flavor.gpu.unit')})`,
      sortable: true,
    });
  }
  return headers.concat([
    {
      title: t('flavor.cpu'),
      key: 'vcpu',
      subTitle: `(${t('basic.cores')})`,
      sortable: true,
    },
    {
      title: t('flavor.memory'),
      key: 'ram',
      subTitle: `(${t('flavor.memory.unit.gb')})`,
      sortable: true,
    },
    {
      title: t('vm.network'),
      key: 'network',
      subTitle: `(${tc('basic.pcs', 2)})`,
      sortable: true,
    },
    {
      title: t('vm.network.floating.ip'),
      key: 'floating_ip',
      subTitle: `(${tc('basic.pcs', 2)})`,
      sortable: true,
    },
    {
      title: t('storage.block'),
      key: 'block_size',
      subTitle: `(${t('storage.disk.unit.gb')})`,
      sortable: true,
      tooltip: t('tips.quota.header.block.storage'),
    },
    {
      title: t('service.file.sharing'),
      key: 'share_size',
      subTitle: `(${t('storage.disk.unit.gb')})`,
      sortable: true,
    },
  ]);
};

const getProjectStorageQuotaListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'name',
      sortable: true,
    },
    {
      title: t('basic.code.name'),
      key: 'codeName',
      sortable: true,
    },
    {
      title: t('basic.type'),
      key: 'type',
      sortable: true,
    },
  ];

  if (globalStore.getIsPilotRegion) {
    return headers.concat([
      {
        title: `${t('service.data.storage')}`,
        key: S3ServiceType.STORAGE_PUBLIC,
        subTitle: `(${t('storage.disk.unit.gb')})`,
        sortable: true,
      },
    ]);
  } else {
    return headers.concat([
      {
        title: `${t('service.data.storage')} (${t('basic.zone.public')})`,
        key: S3ServiceType.STORAGE_PUBLIC,
        subTitle: `(${t('storage.disk.unit.gb')})`,
        sortable: true,
      },
      {
        title: `${t('service.data.storage')} (${t('basic.zone.private')})`,
        key: S3ServiceType.STORAGE_PRIVATE,
        subTitle: `(${t('storage.disk.unit.gb')})`,
        sortable: true,
      },
      {
        title: t('service.data.exchange'),
        key: S3ServiceType.EXCHANGE,
        subTitle: `(${t('storage.disk.unit.gb')})`,
        sortable: true,
      },
      {
        title: t('service.data.release'),
        key: S3ServiceType.RELEASE,
        subTitle: `(${t('storage.disk.unit.gb')})`,
        sortable: true,
      },
    ]);
  }
};

const getProjectImageQuotaListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'name',
      sortable: true,
    },
    {
      title: t('basic.code.name'),
      key: 'codeName',
      sortable: true,
    },
    {
      title: t('basic.type'),
      key: 'type',
      sortable: true,
    },
    {
      title: t('image.virtual.machine'),
      key: 'imageVmCounts',
      subTitle: `(${tc('basic.pcs', 2)})`,
      sortable: true,
    },
    {
      title: t('image.virtual.machine'),
      key: 'imageVmSize',
      subTitle: `(${t('storage.disk.unit.gb')})`,
      sortable: true,
    },
  ];

  if (!globalStore.getIsPilotRegion) {
    headers.push({
      title: t('image.container'),
      key: 'imageCtnSize',
      subTitle: `(${t('storage.disk.unit.gb')})`,
      sortable: true,
    });
  }
  return headers;
};

const getProjectResourceReviewManagementListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name.type', {type: t('basic.project')}),
      key: 'displayName',
      sortable: true,
    },
    {
      title: t('basic.code.name'),
      key: 'extra.iservice.projectSysCode',
      sortable: true,
    },
    {
      title: t('basic.type'),
      key: 'type',
      sortable: true,
    },
    {
      title: t('service.vm.name'),
      key: 'vpsVM', // 'extra.resourceReview.vpsVM'
      align: 'center',
      sortable: true,
    },
    {
      title: t('services.k8s.cluster'),
      key: 'kaas', // 'extra.resourceReview.kaas'
      align: 'center',
      sortable: true,
    },
  ];

  if (!globalStore.getIsPilotRegion) {
    headers.push({
      title: t('services.application'),
      key: 'aps', // 'extra.resourceReview.aps'
      align: 'center',
      sortable: true,
    });
  }

  return headers.concat([
    {
      title: t('resource.gpu.spec') + `(${t('basic.zone.global')})`,
      key: 'gpuFlavor', // 'extra.resourceReview.gpuFlavor'
      align: 'center',
      sortable: true,
    },
    {
      title: t('vm.network.floating.ip') + `(${t('basic.zone.global')})`,
      key: 'floatingIp', // 'extra.resourceReview.floatingIp'
      align: 'center',
      sortable: true,
    },
  ]);
};

const getVmFlavorListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: t('flavor.gpu.type'),
      key: 'gpuType',
    },
    {
      title: t('flavor.gpu'),
      key: 'gpu',
      subTitle: `(${t('flavor.gpu.unit')})`,
      sortable: true,
    },
    {
      title: t('flavor.cpu'),
      key: 'cpu',
      subTitle: `(${t('flavor.cpu.unit')})`,
      sortable: true,
    },
    {
      title: t('flavor.memory'),
      key: 'memory',
      subTitle: `(${t('flavor.memory.unit.gb')})`,
      sortable: true,
    },
    {
      title: t('flavor.disk'),
      key: 'disk',
      subTitle: `(${t('storage.disk.unit.gb')})`,
      sortable: true,
    },
    {
      title: t('permission.public'),
      align: 'center',
      key: 'permission',
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
    },
  ] as DataTableHeader[];
};

const getRemoteDeliveryFlavorListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: t('basic.node'),
      key: 'metadata.nodes',
      subTitle: `(${tc('basic.pcs', 2)})`,
      sortable: true,
    },
    {
      title: t('flavor.gpu'),
      key: 'metadata.gpus_per_node',
      subTitle: `(${t('flavor.gpu.unit')} / ${t('basic.node')})`,
      sortable: true,
    },
    {
      title: t('flavor.cpu'),
      key: 'metadata.cpus_per_task',
      subTitle: `(${t('flavor.cpu.unit')} / ${t('basic.task')})`,
      sortable: true,
    },
    {
      title: t('flavor.memory'),
      key: 'metadata.memory_per_cpu',
      subTitle: `(${t('flavor.memory.unit.gb')} / CPU Core)`,
      sortable: true,
    },
    {
      title: t('basic.partition'),
      key: 'metadata.partition',
      sortable: true,
    },
    {
      title: t('flavor.environment'),
      key: 'provider',
      sortable: true,
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
    },
  ];
};

const getExternalNetworkListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: 'vlan ID',
      key: 'segment_id',
    },
  ];

  if (!globalStore.getIsPilotRegion) {
    headers.push({
      title: t('basic.zone'),
      key: 'zone',
    });
  }

  return headers.concat([
    {
      title: 'CIDR',
      key: 'cidr',
    },
    {
      title: t('basic.default'),
      align: 'center',
      key: 'default',
    },
  ]);
};

const getProjectExternalNetworkListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: t('basic.code.name'),
      key: 'codeName',
    },
    {
      title: t('basic.type.type'),
      key: 'type',
    },
  ];

  if (globalStore.getIsPilotRegion) {
    return headers.concat([
      {
        title: t('network.external'),
        key: 'public.name',
      },
    ]);
  } else {
    return headers.concat([
      {
        title: t('basic.network.type', {type: t('basic.zone.public')}),
        key: 'public.name',
      },
      {
        title: t('basic.network.type', {type: t('basic.zone.private')}),
        key: 'private.name',
      },
    ]);
  }
};

const getS3BucketListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'Name',
    },
  ];
};

const getProviderNetworkListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: 'CIDR',
      key: 'cidr',
    },
    {
      title: t('network.security.group.id'),
      key: 'sg_ids',
    },
  ];
};

const getS3ObjectListHeaders = (): DataTableHeader[] => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
      width: '45%',
    },
    {
      title: t('basic.size'),
      align: 'start',
      key: 'size',
    },
    {
      title: t('basic.lastUpdated.time'),
      align: 'start',
      key: 'lastModified',
    },
  ];
};

const getLogsHeaders = () => {
  return [
    {
      title: t('logMgnt.serviceType'),
      key: 'uiType',
    },
    {
      title: t('logMgnt.region'),
      key: 'meta.ad',
    },
    {
      title: t('logMgnt.action'),
      key: 'uiAction',
    },
    {
      title: t('logMgnt.user'),
      key: 'userName',
    },
    {
      title: t('logMgnt.time'),
      key: 'action.time',
      useDateFilter: true,
    },
  ];
};

const getVmImageListHeaders = () => {
  const headers: DataTableHeader[] = [
    {
      title: t('basic.name'),
      key: 'name',
    },
  ];

  if (!globalStore.getIsPilotRegion) {
    headers.push({
      title: t('basic.zone'),
      key: 'zone',
    });
  }

  return headers.concat([
    {
      title: t('basic.desc'),
      key: 'description',
    },
    {
      title: t('label.number.type', {type: t('label.version')}),
      key: 'count',
    },
  ]);
};
const getVmImageDetailHeaders = () => {
  return [
    {
      title: t('label.version'),
      key: 'name',
    },
    {
      title: t('basic.type'),
      key: 'type',
    },
    {
      title: t('image.diskFormat'),
      key: 'diskFormat',
    },
    {
      title: t('label.volume.size'),
      key: 'size',
    },
    {
      title: t('basic.status'),
      key: 'status',
    },
    {
      title: t('permission.public'),
      align: 'center',
      key: 'permission',
    },
  ] as DataTableHeader[];
};
const getContainerImageListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: t('basic.desc'),
      key: 'description',
    },
    {
      title: t('label.number.type', {type: t('label.version')}),
      key: 'artifactCount',
    },
  ];
};

const getContainerImageDetailHeaders = () => {
  return [
    {
      title: t('label.version'),
      key: 'name',
    },
    {
      title: t('label.volume.size'),
      key: 'tagSize',
    },
    {
      title: 'Push-Command',
      key: 'pushCommand',
    },
    {
      title: 'Pull-Command',
      key: 'pullCommand',
    },
    {
      title: t('label.lastPush'),
      key: 'pushAt',
    },
  ];
};

const getApplicationServiceListHeaders = () => {
  return [
    {
      title: t('basic.name'),
      key: 'name',
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
    },
  ];
};

const getApplicationServiceDetailHeaders = () => {
  return [
    {
      title: t('label.version'),
      key: 'name',
    },
    {
      title: t('permission.public'),
      align: 'center',
      key: 'permission',
    },
    {
      title: t('basic.create.date'),
      key: 'createdAt',
    },
    {
      title: t('basic.creator'),
      key: 'creator.name',
    },
  ] as DataTableHeader[];
};
