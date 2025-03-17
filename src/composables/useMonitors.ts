import {watch} from 'vue';
import {useLogin} from '@/store';
import useBasics from '@/composables/useBasics';
import {COOKIE_CONFIG} from '@/constants/Constants';

import {fetchCephToken, fetchOpenStackToken} from '@/api';
import {makeApiCallWithoutProgress} from '@/api/apiCallFunctions';

const {t, i18n} = useBasics();

const updateI18nStrings = () => {};

const execFetchOpenStackToken = () => {
  const expiredTime: string = COOKIE_CONFIG.OPENSTACK.EXPIRE_TIME ?? 'Session';
  const sameSite: string = COOKIE_CONFIG.OPENSTACK.SAME_SITE ?? 'Strict';
  const domain: string = COOKIE_CONFIG.TOKEN.DOMAIN;
  const cookieNames: string[] = COOKIE_CONFIG.OPENSTACK.KEY_NAMES;

  return makeApiCallWithoutProgress({
    apiCallFn: fetchOpenStackToken,
    actionName: 'fetchOpenStackToken',
    actionType: t('basic.get.data'),
    showErrorDlg: false,
  }).then((res: {csrftoken: string; sessionId: string}) => {
    console.log('fetchOpenStackToken: ', res);
    const userStore = useLogin();
    const cookieValues: string[] = [
      res?.csrftoken ?? '',
      res?.sessionId ?? '',
      'default',
      'default',
    ];
    cookieNames.forEach((cookieName: string, index: number) => {
      userStore.getCookiesInstance?.set(
        cookieName,
        cookieValues[index],
        expiredTime,
        undefined,
        domain,
        undefined,
        sameSite,
      );
    });
  });
};

const execFetchCephToken = () => {
  const expiredTime: string = COOKIE_CONFIG.CEPH.EXPIRE_TIME ?? 'Session';
  const sameSite: string = COOKIE_CONFIG.CEPH.SAME_SITE ?? 'Strict';
  const domain: string = COOKIE_CONFIG.TOKEN.DOMAIN;

  return makeApiCallWithoutProgress({
    apiCallFn: fetchCephToken,
    actionName: 'fetchCephToken',
    actionType: t('basic.get.data'),
    showErrorDlg: false,
  }).then(
    (res: {
      username: string;
      token: string;
      permissions: Record<string, any>;
    }) => {
      console.log(res);
      const userStore = useLogin();
      // set(keyName: string, value: any, expires?: string | number | Date,
      //   path?: string, domain?: string, secure?: boolean, sameSite?: string): this;
      userStore.getCookiesInstance?.set(
        COOKIE_CONFIG.CEPH.CHECK_LOGIN_KEY, // cookie name,
        res?.token ?? '',
        expiredTime,
        undefined,
        domain,
        undefined,
        sameSite,
      );

      localStorage.setItem('dashboard_username', res?.username ?? '');
      localStorage.setItem('user_pwd_expiration_date', 'null');
      localStorage.setItem('user_pwd_update_required', 'false');
      localStorage.setItem('sso', 'false');

      const permissions: Record<string, any> = {};
      const permissionList = Object.keys(res?.permissions) ?? [];
      permissionList.forEach((permissionItem: string) => {
        let permissionKey = permissionItem;
        if (permissionItem === 'config-opt') {
          permissionKey = 'configOpt';
        } else if (permissionItem === 'dashboard-settings') {
          permissionKey = '';
        } else if (permissionItem === 'nfs-ganesha') {
          permissionKey = 'nfs';
        } else if (permissionItem === 'rbd-image') {
          permissionKey = 'rbdImage';
        } else if (permissionItem === 'rbd-mirroring') {
          permissionKey = 'rbdMirroring';
        }
        if (permissionKey) {
          permissions[permissionKey] = {
            create: false,
            delete: false,
            read: false,
            update: false,
          };

          (res?.permissions[permissionItem] ?? []).forEach((op: string) => {
            permissions[permissionKey][op] = true;
          });
        }

        localStorage.setItem(
          'dashboard_permissions',
          JSON.stringify(permissions),
        );
      });
    },
  );
};

watch(
  () => i18n.global.locale,
  () => updateI18nStrings(),
);

const useComposable = () => {
  updateI18nStrings();
  return {
    execFetchCephToken,
    execFetchOpenStackToken,
  };
};
export default useComposable;
