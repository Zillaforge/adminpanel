<template>
  <FlavorList
    :flavorType="FLAVOR_TYPE.REMOTE_DELIVERY"
    :title="
      $t('basic.management.type', {
        type: $tc('flavor.remote.delivery', 2),
      })
    "
  />
</template>

<script setup lang="ts">
import {FLAVOR_TYPE} from '@/constants/Constants';

// components
import FlavorList from '@/components/flavor/FlavorManagementList.vue';
</script>
