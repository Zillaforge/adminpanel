<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp :title="pageTitle" />
        <GeneralDataTable
          :hasClickRowHandler="false"
          :items="userListByType"
          :last-updated-time="lastUpdatedTime"
          :loading="isLoading"
          :main-action-list="[
            {
              label: $t('basic.add.type'),
              action: () => (showCreateUserDlg = true),
            },
          ]"
          :more-action-list="moreActionList"
          :no-data-setting="{
            ...noDataSetting,
            action: () => (showCreateUserDlg = true),
          }"
          :resource-info="[
            {
              title: $t('label.account'),
              keyOfvalue: 'account',
            },
          ]"
          :search="searchStr"
          :sorting-options="{
            sortBy: 'cerateAt',
            isDescending: true,
          }"
          :table-headers="headers"
          :table-item-key="'account'"
          @fetch-data="fetchData"
          @update-search="searchStr = $event"
        >
          <template #item="{item}">
            <TD
              v-for="(header, index) in headers"
              :key="index"
              :item="getDeepObj(item, header.key)"
              :search="searchStr"
              :isCursorPointer="false"
              :useDateFilter="
                header.key === 'createdAt' || header.key === 'lastLoginAt'
              "
              :disableStatusLabel="true"
            />
          </template>
        </GeneralDataTable>
      </v-col>
    </v-row>
    <UserCreateDialog
      :showDialog="showCreateUserDlg"
      :supportFields="supportUserFields"
      @triggerFetch="fetchData"
      @closeDialog="showCreateUserDlg = false"
    />
    <EditPasswordDialog
      :showDialog="showEditPasswordDialog"
      :userInfo="userInfo as UserInfoInterface"
      @triggerShowDialog="showEditPasswordDialog = true"
      @triggerFetch="fetchData"
      @closeDialog="handleCloseEditPwdDlg"
    />
    <UserEditDialog
      :showDialog="showEditMetaDialog"
      :userInfo="editUser as UserEditInterface"
      :supportFields="supportUserFields"
      @afterSubmit="afterUserEdit"
      @closeDialog="showEditMetaDialog = false"
    />
    <MembershipInfoDialog
      :showDialog="showProjectInfoDlg"
      :userInfo="userInfo as UserInfoInterface"
      :userType="userType"
      @closeDialog="showProjectInfoDlg = false"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import type {Ref} from 'vue';
import useBasics from '@/composables/useBasics';
import useUsers from '@/composables/useUsers';

import {useRoute} from 'vue-router';
import {getDeepObj} from '@/utils/utils';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {
  type UserInfoInterface,
  type UserEditInterface,
} from '@/interfaces/DataTypeInterface';

import {type TableItem} from '@/interfaces/InfraDataTableInterface';
import {
  CLOUDINFRA_USER_NAMESPACE,
  USER_TYPE,
  USER_EXTRA_INFO_KEY,
} from '@/constants/Constants';
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import TD from '@/components/common/TdHighlight.vue';
import GeneralDataTable from '@/components/common/GeneralDataTable.vue';
import UserCreateDialog from '@/components/user/UserCreateDialog.vue';
import UserEditDialog from '@/components/user/UserEditDialog.vue';
import EditPasswordDialog from '@/components/user/EditPasswordDialog.vue';
import MembershipInfoDialog from '@/components/user/MembershipInfoDialog.vue';
import getTableHeaders from '@/utils/getTableHeaders';

const {
  t,
  i18n,
  isSystemUser,
  confirmDeleteTableItemDialog,
  handleCopyToClipboard,
} = useBasics();
const route = useRoute();
const props = defineProps({
  userType: {
    type: String,
    default: USER_TYPE.GENERAL,
  },
});

const lastUpdatedTime = ref<Date | string>('');
const searchStr = ref('');
const isLoading = ref(false);
const showCreateUserDlg = ref(false);
const showEditMetaDialog = ref(false);
const showEditPasswordDialog = ref(false);
const showProjectInfoDlg = ref(false);
const headers: Ref<DataTableHeader[]> = ref([]);

const userInfo = ref<Record<string, any>>({});
const editUser = ref<Record<string, any>>({});

const {
  supportUserFields,
  userList,
  execDeleteUser,
  getAllUsers,
  noDataSetting,
} = useUsers(props.userType);

const userListByType = computed(() => {
  if (props.userType === USER_TYPE.BUSINESS) {
    return userList.value.filter(
      (user: UserInfoInterface) => user.namespace !== CLOUDINFRA_USER_NAMESPACE,
    );
  } else {
    return userList.value.filter(
      (user: UserInfoInterface) => user.namespace === CLOUDINFRA_USER_NAMESPACE,
    );
  }
});
const fetchData = async () => {
  isLoading.value = true;

  await getAllUsers();
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};
const handleDelete = async (item: TableItem) => {
  await execDeleteUser(item);
};

const moreActionList = computed(() => {
  return [
    {
      label: t('basic.edit.type', {type: t('basic.users')}),
      action: (item: TableItem) => {
        editUser.value = Object.assign(editUser.value, item);
        if (item?.extra?.[USER_EXTRA_INFO_KEY]) {
          const {title, department, telephone} =
            item?.extra?.[USER_EXTRA_INFO_KEY];
          editUser.value = {
            ...editUser.value,
            title: title || '',
            department: department || '',
            telephone: telephone || '',
          };
        }
        showEditMetaDialog.value = true;
      },
    },
    {
      label: t('basic.password.change'),
      action: (item: TableItem) => {
        userInfo.value = Object.assign({}, item);
        showEditPasswordDialog.value = true;
      },
    },
    {
      label: t('basic.info.type', {type: t('basic.project')}),
      action: (item: TableItem) => {
        userInfo.value = Object.assign({}, item);
        showProjectInfoDlg.value = true;
      },
    },
    {
      label: t('basic.copy.type', {type: 'ID'}),
      action: (item: TableItem) => handleCopyToClipboard(item.userId),
    },

    {
      disabled: (item: TableItem) => isSystemUser(item.account),
      label: t('basic.delete'),
      action: (item: TableItem) => {
        confirmDeleteTableItemDialog(
          item,
          {
            title: t('dialog.delete.title', {
              resource: t('basic.users').toLowerCase(),
            }),
            message: '',
            resourceInfo: [
              {
                title: t('label.account'),
                keyOfvalue: 'account',
              },
            ],
          },
          async (item) => {
            await handleDelete(item);
            fetchData();
          },
        );
      },
    },
  ];
});

const pageTitle: Ref<string> = ref('');
const genPageTitleString = () => {
  return t('basic.management.type', {
    type: t('basic.user.type', {
      type: t('basic.testing'),
    }),
  });
};
pageTitle.value = genPageTitleString();

const init = () => {
  const headerKeyAry = supportUserFields.map((field) => field.key);

  headers.value = getTableHeaders(route.name as string);
  headers.value = getTableHeaders(route.name as string).filter((header) => {
    return (
      !header.optional || headerKeyAry.some((str) => str.includes(header.key))
    );
  });
};

init();
fetchData();

const afterUserEdit = () => {
  showEditMetaDialog.value = false;
  fetchData();
};
const handleCloseEditPwdDlg = () => {
  editUser.value = {
    account: '',
    displayName: '',
    email: '',
    description: '',
    department: '',
    title: '',
    telephone: '',
    password: '',
  };
  showEditPasswordDialog.value = false;
};

watch(
  () => i18n.global.locale,
  () => {
    pageTitle.value = genPageTitleString();
    init();
  },
);
</script>
