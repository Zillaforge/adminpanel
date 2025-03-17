<template>
  <CommonDialog
    :title="$t('basic.edit.type', {type: $t('basic.permission')})"
    :showDialog="showDialog"
    :disableSubmit="initValue === isAdmin"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <template #between-title-and-text>
      <v-row>
        <v-col cols="4" class="form-title pl-4">
          <div>
            {{ $t('label.account') }}
          </div>
        </v-col>
        <v-col cols="8" class="form-title">
          <div>
            {{ userInfo.account }}
          </div>
        </v-col>
        <v-col cols="4" class="form-title pl-4">
          <div>
            {{ $t('basic.permission.type', {type: $t('basic.project.admin')}) }}
          </div>
        </v-col>
        <v-col cols="8" class="form-title">
          <v-switch v-model="isAdmin" color="primary" />
        </v-col>
      </v-row>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {PROJECT_USER_ROLES} from '@/constants/Constants';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import useProjects from '@/composables/useProjects';

const {execUpdateProjectRole} = useProjects();
const emit = defineEmits(['afterSubmit', 'closeDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  userInfo: {
    type: Object,
    required: true,
  },
  projectId: {
    type: String,
    default: '',
  },
});

const initValue = ref(false);
const isAdmin = ref(false);

watch(
  () => props.userInfo,
  () => {
    isAdmin.value =
      props.userInfo?.tenantRole === PROJECT_USER_ROLES.TENANT_ADMIN;
    initValue.value = isAdmin.value;
  },
);

const handleSubmit = async () => {
  if (initValue.value !== isAdmin.value) {
    await execUpdateProjectRole(
      props.projectId,
      props.userInfo.userId,
      isAdmin.value
        ? PROJECT_USER_ROLES.TENANT_ADMIN
        : PROJECT_USER_ROLES.TENANT_MEMBER,
    ).then(() => {
      emit('afterSubmit', true);
    });
  }
};

const handleClose = () => {
  emit('closeDialog');
};
</script>
