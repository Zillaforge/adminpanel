import {useGlobal} from '@/store';
import type MenuItem from '@/interfaces/MenuItemInterface';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {APP_VERSION, LOG_TYPES} from '@/constants/Constants';
import i18n from '@/i18n';

const {t, tc} = i18n.global;
let globalStore: any;

export default function () {
  let menuContent = [];

  if (APP_VERSION.includes('trusted-cloud-system')) {
    menuContent = menuTrustedCloudSystemPortal();
  } else if (APP_VERSION.includes('trusted-cloud')) {
    menuContent = menuTrustedCloud();
  } else {
    menuContent = menuTrustedCloud();
  }
  return menuContent;
}

const menuTrustedCloudSystemPortal = () => {
  return [
    {
      title: t('site.type', {type: 'OpenStack'}),
      routeName: PAGE_TYPES.MONITOR_OPENSTACK,
      svgIcon: 'menu_icon_openstack',
      relatedPath: ['/management/monitor/openstack'],
    },
    {
      title: t('site.type', {type: t('service.storage.ceph')}),
      routeName: PAGE_TYPES.MONITOR_CEPH,
      svgIcon: 'menu_icon_ceph',
      relatedPath: ['/management/monitor/ceph'],
    },
    {
      title: t('basic.system.type', {type: t('basic.monitor')}),
      routeName: PAGE_TYPES.MONITOR_GRAFANA,
      svgIcon: 'menu_icon_grafana',
      relatedPath: ['/management/monitor/grafana'],
    },
    {
      title: t('basic.management.type', {type: t('basic.log')}),
      routeName: PAGE_TYPES.MONITOR_KIBANA,
      // icon: 'mdi-file-multiple-outline',
      svgIcon: 'menu_icon_kibana',
      relatedPath: ['/management/monitor/kibana'],
    },
  ] as MenuItem[];
};

const menuTrustedCloud = () => {
  globalStore ??= useGlobal();
  return [
    {
      title: t('basic.management.type', {
        type: t('basic.member'),
      }),
      icon: 'mdi-account-supervisor',
      group: [
        {
          title: t('basic.user.type', {type: t('basic.testing')}),
          routeName: PAGE_TYPES.USER_LIST,
          relatedPath: ['/management/user/list'],
        },
        {
          title: t('basic.permission.type', {
            type: t('basic.admin'),
          }),
          routeName: PAGE_TYPES.USER_ADMIN_LIST,
          relatedPath: ['/management/project/admin/list'],
        },
      ],
    },
    {
      title: t('basic.management.type', {
        type: t('basic.project'),
      }),
      icon: 'mdi-shield-account-variant',
      group: [
        {
          title: t('basic.project.type', {
            type: 'iService',
          }),
          routeName: PAGE_TYPES.PROJECT_ISERVICE_LIST,
          relatedPath: [
            '/management/project/i-service/list',
            '/management/project/i-service/detail',
          ],
        },
        {
          title: t('basic.project.type', {type: t('basic.testing')}),
          routeName: PAGE_TYPES.PROJECT_LIST,
          relatedPath: [
            '/management/project/list',
            '/management/project/detail',
            '/management/project/create',
            '/management/project/edit',
            '/management/project/member-edit',
          ],
        },
      ],
    },
    {
      title: t('basic.flavor'),
      svgIcon: 'menu_icon_flavor',
      group: [
        {
          title: tc('flavor.vm'),
          routeName: PAGE_TYPES.FLAVOR_VM,
          relatedPath: ['/flavor/vm'],
        },
        {
          title: tc('flavor.remote.delivery'),
          routeName: PAGE_TYPES.FLAVOR_REMOTE_DELIVERY,
          relatedPath: ['/flavor/remote-delivery'],
          hide: globalStore.getIsPilotRegion,
        },
      ],
    },
    {
      title: t('basic.management.type', {type: t('basic.network')}),
      svgIcon: 'menu_icon_network',
      group: [
        {
          title: t('network.external'),
          routeName: PAGE_TYPES.NETWORK_EXTERNAL_LIST,
          relatedPath: ['/network/external'],
        },
        {
          title: t('project.network.external'),
          routeName: PAGE_TYPES.PROJECT_EXTERNAL_NETWORK_LIST,
          relatedPath: ['project/external/list'],
        },
        {
          title: t('network.provider'),
          routeName: PAGE_TYPES.NETWORK_PROVIDER_LIST,
          relatedPath: ['/network/provider/list', '/network/provider/detail'],
          hide: globalStore.getIsPilotRegion,
        },
      ],
    },
    {
      title: t('basic.management.type', {
        type: t('basic.quota'),
      }),
      icon: 'mdi-memory',
      group: [
        {
          title: t('service.virtual.platform'),
          routeName: PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST,
          relatedPath: ['/management/quota/virtual-platform/list'],
        },
        {
          title: t('service.storage'),
          routeName: PAGE_TYPES.QUOTA_STORAGE_LIST,
          relatedPath: ['/management/quota/storage/list'],
        },
        {
          title: t('basic.image'),
          routeName: PAGE_TYPES.QUOTA_IMAGE_LIST,
          relatedPath: ['/management/quota/image/list'],
        },
      ],
    },
    {
      title: t('resource.review.mechanism'),
      routeName: PAGE_TYPES.RESOURCE_REVIEW_LIST,
      relatedPath: ['/resource/review'],
      svgIcon: 'menu_icon_review',
    },
    {
      title: t('basic.setting.type', {
        type: t('service.trusted.cloud.platform'),
      }),
      svgIcon: 'menu_icon_platform_config',
      group: [
        {
          title: t('image.virtual.machine'),
          routeName: PAGE_TYPES.VM_IMAGE_LIST,
          relatedPath: [
            'virtual-image/list',
            'virtual-image/create',
            'virtual-image/detail',
          ],
        },
        {
          title: t('image.container'),
          routeName: PAGE_TYPES.CONTAINER_IMAGE_LIST,
          relatedPath: ['container-image/list', 'container-image/detail'],
          hide: globalStore.getIsPilotRegion,
        },
        {
          title: t('services.application'),
          routeName: PAGE_TYPES.APPLICATION_SERVICE_LIST,
          relatedPath: [
            '/management/application/list',
            '/management/application/detail',
          ],
          hide: globalStore.getIsPilotRegion,
        },
      ],
    },
    {
      title: t('services.cloudStorage'),
      routeName: PAGE_TYPES.S3_BUCKET_LIST,
      relatedPath: ['/cloudstorage/'],
      // svgIcon: 'menu_icon_storage',
      icon: 'mdi-dns',
    },
    {
      title: t('logMgnt'),
      svgIcon: 'menu_icon_log',
      group: [
        {
          title: t('logMgnt.projectLog'),
          routeName: PAGE_TYPES.LOGS,
          routeParams: {logType: LOG_TYPES.PROJECT},
          relatedPath: [`/logs/${LOG_TYPES.PROJECT}`],
        },
        {
          title: t('logMgnt.adminLog'),
          routeName: PAGE_TYPES.LOGS,
          routeParams: {logType: LOG_TYPES.ADMIN},
          relatedPath: [`/logs/${LOG_TYPES.ADMIN}`],
        },
      ],
    },
  ] as MenuItem[];
};
