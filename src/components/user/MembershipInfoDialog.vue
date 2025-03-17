<template>
  <v-row class="justify-center">
    <CommonDialog
      :title="$t('basic.info.type', {type: $t('basic.project')})"
      :showDialog="showDialog"
      :showCancelBtn="false"
      :submitBtnText="$t('basic.yes')"
      @submit="$emit('closeDialog')"
    >
      <template #between-title-and-text>
        <v-row class="mb-4">
          <v-col cols="2">{{ $t('label.account') }}</v-col>
          <v-col cols="10">{{ userInfo.account }}</v-col>
        </v-row>
        <v-row>
          <v-col cols="2">
            {{ $t('basic.info.type', {type: $t('basic.project')}) }}
          </v-col>
          <v-col cols="10">
            <v-data-table
              :items="projectsByUser"
              :item-value="'projectId'"
              :itemsPerPage="-1"
              class="elevation-1"
              :headers="tbHeaders"
              :loading="isLoading"
              :loading-text="$t('basic.data.loading')"
              hide-actions
              hide-default-footer
            >
              <template #loader>
                <v-progress-linear height="4" color="primary" indeterminate />
              </template>
              <template #item="{item}">
                <tr class="v-no-hover">
                  <TdHighlight
                    v-for="(header, index) in tbHeaders"
                    :key="index"
                    :item="getDeepObj(item, header.key)"
                    :isCursorPointer="false"
                  />
                </tr>
              </template>
              <template #no-data>
                <div class="align-center">
                  {{ $t('table.noData') }}
                </div>
              </template>
              <template #bottom />
            </v-data-table>
          </v-col>
        </v-row>
      </template>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed, watch, type Ref, type PropType} from 'vue';
import useBasics from '@/composables/useBasics';
import useUsers from '@/composables/useUsers';
import {
  type UserInfoInterface,
  type ProjectMembershipInterface,
} from '@/interfaces/DataTypeInterface';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';

import {getDeepObj} from '@/utils/utils';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TdHighlight from '@/components/common/TdHighlight.vue';

defineEmits(['closeDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  userInfo: {
    type: Object as PropType<UserInfoInterface>,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

const {t} = useBasics();
const {execFetchUserMemberships} = useUsers(props.userType);
const projectsByUser = ref<ProjectMembershipInterface[]>([]);
const isLoading = ref<boolean>(false);
const tableHeaders: Ref<DataTableHeader[]> = ref([
  {
    title: t('basic.code.name'),
    key: 'extra.iservice.projectSysCode',
    align: 'left',
    sortable: false,
  },
  {
    title: t('basic.name'),
    key: 'displayName',
    align: 'left',
    sortable: false,
  },
]);
const tbHeaders = computed(() => tableHeaders.value);

watch(
  () => props.showDialog,
  async (val) => {
    if (val) {
      projectsByUser.value = [];
      isLoading.value = true;
      const userMemberships = await execFetchUserMemberships(
        props.userInfo.userId,
        true,
      ).catch(() => {
        isLoading.value = false;
      });
      projectsByUser.value = userMemberships.map(
        (membership: ProjectMembershipInterface) => membership.project,
      );

      isLoading.value = false;
    }
  },
);
</script>

<style lang="scss" scoped>
@use '@/styles/common/v-table';
.id-column {
  display: flex;
  align-items: flex-start;
}

.project-info {
  :deep(.text-error) {
    color: rgb(var(--v-theme-error)) !important;
  }
}
</style>
