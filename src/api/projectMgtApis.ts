import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
import {API_VERSION, USER_PERMISSION_ID} from '@/constants/Constants';
import {type ProjectCreateParams} from '@/interfaces/DataTypeInterface';
import type {batchOpPayload} from '@/interfaces/ApiPayloadInterface';
import {makeApiCallWithoutProgress} from './apiCallFunctions';
import useBasics from '@/composables/useBasics';

interface projectOpPayload {
  projectId: string;
  frozen?: boolean;
  limit?: number;
  offset?: number;
  data?: Record<string, any>;
}

interface projectMemberPayload {
  projectId: string;
  userId: string;
  data?: {
    globalPermissionId?: string;
    userPermissionId?: string;
    tenantRole?: string;
    extra?: Record<string, any>;
  };
}

const apiPrefix: string = API_VERSION;

export const fetchProjectList = async () =>
  await apiGWService
    .get(`${apiPrefix}/admin/projects?limit=-1&offset=0`)
    .then((res: AxiosResponse) => res.data?.projects ?? []);

export const fetchProjectListIndex = async (payload: batchOpPayload) => {
  return await apiGWService
    .get(
      `${apiPrefix}/admin/projects?limit=${payload.limit}&offset=${payload.offset}`,
    )
    .then((res: AxiosResponse) => res.data ?? []);
};

export const fetchProjectListBatch = async () => {
  const {t} = useBasics();
  let projList: any[] = [];
  let offset = projList.length;
  let total = 0;
  const limit = 100;
  do {
    const res = await makeApiCallWithoutProgress({
      apiCallFn: fetchProjectListIndex,
      payload: {
        limit,
        offset,
      },
      actionName: 'fetchProjectListIndex',
      actionType: t('basic.get.data'),
    });
    if (!res.projects) break;
    projList = [...projList, ...res.projects];
    total = res.total;
    offset = projList.length;
  } while (total - projList.length > 0);
  return projList;
};

export const createProject = async (payload: ProjectCreateParams) => {
  const data: Record<string, any> = {
    displayName: payload.projectName,
    extra: {
      iservice: {
        projectSysCode: payload.projectSysCode,
      },
    },
  };

  return await apiGWService
    .post(`${apiPrefix}/admin/project`, data)
    .then((res: AxiosResponse) => res.data);
};

export const deleteProject = async (payload: projectOpPayload) => {
  return await apiGWService.delete(
    `${apiPrefix}/admin/project/${payload.projectId}`,
  );
};

export const fetchProjectInfo = async (payload: projectOpPayload) =>
  await apiGWService
    .get(`${apiPrefix}/admin/project/${payload.projectId}`)
    .then((res: AxiosResponse) => res.data ?? {});

export const updateProjectInfo = async (payload: projectOpPayload) => {
  return await apiGWService
    .put(`${apiPrefix}/admin/project/${payload.projectId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchProjectMemberList = async (payload: projectOpPayload) => {
  return await apiGWService
    .get(
      `${apiPrefix}/admin/membership/project/${payload.projectId}?limit=-1&offset=0`,
    )
    .then((res: AxiosResponse) => res.data?.memberships ?? []);
};

export const fetchProjectMemberListIndex = async (payload: batchOpPayload) => {
  const projectId = payload.projectId ?? '';
  return await apiGWService
    .get(
      `${apiPrefix}/admin/membership/project/${projectId}?limit=${payload.limit}&offset=${payload.offset}`,
    )
    .then((res: AxiosResponse) => res.data ?? []);
};

export const fetchProjectMemberListBatch = async (payload: any) => {
  const {t} = useBasics();
  let membershipList: any[] = [];
  let offset = membershipList.length;
  let total = 0;
  const limit = 100;
  do {
    const res = await makeApiCallWithoutProgress({
      apiCallFn: fetchProjectMemberListIndex,
      payload: {
        ...payload,
        limit,
        offset,
      },
      actionName: 'fetchProjectMemberListIndex',
      actionType: t('basic.get.data'),
    });
    membershipList = [...membershipList, ...res.memberships];
    total = res.total;
    offset = membershipList.length;
  } while (total - membershipList.length > 0);
  return membershipList;
};

export const fetchProjectMembership = async (payload: projectMemberPayload) => {
  const {projectId, userId} = payload;
  return await apiGWService
    .get(`${apiPrefix}/admin/membership/project/${projectId}/user/${userId}`)
    .then((res: AxiosResponse) => res.data ?? {});
};

export const updateProjectMembership = async (
  payload: projectMemberPayload,
) => {
  const {projectId, userId, data} = payload;
  return await apiGWService
    .put(
      `${apiPrefix}/admin/membership/project/${projectId}/user/${userId}`,
      data,
    )
    .then((res: AxiosResponse) => res.data ?? {});
};

export const updateProjectRole = async (payload: projectMemberPayload) => {
  const {projectId, userId, data} = payload;
  return await apiGWService
    .put(
      `${apiPrefix}/admin/membership/project/${projectId}/user/${userId}`,
      data,
    )
    .then((res: AxiosResponse) => res.data ?? {});
};

export const addProjectMemberBatch = async (payload: any) => {
  const data = payload.memberList.map((membership: any) => {
    return {
      ...membership,
      globalPermissionId: USER_PERMISSION_ID.DEFAULT,
      userPermissionId: USER_PERMISSION_ID.DEFAULT,
      ...payload.membershipMeta,
    };
  });
  return await apiGWService
    .post(`${apiPrefix}/admin/membership/batch`, data)
    .then((res: AxiosResponse) => res.data);
};

export const removeProjectMember = async (payload: any) => {
  const projectId: string = payload.projectId;
  const userId: string = payload.userId;

  return await apiGWService
    .delete(`${apiPrefix}/admin/membership/project/${projectId}/user/${userId}`)
    .then((res: AxiosResponse) => res.data);
};

export const updateProjectState = async (payload: projectOpPayload) => {
  const data = {
    frozen: payload.frozen,
  };
  return await apiGWService
    .put(`${apiPrefix}/admin/frozen/project/${payload.projectId}`, data)
    .then((res: AxiosResponse) => res.data);
};
