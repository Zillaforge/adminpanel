import i18n from '@/i18n';
import router from '@/router';
import {LOG_TYPES} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {toHomePage} from '@/utils/utils';
import {type BreadcrumbItem} from '@/interfaces/DataTypeInterface';
const {t, tc} = i18n.global;

const handleGoToS3ObjectList = (bucketName: string, prefix: string = '') => ({
  name: PAGE_TYPES.S3_OBJECT_LIST,
  params: {
    bucketName,
    pathMatch: prefix,
  },
});

export default function (pageType: string, params = {}) {
  let breadcrumbs: BreadcrumbItem[] = [];
  switch (pageType) {
    // Dashboard
    case PAGE_TYPES.DASHBOARD:
      breadcrumbs = getDashboardBreadcrumbs();
      break;

    // Change Password
    case PAGE_TYPES.CHANGE_PASSWORD:
      breadcrumbs = getChangePasswordBreadcrumbs();
      break;

    // User Management
    case PAGE_TYPES.USER_LIST:
      breadcrumbs = getUserListBreadcrumbs(pageType);
      break;

    case PAGE_TYPES.USER_ADMIN_LIST:
      breadcrumbs = getAdminUserListBreadcrumbs();
      break;
    case PAGE_TYPES.PROJECT_LIST:
    case PAGE_TYPES.PROJECT_ISERVICE_LIST:
      breadcrumbs = getProjectListBreadcrumbs(pageType);
      break;
    case PAGE_TYPES.PROJECT_CREATE:
      breadcrumbs = getProjectCreateBreadcrumbs(params);
      break;
    case PAGE_TYPES.PROJECT_DETAIL:
    case PAGE_TYPES.PROJECT_ISERVICE_DETAIL:
      breadcrumbs = getProjectDetailBreadcrumbs(
        pageType === PAGE_TYPES.PROJECT_DETAIL
          ? PAGE_TYPES.PROJECT_LIST
          : PAGE_TYPES.PROJECT_ISERVICE_LIST,
        params,
      );
      break;
    case PAGE_TYPES.PROJECT_EDIT:
      breadcrumbs = getProjectEditBreadcrumbs(params);
      break;
    case PAGE_TYPES.PROJECT_MEMBER_EDIT:
      breadcrumbs = getProjectMemberEditBreadcrumbs(params);
      break;

    // Project Resource Overview
    case PAGE_TYPES.QUOTA_VIRTUAL_PLATFORM_LIST:
      breadcrumbs = getProjectVirtualPlatformQuotaListBreadcrumbs();
      break;
    case PAGE_TYPES.QUOTA_STORAGE_LIST:
      breadcrumbs = getProjectStorageQuotaListBreadcrumbs();
      break;
    case PAGE_TYPES.QUOTA_IMAGE_LIST:
      breadcrumbs = getProjectImageQuotaListBreadcrumbs();
      break;

    case PAGE_TYPES.RESOURCE_REVIEW_LIST:
      breadcrumbs = getResourceReviewManagementListBreadcrumbs();
      break;

    // Flavor Management
    case PAGE_TYPES.FLAVOR_VM:
      breadcrumbs = getFlavorVmBreadcrumbs();
      break;
    case PAGE_TYPES.FLAVOR_REMOTE_DELIVERY:
      breadcrumbs = getFlavorRemoteDeliveryBreadcrumbs();
      break;
    case PAGE_TYPES.NETWORK_EXTERNAL_LIST:
      breadcrumbs = getExternalNetworkListBreadcrumbs();
      break;
    case PAGE_TYPES.NETWORK_PROVIDER_LIST:
      breadcrumbs = getProviderNetworkListBreadcrumbs();
      break;
    case PAGE_TYPES.NETWORK_PROVIDER_DETAIL:
      breadcrumbs = getProviderNetworkDetailBreadcrumbs();
      break;
    case PAGE_TYPES.PROJECT_EXTERNAL_NETWORK_LIST:
      breadcrumbs = getProjectExternalNetworkListBreadcrumbs();
      break;

    case PAGE_TYPES.VM_IMAGE_LIST:
      breadcrumbs = getVmImageListBreadcrumbs();
      break;
    case PAGE_TYPES.VM_IMAGE_CREATE:
      breadcrumbs = getVmImageListCreateBreadcrumbs();
      break;
    case PAGE_TYPES.VM_IMAGE_DETAIL:
      breadcrumbs = getVmImageDetailBreadcrumbs(params);
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_LIST:
      breadcrumbs = getContainerImageListBreadcrumbs();
      break;
    case PAGE_TYPES.CONTAINER_IMAGE_DETAIL:
      breadcrumbs = getContainerImageDetailBreadcrumbs(params);
      break;
    case PAGE_TYPES.APPLICATION_SERVICE_LIST:
      breadcrumbs = getApplicationServiceListBreadcrumbs();
      break;
    case PAGE_TYPES.APPLICATION_DETAIL_LIST:
      breadcrumbs = getApplicationServiceDetailBreadcrumbs(params);
      break;

    case PAGE_TYPES.S3_KEY:
      breadcrumbs = getKeyS3Breadcrumbs();
      break;

    case PAGE_TYPES.S3_BUCKET_LIST:
      breadcrumbs = getS3BucketListBreadcrumbs();
      break;
    case PAGE_TYPES.S3_OBJECT_LIST:
      breadcrumbs = getS3ObjectListBreadcrumbs(params);
      break;
    case PAGE_TYPES.LOGS:
      breadcrumbs = getLogsBreadcrumbs(params);
      break;
    default:
      break;
  }
  if (breadcrumbs === null) {
    throw new Error(
      'Whoops, you are trying to get breadcrumb with unknown type',
    );
  }
  return breadcrumbs;
}

const getDashboardBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getChangePasswordBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.password.change'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectVirtualPlatformQuotaListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.quota.type', {type: t('service.virtual.platform')}),
      }),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectStorageQuotaListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.quota.type', {type: t('service.storage')}),
      }),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectImageQuotaListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.quota.type', {type: t('basic.image')}),
      }),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getResourceReviewManagementListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('resource.review.mechanism'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectListBreadcrumbs = (pageType: string): BreadcrumbItem[] => {
  const projectTypeName =
    pageType === PAGE_TYPES.PROJECT_LIST ? t('basic.testing') : 'iService';
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.project.type', {type: projectTypeName}),
      }),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getUserListBreadcrumbs = (pageType: string): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      // prettier-ignore
      text: t('basic.user.type', {type: t('basic.testing')}),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getAdminUserListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      // prettier-ignore
      text: t('basic.management.type', {type: t('basic.permission.type', {type: t('basic.admin')})}),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};
const getProjectDetailBreadcrumbs = (
  projectListPage: string,
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.project.type', {type: params.projectTypeName}),
      }),
      disabled: false,
      action: () => {
        void router.push({name: projectListPage});
      },
    },
    {
      text:
        (params.projectName !== undefined
          ? String(params.projectName) + ' '
          : '') + t('basic.management.type', {type: t('basic.member')}),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectCreateBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.project.type', {type: params.projectTypeName}),
      }),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.PROJECT_LIST});
      },
    },
    {
      text: t('basic.add.type', {
        type: t('basic.project.type', {type: t('basic.testing')}),
      }),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectEditBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.project.type', {type: params.projectTypeName}),
      }),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.PROJECT_LIST});
      },
    },
    {
      text: t('basic.edit.type', {type: t('basic.project')}),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};
const getProjectMemberEditBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  const breadcrumbs = [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {
        type: t('basic.project.type', {type: params.projectTypeName}),
      }),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.PROJECT_LIST});
      },
    },
  ];
  if (params.projectId) {
    breadcrumbs.push({
      text:
        (params.displayName !== undefined
          ? String(params.displayName) + ' '
          : '') + t('basic.management.type', {type: t('basic.member')}),
      disabled: false,
      action: () => {
        void router.push({
          name: PAGE_TYPES.PROJECT_DETAIL,
          params: {
            id: params.projectId,
            // name: params.displayName,
          },
        });
      },
    });
  }
  breadcrumbs.push({
    text: t('basic.edit.type', {type: t('basic.member')}),
    disabled: true,
    action: () => {
      // This is intentional. Blank means no action.
    },
  });
  return breadcrumbs;
};

const getFlavorVmBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: tc('flavor.vm', 2),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getFlavorRemoteDeliveryBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: tc('flavor.remote.delivery', 2),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getExternalNetworkListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('network.external'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProjectExternalNetworkListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('basic.management.type', {type: t('project.network.external')}),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProviderNetworkListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('network.provider'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getProviderNetworkDetailBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('network.provider'),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.NETWORK_PROVIDER_LIST});
      },
    },
    {
      text: t('basic.detail'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};
const getVmImageListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('image.virtual.machine'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getVmImageListCreateBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('image.virtual.machine'),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.VM_IMAGE_LIST});
      },
    },
    {
      text: t('basic.create'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};
const getVmImageDetailBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('image.virtual.machine'),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.VM_IMAGE_LIST});
      },
    },
    {
      text: params.imageName ?? t('basic.detail'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getContainerImageListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('image.container'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getContainerImageDetailBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('image.container'),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.CONTAINER_IMAGE_LIST});
      },
    },
    {
      text: params.imageName ?? t('basic.detail'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getApplicationServiceListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('services.application'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getApplicationServiceDetailBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('services.application'),
      disabled: false,
      action: () => {
        void router.push({name: PAGE_TYPES.APPLICATION_SERVICE_LIST});
      },
    },
    {
      text: params.name ?? t('basic.detail'),
      disabled: true,
      action: () => {
        // This is intentional. Blank means no action.
      },
    },
  ];
};

const getKeyS3Breadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('keyMgnt.s3'),
      disabled: true,
    },
  ];
};

const getS3BucketListBreadcrumbs = (): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('services.cloudStorage'),
      disabled: true,
      action: () => {
        void router.push({
          name: PAGE_TYPES.S3_BUCKET_LIST,
        });
      },
    },
  ];
};

const getS3ObjectListBreadcrumbs = (
  params: Record<string, any>,
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text: t('services.cloudStorage'),
      disabled: !params.bucketName,
      action: () => {
        void router.push({
          name: PAGE_TYPES.S3_BUCKET_LIST,
        });
      },
    },
  ];
  if (!params.path) {
    if (params.bucketName) {
      breadcrumbs.push({
        text: params.bucketName,
        disabled: true,
      });
    }
  } else {
    breadcrumbs.push({
      text: params.bucketName,
      disabled: false,
      action: () => {
        void router.push(handleGoToS3ObjectList(params.bucketName as string));
      },
    });
    const prefixArray: string[] = [];
    let prefix = '';
    const subpath = params.path.split('/');
    subpath.forEach((path: string, index: number) => {
      if (index === subpath.length - 2) {
        breadcrumbs.push({
          text: path,
          disabled: true,
        });
      } else if (index !== subpath.length - 1) {
        prefix += `${path}/`;
        prefixArray.push(prefix);
        breadcrumbs.push({
          text: path,
          disabled: false,
          action: () => {
            void router.push(
              handleGoToS3ObjectList(
                params.bucketName as string,
                prefixArray[index],
              ),
            );
          },
        });
      }
    });
  }
  return breadcrumbs;
};

const getLogsBreadcrumbs = (params: Record<string, any>): BreadcrumbItem[] => {
  return [
    {
      text: t('breadcrumbs.home'),
      disabled: false,
      action: () => toHomePage(),
    },
    {
      text:
        params.logType === LOG_TYPES.ADMIN
          ? t('logMgnt.adminLog')
          : t('logMgnt.projectLog'),
      disabled: true,
    },
  ];
};
