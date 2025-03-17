<script lang="ts">
import {computed, onMounted, onBeforeMount} from 'vue';

import ListPageComponent from '@/components/dataStorage/DataListPageComponent.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import useSvgIcons from '@/composables/useSvgIcons';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import {ENV} from '@/constants/Constants';

export default {
  name: 'S3BucketListView',
};
</script>

<script lang="ts" setup>
const {
  s3BucketList,
  headers,
  usedBytes,
  allocatedBytes,
  toBucketObjectListPage,
  execCreateS3Bucket,
  execDeleteS3Bucket,
  execFetchS3BucketList,
  execFetchS3UsageInfo,
} = useCloudStorage(PAGE_TYPES.S3_BUCKET_LIST);
const {IconKeys, ServiceIcons} = useSvgIcons();
const {t, getDocumentTagLink} = useBasics();
const {getProjects} = useProjects();

const linkUrl = computed(() => getDocumentTagLink('STORAGE'));
const endpoint = computed(() => ENV.ENDPOINT_CLOUD_STORAGE);
const noDataSetting = computed(() => ({
  svgIcon: ServiceIcons[IconKeys.storage].svg,
  message1: t('basic.noData.less.type', {type: t('s3.bucket')}),
  message2: t('noData.msg2.s3.bucket'),
  buttonTitle: t('basic.create.type', {
    type: t('services.cloudStorage'),
  }),
}));

onBeforeMount(() => {
  getProjects();
});

onMounted(() => {
  fetchData();
});

const fetchData = async (callback?: () => void) => {
  await execFetchS3UsageInfo();
  await execFetchS3BucketList().then(callback);
};

const createAction = (bucketName: string, callback?: () => void) => {
  execCreateS3Bucket(
    bucketName,
    async () => await fetchData(callback),
    callback,
  );
};

const deleteAction = (bucketName: string, callback?: () => void) => {
  execDeleteS3Bucket(
    bucketName,
    async () => await fetchData(callback),
    callback,
  );
};

const getUsage = (callback?: () => void) => {
  execFetchS3UsageInfo(true, callback);
};
</script>

<template>
  <ListPageComponent
    :data-list="s3BucketList"
    :headers="headers"
    :title="$t('basic.management.type', {type: $t('services.cloudStorage')})"
    :link-url="linkUrl"
    :no-data-setting="noDataSetting"
    :allocated-bytes="allocatedBytes"
    :used-bytes="usedBytes"
    :endpoint="endpoint"
    @fetch-data="fetchData"
    @create-action="createAction"
    @delete-action="deleteAction"
    @get-usage="getUsage"
    @to-detail-page="toBucketObjectListPage"
  />
</template>
