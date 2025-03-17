import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
import {ADMIN_PROJECT_ID} from '@/constants/Constants';
const API_VERSION = '/crm/api/v1';

interface ctnImgOpPayload {
  imageName: string;
  projectId: string;
  tagName?: string;
  data?: Record<string, any>;
}

export const fetchContainerImageList = async (projectId: string) => {
  console.log('fetchContainerImageList: ', projectId);
  return await apiGWService
    .get(`${API_VERSION}/admin/project/${projectId}/repositories`)
    .then((res: AxiosResponse) => {
      return res.data.repositories || [];
    });
};

export const updateContainerImage = async (payload: ctnImgOpPayload) => {
  const escapeImgName = encodeURIComponent(
    encodeURIComponent(payload.imageName),
  );
  return await apiGWService
    .put(
      `${API_VERSION}/admin/project/${payload.projectId}/repository/${escapeImgName}`,
      payload.data,
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteContainerImage = async (payload: ctnImgOpPayload) => {
  const escapeImgName = encodeURIComponent(
    encodeURIComponent(payload.imageName),
  );
  return await apiGWService.delete(
    `${API_VERSION}/admin/project/${payload.projectId}/repository/${escapeImgName}`,
  );
};

export const fetchContainerImageTags = async (imageName: string) => {
  const escapeImgName = encodeURIComponent(encodeURIComponent(imageName));
  console.log(
    'calling api: fetchContainerImageTags',
    ADMIN_PROJECT_ID,
    imageName,
    escapeImgName,
  );

  return await apiGWService
    .get(
      `${API_VERSION}/admin/project/${ADMIN_PROJECT_ID}/repository/${escapeImgName}/tags`,
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const deleteContainerImageTag = async (payload: ctnImgOpPayload) => {
  const {imageName, projectId} = payload;
  const escapeImgName = encodeURIComponent(encodeURIComponent(imageName));
  const tagName = payload.tagName ?? '';
  console.log(
    'calling api: deleteContainerImageTag',
    projectId,
    imageName,
    tagName,
  );
  return await apiGWService.delete(
    `${API_VERSION}/admin/project/${projectId}/repository/${escapeImgName}/tag/${tagName}`,
  );
};

export const fetchCtnImageQuotaList = async () => {
  return await apiGWService
    .get(`${API_VERSION}/admin/projects`)
    .then((res: AxiosResponse) => {
      return res.data?.registries || {};
    });
};

export const updateContainerImageQuota = async (payload: ctnImgOpPayload) => {
  return await apiGWService
    .put(`${API_VERSION}/admin/project/${payload.projectId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
