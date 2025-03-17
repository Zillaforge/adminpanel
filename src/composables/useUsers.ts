import {ref, watch, computed, type Ref} from 'vue';
import iconMember from '@/assets/images/icon_member.svg';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  PROJECT_USER_ROLES,
  USER_PERMISSION_ID,
  USER_EXTRA_INFO_KEY,
  ADMIN_PROJECT_ID,
} from '@/constants/Constants';
import {pwdHistoryDuplicatedChecker} from '@/utils/utilsFunctions';

import useBasics from '@/composables/useBasics';
import getTableHeaders from '@/utils/getTableHeaders';
import type {DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {type UserFieldConfigInterface} from '@/interfaces/DataTypeInterface';

import {
  createUser,
  deleteUser,
  fetchUserMembershipsBatch,
  fetchUserList,
  fetchUserInfo,
  generateUserSimulationToken,
  updateUserInfo,
  updateUserPassword,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';

const {t, tc, i18n, getDuplicatedString} = useBasics();
let currentPage: string = '';
const headers: Ref<DataTableHeader[]> = ref([]);
const noDataSetting = computed(() => {
  return {
    image: iconMember,
    buttonTitle: t('basic.add.type', {type: tc('basic.users', 1)}),
    message1: t('basic.noData.less.type', {
      type: t('basic.user.type', {type: t('basic.testing')}),
    }),
    message2: t('basic.noData.emptyMsg'),
  };
});

const supportUserFields: UserFieldConfigInterface[] = [
  {
    key: 'account',
    title: t('label.account'),
    hintType: 'email',
    isRequired: true,
    isTextArea: false,
    isEditable: false,
  },
  {
    key: 'displayName',
    title: t('basic.user.name'),
    hintType: '',
    isRequired: true,
    isTextArea: false,
    isEditable: true,
  },
  {
    key: 'email',
    title: t('basic.user.email'),
    hintType: 'email',
    isRequired: true,
    isTextArea: false,
    isEditable: true,
  },
];

const updateI18nStrings = (pageType: string) => {
  headers.value = getTableHeaders(PAGE_TYPES.USER_LIST);
  currentPage = pageType || currentPage;
};

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage);
  },
);

const userList: any = ref([]);
const getAllUsers = async () => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchUserList,
    actionName: 'fetchUserList',
    actionType: t('basic.get.data'),
  }).then((res: any[]) => {
    if (!Array.isArray(res)) {
      userList.value = [];
    } else {
      userList.value = res.map((user: any) => {
        return {
          ...user,
          admin: '',
          extra: {
            ...(user?.extra ?? {}),
            [USER_EXTRA_INFO_KEY]: {
              ...(user.extra?.[USER_EXTRA_INFO_KEY] ?? {}),
              department: user.extra?.[USER_EXTRA_INFO_KEY]?.department ?? '',
              title: user.extra?.[USER_EXTRA_INFO_KEY]?.title ?? '',
              telephone: user.extra?.[USER_EXTRA_INFO_KEY]?.telephone ?? '',
            },
          },
        };
      });
    }
  });
};

const isAdvancedUserPermission = (permission: string) => {
  return USER_PERMISSION_ID.ADVANCE.includes(permission);
};

const isTenantAdmin = (permission: string) => {
  return PROJECT_USER_ROLES.TENANT_ADMIN === permission;
};

const isTenantOwner = (permission: string) => {
  return PROJECT_USER_ROLES.TENANT_OWNER === permission;
};

const getRoleDisplayName = (role: string) => {
  if (isTenantOwner(role)) {
    return t('basic.project.owner');
  } else if (isTenantAdmin(role)) {
    return t('basic.project.admin');
  } else {
    return t('basic.project.user');
  }
};

const execCreateUser = (newUser: any, userType: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: createUser,
    payload: {
      user: newUser,
      type: userType,
    },
    actionName: 'createUser',
    actionType: t('basic.create'),
  });
};

const execFetchUserMemberships = (
  userId: string,
  hideAdminProject: boolean = false,
) => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchUserMembershipsBatch,
    actionName: 'fetchUserMembershipsBatch',
    payload: {
      userId,
    },
    actionType: t('basic.get.data'),
    successCallback: (res) => {
      if (hideAdminProject) {
        return res.filter(
          (membership: any) =>
            membership?.project?.projectId !== ADMIN_PROJECT_ID,
        );
      } else return res;
    },
  });
};

const execUpdateUser = (user: any) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateUserInfo,
    payload: {
      user,
    },
    actionName: 'updateUserInfo',
    actionType: t('basic.edit.type', {type: t('basic.users')}),
  });
};

const execDeleteUser = async (user: any) => {
  await makeApiCallWithoutProgress({
    apiCallFn: deleteUser,
    payload: {
      userId: user.userId,
    },
    actionName: 'deleteUser',
    actionType: t('basic.delete'),
  });
};

const execFetchUserInfo = () => {
  return makeApiCallWithoutProgress({
    apiCallFn: fetchUserInfo,
    actionName: 'fetchUserInfo',
    actionType: t('basic.get.data'),
  });
};

const strPwdDuplicatedErrorMsg = ref('');
const execUpdatePassword = (userId: string, password: string) => {
  strPwdDuplicatedErrorMsg.value = '';
  return makeApiCall({
    apiCallFn: updateUserPassword,
    payload: {
      userId,
      password,
    },
    actionName: 'updateUserPassword',
    actionType: t('basic.password.change'),
    showErrorDlg: false,
    successCallback: () => {},
    errorCallback: (errRespond) => {
      if (pwdHistoryDuplicatedChecker(errRespond)) {
        const duplicatedCounts =
          errRespond?.response?.data?.meta?.passwordDetectRange ?? 3;
        strPwdDuplicatedErrorMsg.value = tc(
          'form.error.pwd.history.duplicate.counts',
          duplicatedCounts,
          {counts: getDuplicatedString(duplicatedCounts)},
        );
      }
    },
  });
};

const execGenerateUserSimulationToken = (userId: string) => {
  return makeApiCallWithoutProgress({
    apiCallFn: generateUserSimulationToken,
    payload: userId,
    actionName: 'generateUserSimulationToken',
    actionType: t('table.action.clone'),
  });
};

const useComposable = (pageType: string = '') => {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    supportUserFields,

    headers,
    noDataSetting,
    strPwdDuplicatedErrorMsg,
    userList,

    getAllUsers,
    isAdvancedUserPermission,
    isTenantAdmin,
    isTenantOwner,
    getRoleDisplayName,

    execCreateUser,
    execFetchUserMemberships,
    execUpdateUser,
    execDeleteUser,
    execFetchUserInfo,
    execUpdatePassword,

    execGenerateUserSimulationToken,
  };
};
export default useComposable;
