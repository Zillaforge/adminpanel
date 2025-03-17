import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
const API_PREFIX = '/aps/api/v1/admin';

export const fetchModuleCategoryList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/module-categories?limit=-1&offset=0`)
    .then((res: AxiosResponse) => {
      return res.data?.moduleCategories ?? [];
    });
};

export const createModuleCategory = async (payload: {
  name: string;
  creator: string;
  description?: string;
}) => {
  return await apiGWService
    .post(`${API_PREFIX}/module-category/`, payload)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const deleteModuleCategory = async (id: string) => {
  return await apiGWService.delete(`${API_PREFIX}/module-category/${id}`);
};

export const fetchModuleList = async (categoryId: string) => {
  const where = categoryId ? `&where=module-category-id=${categoryId}` : '';
  return await apiGWService
    .get(`${API_PREFIX}/modules?limit=-1&offset=0${where}`)
    .then((res: AxiosResponse) => {
      return res.data?.Modules ?? [];
    });
}; // where=module-category-id=xxxx

export const createModule = async (payload: {
  name: string;
  moduleCategoryID: string;
  description?: string;
}) => {
  return await apiGWService
    .post(`${API_PREFIX}/module`, payload)
    .then((res: AxiosResponse) => {
      console.log('createModule: ', res);
      return res.data ?? {};
    });
};

export const deleteApsModule = async (id: string) => {
  return await apiGWService.delete(`${API_PREFIX}/module/${id}`);
};

export const updateApsModule = async (payload: {
  id: string;
  data: Record<string, string | boolean>;
}) => {
  return await apiGWService.put(
    `${API_PREFIX}/module/${payload.id}`,
    payload.data,
  );
};

export const fetchApsModuleAcl = async (id: string) => {
  return await apiGWService
    .get(`${API_PREFIX}/module/${id}/acl`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateApsModuleAcl = async (payload: {
  id: string;
  projectIds: string[];
}) => {
  return await apiGWService
    .put(`${API_PREFIX}/module/${payload.id}/acl`, {
      projectIds: payload.projectIds,
    })
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};
