import i18n from '@/i18n';
import {
  enableMfaAuth,
  disableMfaAuth,
  fetchMfaAuth,
  verifyMfaAuth,
  makeApiCall,
} from '@/api';

const {t} = i18n.global;
const execGetMfaAuth = () => {
  return makeApiCall({
    apiCallFn: fetchMfaAuth,
    actionName: 'fetchMfaAuth',
    actionType: t('basic.get.data'),
  });
};

const execEnableMfaAuth = (verificationCode, mfaSecret, mfaToken) => {
  return makeApiCall({
    apiCallFn: enableMfaAuth,
    payload: {
      verificationCode,
      mfaSecret,
      mfaToken,
    },
    actionName: 'enableMfaAuth',
    actionType: t('basic.enabled'),
    showErrorDlg: false,
    successCallback: (res) => {
      if (res.status === 204) {
        return true;
      } else {
        return false;
      }
    },
    errorCallback: (errRespond) => {
      return false;
    },
  });
};
const execDisableMfaAuth = (userId: string) => {
  return makeApiCall({
    apiCallFn: disableMfaAuth,
    payload: {
      userId,
    },
    actionName: 'disableMfaAuth',
    actionType: t('basic.disabled'),
  });
};
const execVerifyMfaAuth = (payload) => {
  return makeApiCall({
    apiCallFn: verifyMfaAuth,
    payload,
    actionName: 'verifyMfaAuth',
    actionType: t('basic.verify'),
    showErrorDlg: false,
    successCallback: (res) => {
      if (res.status === 204) {
        return true;
      } else {
        return false;
      }
    },
    errorCallback: (errRespond) => {
      return false;
    },
  });
};

const useComposable = () => {
  return {
    execEnableMfaAuth,
    execDisableMfaAuth,
    execGetMfaAuth,
    execVerifyMfaAuth,
  };
};
export default useComposable;
