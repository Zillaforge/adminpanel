import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
const API_PREFIX = '/vps/api/v1/admin';

export const fetchSupportedFeatures = async () => {
  return await apiGWService
    .get(`/vps/api/v1/features`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchGpuModelList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/gpu_model`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchAvailabilityZones = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/az/compute`)
    .then((res: AxiosResponse) => {
      return res.data?.availability_zones ?? [];
    });
};

export const createExternalNetwork = async (data: Record<string, any>) => {
  return await apiGWService
    .post(`${API_PREFIX}/extnetworks`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchExtNetworkList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/extnetworks`)
    .then((res: AxiosResponse) => {
      return res.data?.extnetworks ?? [];
    });
};

export const fetchUnusedExtNetworkList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/opsk_extnetworks`)
    .then((res: AxiosResponse) => {
      return res.data?.opsk_extnetworks ?? [];
    });
};

export const updateDefaultExternalNetwork = async (extNetId: string) => {
  return await apiGWService
    .post(`${API_PREFIX}/extnetworks/${extNetId}/default`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchExtNetworkUsage = async (extNetId: string) => {
  return await apiGWService
    .get(`${API_PREFIX}/extnetworks/${extNetId}/usage`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchExtNetworkProjectAssociations = async (extNetId: string) => {
  return await apiGWService
    .get(`${API_PREFIX}/extnetworks/associations`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateExtNetworkProjectAssociation = async (payload: {
  extNetId: string;
  projectId: string;
}) => {
  return await apiGWService.post(
    `${API_PREFIX}/extnetworks/${payload.extNetId}/project/${payload.projectId}`,
  );
};

export const deleteExtNetwork = async (extNetId: string) => {
  return await apiGWService
    .delete(`${API_PREFIX}/extnetworks/${extNetId}`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchVirtualPlatformQuotaList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/quotas/projects`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateVirtualPlatformProjectQuota = async (payload: {
  projectId: string;
  data: Record<string, any>;
}) => {
  return await apiGWService
    .put(`${API_PREFIX}/quotas/projects/${payload.projectId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchVirtualPlatformDefaultQuota = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/quotas/default`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateVirtualPlatformDefaultQuota = async (
  data: Record<string, any>,
) => {
  return await apiGWService
    .put(`${API_PREFIX}/quotas/default`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchProviderNetworkList = async () => {
  return await apiGWService
    .get(`${API_PREFIX}/provider_networks`)
    .then((res: AxiosResponse) => {
      return res.data.provider_networks ?? [];
    });
};

export const createProviderNetwork = async (data: Record<string, any>) => {
  return await apiGWService
    .post(`${API_PREFIX}/provider_networks`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchProviderNetworkDetail = async (networkId: string) => {
  return await apiGWService
    .get(`${API_PREFIX}/provider_networks/${networkId}`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const deleteProviderNetwork = async (networkId: string) => {
  return await apiGWService
    .delete(`${API_PREFIX}/provider_networks/${networkId}`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const updateProviderNetwork = async (payload: {
  networkId: string;
  data: Record<string, any>;
}) => {
  return await apiGWService
    .put(`${API_PREFIX}/provider_networks/${payload.networkId}`, payload.data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const fetchProviderNetworkServerAttachments = async (
  networkId: string,
) => {
  return await apiGWService
    .get(`${API_PREFIX}/provider_networks/${networkId}/ports`)
    .then((res: AxiosResponse) => {
      return res.data?.ports ?? {};
    });
};

export const updateProviderNetworkServerAttachment = async (payload: {
  id: string;
  server_id: string;
}) => {
  return await apiGWService
    .post(`${API_PREFIX}/provider_networks/${payload.id}/ports`, payload)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};

export const deleteProviderNetworkServerAttachment = async (payload: {
  networkId: string;
  portId: string;
}) => {
  return await apiGWService.delete(
    `${API_PREFIX}/provider_networks/${payload.networkId}/ports/${payload.portId}`,
  );
};

export const fetchProviderNetworkUsage = async (networkId: string) => {
  return await apiGWService
    .get(`${API_PREFIX}/provider_networks/${networkId}/usage`)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};
