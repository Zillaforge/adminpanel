<template>
  <CommonDialog
    :title="$t('table.action.config.permission')"
    :showDialog="showDialog"
    :disableSubmit="!disableSubmit"
    @submit="handleSubmit"
    @close="showDialog = false"
  >
    <template #between-title-and-text>
      <v-row>
        <v-col cols="3" class="form-title pl-4">
          <div>
            {{ $t('label.account') }}
          </div>
        </v-col>
        <v-col cols="9" class="form-content content-style">
          <div>
            {{ membershipInfo.account }}
          </div>
        </v-col>
        <v-col cols="3" class="form-title pl-4">
          <span class="input-required">{{ $t('basic.permission') }}</span>
        </v-col>
        <v-col cols="9" class="form-content">
          <v-row no-gutters>
            <v-col v-for="(admin, index) in adminTypes" :key="index" cols="4">
              <v-checkbox
                v-model="admin.checked"
                class="mt-0 admin-option"
                color="primary"
                :label="$t(admin.labelId)"
                density="compact"
                hide-details
                :disabled="
                  isIServiceAccount &&
                  admin.permission === ADMIN_TYPE.SYSTEM_ADMIN
                "
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </CommonDialog>
</template>

<script setup lang="ts">
import {computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
import {ADMIN_TYPE, ISERVICE_NAMESPACE} from '@/constants/Constants';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';

const {isSiteOrSystemAdmin} = useBasics();
const {adminTypes, execUpdateAdminRole} = useProjects();

const showDialog = defineModel<boolean>('show', {required: false});
const props = defineProps({
  membershipInfo: {
    type: Object,
    required: true,
  },
  submitCallback: {
    type: Function,
    default: undefined,
  },
});

const disableSubmit = computed(() =>
  adminTypes.value.some((type: Record<string, any>) => type.checked),
);

const isIServiceAccount = computed(
  () => props.membershipInfo?.user?.namespace === ISERVICE_NAMESPACE,
);

watch(
  () => props.membershipInfo,
  () => {
    adminTypes.value.forEach((type: Record<string, any>) => {
      type.checked = isSiteOrSystemAdmin(
        props.membershipInfo?.extra?.opUserMode ?? ADMIN_TYPE.SITE_ADMIN,
        type.permission,
      );
    });
  },
);

const handleSubmit = async () => {
  let adminTypeConfig = 0;
  adminTypes.value.forEach((type) => {
    if (type.checked) {
      adminTypeConfig += type.permission;
    }
  });

  await execUpdateAdminRole(
    props.membershipInfo.projectId,
    props.membershipInfo.user.userId,
    adminTypeConfig,
  ).then(() => {
    props.submitCallback?.();
  });

  showDialog.value = false;
};
</script>

<style lang="scss" scoped>
.content-style {
  align-items: center;
  display: flex;
}

.admin-option {
  :deep(.v-label) {
    padding-left: 20px;
  }
  :deep(.v-checkbox-btn .v-selection-control__input) {
    &:hover {
      background-color: rgba(
        var(--v-theme-btn-texted-active-bg),
        var(--v-btn-texted-active-bg-opacity)
      ) !important;
      border-radius: 50%;
    }
  }
}
</style>
