import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
import {API_VERSION} from '@/constants/Constants';
import {toLoginPage} from '@/utils/utils';
// user & login related
interface LoginCredentials {
  account: string;
  password: string;
}

const apiPrefix: string = API_VERSION;
export const loginApi = async (data: LoginCredentials) =>
  await apiGWService
    .post(`${apiPrefix}/admin/login`, data)
    .then((res: AxiosResponse) => {
      return res;
    })
    .catch((error: AxiosResponse) => {
      // console.error('Login failed: ', error);
      return error;
    });

export const logoutApi = async () =>
  await apiGWService.post(`${apiPrefix}/admin/logout`);

export const getAdminToken = async (token: string) => {
  apiGWService.defaults.headers.Authorization = `Bearer ${token}`;
  return await apiGWService
    .get(`${apiPrefix}/token/admin`)
    .then((res: any) => res)
    .catch(() => toLoginPage());
};
