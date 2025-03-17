import {defineStore} from 'pinia';
import {
  ENABLE_SWITCH_REGION,
  RESOURCE_REGION_TYPE,
  DEFAULT_RESOURCE_REGION,
} from '@/constants/Constants';
import i18n from '../i18n';
import {type ResourceInfo} from '@/interfaces/LayoutItemInterface';

const {t} = i18n.global;

interface GlobalDlgParams {
  show?: boolean;
  type: string;
  title: string;
  width?: number;
  message: string;
  errorCode?: string;
  persistent?: boolean;
  isResourceConfirm?: boolean;
  resourceInfo?: ResourceInfo[];
  btnText?: string;
  callback?: (...args: any[]) => any | null | undefined;
  secondaryBtnText?: string;
  secondaryCallback?: () => any | null;
  hideCancelBtn?: boolean;
  isCreateConfirm?: boolean;
  actionName?: string;
  actionType?: string;
  errorResponse?: Record<string, any>;
}

interface ProgressDlgParams {
  show?: boolean;
  message?: string;
}

interface GlobalState {
  loading: boolean;
  progress: number | null;
  message: string;
  dialog: GlobalDlgParams;
  progressDlg: ProgressDlgParams;
  breadcrumbsParams: any;
  breadcrumbs: [];
  resourceRegion: Array<Record<string, any>>;
  currentRegion: string;
  adminPrjId: string;
}

const localStorageValue = localStorage.getItem('resourceRegion') ?? '';

/** Global Store */
const useGlobalStore = defineStore('global', {
  // State
  state: (): GlobalState => {
    return {
      loading: true /** Loading overlay */,
      progress: null /** ProgressBar Percentage */,
      message: '' /** SnackBar Text */,
      dialog: {
        show: false,
        type: '',
        title: '',
        message: '',
        actionName: '',
        actionType: '',
        errorCode: '',
        persistent: false,
        isResourceConfirm: false,
        resourceInfo: [],
        btnText: '',
        callback: Function,
        secondaryBtnText: '',
        secondaryCallback: Function,
        hideCancelBtn: false,
        isCreateConfirm: false,
      },
      progressDlg: {
        show: false,
        message: '',
      },
      breadcrumbsParams: {},
      breadcrumbs: [],
      resourceRegion: [
        {
          value: RESOURCE_REGION_TYPE.TRUSTED_PLATFORM,
          title: 'appBar.trustyPlatformResource',
        },
        {
          value: RESOURCE_REGION_TYPE.PILOT,
          title: 'appBar.pilotResource',
        },
      ],
      currentRegion:
        ENABLE_SWITCH_REGION &&
        localStorageValue &&
        Object.values(RESOURCE_REGION_TYPE).includes(localStorageValue)
          ? localStorageValue
          : DEFAULT_RESOURCE_REGION,
      adminPrjId: '',
    };
  },

  getters: {
    getBreadcrumbsParams: (state: GlobalState) => state.breadcrumbsParams,
    getBreadcrumbsValue: (state: GlobalState) => state.breadcrumbs,
    getProgressDlgState: (state: GlobalState) => state.progressDlg,
    getAdminPrjId: (state: GlobalState) => state.adminPrjId,
    getResourceRegion: (state: GlobalState) => state.resourceRegion,
    getCurrentRegion: (state: GlobalState) => state.currentRegion,
    getIsPilotRegion: (state: GlobalState) =>
      state.currentRegion === RESOURCE_REGION_TYPE.PILOT,
  },

  // Actions
  actions: {
    uiShowDialog(params: GlobalDlgParams) {
      let type = '';
      if (params.callback) {
        type = 'asking';
      }
      if (params.type) {
        type = params.type;
      }
      this.dialog = {
        ...params,
        show: true,
        type,
      };
    },

    uiHideDialog() {
      this.dialog = {
        ...this.dialog,
        show: false,
      };
    },

    uiResponseErrorDialog(params: GlobalDlgParams) {
      let type = '';
      let errMsg = '';
      let errStat = '';
      let errStatText = '';
      const errorResponse = params.errorResponse;

      if (params.callback && !params.hideCancelBtn) {
        type = 'asking';
      }
      if (errorResponse?.response) {
        const {data} = errorResponse.response;
        if (data && typeof data === 'object' && !(data instanceof Blob)) {
          if (data.error) {
            errMsg = data.error;
          } else if (data.Error) {
            errMsg = data.Error;
          } else if (data.detail) {
            errMsg = data.detail;
          } else if (data.message) {
            errMsg = data.message;
          } else if (data.data) {
            errMsg = data.data.message;
          } else if (data.Message) {
            errMsg = data.Message;
          } else if (data.errorMessage) {
            errMsg = data.errorMessage;
          }
        } else {
          errMsg = errorResponse.message ?? '';
        }
        errStat = errorResponse.response.status || '';
        errStatText = errorResponse.response.statusText || '';
      } else if (errorResponse?.data) {
        errMsg =
          errorResponse.data.detail ||
          errorResponse.data.message ||
          errorResponse.data.Message ||
          errorResponse.data.error ||
          errorResponse.data.errorMessage;
        errStat =
          errorResponse.data.errorCode ||
          errorResponse.data.status ||
          errorResponse.status;
        errStatText = errorResponse.statusText;
      } else if (errorResponse?.message) {
        errMsg = errorResponse.message;
        errStat = '';
        errStatText = '';
      }

      errStatText = errStatText ? `(${errStatText})` : '';
      const actionMessage = params?.actionName
        ? `${t('basic.error.function')}: ${params.actionName}\n`
        : '';
      const message = errorResponse?.hideErrorCode
        ? `${t('basic.error.message')}: ${errMsg}`
        : `${import.meta.env.PROD ? '' : actionMessage}` +
          `${t('basic.error.code')}: ${errStat} ${errStatText}\n` +
          `${t('basic.error.message')}: ${errMsg}`;

      this.dialog = {
        ...params,
        show: true,
        callback: params?.callback ?? undefined,
        type,
        title: t('basic.fail.action', {action: params.actionType}),
        message,
      };
    },

    uiShowProgressDlg(Params: ProgressDlgParams = {}) {
      this.progressDlg = {
        message: Params.message ?? '',
        show: true,
      };
    },
    uiHideProgressDlg() {
      this.progressDlg = {
        show: false,
        message: '',
      };
    },

    /**
     * Show loading Overlay
     *
     * @param display - visibility
     */
    setLoading(display: boolean): void {
      this.loading = display;
      if (!display) {
        // Reset Progress value
        this.progress = null;
      }
    },
    /**
     * Update progress value
     *
     * @param v - progress value
     */
    setProgress(v: number | null = null): void {
      // update progress value
      this.progress = v;
      // display loading overlay
      this.loading = true;
    },
    /**
     * Show snackbar message
     *
     * @param msg - snackbar message
     */
    setMessage(msg: string = ''): void {
      // put snackbar text
      this.message = msg;
    },
    setBreadcrumbsParams(params: any): void {
      this.breadcrumbsParams = params;
    },
    setBreadcrumbsValue(breadcrumbs: any): void {
      this.breadcrumbs = breadcrumbs;
    },
    updateResourceRegion(value: string): void {
      this.currentRegion =
        this.resourceRegion.find((el) => el.value === value)?.value ??
        RESOURCE_REGION_TYPE.TRUSTED_PLATFORM;
      localStorage.setItem('resourceRegion', this.currentRegion);
    },
    setAdminPrjId(id: string) {
      this.adminPrjId = id;
    },
  },
});

export default useGlobalStore;
