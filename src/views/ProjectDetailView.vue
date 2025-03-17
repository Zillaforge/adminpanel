<template>
  <UiContainer>
    <v-row class="main-content">
      <v-col cols="12">
        <TitleComp :title="pageTitle" />
        <GeneralDataTable
          :hasClickRowHandler="false"
          :items="projectMemberList"
          :last-updated-time="pageLastUpdatedTime"
          :loading="isLoading"
          :main-action-list="
            getProjectType(projectDetail.namespace) === PROJECT_TYPE.GENERAL
              ? [
                  {
                    label: isSiteAdminProject
                      ? $t('basic.add.type')
                      : $t('basic.edit'),
                    action: () => actionAddOrEditAdmin(),
                  },
                ]
              : []
          "
          :more-action-list="moreActionList"
          :no-data-setting="
            getProjectType(projectDetail.namespace) === PROJECT_TYPE.GENERAL
              ? isSiteAdminProject
                ? {...noDataSetting, action: () => actionAddOrEditAdmin()}
                : noDataSetting
              : {
                  ...noDataSetting,
                  buttonTitle: undefined,
                  action: undefined,
                }
          "
          :resource-info="[
            {
              title: $t('basic.name'),
              keyOfvalue: 'account',
            },
          ]"
          :search="searchStr"
          :sorting-options="{
            sortBy: 'user.account',
            isDescending: false,
          }"
          :table-headers="headers"
          :table-item-key="'user.userId'"
          @fetch-data="fetchData"
          @update-search="searchStr = $event"
        >
          <template #item="{item}">
            <TD
              v-for="(header, index) in headers"
              :key="index"
              :is-cursor-pointer="false"
              :disable-status-label="
                header.key === 'site-admin' || header.key === 'sys-admin'
              "
              :is-status="
                header.key === 'site-admin' || header.key === 'sys-admin'
              "
              :item="getDeepObj(item, header.key)"
              :search="searchStr"
              :useDateFilter="
                header.key === 'user.createdAt' ||
                header.key === 'user.lastLoginAt'
              "
              :state-icon-style="'margin-right: 21px;'"
              :is-align-center="
                header.key === 'site-admin' || header.key === 'sys-admin'
              "
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
  </UiContainer>
  <UserAddMemberDialog
    :showDialog="showAddAdminDlg"
    :all-user-list="userList"
    :origin-member-list="
      projectMemberList.map((membership: ProjectMembershipInterface) => ({
        ...membership,
        ...membership.user,
      }))
    "
    :submit-callback="handleUpdateMemberList"
    @close-dialog="closeDialog"
  />
  <ProjectEditPermissionDialog
    :showDialog="showPermissionSwitchDlg"
    :projectId="projectId"
    :userInfo="editUser"
    @afterSubmit="afterPermissionEdit($event)"
    @closeDialog="showPermissionSwitchDlg = false"
  />
  <ProjectEditAdminPermissionDialog
    v-model:show="showAdminPermissionEditDlg"
    :membership-info="editMembership"
    :submit-callback="fetchData"
  />
  <SimulationUserResultDialog
    v-model:show="showSimluationUserResultDlg"
    :data="simulationLink"
    :account="editMembership?.user?.account"
  />
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {useRoute} from 'vue-router';

import {useGlobal} from '@/store';
import useProjects from '@/composables/useProjects';
import useUsers from '@/composables/useUsers';
import useBasics from '@/composables/useBasics';
import {getDeepObj} from '@/utils/utils';
import {type ProjectMembershipInterface} from '@/interfaces/DataTypeInterface';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import ProjectEditPermissionDialog from '@/components/project/ProjectEditPermissionDialog.vue';
import ProjectEditAdminPermissionDialog from '@/components/project/ProjectEditAdminPermissionDialog.vue';
import SimulationUserResultDialog from '@/components/project/SimulationUserResultDialog.vue';
import UserAddMemberDialog from '@/components/project/UserAddMemberDialog.vue';

import {ENV, ADMIN_PROJECT_ID, PROJECT_TYPE} from '@/constants/Constants';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
const globalStore = useGlobal();
const route = useRoute();
const {
  t,
  i18n,
  isSystemUser,
  isSystemProject,
  confirmDeleteTableItemDialog,
  handleCopyToClipboard,
} = useBasics();
const isSiteAdminProject = computed(() => {
  return route.name === PAGE_TYPES.USER_ADMIN_LIST;
});

const {
  headers,
  noDataSetting,
  getProjectType,
  getProjectTypeName,

  projectDetail,
  getProjectDetail,
  projectMemberList,
  getProjectMemberList,
  execRemoveProjectMember,

  processProjectMembershipUpdated,
  toEditPage,
} = useProjects(
  isSiteAdminProject.value
    ? PAGE_TYPES.USER_ADMIN_LIST
    : PAGE_TYPES.PROJECT_DETAIL,
);
const {userList, getAllUsers, execGenerateUserSimulationToken, isTenantOwner} =
  useUsers();

const pageTitle = ref('');
const isLoading = ref(false);
const searchStr = ref('');
const pageLastUpdatedTime = ref<Date | string>('');
const showAddAdminDlg = ref<boolean>(false);
const showPermissionSwitchDlg = ref<boolean>(false);
const showAdminPermissionEditDlg = ref<boolean>(false);
const showSimluationUserResultDlg = ref<boolean>(false);
const simulationLink = ref('');
const projectId = ref<string>('');
const editUser = ref({});
const editMembership = ref<TableItem>({});

const init = async () => {
  pageTitle.value = `${projectDetail.value.displayName} ${t(
    'basic.management.type',
    {type: t('basic.member')},
  )}`;
  if (isSiteAdminProject.value) {
    pageTitle.value = t('basic.management.type', {
      type: t('basic.permission.type', {type: t('basic.admin')}),
    });
  }

  globalStore.setBreadcrumbsParams({
    projectName: projectDetail.value.displayName,
    projectTypeName: getProjectTypeName(
      getProjectType(projectDetail.value?.namespace),
    ),
  });
  await getProjectMemberList((route.params?.id as string) ?? ADMIN_PROJECT_ID);
};

const fetchData = async () => {
  isLoading.value = true;
  projectMemberList.value = [];

  await getProjectDetail((route.params?.id as string) ?? ADMIN_PROJECT_ID);

  init();
  isLoading.value = false;
  pageLastUpdatedTime.value = new Date();
};
fetchData();

const handleRemoveMember = async (selectedItem: TableItem) => {
  let removeList: string[] = [];
  if (selectedItem) {
    removeList = [selectedItem.id];
  }
  await Promise.all(
    removeList.map((id) =>
      execRemoveProjectMember(projectDetail.value.projectId, id),
    ),
  );
};

const closeDialog = () => {
  showAddAdminDlg.value = false;
};

const handleUpdateMemberList = (
  newUserIdList: string[],
  metaData: Record<string, any>,
) => {
  processProjectMembershipUpdated(
    (route.params?.id as string) ?? ADMIN_PROJECT_ID,
    newUserIdList,
    [],
    metaData,
  ).finally(() => {
    closeDialog();
    fetchData();
  });
};

const afterPermissionEdit = (stateChanged: boolean) => {
  showPermissionSwitchDlg.value = false;
  if (stateChanged === true) {
    fetchData();
  }
};

const isAllowSimulationUser = (item: TableItem) => {
  return item?.user.extra?.enableSimulationUser ?? false;
};

const moreActionList = computed(() => [
  {
    visible: () => !isSiteAdminProject.value,
    disabled: (item) => !isAllowSimulationUser(item),
    label: t('table.action.clone'),
    action: async (item: TableItem) => {
      editMembership.value = Object.assign({}, item);
      const res = await execGenerateUserSimulationToken(item?.user?.userId);
      simulationLink.value = `${ENV.USER_PORTAL}?saat_token=${res.token}&project=${item.projectId}`;
      showSimluationUserResultDlg.value = true;
    },
  },
  {
    visible: () =>
      getProjectType(projectDetail.value.namespace) === PROJECT_TYPE.GENERAL &&
      !isSiteAdminProject.value,
    // UI only support switch between tenant_admin & tenant_member.
    disabled: (item: TableItem) => isTenantOwner(item.tenantRole),
    label: t('basic.edit.type', {type: t('basic.permission')}),
    action: (item: TableItem) => {
      editUser.value = Object.assign(
        {},
        {...item.user, tenantRole: item.tenantRole},
      );
      projectId.value = item.projectId;
      showPermissionSwitchDlg.value = true;
    },
  },
  {
    visible: () =>
      getProjectType(projectDetail.value.namespace) === PROJECT_TYPE.GENERAL &&
      isSiteAdminProject.value,
    label: t('table.action.config.permission'),
    action: (item: TableItem) => {
      editMembership.value = Object.assign({}, item);
      projectId.value = item.projectId;
      showAdminPermissionEditDlg.value = true;
    },
  },
  {
    visible: () => !isSiteAdminProject.value,
    label: t('basic.copy.type', {type: 'ID'}),
    action: (item: TableItem) => handleCopyToClipboard(item?.user?.userId),
  },
  {
    visible: () =>
      getProjectType(projectDetail.value.namespace) === PROJECT_TYPE.GENERAL,
    disabled: (item: TableItem) =>
      isSystemProject(projectDetail.value.displayName) &&
      isSystemUser(item.account),
    label: t('basic.delete'),
    action: (item: TableItem) => {
      confirmDeleteTableItemDialog(
        item,
        {
          title: t('dialog.delete.title', {
            resource: t('basic.member').toLowerCase(),
          }),
          message: '',
          resourceInfo: [
            {
              title: t('basic.name'),
              keyOfvalue: 'user.account',
            },
          ],
        },
        (item) => {
          handleRemoveMember(item);
          fetchData();
        },
      );
    },
  },
]);

const actionAddOrEditAdmin = async () => {
  if (!isSiteAdminProject.value) {
    toEditPage(projectDetail.value.projectId, true);
  } else {
    await getAllUsers();
    showAddAdminDlg.value = true;
  }
};

watch(
  () => i18n.global.locale,
  () => {
    init();
  },
);
</script>

<style lang="scss" scoped>
.permission-style-tw {
  background: '#FFFFFF';
  width: 140px;
}

.permission-style-en {
  background: '#FFFFFF';
  width: 180px;
}
</style>
