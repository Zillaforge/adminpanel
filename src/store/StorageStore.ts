import {defineStore} from 'pinia';

import type {S3CredentialInfo} from '@/interfaces/CloudStorageInterface';

const useStorageStore = defineStore('s3Storage', {
  state: (): S3CredentialInfo => ({
    accessKey: '',
    secretKey: '',
  }),
  getters: {
    getS3AccessKey: (state): string => state.accessKey,
    getS3SecretKey: (state): string => state.secretKey,
  },
  actions: {
    setS3Credential(payload: S3CredentialInfo) {
      this.accessKey = payload.accessKey;
      this.secretKey = payload.secretKey;
    },
  },
});

export default useStorageStore;
