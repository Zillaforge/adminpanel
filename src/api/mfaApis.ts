import {apiGWService} from './axiosReq';
import type {AxiosResponse} from 'axios';
import {useLogin} from '@/store';
import {API_VERSION} from '@/constants/Constants';

interface mfaPayload {
  verificationCode: string;
  mfaSecret?: string;
  mfaToken: string;
}

interface mfaDisablePayload {
  userId: string;
}

const apiPrefix: string = API_VERSION;
export const fetchMfaAuth = async () =>
  await apiGWService.get(`${apiPrefix}/mfa/get`).then((res: AxiosResponse) => {
    return res.data ?? {};
  });

export const enableMfaAuth = async (payload: mfaPayload) =>
  await apiGWService
    .post(`${apiPrefix}/mfa/enable`, payload)
    .then((res: AxiosResponse) => {
      if (res.status === 204) {
        return true;
      } else {
        return false;
      }
    });

export const disableMfaAuth = async (payload: mfaDisablePayload) =>
  await apiGWService
    .post(`${apiPrefix}/admin/mfa/user/${payload.userId}/disable`, null)
    .then((res: AxiosResponse) => {
      if (res.status === 204) {
        return true;
      } else return false;
    });

export const verifyMfaAuth = async (payload: mfaPayload) =>
  await apiGWService
    .post(`${apiPrefix}/mfa/verify`, payload)
    .then((res: AxiosResponse) => {
      if (res.status === 200) {
        const loginStore = useLogin();
        loginStore.setLoginInfo(res.data);
        // commit('Login_SetUser');
        return true;
      } else return false;
    });
