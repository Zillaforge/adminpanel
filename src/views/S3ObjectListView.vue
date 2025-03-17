<script lang="ts">
import {computed, ref, type Ref, onBeforeMount} from 'vue';
import {useRouter} from 'vue-router';

import type {
  S3DeleteObject,
  S3DownloadParams,
} from '@/interfaces/CloudStorageInterface';

import ContentListComponent from '@/components/dataStorage/DataContentListComponent.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import useSvgIcons from '@/composables/useSvgIcons';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';

export default {
  name: 'S3ObjectListView',
};
</script>

<script lang="ts" setup>
const {
  headers,
  allocatedBytes,
  usedBytes,
  s3ObjectList,
  isTruncated,
  execFetchS3ObjectList,
  execCreateS3Folder,
  execDeleteS3Objects,
  execDownloadS3Object,
  execFetchS3UsageInfo,
} = useCloudStorage(PAGE_TYPES.S3_OBJECT_LIST);

const router = useRouter();
const {IconKeys, ServiceIcons} = useSvgIcons();
const {t} = useBasics();
const {getProjects} = useProjects();

const bucketName: Ref<string> = ref('');

onBeforeMount(() => {
  getProjects();
});

const noDataSetting = computed(() => ({
  svgIcon: ServiceIcons[IconKeys.storage].svg,
  message1: t('basic.noData.less.type', {type: t('s3.object')}),
  message2: t('noData.msg2.s3.object'),
}));

const fetchData = async (
  params: {bucketName: string; prefix: string; isFetchMoreAction: boolean},
  callback?: () => void,
) => {
  await execFetchS3UsageInfo();
  await execFetchS3ObjectList(
    params.bucketName,
    params.prefix,
    params.isFetchMoreAction,
  ).finally(callback);
};

const gotoObjectDetail = (item: any) => {
  router.push({
    name: 'S3ObjectList',
    params: {
      bucketName: bucketName.value,
      pathMatch: item.Prefix,
    },
  });
};

const createFolderAction = (
  bucketName: string,
  path: string,
  successCallback?: () => void,
  errorCallback?: () => void,
) => {
  execCreateS3Folder(bucketName, path, successCallback, errorCallback);
};

const deleteAction = (
  bucketName: string,
  deleteObjects: S3DeleteObject[],
  successCallback?: () => void,
  errorCallback?: () => void,
) => {
  execDeleteS3Objects(
    bucketName,
    deleteObjects,
    successCallback,
    errorCallback,
  );
};

const downloadAction = (
  downloadParams: S3DownloadParams,
  successCallback?: () => void,
) => {
  execDownloadS3Object(downloadParams, successCallback);
};

const getUsage = (callback?: () => void) => {
  execFetchS3UsageInfo(true, callback);
};
</script>

<template>
  <ContentListComponent
    :content-list="s3ObjectList"
    :headers="headers"
    :no-data-setting="noDataSetting"
    :allocated-bytes="allocatedBytes"
    :used-bytes="usedBytes"
    :is-truncated="isTruncated"
    @fetch-data="fetchData"
    @create-folder-action="createFolderAction"
    @delete-action="deleteAction"
    @download-action="downloadAction"
    @to-detail-page="gotoObjectDetail"
    @get-usage="getUsage"
  />
</template>
