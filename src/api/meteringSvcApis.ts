import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';

const apiPrefix = '/mts/api/v1';
export const fetchUsageReportResourceList = async () => {
  return await apiGWService
    .get(`${apiPrefix}/admin/report/resources`)
    .then((res: AxiosResponse) => {
      return res.data ?? [];
    });
};

export const downloadProjectUsageReport = async (payload: {
  projectId: string;
  month: string;
  resources: string[];
}) => {
  return await apiGWService
    .post(`${apiPrefix}/admin/report/bundle`, payload, {responseType: 'blob'})
    .then((res: AxiosResponse) => res.data ?? {});
};
