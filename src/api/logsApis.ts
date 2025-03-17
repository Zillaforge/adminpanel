import {apiGWService} from './axiosReq';

import type {AxiosResponse} from 'axios';

const API_VERSION = '/ats/api/v1';

export const fetchProjectLogs = async (payload: {
  size: number;
  offset: number;
  from: number;
  to: number;
  projectId: string;
  language: string;
  op?: string;
}) => {
  const language = payload.language === 'tw' ? 'zh-tw' : 'en';

  const data = {
    params: {
      from: payload.from,
      to: payload.to,
      limit: payload.size,
      offset: payload.offset,
      op: payload.op,
      language,
    },
  };

  const query = payload.projectId
    ? `?where=project.id=${payload.projectId}`
    : '';

  return await apiGWService
    .get(`${API_VERSION}/admin/logs${query}`, data)
    .then((res: AxiosResponse) => {
      return res.data ?? {};
    });
};
