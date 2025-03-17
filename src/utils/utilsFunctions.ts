import {IAM_ERROR_CODE} from '@/constants/Constants';

export const pwdHistoryDuplicatedChecker = (errorRes: Record<string, any>) => {
  if (
    (errorRes?.response?.status === 400 ||
      errorRes?.response?.status === 403) &&
    (errorRes?.response?.data?.errorCode ===
      IAM_ERROR_CODE.AdminAPIUpdateSamePasswordErrCode ||
      errorRes?.response?.data?.errorCode ===
        IAM_ERROR_CODE.UserAPIUpdateSamePasswordErrCode)
  ) {
    return true;
  }

  return false;
};

export const adminPermissionChecker = (errorRes) => {
  if (
    (errorRes?.response?.status === 400 ||
      errorRes?.response?.status === 403) &&
    (errorRes?.response?.data?.errorCode ===
      IAM_ERROR_CODE.AdminAPIPermissionDeniedErrCode ||
      errorRes?.response?.data?.errorCode ===
        IAM_ERROR_CODE.AdminNotAdminPermissionErrCode)
  ) {
    return true;
  }
  return false;
};
