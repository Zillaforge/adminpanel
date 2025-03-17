import {useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';

interface resultItem {
  name: string;
  status: string;
  statusText: string;
}
interface ApiCallParams {
  apiCallFn: (...args: any[]) => any;
  items?: any[];
  payload?: any;
  successCallback?: (...args: any[]) => any;
  errorCallback?: (...args: any[]) => any;
  progressMessage?: string;
  actionName?: string;
  actionType?: string;
  showErrorDlg?: boolean;
}

const executeApiCall = (showProgress: boolean, params: ApiCallParams) => {
  const {apiCallFn, payload, actionName, actionType, successCallback} = params;
  const {t} = useBasics();

  const globalStore = useGlobal();

  if (showProgress) {
    globalStore.uiShowProgressDlg({
      message: params?.progressMessage ?? '',
    });
  }
  return apiCallFn(payload)
    .then(async (res: unknown) => {
      if (successCallback) {
        const processedRes = await successCallback(res);
        if (processedRes) return processedRes;
      }
      return res;
    })
    .catch(async (errorResponse: any) => {
      console.error('executeApiCall error: ', actionName, errorResponse);
      if (params?.showErrorDlg ?? true) {
        globalStore.uiResponseErrorDialog({
          type: 'asking',
          title: t('basic.fail.action'),
          message: t('basic.error.message'),
          actionName,
          actionType,
          errorResponse,
          hideCancelBtn: true,
          callback: () => params?.errorCallback?.(errorResponse),
        });
        return errorResponse;
      }
      return params?.errorCallback?.(errorResponse) || errorResponse;
    })
    .finally(() => {
      if (showProgress) {
        globalStore.uiHideProgressDlg();
      }
    });
};

const executeApiBatchCall = async (params: ApiCallParams) => {
  const {t} = useBasics();
  const {apiCallFn, payload, items} = params;
  const successResults: resultItem[] = [];
  const failureResults: resultItem[] = [];
  const globalStore = useGlobal();
  if (!items) return;

  const resArr: any[] = [];
  const promiseArray = items.map((item: any) => {
    return apiCallFn({...payload, ...item, item})
      .then(async (res: unknown) => resArr.push(res))
      .catch(async (errorResponse: any) => resArr.push(errorResponse));
  });
  await Promise.allSettled(promiseArray);

  try {
    resArr.map((res: any, index: number) => {
      if (res.status >= 200 && res.status < 300) {
        // delete success
        // console.log(`res[${index}]= `, res);
        const item = Object.assign({}, items[index]);
        item.status = res.status;
        item.statusText = res.statusText;
        successResults.push(item);
      } else {
        // delete fail
        // console.log(`res[${index}].response= `, res, res.response);
        const item = Object.assign({}, items[index]);
        item.status = res.response?.status;
        item.statusText =
          res.response?.data?.detail ||
          res.response?.data?.Message ||
          res.response?.data?.Error ||
          res.response?.data?.error ||
          res.response?.data?.message;
        failureResults.push(item);
      }
      return res;
    });
  } catch (error) {
    console.log(error);
  } finally {
    let message: string = '';
    let title: string = '';
    let failureDetail: string = '';
    const action: string = t('basic.delete');
    if (params?.showErrorDlg ?? true) {
      message =
        `${t('dialog.total.request.action', {action})}: ${items.length}\n` +
        `${t('basic.success.action', {action})}: ${successResults.length}\n` +
        `${t('basic.fail.action', {action})}: ${failureResults.length}\n`;
      failureDetail = t('dialog.failure.detail', {action});
      title = t('basic.done.action', {action});
      if (failureResults.length > 0) {
        message = `${message}${failureDetail}:\n`;
        failureResults.forEach((cntr) => {
          message = `${message}${cntr.name}: ${cntr.statusText}\n`;
        });
      }
      globalStore.uiShowDialog({
        title,
        type: 'information',
        message,
      });
    }
  }
};

/*
    makeApiCall will show progress modal until callback is done
    makeApiCallWithoutProgress won't show progress modal
*/
export const makeApiCall = (apiParams: ApiCallParams) => {
  return executeApiCall(true, apiParams);
};
export const makeApiCallWithoutProgress = (apiParams: ApiCallParams) => {
  return executeApiCall(false, apiParams);
};

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const makeApiBatchCall = (apiParams: ApiCallParams) => {
  return executeApiBatchCall(apiParams);
};
