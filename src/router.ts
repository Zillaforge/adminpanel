import {useLogin, usePortalConfig, useGlobal} from '@/store';
import {createRouter, createWebHistory} from 'vue-router';
import type {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import type {VueCookies} from 'vue-cookies';
import {inject} from 'vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {COOKIE_CONFIG, ENV, APP_VERSION} from '@/constants/Constants';
import useBasics from '@/composables/useBasics';
import useMonitors from '@/composables/useMonitors';
import {toLoginPage, toRedirectPage} from '@/utils/utils';
import {fetchUserInfo} from './api';

let globalStore: any;
const checkEnabled = (to: any) => {
  globalStore ??= useGlobal();
  if (globalStore.getIsPilotRegion) {
    if (
      to.name === PAGE_TYPES.FLAVOR_REMOTE_DELIVERY ||
      to.name === PAGE_TYPES.NETWORK_PROVIDER_LIST ||
      to.name === PAGE_TYPES.NETWORK_PROVIDER_DETAIL ||
      to.name === PAGE_TYPES.APPLICATION_SERVICE_LIST ||
      to.name === PAGE_TYPES.APPLICATION_DETAIL_LIST ||
      to.name === PAGE_TYPES.CONTAINER_IMAGE_LIST ||
      to.name === PAGE_TYPES.CONTAINER_IMAGE_DETAIL
    )
      return false;
  }

  return true;
};

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: async () => await import('@/views/LoginView.vue'),
    meta: {
      disableBars: true,
    },
  },
  {
    path: '/redirect',
    name: PAGE_TYPES.REDIRECT,
    component: async () => await import('@/views/RedirectView.vue'),
    meta: {
      disableBars: true,
      disableBreadcrumbs: true,
    },
  },
  {
    path: '/account',
    children: [
      {
        path: 'changepassword',
        name: PAGE_TYPES.CHANGE_PASSWORD,
        component: async () => await import('@/views/ChangePwdView.vue'),
      },
    ],
  },
  {
    path: '/management',
    children: [
      {
        path: 'monitor/',
        children: [
          {
            path: 'openstack',
            name: PAGE_TYPES.MONITOR_OPENSTACK,
            component: async () =>
              await import('@/views/MonitorOpenstackView.vue'),
            meta: {
              disableBreadcrumbs: true,
            },
          },
          {
            path: 'ceph',
            name: PAGE_TYPES.MONITOR_CEPH,
            component: async () => await import('@/views/MonitorCephView.vue'),
            meta: {
              disableBreadcrumbs: true,
            },
          },
          {
            path: 'grafana',
            name: PAGE_TYPES.MONITOR_GRAFANA,
            component: async () =>
              await import('@/views/MonitorGrafanaView.vue'),
            meta: {
              disableBreadcrumbs: true,
            },
          },
          {
            path: 'kibana',
            name: PAGE_TYPES.MONITOR_KIBANA,
            component: async () =>
              await import('@/views/MonitorKibanaView.vue'),
            meta: {
              disableBreadcrumbs: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    name: 'PageNotFound',
    component: async () => await import('@/views/SystemUIView.vue'),
    meta: {
      disableBars: true,
    },
  },
];

/** Router Rules */
const routes: RouteRecordRaw[] = APP_VERSION.includes('trusted-cloud-system')
  ? systemRoutes
  : [
      {
        path: '/',
        name: 'Login',
        component: async () => await import('@/views/LoginView.vue'),
        meta: {
          disableBars: true,
        },
      },
      {
        path: '/redirect',
        name: PAGE_TYPES.REDIRECT,
        component: async () => await import('@/views/RedirectView.vue'),
        meta: {
          disableBars: true,
          disableBreadcrumbs: true,
        },
      },
      {
        path: '/authenticator',
        name: PAGE_TYPES.MFA_AUTHENTICATOR_DOWNLOAD,
        component: async () => await import('@/views/AuthenticatorView.vue'),
        meta: {
          disableBars: true,
        },
      },
      {
        path: '/account',
        children: [
          {
            path: 'changepassword',
            name: PAGE_TYPES.CHANGE_PASSWORD,
            component: async () => await import('@/views/ChangePwdView.vue'),
          },
          {
            path: 'key/s3',
            name: PAGE_TYPES.S3_KEY,
            component: async () => await import('@/views/S3PluginView.vue'),
          },
        ],
      },
      {
        path: '/management',
        children: [
          {
            path: 'user/',
            children: [
              {
                path: 'list',
                name: PAGE_TYPES.USER_LIST,
                component: async () => await import('@/views/UserListView.vue'),
              },
            ],
          },
          {
            path: 'project/',
            children: [
              {
                path: 'list',
                name: PAGE_TYPES.PROJECT_LIST,
                component: async () =>
                  await import('@/views/ProjectLocalListView.vue'),
              },
              {
                path: 'i-service/list',
                name: PAGE_TYPES.PROJECT_ISERVICE_LIST,
                component: async () =>
                  await import('@/views/ProjectIServiceListView.vue'),
              },
              {
                path: 'create',
                name: PAGE_TYPES.PROJECT_CREATE,
                component: async () =>
                  await import('@/views/ProjectCreateView.vue'),
              },
              {
                path: 'detail/:id',
                name: PAGE_TYPES.PROJECT_DETAIL,
                component: async () =>
                  await import('@/views/ProjectDetailView.vue'),
              },
              {
                path: 'i-service/detail/:id',
                name: PAGE_TYPES.PROJECT_ISERVICE_DETAIL,
                component: async () =>
                  await import('@/views/ProjectDetailView.vue'),
              },
              {
                path: 'admin/list',
                name: PAGE_TYPES.USER_ADMIN_LIST,
                component: async () =>
                  await import('@/views/ProjectDetailView.vue'),
              },
              {
                path: 'edit/:id',
                name: PAGE_TYPES.PROJECT_EDIT,
                component: async () =>
                  await import('@/views/ProjectEditView.vue'),
              },
              {
                path: 'member-edit/:id',
                name: PAGE_TYPES.PROJECT_MEMBER_EDIT,
                component: async () =>
                  await import('@/views/ProjectEditView.vue'),
              },
              {
                path: 'external/list',
                name: PAGE_TYPES.PROJECT_EXTERNAL_NETWORK_LIST,
                component: async () =>
                  await import('@/views/ProjectNetworkExternalView.vue'),
              },
            ],
          },
          {
            path: 'quota/',
            children: [
              {
                path: 'virtual-platform/list',
                name: PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST,
                component: async () =>
                  await import('@/views/QuotaVirtualPlatformListView.vue'),
              },
              {
                path: 'storage/list',
                name: PAGE_TYPES.QUOTA_STORAGE_LIST,
                component: async () =>
                  await import('@/views/QuotaStorageListView.vue'),
              },
              {
                path: 'image/list',
                name: PAGE_TYPES.QUOTA_IMAGE_LIST,
                component: async () =>
                  await import('@/views/QuotaImageListView.vue'),
              },
            ],
          },
          {
            path: 'resource/review/list',
            name: PAGE_TYPES.RESOURCE_REVIEW_LIST,
            component: async () =>
              await import('@/views/ResourceReviewManagementView.vue'),
          },
          {
            path: 'virtual-image/',
            children: [
              {
                path: 'list',
                name: PAGE_TYPES.VM_IMAGE_LIST,
                component: async () =>
                  await import('@/views/VmImageListView.vue'),
              },
              {
                path: 'create',
                name: PAGE_TYPES.VM_IMAGE_CREATE,
                component: async () =>
                  await import('@/views/VmImageCreateView.vue'),
              },
              {
                path: 'detail/:imageId',
                name: PAGE_TYPES.VM_IMAGE_DETAIL,
                component: async () =>
                  await import('@/views/VmImageDetailView.vue'),
              },
            ],
          },
          {
            path: 'container-image/',
            children: [
              {
                path: 'list',
                name: PAGE_TYPES.CONTAINER_IMAGE_LIST,
                component: async () =>
                  await import('@/views/ContainerImageListView.vue'),
              },
              {
                path: 'detail/:imageName',
                name: PAGE_TYPES.CONTAINER_IMAGE_DETAIL,
                component: async () =>
                  await import('@/views/ContainerImageDetailView.vue'),
              },
            ],
          },
          {
            path: 'application/list',
            name: PAGE_TYPES.APPLICATION_SERVICE_LIST,
            component: async () =>
              await import('@/views/ApplicationSvcListView.vue'),
          },
          {
            path: 'application/detail/:name/:categoryId',
            name: PAGE_TYPES.APPLICATION_DETAIL_LIST,
            component: async () =>
              await import('@/views/ApplicationSvcDetailView.vue'),
          },
          {
            path: 'flavor/',
            children: [
              {
                path: 'vm',
                name: PAGE_TYPES.FLAVOR_VM,
                component: async () =>
                  await import('@/views/FlavorVirtualMachineView.vue'),
              },
              {
                path: 'remote-delivery',
                name: PAGE_TYPES.FLAVOR_REMOTE_DELIVERY,
                component: async () =>
                  await import('@/views/FlavorRemoteDeliveryView.vue'),
              },
            ],
          },
          {
            path: 'network/',
            children: [
              {
                path: 'external/list',
                name: PAGE_TYPES.NETWORK_EXTERNAL_LIST,
                component: async () =>
                  await import('@/views/NetworkExternalListView.vue'),
              },
              {
                path: 'provider/list',
                name: PAGE_TYPES.NETWORK_PROVIDER_LIST,
                component: async () =>
                  await import('@/views/NetworkProviderListView.vue'),
              },
              {
                path: 'provider/detail/:id',
                name: PAGE_TYPES.NETWORK_PROVIDER_DETAIL,
                component: async () =>
                  await import('@/views/NetworkProviderDetailView.vue'),
              },
            ],
          },
        ],
      },
      {
        path: '/cloudStorage',
        children: [
          {
            path: 'bucket/list',
            name: PAGE_TYPES.S3_BUCKET_LIST,
            component: async () => await import('@/views/S3BucketListView.vue'),
          },
          {
            path: 'bucket/:bucketName/detail/:pathMatch(.*)*',
            name: PAGE_TYPES.S3_OBJECT_LIST,
            component: async () => await import('@/views/S3ObjectListView.vue'),
          },
        ],
      },
      {
        path: '/logs/:logType',
        name: PAGE_TYPES.LOGS,
        component: async () => await import('@/views/LogsView.vue'),
        props: true,
      },
      {
        path: '/:catchAll(.*)',
        name: 'PageNotFound',
        component: async () => await import('@/views/SystemUIView.vue'),
        meta: {
          disableBars: true,
        },
      },
    ];

/** Vue Router */
const router: Router = createRouter({
  /**
   * History Mode
   *
   * @see {@link https://router.vuejs.org/guide/essentials/history-mode.html }
   */
  history: createWebHistory(import.meta.env.BASE_URL), // createWebHashHistory(import.meta.env.BASE_URL)
  /*
  scrollBehavior: (to, _from, savedPosition) => {
    let scrollTo: number | string = 0;

    if (to.hash) {
      scrollTo = to.hash;
    } else if (savedPosition) {
      scrollTo = savedPosition.top;
    }
    return goTo(scrollTo);
  },
  */
  routes,
});
// Global before guards
// https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards}
router.beforeEach(
  async (
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const enabled = checkEnabled(_to);
    if (!enabled) {
      next('/PageNotFound');
      return;
    }
    const userStore = useLogin();
    const {isSystemSite} = useBasics();

    if (!userStore.getCookiesInstance) {
      const $cookies = inject<VueCookies>('$cookies');
      userStore.setCookiesInstance($cookies);
    }

    const portalConfigStore = usePortalConfig();
    if (!portalConfigStore.getHasGottenConfigFromJson || !ENV.API_URL) {
      await portalConfigStore.getPortalConfig();
    }

    if (_to.name === PAGE_TYPES.LOGIN_PAGE && _to.query?.token) {
      if (isSystemSite.value) {
        await userStore.login({token: _to.query.token as string});
      } else {
        await userStore.fetchAdminToken(_to.query.token as string);
      }
    }

    userStore.token = userStore.cookiesInstance?.get(COOKIE_CONFIG.TOKEN.NAME);

    if (!userStore.getToken) {
      toLoginPage(_to, next);
      return;
    }

    if (!userStore.userInfo?.account) {
      await fetchUserInfo(userStore.getToken);
    }

    if (userStore.userInfo?.account) {
      if (_to.name === PAGE_TYPES.LOGIN_PAGE) {
        toRedirectPage(next);
        return;
      } else if (_to.name === PAGE_TYPES.MONITOR_OPENSTACK) {
        const opskSessionId = userStore.cookiesInstance?.get(
          COOKIE_CONFIG.OPENSTACK.CHECK_LOGIN_KEY,
        );

        if (!opskSessionId) {
          await useMonitors()
            .execFetchOpenStackToken()
            .catch(() => {
              console.error('execFetchOpenStackToken/error');
            });
        }
      } else if (_to.name === PAGE_TYPES.MONITOR_CEPH) {
        const cephToken = userStore.cookiesInstance?.get(
          COOKIE_CONFIG.CEPH.CHECK_LOGIN_KEY,
        );
        const cephUsername = localStorage.getItem('dashboard_username');
        if (!cephToken || !cephUsername) {
          await useMonitors()
            .execFetchCephToken()
            .catch(() => {
              console.error('execFetchCephToken/error');
            });
        }
      }
    }
    next();
  },
);

// Global After Hooks
// https://router.vuejs.org/guide/advanced/navigation-guards.html#global-after-hooks}
router.afterEach(() => {
  // const globalStore = useGlobal();
  // // Hide Loading
  // globalStore.setLoading(false);
});

export default router;
