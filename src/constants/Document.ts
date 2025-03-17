import {ENV} from '@/constants/Constants';
export const Document: Record<string, any> = {
  CONTAINER_IMAGE: {
    tw: `#容器映像檔`,
    en: `#容器映像檔`,
  },
  LOG_MANAGEMENT: {
    tw: '#管理操作紀錄',
    en: '#管理操作紀錄',
  },
  LOG_PROJECT: {
    tw: '#專案操作紀錄',
    en: '#專案操作紀錄',
  },
  STORAGE: {
    tw: `#系統儲存`,
    en: `#系統儲存`,
  },
  VM_IMAGE: {
    tw: `#虛擬映像檔`,
    en: `#虛擬映像檔`,
  },
};

export const getDocumentLink = (tag: string = '') => {
  return {
    tw: (ENV.ENDPOINT_DOCS as string) + tag,
    en: (ENV.ENDPOINT_DOCS as string) + tag,
  };
};
