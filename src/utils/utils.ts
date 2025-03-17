import dayjs, {extend} from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import get from 'lodash/get';
import i18n from '@/i18n';
import {useLogin} from '@/store';
import jwtDecode, {type JwtPayload} from 'jwt-decode';
import router from '@/router';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import cloneDeep from 'lodash/cloneDeep';
import {
  ENV,
  COOKIE_CONFIG,
  OS,
  UUIDRegex,
  LOCAL_DOMAIN,
  enableLoginPage,
} from '@/constants/Constants';

import {
  atLeastOne,
  checkPwdLength,
  emailRule,
  integerRegexRule,
  ruleBucketName,
  ruleFirstAlphabet,
  ruleLowercaseNumberWithMinus,
} from '@/utils/formRules';
import {
  releaseOpenStackAuthentication,
  releaseCephAuthentication,
  makeApiCall,
} from '@/api';
import validation from '@/utils/validation';
import type {NavigationGuardNext, RouteLocationNormalized} from 'vue-router';

extend(isSameOrBefore);
extend(isSameOrAfter);

const {t, tc} = i18n.global;

export const clearSessionAndLogout = async () => {
  const loginStore = useLogin();
  await makeApiCall({
    apiCallFn: releaseOpenStackAuthentication,
    showErrorDlg: false,
  });
  await makeApiCall({
    apiCallFn: releaseCephAuthentication,
    showErrorDlg: false,
  });

  loginStore.logout();
  try {
    await fetch('https://iservice.nchc.org.tw/nchc_service/new_saml_slo.php');
  } catch (err) {
    // handle error
    console.log('iservice error');
  } finally {
    sessionStorage.clear();
    localStorage.removeItem('dashboard_username');
    localStorage.removeItem('dashboard_permissions');
    localStorage.removeItem('user_pwd_expiration_date');
    localStorage.removeItem('user_pwd_update_required');
    localStorage.removeItem('sso');
  }
};

// To check Object is an empty Object: {};
export const isEmptyObject = (obj: any) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const formatDate = (
  date: Date | string | number | undefined,
  noTime = false,
) => {
  if (!date) return '';

  return dayjs(date).format(noTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
};

export const formatDateSec = (date: Date, noTime = false) => {
  if (!date) return '';

  return dayjs(date).format(noTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
};

// For <v-text-field> type="number" @keypress
// charCode: digit0-9: 48~57, dot: 46
export const onlyDigit = (event: string) => {
  event = event ?? window.event;
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode >= 48 && charCode <= 57) {
    return true;
  } else {
    event.preventDefault();
  }
};

export const updNameHints = (event: string) => {
  /*
   * rule1 : first char must be a lowercase alphabet
   * rule2 : content must be lowercase or number and allow dash -
   */
  const rule1 = ruleFirstAlphabet(event);
  const rule2 = ruleLowercaseNumberWithMinus(event);
  return [
    {
      icon: rule1 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule1 ? 'hint-success' : 'hint-error',
      text: t('tips.name.first.char.lowercase'),
    },
    {
      icon: rule2 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule2 ? 'hint-success' : 'hint-error',
      text: t('tips.name.letterNumDash.and.startEndLetter'),
    },
  ];
};

export const updBucketHints = (event: string) => {
  const rule1 = ruleFirstAlphabet(event);
  const rule2 = ruleLowercaseNumberWithMinus(event);
  const rule3 = ruleBucketName(event);
  return [
    {
      icon: rule1 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule1 ? 'hint-success' : 'hint-error',
      text: t('tips.name.first.char.lowercase'),
    },
    {
      icon: rule2 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule2 ? 'hint-success' : 'hint-error',
      text: t('tips.name.letterNumDash.and.startEndLetter'),
    },
    {
      icon: rule3 ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule3 ? 'hint-success' : 'hint-error',
      text: t('tips.required.bucketName.maxLength'),
    },
  ];
};

export const updPwdHints = (event: string) => {
  return [
    {
      icon:
        atLeastOne.upperCaseEngLetter(event) === true
          ? 'mdi-check-circle'
          : 'mdi-close-circle',
      color:
        atLeastOne.upperCaseEngLetter(event) === true
          ? 'hint-success'
          : 'hint-error',
      text: t('form.error.atLeastOne.upperCaseEngLetter'),
    },
    {
      icon:
        atLeastOne.lowerCaseEngLetter(event) === true
          ? 'mdi-check-circle'
          : 'mdi-close-circle',
      color:
        atLeastOne.lowerCaseEngLetter(event) === true
          ? 'hint-success'
          : 'hint-error',
      text: t('form.error.atLeastOne.lowerCaseEngLetter'),
    },
    {
      icon:
        atLeastOne.digit(event) === true
          ? 'mdi-check-circle'
          : 'mdi-close-circle',
      color: atLeastOne.digit(event) === true ? 'hint-success' : 'hint-error',
      text: t('form.error.atLeastOne.digit'),
    },
    {
      icon:
        atLeastOne.specialCharacter(event) === true
          ? 'mdi-check-circle'
          : 'mdi-close-circle',
      color:
        atLeastOne.specialCharacter(event) === true
          ? 'hint-success'
          : 'hint-error',
      text: t('form.error.atLeastOne.special.character'),
    },
    {
      icon:
        checkPwdLength(event) === true
          ? 'mdi-check-circle'
          : 'mdi-close-circle',
      color: checkPwdLength(event) === true ? 'hint-success' : 'hint-error',
      text: t('form.error.pwd.length'),
    },
  ];
};

export const updEmailHints = (event: string) => {
  const rule = emailRule(event);

  return [
    {
      icon: rule === true ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule === true ? 'hint-success' : 'hint-error',
      text: t('form.error.email'),
    },
  ];
};

export const updMinValueHints = (event: string, min: number) => {
  const rule = parseInt(event) >= min && Number.isInteger(parseFloat(event));
  return [
    {
      icon: rule ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule ? 'hint-success' : 'hint-error',
      text: t('tips.number.min.or.equal.value', {min}),
    },
  ];
};

export const updMinValueWithExceptionHints = (
  event: string,
  min: number,
  exceptionAry: number[],
) => {
  const rule =
    parseFloat(event) >= min &&
    exceptionAry &&
    exceptionAry.length > 0 &&
    !exceptionAry.includes(parseFloat(event));
  const ruleInt = event && Number.isInteger(parseFloat(event));
  return [
    {
      icon: ruleInt ? 'mdi-check-circle' : 'mdi-close-circle',
      color: ruleInt ? 'hint-success' : 'hint-error',
      text: t('form.error.integer'),
    },
    {
      icon: rule ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule ? 'hint-success' : 'hint-error',
      text: t('tips.number.min.value.with.exception', {min}),
    },
  ];
};

export const updIntegerHints = (value: string) => {
  const rule = integerRegexRule()(value);
  return [
    {
      icon: rule === true ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule === true ? 'hint-success' : 'hint-error',
      text: t('form.error.integer'),
    },
  ];
};

export const updInputHints = (isValid: boolean, message: string) => {
  return [
    {
      icon: isValid ? 'mdi-check-circle' : 'mdi-close-circle',
      color: isValid ? 'hint-success' : 'hint-error',
      text: message,
    },
  ];
};

export const updIServiceProjectSysCodeHints = (input: string) => {
  const rule = validation.ruleIServiceProjectSysCodeName()(input);

  return [
    {
      icon: rule === true ? 'mdi-check-circle' : 'mdi-close-circle',
      color: rule === true ? 'hint-success' : 'hint-error',
      text: t('tips.name.iservice.codename'),
    },
  ];
};

export const rangeCheck = (input: string, max: number, min: number) => {
  if (!input) return false;
  return (
    parseInt(input) > max ||
    parseInt(input) < min ||
    !Number.isInteger(parseFloat(input))
  );
};

export const getDeepObj = (obj: Record<string, any>, path: string) => {
  return get(obj, path);
};

export const stringSlice = (str: string, length = 32) => {
  if (str && str.length > length) {
    return str.slice(0, length) + '...';
  }
  return str;
};

export const handleString = (
  content: string | any,
  sliceLength = 32,
  isDescription = false,
  isTruncateId = true,
) => {
  if (isTruncateId && UUIDRegex.test(content) && typeof content === 'string') {
    content = `${content.slice(0, 6)}...`;
  } else if (isDescription) {
    content = stringSlice(content, sliceLength);
  }
  return content;
};

export const uppercaseFirst = (input: string) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const sortByAccount = (
  a: Record<string, any>,
  b: Record<string, any>,
) => {
  return a.account.toUpperCase() > b.account.toUpperCase() ? 1 : -1;
};

export const sortByProperty = (prop: string, isAscending: boolean = true) => {
  return (a: any, b: any) => {
    return isAscending
      ? a?.[prop] > b?.[prop]
        ? 1
        : -1
      : a?.[prop] > b?.[prop]
      ? -1
      : 1;
  };
};

export const toHomePage = (next?: NavigationGuardNext) => {
  const homeRouteName = ENV.DASHBOARD_ROUTE_NAME
    ? ENV.DASHBOARD_ROUTE_NAME
    : PAGE_TYPES.DASHBOARD;
  if (next) {
    next({name: homeRouteName});
    return;
  }
  void router.push({name: homeRouteName});
};

export const toRedirectPage = (next?: NavigationGuardNext) => {
  if (next) {
    next({
      name: PAGE_TYPES.REDIRECT,
      query: {
        to: 'home',
        type: 'permission',
      },
    });
    return;
  }
  void router.push({
    name: PAGE_TYPES.REDIRECT,
    query: {
      to: 'home',
      type: 'permission',
    },
  });
};

export const toUserPortal = () => {
  window.location.replace(ENV.USER_PORTAL);
};

export const toLoginPage = (
  to?: RouteLocationNormalized,
  next?: NavigationGuardNext,
) => {
  if (enableLoginPage) {
    if (next) {
      if (to?.name === PAGE_TYPES.LOGIN_PAGE) {
        next?.();
        return;
      }
      next?.({name: PAGE_TYPES.LOGIN_PAGE});
      return;
    } else {
      void router.push({name: PAGE_TYPES.LOGIN_PAGE});
      return;
    }
  }

  toUserPortal();
};

export const getImageUrl = (subpath: string) => {
  return new URL(`/src/assets/images/${subpath}`, import.meta.url).href;
};

export const formatBytesConfig = (
  bytes: number,
  decimals = 2,
  power: number = -1,
  showUnit: boolean = false,
) => {
  if (!bytes || bytes === 0) {
    return showUnit ? '0 Byte' : 0;
  }
  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];
  const i = power !== -1 ? power : Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString() +
    (showUnit ? ' ' + sizes[i] : '')
  );
};

export const formatBytes = (bytes: number, decimals = 2) => {
  return formatBytesConfig(bytes, decimals, -1, true);
};

export const formatBytesGbNoUnit = (bytes: number, decimals = 2) => {
  return formatBytesConfig(bytes, decimals, 3, false);
};

export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = 3600 * 1000;
export const THREE_HOUR = 3 * 3600 * 1000;
export const SIX_HOUR = 6 * 3600 * 1000;
export const TWELVE_HOUR = 12 * 3600 * 1000;
export const ONE_DAY = 86400 * 1000;
export const SEVEN_DAY = 7 * 86400 * 1000;
export const FOURTEEN_DAY = 14 * 86400 * 1000;
export const THIRTY_DAY = 30 * 86400 * 1000;
export const THREE_MONTH = 3 * 30 * 86400 * 1000;
export const SIX_MONTH = 6 * 30 * 86400 * 1000;
export const ONE_YEAR = 365 * 86400 * 1000;

export const getTimePeriodOptions = () => {
  return [
    {
      title: tc('usage.time.hour', 1, {n: 1}),
      value: ONE_HOUR,
    },
    {
      title: tc('usage.time.hour', 2, {n: 6}),
      value: SIX_HOUR,
    },
    {
      title: tc('usage.time.hour', 2, {n: 12}),
      value: TWELVE_HOUR,
    },
    {
      title: tc('usage.time.day', 1, {n: 1}),
      value: ONE_DAY,
    },
    {
      title: tc('usage.time.day', 2, {n: 7}),
      value: SEVEN_DAY,
    },
    {
      title: tc('usage.time.day', 2, {n: 30}),
      value: THIRTY_DAY,
    },
    {
      title: t('usage.custom'),
      value: -1,
    },
  ];
};

export const getTimeOptions = () => {
  const timeSelectItem = [];
  for (let i = 0; i <= 23; i++) {
    if (i < 10) {
      timeSelectItem.push({
        title: `0${i}:00`,
        value: i * 60 * 60 * 1000,
      });
    } else {
      timeSelectItem.push({
        title: `${i}:00`,
        value: i * 60 * 60 * 1000,
      });
    }
  }
  timeSelectItem.push({
    title: `23:59`,
    value: 23 * 60 * 60 * 1000 + 59 * 60 * 1000,
  });
  return timeSelectItem;
};

// v-date-picker: allowed-dates
// https://vuetifyjs.com/en/api/v-date-picker/#props-allowed-dates
// Allowed dates: unknown[] | ((date: unknown) => boolean)
// Specify allowed dates using objects or functions.
// When using objects, accepts a date string in the format of YYYY-MM-DD.
// When using functions, accepts a date object as a parameter and should return a boolean.
export const getAllowedDatesFn =
  ({
    allowedMinDate,
    allowedMaxDate,
  }: {
    allowedMinDate?: string;
    allowedMaxDate?: string;
  }) =>
  (val: unknown) => {
    // val: 預期會是 Date 但是文件中定義的 type 為 unknown
    const date = dayjs(val as Date);
    if (allowedMinDate && allowedMaxDate) {
      return (
        date.isSameOrAfter(allowedMinDate) &&
        date.isSameOrBefore(allowedMaxDate)
      );
    }
    if (allowedMinDate) {
      return date.isSameOrAfter(allowedMinDate);
    }
    if (allowedMaxDate) {
      return date.isSameOrBefore(allowedMaxDate);
    }
    return true;
  };

/*
 * osName variable as follows:
 * "Windows"    for all versions of Windows (Win)
 * "MacOS"      for all versions of Macintosh OS (Mac)
 * "Linux"      for all versions of Linux (Linux)
 * "UNIX"       for all other UNIX flavors (X11)
 * "Unknown OS" indicates failure to detect the OS
 */
export const getOS = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Win')) {
    return OS.win;
  } else if (userAgent.includes('Mac')) {
    return OS.mac;
  } else if (userAgent.includes('X11')) {
    return OS.linux;
  } else if (userAgent.includes('Linux')) {
    return OS.linux;
  }

  return OS.win;
};

export const convertToCSV = (objArray: string) => {
  const strNewLine: string = '\r\n';
  const array: string =
    typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = array[0] + strNewLine;

  for (let i = 1; i < array.length; i++) {
    str += array[i] + strNewLine;
  }
  return str;
};

export const exportCSVFile = (
  headers: string[],
  items: string[][],
  fileTitle: string = '',
) => {
  const cloneItems = cloneDeep(items);
  if (headers) {
    cloneItems.unshift(headers);
  }

  // Convert Object to JSON
  const jsonObject = JSON.stringify(cloneItems);
  let csv = convertToCSV(jsonObject);
  // Adding UTF-8 BOM to string/Blob
  csv = '\uFEFF' + csv;
  let exportedFilenmae = '';
  if (fileTitle) {
    exportedFilenmae = fileTitle + '.csv';
  } else {
    exportedFilenmae = 'export.csv';
  }

  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', exportedFilenmae);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const setToken2Cookie = (token: string) => {
  if (!token) {
    return;
  }
  const userStore = useLogin();
  const decoded = jwtDecode<JwtPayload>(token);
  const expireTime = decoded.exp ? new Date(decoded.exp * 1000) : undefined;
  const tokenConf = COOKIE_CONFIG.TOKEN;
  const domain = getDomain();
  userStore.getCookiesInstance?.set(
    tokenConf.NAME,
    token,
    expireTime,
    undefined,
    domain,
    undefined,
    'Strict',
  );
};

export const getDomain = (): string | undefined => {
  const domain: string = location.hostname.toLowerCase();
  if (domain === LOCAL_DOMAIN) {
    return undefined;
  }

  /*
  handle www.trusted-cloud.nchc.org.stg & admin.trusted-cloud.nchc.org.stg to .trusted-cloud.nchc.org
  */
  const REPLACE_PREFIX = ['www', 'admin'];
  let replacedDomain;
  REPLACE_PREFIX.forEach((replacer) => {
    if (domain.startsWith(replacer)) {
      replacedDomain = domain.replace(replacer, '');
    }
  });
  return replacedDomain;
};
