<template>
  <UiContainer>
    <v-row class="main-content contain-footer">
      <v-col cols="12" class="project-content-padding">
        <TitleComp class="pb-4" :title="title" />
        <CreationCard>
          <ProjectConfigSettings
            :isEditMode="true"
            :isProjectEdit="isPrjEdit"
            :projectInfo="projectDetail"
            :membershipList="memberAccounts"
            @onMembershipChanged="(event) => (finalSelectedMembers = event)"
          />
        </CreationCard>
      </v-col>
    </v-row>
    <v-footer height="var(--v-footer-height-px)" class="footer-style" app>
      <v-row>
        <v-col>
          <ContainedBtn
            :text="$t('basic.ok')"
            :disabled="isPrjEdit"
            @click="handleSubmit"
          />
          <OutlinedBtn
            :text="$t('basic.cancel')"
            class="ml-4"
            @click="backToPreviousPage"
          />
        </v-col>
      </v-row>
    </v-footer>
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import {useGlobal} from '@/store';
import {useRoute} from 'vue-router';

import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import useUsers from '@/composables/useUsers';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {PROJECT_TYPE} from '@/constants/Constants';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';
import {
  type ProjectMembershipInterface,
  type UserInfoInterface,
} from '@/interfaces/DataTypeInterface';

// components
import TitleComp from '@/components/common/TitleComponent.vue';
import CreationCard from '@/components/common/CreationCard.vue';
import ProjectConfigSettings from '@/components/project/components/ProjectConfigSettings.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';

const route = useRoute();
const {t} = useBasics();
const globalStore = useGlobal();

const isPrjEdit = computed(() => route?.name === PAGE_TYPES.PROJECT_EDIT);
const title = computed(() => {
  return isPrjEdit.value
    ? t('basic.edit.type', {type: t('basic.project')})
    : t('basic.edit.type', {type: t('basic.member')});
});
const {userList, getAllUsers} = useUsers();
const {
  getProjectType,
  getProjectTypeName,

  projectDetail,
  getProjectDetail,
  projectMemberList,
  getProjectMemberList,

  processProjectMembershipUpdated,
  toDetailPage,
  toListPage,
} = useProjects(
  isPrjEdit.value ? PAGE_TYPES.PROJECT_EDIT : PAGE_TYPES.PROJECT_MEMBER_EDIT,
);

const memberAccounts = ref<UserInfoInterface[]>([]);

const fetchData = async () => {
  await getProjectDetail(route.params.id as string);
  await getProjectMemberList(route.params.id as string);
  memberAccounts.value = projectMemberList.value.map(
    (member: ProjectMembershipInterface) => ({
      ...member?.user,
      isMember: true,
    }),
  );
  if (userList.value.length === 0) await getAllUsers();
  globalStore.setBreadcrumbsParams({
    projectId: projectDetail.value.projectId,
    displayName: projectDetail.value.displayName,
    isDetailPage: true,
    projectTypeName: getProjectTypeName(
      getProjectType(projectDetail.value?.namespace),
    ),
  });
};
fetchData();

const finalSelectedMembers = ref([]);
const updateProjectMembership = async (
  newList: string[],
  removeList: string[],
) => {
  uiShowProgress();
  processProjectMembershipUpdated(
    route.params.id as string,
    newList,
    removeList,
    {},
  ).finally(() => {
    fetchData();
    uiHideProgress();
    backToPreviousPage();
  });
};
const handleSubmit = async () => {
  const finalList = finalSelectedMembers.value.map(
    (member: UserInfoInterface) => member.userId,
  );
  const members = projectMemberList.value.map(
    (membership: ProjectMembershipInterface) => membership.user.userId,
  );
  const newList = finalList.filter((user) => !members.includes(user));
  const delList = members.filter((user) => !finalList.includes(user));
  return updateProjectMembership(newList, delList);
};

const backToDetail = () => {
  toDetailPage(
    projectDetail.value?.projectId,
    PROJECT_TYPE.GENERAL, // only local project can be edited now
  );
};
const backToPreviousPage = () => {
  if (!isPrjEdit.value) {
    backToDetail();
  } else {
    toListPage();
  }
};
</script>

<style lang="scss" scoped>
.project-content-padding {
  padding-bottom: 72px;
}
.footer-style {
  background-color: rgb(var(--v-theme-card-creation-footer-bg));
}
</style>
