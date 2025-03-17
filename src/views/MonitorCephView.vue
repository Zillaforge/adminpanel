<template>
  <MonitorPage :link-to="getLink()" />
</template>

<script setup lang="ts">
// utils
import {ENV} from '@/constants/Constants';
// components
import MonitorPage from '@/components/monitor/MonitorPage.vue';

const getLink = () => {
  return ENV.ENDPOINT_CEPH;
};
</script>
