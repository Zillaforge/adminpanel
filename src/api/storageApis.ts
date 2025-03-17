import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';

const apiPrefix = '/cs/api/v1';
interface storageQuotaPayload {
  projectId: string;
  quota?: number;
  typeSvc?: string;
}

export const fetchStorageQuotaList = async (typeSvc: string) => {
  return await apiGWService
    .get(`${typeSvc}${apiPrefix}/admin/projects?limit=-1&offset=0`)
    .then((res: AxiosResponse) => res.data?.projects ?? []);
};

export const updateProjectStorageQuota = async (
  payload: storageQuotaPayload,
) => {
  const prefixSvc = payload.typeSvc ?? '';
  const data = {
    hardLimitBytes: payload?.quota ?? -1,
  };
  return await apiGWService
    .put(
      `${prefixSvc}${apiPrefix}/admin/quota/project/${payload.projectId}`,
      data,
    )
    .then((res: AxiosResponse) => res.data ?? []);
};
