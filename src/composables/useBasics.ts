import i18n from '@/i18n';
import {computed} from 'vue';
import {useGlobal, useLogin} from '@/store';
import {
  ADMIN_TYPE,
  APP_VERSION,
  CLOUDINFRA_USER_NAMESPACE,
  SYSTEM_USERS,
  SYSTEM_PROJECTS,
} from '@/constants/Constants';

import {
  type TableItem,
  type CustomMsg,
} from '@/interfaces/InfraDataTableInterface';
import {Document, getDocumentLink} from '@/constants/Document';
import get from 'lodash/get';

let globalStore: any;
const {t, tc} = i18n.global;
const isSystemUser = (account: string) => {
  return SYSTEM_USERS.includes(account);
};

const isSystemProject = (displayName: string) => {
  return SYSTEM_PROJECTS.some(
    (prj: string) => prj.toLowerCase() === displayName.toLowerCase(),
  );
};

const isSystemProjectAndUser = (account: string, ProjectName: string) => {
  return isSystemUser(account) && SYSTEM_PROJECTS.includes(ProjectName);
};

const isSiteOrSystemAdmin = (config: number, adminType: number) =>
  (adminType & config) > 0;

const getDuplicatedString = (times) => {
  switch (times) {
    case 2:
      return t('duplicated.times.two');
    case 3:
      return t('duplicated.times.three');
    case 4:
      return t('duplicated.times.four');
    case 5:
      return t('duplicated.times.five');
    default:
      return t('duplicated.times.three');
  }
};

const confirmDeleteTableItemDialog = (
  item: TableItem,
  customMsg: CustomMsg,
  deleteAction: (item: TableItem) => void = () => ({}),
) => {
  globalStore ??= useGlobal();
  const strTitle = customMsg.title
    ? customMsg.title
    : t('dialog.delete.title', {
        resource: t('basic.resource').toLowerCase(),
      });
  const strMsg = customMsg.message ? customMsg.message : '';
  const resourceInfo =
    customMsg.resourceInfo.length > 0
      ? customMsg.resourceInfo.map((info) => ({
          title: `${info.title}:`,
          value: get(item, info.keyOfvalue),
        }))
      : [
          {
            title: t('basic.name') + ':',
            value: get(item, 'name'),
          },
        ];

  globalStore.uiShowDialog({
    title: strTitle,
    type: 'delete',
    message: strMsg,
    isResourceConfirm: true,
    resourceInfo,
    callback: () => {
      deleteAction(item);
    },
  });
};

export const isCloudInfraUser = () => {
  try {
    const userInfo = useLogin().getUserInfo;
    return userInfo.namespace === CLOUDINFRA_USER_NAMESPACE;
  } catch (err) {}
  return false;
};

const handleCopyToClipboard = async (strId: string) => {
  const globalStore = useGlobal();
  // copyToClipboard(strId);
  await navigator.clipboard.writeText(strId);
  globalStore.message = t('basic.copied');
};

const getDocumentTagLink = (tag: string) => {
  const language =
    i18n.global.locale in getDocumentLink() ? i18n.global.locale : 'en';
  return tag
    ? getDocumentLink(Document[tag][language])[language]
    : getDocumentLink()[language];
};

const isPrivateSite = computed(() => {
  return APP_VERSION.includes('private');
});

const isSystemSite = computed(() => {
  return APP_VERSION.includes('trusted-cloud-system');
});

const verifyAdminPermission = (adminType: number) => {
  if (adminType > ADMIN_TYPE.SYSTEM_SITE_ADMIN) return false;
  if (isSystemSite.value) {
    return (adminType & ADMIN_TYPE.SYSTEM_ADMIN) > 0;
  } else {
    return (adminType & ADMIN_TYPE.SITE_ADMIN) > 0;
  }
};

const useComposable = () => {
  return {
    t,
    tc,
    i18n,
    getDuplicatedString,
    isCloudInfraUser,
    isPrivateSite,
    isSystemSite,
    isSystemUser,
    isSystemProject,
    isSystemProjectAndUser,
    isSiteOrSystemAdmin,

    confirmDeleteTableItemDialog,
    getDocumentTagLink,

    handleCopyToClipboard,
    verifyAdminPermission,
  };
};

export default useComposable;
