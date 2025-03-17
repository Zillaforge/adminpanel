import axios, {type AxiosInstance} from 'axios';
import {useLogin, useGlobal} from '@/store';
import {DEFAULT_RESOURCE_REGION, ENV} from '@/constants/Constants';

const apiGWService: AxiosInstance = axios.create();
const apiCSService: AxiosInstance = axios.create();

apiGWService.defaults.headers.common['Content-Type'] = 'application/json';
apiCSService.defaults.headers.common['Content-Type'] = 'application/json';

let loginStore: any;
let globalStore: any;
apiGWService.interceptors.request.use(
  (request: any) => {
    loginStore = !loginStore ? useLogin() : loginStore;
    request.baseURL = ENV.API_URL;
    const token: string = loginStore.getToken;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }
    globalStore ??= useGlobal();
    request.headers['X-Availability-District'] =
      globalStore.getCurrentRegion ?? DEFAULT_RESOURCE_REGION;
    return request;
  },
  async (err: any) => {
    await Promise.reject(err);
  },
);

apiCSService.interceptors.request.use(
  (request: any) => {
    request.baseURL = ENV.ENDPOINT_CLOUD_STORAGE;
    loginStore = !loginStore ? useLogin() : loginStore;
    const token: string = loginStore.getToken;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }
    globalStore ??= useGlobal();
    request.headers['X-Availability-District'] =
      globalStore.getCurrentRegion ?? DEFAULT_RESOURCE_REGION;
    return request;
  },
  async (err: any) => {
    await Promise.reject(err);
  },
);

export {apiGWService, apiCSService};
