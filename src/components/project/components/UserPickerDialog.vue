<template>
  <CommonDialog
    :title="$t('basic.choose.type', {type: $t('basic.member')})"
    :showDialog="showDialog"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <v-row no-gutters>
      <v-col cols="12" class="pb-4">
        <SearchTextField v-model="searchStr" />
      </v-col>
      <v-col>
        <v-data-table
          hide-actions
          :headers="tableHeaders"
          :items="userList"
          :items-per-page="-1"
          :item-value="'account'"
          :search="searchStr"
          class="table detail_table_shadow user-table user-table-scroll-bar"
        >
          <template #item="{item}">
            <tr
              :id="item.account"
              :class="{
                'table-row': true,
                selected: item.isMember,
                'v-hover': !isDisableCheckbox(item),
                'text--disabled--light v-no-hover': isDisableCheckbox(item),
              }"
              @click="clickDataRow(item)"
            >
              <td key="key" class="td-checkbox">
                <v-checkbox
                  v-model="item.isMember"
                  primary
                  hide-details
                  :disabled="isDisableCheckbox(item)"
                  color="rgb(var(--v-theme-text-highlight))"
                >
                  <v-tooltip
                    location="bottom"
                    activator="parent"
                    :disabled="!isDisableCheckbox(item)"
                  >
                    {{ $t('tips.system.user.delete') }}
                  </v-tooltip>
                </v-checkbox>
              </td>
              <td
                v-for="(header, index) in tableHeaders.slice(1)"
                :key="index"
                class="text-left word-break-all"
                :style="
                  header.width
                    ? `width: ${header.width}; margin: 4px 0`
                    : 'margin: 4px 0'
                "
              >
                <div v-text="handleString(getValue(item, header.key))" />
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="text-center">
              {{
                userList.length === 0
                  ? $t('basic.noData.less.type', {type: $t('basic.users')})
                  : $t('table.search.notFound')
              }}
            </div>
          </template>
          <template #bottom />
        </v-data-table>
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import useUsers from '@/composables/useUsers';
import {getDeepObj, sortByAccount, handleString} from '@/utils/utils';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {CLOUDINFRA_USER_NAMESPACE} from '@/constants/Constants';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';

const emit = defineEmits(['closeDialog', 'onMemberChanged']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  projectInfo: {
    type: Object,
    default: () => ({}),
  },
  membershipList: {
    type: Array,
    default: () => [],
  },
  namespace: {
    type: String,
    default: CLOUDINFRA_USER_NAMESPACE,
  },
});
const searchStr = ref('');
const {t, isSystemProjectAndUser} = useBasics();
const {userList, getAllUsers, supportUserFields} = useUsers();

const handleClose = () => {
  emit('closeDialog');
};
const handleSubmit = () => {
  const memberList = userList.value.filter((user) => user.isMember);

  emit('onMemberChanged', memberList);
  handleClose();
};

const checkMember = (user) => {
  const found = props.membershipList.find(
    (member) => member.account === user.account && member.isMember,
  );
  return found !== undefined;
};

const fetchData = async () => {
  if (userList.value.length === 0) await getAllUsers();
  userList.value = userList.value
    .filter((user) => user.namespace === props.namespace)
    .map((user) => {
      return {
        ...user,
        isMember: checkMember(user),
      };
    })
    .sort(sortByAccount);
};

const tableHeaders = computed(() => {
  const headers: DataTableHeader[] = [
    {title: '', key: 'check-box', sortable: false, align: 'center', width: 48},
  ];
  headers.push(
    {
      title: t('label.account'),
      key: 'account',
      align: 'left',
    },
    {
      title: t('basic.user.name'),
      key: 'displayName',
      align: 'left',
    },
  );

  const headerKeyAry = supportUserFields.map((field) => field.key);
  return headers.filter((header) => {
    return (
      !header.optional || headerKeyAry.some((str) => str.includes(header.key))
    );
  });
});
const isDisableCheckbox = (item) => {
  return isSystemProjectAndUser(
    item.account,
    props?.projectInfo?.displayName ? props?.projectInfo?.displayName : '',
  );
};
const getValue = (item, headerValue) => {
  return getDeepObj(item, headerValue) || '';
};
const clickDataRow = (item) => {
  if (isDisableCheckbox(item)) {
    return;
  }
  item.isMember = !item.isMember;
};

watch(
  () => props.showDialog,
  () => {
    searchStr.value = '';
    fetchData();
  },
);
</script>

<style lang="scss" scoped>
@use '@/styles/common/v-table';
.word-break-all {
  word-break: break-all;
}
.td-checkbox {
  width: 48px;
  padding: 4px !important;
}
</style>
