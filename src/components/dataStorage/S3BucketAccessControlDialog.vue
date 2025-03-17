<template>
  <CommonDialog
    :show-dialog="showDialog"
    :title="$t('s3.accessControl')"
    :show-cancel-btn="hasPermission"
    @submit="submitAction"
    @close="$emit('close-dialog')"
  >
    <template v-if="!hasPermission">
      {{ $t('s3.accessControl.noPermission') }}
    </template>
    <template v-else>
      <RadioButtonSwitch
        :title="$t('s3.accessControl')"
        :options="[
          {label: $t('basic.enable'), value: true},
          {label: $t('basic.disabled'), value: false},
        ]"
        :tooltip="$t('s3.accessControl.tooltip')"
        :init-value="enableAcl"
        is-inline
        is-hide-details
        is-required
        @select="(value: boolean) => (enableAcl = value)"
      />
      <SelectWithHint
        v-model="selectedMember"
        :input-title="$t('s3.accessControl.addMember')"
        :items="selectableMemberList"
        item-text="displayName"
        item-value="id"
        :selection-cols="8"
        :disabled="!enableAcl"
        is-hide-details
        is-return-object
        no-gutters
      />
      <v-row no-gutters>
        <v-col :cols="3" class="form-title" />
        <v-col :cols="8">
          <OutlinedBtn
            :text="$t('s3.accessControl.memberList.add')"
            :disabled="!enableAcl || !selectedMember"
            class="my-6"
            @click="addMember"
          />
        </v-col>
        <v-spacer />
        <v-col
          :cols="3"
          class="form-title"
          :class="{'text-disabled': !enableAcl}"
        >
          {{ $t('s3.accessControl.memberList') }}
        </v-col>
        <v-col
          :cols="8"
          class="chip-area rounded"
          :class="{disabled: !enableAcl}"
        >
          <v-chip
            v-for="(member, index) in memberList"
            :key="`member${member.id}`"
            :disabled="!enableAcl"
            class="ma-2"
            closable
            @click:close="removeMember(index)"
          >
            <span>{{ member.displayName }}</span>
          </v-chip>
        </v-col>
        <v-spacer />
      </v-row>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import {useGlobal, useLogin} from '@/store';
import useProjects from '@/composables/useProjects';
import {ref, computed, type Ref, watch} from 'vue';

import RadioButtonSwitch from '@/components/common/RadioButtonSwitch.vue';
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import useCloudStorage from '@/composables/useCloudStorage';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {ADMIN_PROJECT_ID} from '@/constants/Constants';

const emits = defineEmits(['close-dialog']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  bucketName: {
    type: String,
    default: '',
  },
});

const globalStore = useGlobal();
const userStore = useLogin();
const {execFetchS3BucketAcl, execUpdateS3BucketAcl} = useCloudStorage(
  PAGE_TYPES.S3_BUCKET_LIST,
);

const {getProjectMemberList, projectMemberList} = useProjects('');

const showDialog: Ref<boolean> = ref(false);
const hasPermission: Ref<boolean> = ref(true);
const enableAcl: Ref<boolean> = ref(false);
const allMemberList: Ref<any[]> = ref([]);
const memberList: Ref<any[]> = ref([]);
const selectedMember: Ref<Record<string, any> | undefined> = ref(undefined);

const selectableMemberList = computed(() => {
  return allMemberList.value
    .filter(
      (member) =>
        member.id !== userStore.getUserInfo.userId &&
        !memberList.value.find((el) => el.id === member.id),
    )
    .sort((a, b) => {
      return a.displayName.toUpperCase() > b.displayName.toUpperCase() ? 1 : -1;
    });
});

const fetchData = async () => {
  await getProjectMemberList(ADMIN_PROJECT_ID);
  allMemberList.value = projectMemberList.value.map(
    (member: Record<string, any>) => ({
      displayName:
        member?.user?.displayName ||
        member?.user?.account ||
        member?.user?.email ||
        member?.user?.userId ||
        '',
      id: member?.user?.userId,
    }),
  );

  await execFetchS3BucketAcl(
    props.bucketName,
    (acl) => {
      memberList.value = acl.map((id: string) =>
        allMemberList.value.find((member) => member?.id === id),
      );
    },
    () => {
      hasPermission.value = false;
      enableAcl.value = false;
    },
  );
  if (memberList.value.length > 0) {
    enableAcl.value = true;
  }
  showDialog.value = true;
  globalStore.uiHideProgressDlg();
};

const submitAction = () => {
  if (!hasPermission.value) {
    emits('close-dialog');
    return;
  }
  const idList = memberList.value.map((member) => member.id as string);
  execUpdateS3BucketAcl(
    props.bucketName,
    enableAcl.value ? idList : [],
    () => emits('close-dialog', true),
    () => emits('close-dialog'),
  );
};

const addMember = () => {
  memberList.value.push(selectedMember.value);
  selectedMember.value = undefined;
};

const removeMember = (index: number) => {
  memberList.value.splice(index, 1);
};

watch(
  () => props.show,
  (newVal) => {
    showDialog.value = false;
    if (newVal) {
      showDialog.value = false;
      hasPermission.value = true;
      selectedMember.value = undefined;
      memberList.value = [];
      allMemberList.value = [];
      enableAcl.value = false;
      globalStore.uiShowProgressDlg();
      fetchData();
    }
  },
);
</script>

<style scoped lang="scss">
@use '@/styles/common/v-chip';
.chip-area {
  height: 180px;
  padding: 16px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-theme-border), var(--v-border-opacity));
}
</style>
