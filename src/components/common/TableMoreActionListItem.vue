<template>
  <v-list-item
    :disabled="listItem.disabled"
    @click="listItem.action(tableItem)"
  >
    <v-list-item-title>
      {{ listItem.label }}
    </v-list-item-title>
  </v-list-item>
</template>

<script lang="ts">
import type {PropType} from 'vue';

import type {MoreActionListItem} from '@/interfaces/InfraDataTableInterface';
import type {DataTableItemValue} from '@/interfaces/VuetifyInterfaces';

export default {
  name: 'TableMoreActionListItem',
};
</script>

<script setup lang="ts">
defineProps({
  tableItem: {
    type: Object as PropType<Record<string, DataTableItemValue>>,
    required: true,
  },
  listItem: {
    type: Object as PropType<MoreActionListItem>,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.v-list-item {
  &:hover,
  &:active {
    background-color: rgba(
      var(--v-theme-table-more-action-hover-bg),
      var(--v-table-more-action-hover-bg-opacity)
    ) !important;
  }
}
</style>
