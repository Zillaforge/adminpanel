import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
import useBasics from '@/composables/useBasics';
import {useLogin} from '@/store';
import {
  API_VERSION,
  CLOUDINFRA_USER_NAMESPACE,
  USER_EXTRA_INFO_KEY,
} from '@/constants/Constants';

import {makeApiCallWithoutProgress} from './apiCallFunctions';
import type {
  batchOpPayload,
  batchOpUserPayload,
} from '@/interfaces/ApiPayloadInterface';

interface userInterface {
  type: string;
  user: {
    account: string;
    userId: string;
    password?: string;
    email?: string;
    displayName?: string;
    description?: string;
    department?: string;
    telephone?: string;
    title?: string;
    extra?: Record<string, any>;
  };
}

interface userOpPayload {
  userId: string;
}
interface userPwdPayload {
  userId: string;
  password: string;
}
interface userInfoPayload {
  user: {
    userId: string;
    email?: string;
    displayName?: string;
    description?: string;
    department?: string;
    telephone?: string;
    title?: string;
    extra?: Record<string, any>;
  };
}

const apiPrefix: string = API_VERSION;
export const fetchUserList = async () => {
  return await apiGWService
    .get(`${apiPrefix}/admin/users?limit=-1&offset=0`)
    .then((res: AxiosResponse) => res.data?.users ?? []);
};

export const fetchUserListIndex = async (payload: batchOpPayload) => {
  return await apiGWService
    .get(
      `${apiPrefix}/admin/users?limit=${payload.limit}&offset=${payload.offset}`,
    )
    .then((res: AxiosResponse) => res.data ?? []);
};

export const fetchUserListBatch = async () => {
  const {t} = useBasics();
  let userList: any[] = [];
  let offset = userList.length;
  let total = 0;
  const limit = 100;
  do {
    const res = await makeApiCallWithoutProgress({
      apiCallFn: fetchUserListIndex,
      payload: {
        limit,
        offset,
      },
      actionName: 'fetchUserListIndex',
      actionType: t('basic.get.data'),
    });
    if (!res.users) break;
    userList = [...userList, ...res.users];
    total = res.total;
    offset = userList.length;
  } while (total - userList.length > 0);
  return userList;
};

export const createUser = async (payload: userInterface) => {
  const data = {
    account: payload.user.account,
    email: payload.user.email,
    password: payload.user.password,
    namespace: CLOUDINFRA_USER_NAMESPACE,
    displayName: payload.user.displayName,
    description: payload?.user?.description ?? '',
    force: false,
    extra:
      payload.user?.title ?? payload.user?.department ?? payload.user?.telephone
        ? {
            [USER_EXTRA_INFO_KEY]: {
              department: payload?.user?.department ?? '',
              title: payload?.user?.title ?? '',
              telephone: payload?.user?.telephone ?? '',
            },
          }
        : {},
  };
  return await apiGWService
    .post(`${apiPrefix}/admin/user`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const deleteUser = async (payload: userOpPayload) => {
  return await apiGWService
    .delete(`${apiPrefix}/admin/user/${payload.userId}`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateUserPassword = async (payload: userPwdPayload) => {
  const data = {
    password: payload.password,
  };
  return await apiGWService
    .put(`${apiPrefix}/admin/user/${payload.userId}/password`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateUserInfo = async (payload: userInfoPayload) => {
  const data = {
    email: payload?.user?.email ?? '',
    displayName: payload?.user?.displayName ?? '',
    description: payload?.user?.description ?? '',
    extra: {
      ...payload?.user.extra,
      [USER_EXTRA_INFO_KEY]: {
        ...(payload?.user?.extra?.[USER_EXTRA_INFO_KEY] ?? {}),
        department: payload?.user?.department ?? '',
        title: payload?.user?.title ?? '',
        telephone: payload?.user?.telephone ?? '',
      },
    },
  };
  return await apiGWService
    .put(`${apiPrefix}/admin/user/${payload.user.userId}`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

// fetch user own info, userId is no need.
export const fetchUserInfo = async (cookieToken?: string) => {
  const loginStore = useLogin();
  if (cookieToken) {
    loginStore.token = cookieToken;
  }
  return await apiGWService
    .get(`${apiPrefix}/admin/user`)
    .then((res: AxiosResponse) => {
      if (res.status === 200) {
        const data = {token: loginStore.getToken, userInfo: res.data ?? {}};
        loginStore.setLoginInfo(data);
        return res.data ?? {};
      }
      return {};
    });
};

export const fetchUserMembershipsByIndex = async (
  payload: batchOpUserPayload,
) => {
  if (!payload.userId) return [];
  return await apiGWService
    .get(
      `${apiPrefix}/admin/membership/user/${payload.userId}?limit=${payload.limit}&offset=${payload.offset}`,
    )
    .then((res: AxiosResponse) => res.data ?? []);
};

export const fetchUserMembershipsBatch = async (payload: userOpPayload) => {
  const {t} = useBasics();
  let membershipList: any[] = [];
  let offset = membershipList.length;
  let total = 0;
  const limit = 100;
  do {
    const res = await makeApiCallWithoutProgress({
      apiCallFn: fetchUserMembershipsByIndex,
      payload: {
        userId: payload.userId,
        limit,
        offset,
      },
      actionName: 'fetchUserMembershipsByIndex',
      actionType: t('basic.get.data'),
    });
    if (!res.memberships) break;
    membershipList = [...membershipList, ...res.memberships];
    total = res.total;
    offset = membershipList.length;
  } while (total - membershipList.length > 0);
  return membershipList;
};

export const generateUserSimulationToken = async (userId: string) => {
  return await apiGWService
    .post(`${apiPrefix}/admin/user/${userId}/simulation_user`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};
