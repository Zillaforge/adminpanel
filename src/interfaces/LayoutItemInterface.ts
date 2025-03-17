export interface ExternalLinkItem {
  linkTo: string;
  text: string;
  isBreakLine?: boolean;
  unique?: boolean;
}

export interface ResourceInfo {
  title: string;
  value: string | string[];
}

// export interface GlobalDlgParams {
//   show?: boolean;
//   width?: number;
//   type?: string;
//   title: string;
//   message: string;
//   errorCode?: string;
//   persistent?: boolean | undefined;
//   isResourceConfirm?: boolean;
//   resourceInfo?: ResourceInfo[];
//   btnText?: string;
//   callback?: (...args: any[]) => any | null | undefined;
//   secondaryBtnText?: string;
//   secondaryCallback?: (...args: any[]) => any | null | undefined;
//   hideCancelBtn?: boolean;
//   isCreateConfirm?: boolean;
//   actionName?: string | undefined;
//   actionType?: string;
//   errorResponse?: Record<string, any>;
// }

// export interface ProgressDlgParams {
//   show?: boolean;
//   message?: string;
// }

export interface RadioButtonOptions {
  label?: string;
  value?: any;
  disabled?: boolean;
}
