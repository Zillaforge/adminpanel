<template>
  <ProjectList
    :projectType="PROJECT_TYPE.iSERVICE"
    :namespace="ISERVICE_NAMESPACE"
  />
</template>

<script setup lang="ts">
import {PROJECT_TYPE, ISERVICE_NAMESPACE} from '@/constants/Constants';

// components
import ProjectList from '@/components/project/ProjectManagementList.vue';
</script>
