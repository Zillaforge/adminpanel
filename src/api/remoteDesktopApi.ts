import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
const API_PREFIX = '/rds/api/v1/admin';

interface rdsFlavorPayload {
  flavorType: string;
  id: string;
  data?: any;
}

export const fetchRdsSystemScopes = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/system/scopes`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const createRdsFlavor = async (payload: rdsFlavorPayload) =>
  await apiGWService
    .post(`${API_PREFIX}/flavor`, payload.data)
    .then((res: AxiosResponse) => {
      return res?.data ?? {};
    });

export const deleteRdsFlavor = async (payload: rdsFlavorPayload) => {
  return await apiGWService
    .delete(`${API_PREFIX}/flavor/${payload.id}`)
    .then((res: AxiosResponse) => {
      return res;
    });
};
