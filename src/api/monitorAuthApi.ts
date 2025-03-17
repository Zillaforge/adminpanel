import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';

const apiPrefix = '/s3o/api/v1';

export const fetchOpenStackToken = async () =>
  await apiGWService
    .get(`${apiPrefix}/openstack/authenticate`)
    .then((res: AxiosResponse) => {
      return res.data;
    })
    .catch((error: AxiosResponse) => {
      return error;
    });

export const releaseOpenStackAuthentication = async () =>
  await apiGWService
    .get(`${apiPrefix}/openstack/logout`)
    .catch((error: AxiosResponse) => {
      return error;
    });

export const fetchCephToken = async () =>
  await apiGWService
    .get(`${apiPrefix}/ceph/authenticate`)
    .then((res: AxiosResponse) => {
      return res.data;
    })
    .catch((error: AxiosResponse) => {
      return error;
    });

export const releaseCephAuthentication = async () =>
  await apiGWService
    .get(`${apiPrefix}/ceph/logout`)
    .catch((error: AxiosResponse) => {
      return error;
    });
