import {apiGWService} from './axiosReq';
import {type AxiosResponse} from 'axios';

const API_VERSION = '/vrm/api/v1';

interface vmImgOpPayload {
  imageId: string;
  data?: Record<string, any>;
}

interface vmImgTagOpPayload {
  imageId: string;
  projectId: string;
}

interface vmImgOpPayload {
  imageName: string;
  projectId: string;
  tagName?: string;
  data?: Record<string, any>;
}

export const fetchVirtualImageList = async (projectId: string) => {
  return await apiGWService
    .get(
      `${API_VERSION}/admin/repositories?limit=-1&offset=0&where=project-id=${projectId}`,
    )
    .then((res: AxiosResponse) => {
      return res.data.repositories || [];
    });
};

export const fetchVirtualImageDetail = async (imageId: string) => {
  return await apiGWService
    .get(`${API_VERSION}/admin/repository/${imageId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const createVirtualImage = async (payload: any) => {
  return await apiGWService
    .post(`${API_VERSION}/admin/upload`, payload)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const updateVirtualImageDetail = async (payload: vmImgOpPayload) => {
  return await apiGWService
    .put(`${API_VERSION}/admin/repository/${payload.imageId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
export const deleteVirtualImage = async (imageId: string) => {
  return await apiGWService
    .delete(`${API_VERSION}/admin/repository/${imageId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVirtualImageQuotaList = async () => {
  return await apiGWService
    .get(`${API_VERSION}/admin/projects`)
    .then((res: AxiosResponse) => {
      return res.data?.projects || {};
    });
};

export const updateVirtualImageQuota = async (payload: vmImgOpPayload) => {
  return await apiGWService
    .put(`${API_VERSION}/admin/project/${payload.projectId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const fetchVmImageRegistryQuotaInfo = async (projectId: string) => {
  return await apiGWService
    .get(`${API_VERSION}/admin/project/${projectId}`)
    .then((res: AxiosResponse) => {
      return res.data || {};
    });
};

// //////////////////////////////////////////////////// //
// ------------------- Vm Image Tag ------------------- //
// //////////////////////////////////////////////////// //

export const fetchVirtualImageTagListByProject = async (projectId: string) => {
  return await apiGWService
    .get(
      `${API_VERSION}/admin/tags?limit=-1&offset=0&where=project-id=${projectId}`,
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const fetchVirtualImageTagList = async (payload: vmImgTagOpPayload) => {
  return await apiGWService
    .get(
      `${API_VERSION}/admin/tags/?limit=-1&offset=0&where=repository-id=${payload.imageId}`,
    )
    .then((res: AxiosResponse) => {
      return res.data.tags || [];
    });
};

export const deleteVirtualImageTag = async (tagId: string) => {
  return await apiGWService
    .delete(`${API_VERSION}/admin/tag/${tagId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

// //////////////////////////////////////////////////// //
// ---------------- Vm Image ProjectAcl ---------------- //
// //////////////////////////////////////////////////// //

export const fetchVirtualImageTagProjectAcls = async (tagId: string) => {
  const where = tagId ? `&where=tag-id=${tagId}` : '';
  return await apiGWService
    .get(`${API_VERSION}/admin/projectacls?limit=-1&offset=0${where}`)
    .then((res: AxiosResponse) => {
      return res.data.projectAcls || [];
    });
};

export const createVirtualImageTagProjectAcl = async (payload: {
  tagId: string;
  projectId: string;
}) => {
  const {tagId, projectId} = payload;
  return await apiGWService
    .post(
      `${API_VERSION}/admin/projectacl`,
      projectId?.length > 0
        ? {
            tagId,
            projectId,
          }
        : {tagId},
    )
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};

export const deleteVirtualImageTagProjectAcl = async (projectAclId: string) => {
  return await apiGWService
    .delete(`${API_VERSION}/admin/projectacl/${projectAclId}`)
    .then((res: AxiosResponse) => {
      return res.data || [];
    });
};
