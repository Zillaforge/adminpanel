<template>
  <ProjectList
    :projectType="PROJECT_TYPE.GENERAL"
    :namespace="CLOUDINFRA_NAMESPACE"
  />
</template>

<script setup lang="ts">
import {PROJECT_TYPE, CLOUDINFRA_NAMESPACE} from '@/constants/Constants';

// components
import ProjectList from '@/components/project/ProjectManagementList.vue';
</script>
