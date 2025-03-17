import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';

const apiPrefix = '/api/v1';

interface flavorPayload {
  flavorType: string;
  id: string;
  data?: any;
}

export const fetchFlavors = async (flavorType: string = '') =>
  await apiGWService
    .get(`/${flavorType}${apiPrefix}/admin/flavors`)
    .then((res: AxiosResponse) => {
      const flavors = res?.data.flavors ?? [];
      return flavors.sort((a: any, b: any) => a.id - b.id);
    });

export const createFlavor = async (payload: flavorPayload) =>
  await apiGWService
    .post(`/${payload.flavorType}${apiPrefix}/admin/flavors`, payload.data)
    .then((res: AxiosResponse) => {
      return res?.data ?? {};
    });

export const deleteFlavor = async (payload: flavorPayload) => {
  return await apiGWService
    .delete(`/${payload.flavorType}${apiPrefix}/admin/flavors/${payload.id}`)
    .then((res: AxiosResponse) => {
      return res;
    });
};

export const updateFlavor = async (payload: flavorPayload) => {
  return await apiGWService
    .put(
      `/${payload.flavorType}${apiPrefix}/admin/flavors/${payload.id}`,
      payload.data,
    )
    .then((res: AxiosResponse) => res.data ?? {});
};
