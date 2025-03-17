import {defineStore} from 'pinia';
import {ref, type Ref} from 'vue';
import {loginApi, logoutApi, getAdminToken, makeApiCall} from '@/api';
import type {VueCookies} from 'vue-cookies';
import {getDomain, setToken2Cookie, toLoginPage} from '@/utils/utils';
import {COOKIE_CONFIG} from '@/constants/Constants';

interface LoginState {
  token: string;
  userInfo: any;
  cookiesInstance: VueCookies | undefined;
}

export const useLoginStore = defineStore('login', {
  // State
  // const token: Ref<string> = ref('');
  // const userInfo: Ref<any> = ref({});
  // const result: Ref<boolean> = ref(false);
  state: (): LoginState => {
    return {
      token: '',
      userInfo: undefined,
      cookiesInstance: undefined,
    };
  },

  // // Getters
  // const getToken = computed(() => token.value);
  // const getUserInfo = computed(() => userInfo.value);
  getters: {
    getToken: (state: LoginState) => state.token,
    getUserInfo: (state: LoginState) => state.userInfo,
    getCookiesInstance: (state: LoginState) => state.cookiesInstance,
  },

  actions: {
    hasLogin(): boolean {
      return !!this.token;
    },
    setLoginInfo(payload: any): void {
      this.userInfo = payload?.userInfo ?? {};
      this.token = payload?.token ?? '';
      setToken2Cookie(this.token);
    },

    async login(payload: {
      token?: string;
      account?: string;
      password?: string;
    }) {
      const result: Ref<boolean> = ref(false);
      const res = await makeApiCall({
        apiCallFn: loginApi,
        payload: payload.token
          ? {
              token: payload.token,
            }
          : {
              account: payload.account,
              password: payload.password,
            },
        showErrorDlg: false,
      });
      if (res?.status) {
        if (res.status === 200) {
          // login success
          result.value = true;
          // cache token & login account info
          this.token = res.data.token;
          this.userInfo = res.data.userInfo;
          this.setLoginInfo({token: this.token, userInfo: this.userInfo});
        } else if (res?.status === 205 || res?.status === 302) {
          // login success with redirect location
          result.value = true;
        } else {
          result.value = false;
        }
      }
      return await Promise.resolve({
        result: result.value,
        status: res?.status ?? 401,
        location: res?.headers?.location ?? '',
        err: res,
      });
    },
    logout() {
      makeApiCall({
        apiCallFn: logoutApi,
        successCallback: () => {
          this.token = '';
          this.userInfo = {};
          const domain = getDomain();
          this.cookiesInstance?.remove(
            COOKIE_CONFIG.TOKEN.NAME,
            undefined,
            domain,
          );
          this.cookiesInstance?.remove(
            COOKIE_CONFIG.USER_TOKEN.NAME,
            undefined,
            domain,
          );

          // const opskSessionId = this.cookiesInstance?.get(
          //   COOKIE_CONFIG.OPENSTACK.CHECK_LOGIN_KEY,
          // );
          // if (opskSessionId) {
          //   this.cookiesInstance?.set(
          //     COOKIE_CONFIG.OPENSTACK.CHECK_LOGIN_KEY,
          //     opskSessionId,
          //     1,
          //     undefined,
          //     domain,
          //     true,
          //     'Lax',
          //   );
          // }
          // const resultDelete = this.cookiesInstance?.remove(
          //   COOKIE_CONFIG.OPENSTACK.CHECK_LOGIN_KEY,
          //   undefined,
          //   domain,
          // );
          // console.log('Delete cookie: ', resultDelete);

          // this.cookiesInstance?.remove(
          //   COOKIE_CONFIG.CEPH.CHECK_LOGIN_KEY,
          //   undefined,
          //   domain,
          // );
          toLoginPage();
        },
      });
    },

    async fetchAdminToken(token?: string) {
      const result: Ref<boolean> = ref(false);
      const res = await makeApiCall({
        apiCallFn: getAdminToken,
        payload: token,
        showErrorDlg: false,
      });
      if (res?.status) {
        if (res.status === 200) {
          // get admin token success
          result.value = true;
          this.token = res.data.token;
          this.setLoginInfo({token: this.token});
        }
        return await Promise.resolve({
          result: result.value,
          status: res?.status ?? 401,
          location: res?.headers?.location ?? '',
        });
      } else {
        return await Promise.resolve({
          result: result.value,
          status: res?.response?.status ?? 401,
          err: res,
        });
      }
    },
    setCookiesInstance(cookie: VueCookies | undefined) {
      this.cookiesInstance = cookie;
    },
  },
});

export default useLoginStore;
