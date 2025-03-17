<template>
  <v-row>
    <v-col
      v-show="isProjectEdit"
      cols="2"
      class="form-title-compact"
      :class="!isEditMode ? 'name-title-margin' : ''"
    >
      <span :class="!isEditMode ? 'input-required' : ''">
        {{ $t('basic.name.type', {type: $t('basic.project')}) }}
      </span>
    </v-col>
    <v-col
      v-show="isProjectEdit"
      cols="6"
      class="form-title-compact"
      :class="!isEditMode ? 'name-content-margin' : ''"
    >
      <TextFieldWithHint
        v-model="projectName"
        hideTitle
        hintType="name"
        :inputTitle="$t('basic.name')"
        :fillLayout="true"
        :isRequired="!isEditMode"
        :disable="!isEditMode"
        :showBoarder="!isEditMode"
        :maxLengthLimit="256"
        @update:modelValue="$emit('onProjectNameChanged', $event)"
      />
    </v-col>
    <v-col v-show="isProjectEdit" cols="4" />
    <v-col
      v-show="isProjectEdit"
      cols="2"
      class="form-title-compact mt-2"
      :class="!isEditMode ? 'name-title-margin' : ''"
    >
      <span :class="!isEditMode ? 'input-required' : ''">
        {{ $t('basic.code.name.type', {type: $t('basic.project')}) }}
      </span>
    </v-col>
    <v-col
      v-show="isProjectEdit"
      cols="6"
      class="form-title-compact mt-2"
      :class="!isEditMode ? 'name-content-margin' : ''"
    >
      <TextFieldWithHint
        v-model="projectCodeName"
        hintType="isvcCodeName"
        hideTitle
        :inputTitle="$t('basic.code.name.type', {type: $t('basic.project')})"
        :fillLayout="true"
        :isRequired="!isEditMode"
        :input-rules="[
          (val: string) =>
            !getExistingProjSysCodes().includes(val) ||
            $t('form.error.duplicated.type', {
              type: $t('basic.code.name.type', {type: $t('basic.project')}),
            }),
        ]"
        :input-hints="
          (val: string) =>
            updInputHints(
              !getExistingProjSysCodes().includes(val),
              $t('tips.project.sys.code.unique'),
            )
        "
        :disable="!isEditMode"
        :showBoarder="!isEditMode"
        :maxLengthLimit="9"
        :input-label="$t('label.project.code.name.input')"
      />
    </v-col>
    <v-col v-show="isProjectEdit" cols="4" class="mt-2" />
    <v-col cols="2" class="form-title-compact">{{ titleMembershipList }}</v-col>
    <v-col cols="10">
      <div class="members-div-style">
        <v-chip
          v-for="(user, index) in memberList"
          :key="index"
          v-model="user.isMember"
          class="ma-1"
          closable
          :disabled="
            isSystemProjectAndUser(user.account, projectInfo?.displayName ?? '')
          "
          @click:close="handleRemoveMember()"
        >
          {{ user.account }}
        </v-chip>
      </div>
    </v-col>
    <v-col cols="2" />
    <v-col cols="10">
      <OutlinedBtn
        id="selectMemberBtn"
        :text="$t('basic.choose.type', {type: $t('basic.member')})"
        @click="showPickMemberDialog = true"
      />
    </v-col>
    <UserPickerDialog
      id="UserPickerDialog"
      :showDialog="showPickMemberDialog"
      :membershipList="memberList"
      :projectInfo="projectInfo"
      @closeDialog="showPickMemberDialog = false"
      @onMemberChanged="
        (event) => {
          memberList = event;
          $emit('onMembershipChanged', memberList);
        }
      "
    />
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import {updInputHints} from '@/utils/utils';

// components
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import UserPickerDialog from '@/components/project/components/UserPickerDialog.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';

const emit = defineEmits(['onMembershipChanged', 'onProjectNameChanged']);
const props = defineProps({
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isProjectEdit: {
    type: Boolean,
    default: true,
  },
  projectInfo: {
    type: Object,
    default: () => ({}),
  },
  membershipList: {
    type: Array,
    default: () => [],
  },
});
const projectCodeName = defineModel<string>('projSysCode', {required: false});

const {i18n, t, isSystemProjectAndUser} = useBasics();
const {projectFullList} = useProjects('');
const projectName = ref('');
const showPickMemberDialog = ref(false);
const memberList = ref<Record<string, any>[]>([]);
projectName.value = props.isEditMode
  ? props?.projectInfo?.displayName
  : 'prj' + Math.floor(Date.now());

const titleMembershipList = computed(() => {
  const strSeparator = i18n.global.locale === 'tw' ? '' : ' ';
  return t('basic.member') + strSeparator + t('basic.list');
});

const handleRemoveMember = () => {
  emit(
    'onMembershipChanged',
    memberList.value.filter((member) => member.isMember),
  );
};

const getExistingProjSysCodes = () => {
  return projectFullList.value.map((proj: {codeName: string}) => proj.codeName);
};

watch(
  () => props.membershipList,
  () => {
    memberList.value = Object.assign([], props.membershipList).sort();
    emit('onMembershipChanged', memberList.value);
  },
);

watch(
  () => props.projectInfo,
  () => {
    projectName.value = props.isEditMode
      ? props?.projectInfo?.displayName
      : ref('prj' + Math.floor(Date.now()));
  },
);
</script>

<style lang="scss" scoped>
.name-textfield-style {
  padding-left: 8px;
  padding-right: 8px;
}
.members-div-style {
  border: 2px
    rgba(
      var(--v-theme-input-default-border),
      var(--v-input-default-border-opacity)
    )
    solid;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 20px;
  height: 250px;
  overflow: auto;
}

.name-title-margin {
  margin-top: 6px;
  margin-bottom: -24px;
}
.name-content-margin {
  margin-bottom: -24px;
}
</style>
