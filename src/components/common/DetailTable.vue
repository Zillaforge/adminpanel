<script lang="ts" setup>
import {computed} from 'vue';

import TD from '@/components/common/TdHighlight.vue';
interface Action {
  text: string;
  action: (item: any, index: number) => any;
}
const props = defineProps({
  items: {
    type: Array<any>,
    default: () => {},
  },
  headers: {
    type: Array<any>,
    default: () => [],
  },
  actions: {
    type: Array<Action>,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
});

const checkedHeaders = computed(() => {
  if (props.actions.length === 0) {
    return props.headers;
  }
  return props.headers.concat({
    title: '',
    key: 'actions',
    sortable: false,
    align: 'end',
  });
});
const itemsHasEmptyValue = computed(() =>
  props.items.some((item: Record<string, unknown>) =>
    Object.values(item).some((val) => !val),
  ),
);
</script>

<template>
  <div>
    <v-data-table
      class="table-border table-no-hover"
      :headers="checkedHeaders"
      :items="items"
      :no-data-text="$t('table.noData')"
      hide-default-footer
    >
      <template #item.status="{item}">
        <TD :item="item.status" :is-status="true" class="ma-0" />
      </template>
      <template #item.security_group="{item}">
        <v-chip v-for="group in item?.security_group" :key="group" class="ma-1">
          {{ group }}
        </v-chip>
      </template>
      <template #item.actions="{item, index}">
        <v-menu open-on-hover>
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              variant="flat"
              icon
              density="comfortable"
              class="table-more-btn"
              @click.stop
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list class="pa-0 more-action-list">
            <v-list-item
              v-for="act in actions"
              :key="act.text"
              @click="act.action(item, index)"
            >
              {{ act.text }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-if="required" #no-data>
        <span class="alert">{{ $t('form.required') }}</span>
      </template>
    </v-data-table>
    <div v-if="hasError || (required && itemsHasEmptyValue)" class="mt-2">
      <span class="alert">
        {{ `(${$t('form.error.please.check')})` }}
      </span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use '@/styles/common/v-table';

.alert {
  color: rgb(var(--v-theme-error));
}
</style>
