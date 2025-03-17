export const USER_TYPE = {
  BUSINESS: 'business',
  GENERAL: 'general',
};

export const ADMIN_TYPE = {
  SITE_ADMIN: 1,
  SYSTEM_ADMIN: 2,
  SYSTEM_SITE_ADMIN: 3,
};

export const PROJECT_TYPE = {
  iSERVICE: 'iservice',
  GENERAL: 'general',
};

export const UUIDRegex =
  /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

export const ADMIN_PROJECT_NAME = 'administrator';
export const ADMIN_PROJECT_ID = import.meta.env.VITE_APP_ADMIN_PROJECT_ID;
export const ADMIN_PROJECT_SYSTEM_CODE = 'TCI000000';

export const SYSTEM_PROJECTS = [ADMIN_PROJECT_NAME, ADMIN_PROJECT_ID];
export const SYSTEM_USERS = ['admin@ci.asus.com', 'system@ci.asus.com'];

export const MFA_TYPE = {
  DISABLE: 'disabled',
  MANUAL: 'manual',
  FORCE_ENABLE: 'force',
};
export const {
  VITE_APP_API_VERSION: API_VERSION,
  VITE_APP_BASE_PORT: BASE_PORT,
  VITE_APP_VERSION: APP_VERSION,
  VITE_APP_MFA_ENABLED_TYPE: MFA_ENABLED_TYPE,
  VITE_APP_USER_EXTRA_INFO_KEY: EXTRA_INFO_KEY,
} = import.meta.env;

export const USER_EXTRA_INFO_KEY: string = EXTRA_INFO_KEY ?? 'ci';
// prettier-ignore
export const ENV:any = {
  API_URL: '',
  BASE_DOMAIN: '',
  DASHBOARD_ROUTE_NAME: import.meta.env.VITE_APP_DASHBOARD_ROUTE_NAME,
  ENDPOINT_CLOUD_STORAGE: '',
  ENDPOINT_CEPH: '',
  ENDPOINT_DOCS: '',
  ENDPOINT_GRAFANA: '',
  ENDPOINT_KIBANA: '',
  ENDPOINT_OPENSTACK: '',
  USER_PORTAL: '',
  MFA_MENU_ENABLED: import.meta.env.VITE_APP_MFA_ENABLED_TYPE === MFA_TYPE.MANUAL,
};

export const IAM_ERROR_CODE = {
  AdminUserHasBeenFrozenErrCode: 12000002,
  AdminNotAdminPermissionErrCode: 12000005,

  AdminAPIInternalServerErrCode: 13000000,
  AdminAPIInvalidFormatErrCode: 13000001,
  AdminAPIPermissionDeniedErrCode: 13000002,
  AdminAPIAuthenticationFailedErrCode: 13000003,
  AdminAPIUserIsJailerErrCode: 13000004,
  AdminAPIUpdateSamePasswordErrCode: 13000005,
  AdminAPIUserHasBeenFrozenErrCode: 13000006,
  AdminAPIMembershipHasBeenFrozenErrCode: 13000007,
  AdminAPIProjectHasBeenFrozenErrCode: 13000008,
  AdminAPIPermissionAlreadyInUseErrCode: 13000009,
  AdminAPIDeleteDefaultPermissionErrCode: 13000010,
  AdminAPIUserIsNotPAATCreatorErrCode: 13000011,

  UserAPIUpdateSamePasswordErrCode: 13010005,
};

export const INFRA_STAT = {
  CREATING: 'CREATING',
  CREATED: 'CREATED',
  DISABLED: 'DISABLED',
  DELETING: 'DELETING',
  DELETED: 'DELETED',
};

export const USER_PERMISSION_ID = {
  DEFAULT: 'e763477c-c6a2-4eff-a1ee-2d6a02b05a36',
  ADVANCE: '5a029fdc-b600-4ebf-ae71-868907665880',
  SYSTEM: 'c87c6dfe-4a3c-4aad-921d-09e1ef6f07cb',
};

export const PROJECT_USER_ROLES = {
  TENANT_OWNER: 'TENANT_OWNER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MEMBER: 'TENANT_MEMBER',
};

export const ONE_HOUR = 3600 * 1000;
export const THREE_HOUR = 3 * 3600 * 1000;
export const SIX_HOUR = 6 * 3600 * 1000;
export const TWELVE_HOUR = 12 * 3600 * 1000;
export const ONE_DAY = 86400 * 1000;
export const SEVEN_DAY = 7 * 86400 * 1000;
export const FOURTEEN_DAY = 14 * 86400 * 1000;
export const THIRTY_DAY = 30 * 86400 * 1000;
export const THREE_MONTH = 3 * 30 * 86400 * 1000;
export const SIX_MONTH = 6 * 30 * 86400 * 1000;
export const ONE_YEAR = 365 * 86400 * 1000;

export const GPU_TABLE_FIELD_NAME = 'gpuName';

export const CLOUDINFRA_NAMESPACE = 'ci.asus.com';
export const ISERVICE_NAMESPACE = 'iservice.nchc.org.tw';
export const CLOUDINFRA_USER_NAMESPACE = 'ci.asus.com';
export const TRUSTED_CLOUD_NAMESPACE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};
export const PROJECT_TYPE_ISERVICE = 'iService';

export const LOGIN_STATUS = {
  PROCESSING: 0,
  LOGIN_FAILED: 1,
  MFA_VERIFY_DONE: 2,
  MFA_VERIFY_FAILED: 3,
  MFA_ENABLE_DONE: 4,
  NO_PROJECT: 5,
  LOGIN_FAILED_NOT_ADMIN: 6,
};

export const COOKIE_CONFIG = {
  TOKEN: {
    NAME: 'atoken',
    DOMAIN: 'localhost',
    // y:	year, m: month, d: day
    // h: hour, min: minute, s: second
    EXPIRE_TIME: '24h',
  },
  USER_TOKEN: {
    NAME: 'trusted-cloud-token',
  },
  OPENSTACK: {
    EXPIRE_TIME: '24h',
    SAME_SITE: 'Strict',
    CHECK_LOGIN_KEY: 'sessionid',
    KEY_NAMES: ['csrftoken', 'sessionid', 'login_domain', 'login_region'],
  },
  CEPH: {
    EXPIRE_TIME: '24h',
    SAME_SITE: 'Strict',
    CHECK_LOGIN_KEY: 'token',
    KEY_NAMES: ['token'],
  },

  KEY_NAMES: ['atoken'],
};

export const LOCAL_DOMAIN = 'localhost';

export const DOMAIN = {
  LOCAL: '',
  BASE: '',
};

export const ENABLE_SWITCH_REGION =
  import.meta.env.VITE_APP_SWITCH_REGION === 'true';
const isSystemSite = import.meta.env.MODE?.includes('system');
export const enableLoginPage =
  location.hostname.toLowerCase() === LOCAL_DOMAIN || isSystemSite;

export const FLAVOR_TYPE = {
  VM: 'vm',
  REMOTE_DELIVERY: 'remote_delivery',
};

export const BYTES_GIB = 1024 * 1024 * 1024;

export const OS = {
  win: 0,
  mac: 1,
  linux: 2,
};

export const LOG_TYPES = {
  PROJECT: 'project',
  ADMIN: 'admin',
};

export const RESOURCE_REGION_TYPE = {
  PILOT: 'tw-tc-ad2',
  TRUSTED_PLATFORM: 'tw-tc-ad1',
};

export const DEFAULT_RESOURCE_REGION = RESOURCE_REGION_TYPE.TRUSTED_PLATFORM;

export default {
  APP_BAR_HEIGHT: 56,
  APP_BAR_HEIGHT_PX: '56px',
  BYTES_GIB,
  GPU_TABLE_FIELD_NAME,
  MENU_NORMAL_WIDTH: 260,
  MENU_MINI_WIDTH: 56,
  MENU_ICON_DEFAULT_SIZE: 24,
  MENU_FOOTER_ICON_SIZE: 24,
  MENU_FOOTER_BTN_SIZE: 28,

  ONE_HOUR,
  THREE_HOUR,
  SIX_HOUR,
  TWELVE_HOUR,
  ONE_DAY,
  SEVEN_DAY,
  FOURTEEN_DAY,
  THIRTY_DAY,
  THREE_MONTH,
  SIX_MONTH,
  ONE_YEAR,

  COOKIE_CONFIG,
  CLOUDINFRA_USER_NAMESPACE,
  ENV,
  ENABLE_SWITCH_REGION,
  IAM_ERROR_CODE,
  INFRA_STAT,
  LOGIN_STATUS,
  FLAVOR_TYPE,
  PROJECT_TYPE,
  SYSTEM_PROJECTS,
  SYSTEM_USERS,
  USER_TYPE,
  UUIDRegex,
  USER_EXTRA_INFO_KEY,
  USER_PERMISSION_ID,
};
