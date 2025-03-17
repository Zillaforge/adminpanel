<template>
  <UiContainer>
    <v-row class="main-content contain-footer">
      <v-col cols="12" class="project-content-padding">
        <TitleComp
          class="pb-4"
          :title="
            $t('basic.add.type', {
              type: $t('basic.project.type', {type: $t('basic.testing')}),
            })
          "
        />
        <CreationCard>
          <v-form v-model="inputValid">
            <ProjectConfigSettings
              v-model:proj-sys-code="projectSysCode"
              :isEditMode="false"
              @onMembershipChanged="(event) => (memberAccounts = event)"
              @onProjectNameChanged="(event) => (projectName = event)"
            />
          </v-form>
        </CreationCard>
      </v-col>
    </v-row>
    <v-footer height="var(--v-footer-height-px)" class="footer-style" app>
      <v-row>
        <v-col>
          <ContainedBtn
            :text="$t('basic.ok')"
            :disabled="!inputValid"
            @click="handleCreate"
          />
          <TextBtn
            :text="$t('basic.cancel')"
            class="ml-4"
            @click="toListPage"
          />
        </v-col>
      </v-row>
    </v-footer>
  </UiContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue';

import useProjects from '@/composables/useProjects';
import useUsers from '@/composables/useUsers';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {type UserInfoInterface} from '@/interfaces/DataTypeInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import CreationCard from '@/components/common/CreationCard.vue';
import ProjectConfigSettings from '@/components/project/components/ProjectConfigSettings.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import TextBtn from '@/components/common/button/TextBtn.vue';

const {getAllUsers} = useUsers();
const {getProjects, toListPage, execAddProjectMembers, execCreateProject} =
  useProjects(PAGE_TYPES.PROJECT_CREATE);

const projectName = ref('');
const projectSysCode = ref('');
const memberAccounts = ref([]);
const inputValid = ref(true);

const handleMemberAdded = (projectId: string) => {
  const memberList = memberAccounts.value.map((member: UserInfoInterface) => ({
    userId: member.userId,
    projectId,
  }));

  const params = {
    memberList,
    membershipMeta: {},
  };
  return execAddProjectMembers(params);
};
const handleCreate = async () => {
  const params = {
    projectName: projectName.value,
    projectSysCode: projectSysCode.value,
    memberAccounts: memberAccounts.value,
  };
  const projectInfo = await execCreateProject(params);
  if (memberAccounts.value.length) {
    await handleMemberAdded(projectInfo.projectId);
  }
  toListPage();
};
const fetchData = async () => {
  await getAllUsers();
  await getProjects();
};
fetchData();
</script>

<style lang="scss" scoped>
.project-content-padding {
  padding-bottom: 72px;
}

.footer-style {
  background-color: rgb(var(--v-theme-card-creation-footer-bg));
}
</style>
