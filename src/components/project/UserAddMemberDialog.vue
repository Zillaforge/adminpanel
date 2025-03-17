<template>
  <v-dialog :model-value="showDialog" max-width="900px" persistent>
    <v-card>
      <v-card-title class="headline-style pt-5 px-6">
        {{ $t('basic.add.type', {type: $t('basic.admin')}) }}
      </v-card-title>
      <v-card-text class="pt-0">
        <v-row no-gutters>
          <v-col cols="2" class="title-style">
            <span class="input-required">{{ $t('label.admin.list') }}</span>
          </v-col>
          <v-col cols="10">
            <v-textarea
              v-model="inputValue"
              :rows="3"
              :placeholder="
                $t('tips.addUser.placeholder', {domain: 'example.com'})
              "
              :disabled="loading"
              variant="solo"
              hide-details
              no-resize
            />
          </v-col>
          <v-col cols="2" />
          <v-col cols="10">
            <OutlinedBtn
              :text="$t('basic.add')"
              :disabled="!inputValue || loading"
              class="my-6"
              @click="handleAddAction"
            />
          </v-col>
          <v-col cols="2" />
          <v-col cols="10">
            <div class="chip-area rounded">
              <v-chip
                v-for="(user, index) in displayChipList"
                :key="`user${user.account}`"
                :color="user.isValid ? '' : 'error'"
                :prepend-icon="
                  user.isValid
                    ? 'mdi-account-circle'
                    : 'mdi-alert-circle-outline'
                "
                class="ma-2"
                closable
                @click:close="removeChip(index)"
              >
                <span>{{ user.account }}</span>
                <v-tooltip
                  v-if="!user.isValid && user.message"
                  location="top"
                  activator="parent"
                >
                  {{ user.message }}
                </v-tooltip>
              </v-chip>
            </div>
          </v-col>
          <v-col cols="2" class="mt-6 title-style">
            <span class="input-required">{{ $t('basic.permission') }}</span>
          </v-col>
          <v-col cols="10" class="mt-6">
            <v-row no-gutters>
              <v-col v-for="(admin, index) in adminTypes" :key="index" cols="4">
                <v-checkbox
                  v-model="admin.checked"
                  class="mt-0 admin-option"
                  color="primary"
                  :label="$t(admin.labelId)"
                  density="compact"
                  hide-details
                  @update:model-value="handlePermissionTypeChecked(admin)"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="2" />
          <v-col cols="10">
            <span v-show="showAlertMsg" class="delete-alert">
              {{ $t('tips.config.admin.permission') }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-end px-6 pb-4">
        <TextBtn :text="$t('basic.cancel')" @click="$emit('closeDialog')" />

        <TextBtn
          :text="$t('basic.ok')"
          :disabled="loading || disableSubmitBtn"
          @click="handleSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
ㄝ
<script setup lang="ts">
import {ref, watch, computed, type PropType} from 'vue';
import {ADMIN_TYPE, ISERVICE_NAMESPACE} from '@/constants/Constants';
import useProjects from '@/composables/useProjects';
import useBasics from '@/composables/useBasics';
import {type ProjectMembershipInterface} from '@/interfaces/DataTypeInterface';
import TextBtn from '@/components/common/button/TextBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  allUserList: {
    type: Array<any>,
    default: () => [],
  },
  originMemberList: {
    type: Array as PropType<ProjectMembershipInterface[]>,
    default: () => [],
  },
  submitCallback: {
    type: Function,
    default: undefined,
  },
});

const {adminTypes} = useProjects();
const {t} = useBasics();
defineEmits(['closeDialog']);
const inputValue = ref('');
const displayChipList = ref<any[]>([]);
const loading = ref<boolean>(false);
const typeSysAdmin =
  adminTypes.value.find(
    (type) => type.permission === ADMIN_TYPE.SYSTEM_ADMIN,
  ) ?? adminTypes.value?.[1];

const newUserIdList = computed(() => {
  return displayChipList.value
    .filter((el) => el.isValid)
    .map((user) => user.userId || user.id);
});

const showAlertMsg = computed(
  () => !adminTypes.value.some((type: Record<string, any>) => type.checked),
);

const disableSubmitBtn = computed(
  () => newUserIdList.value.length === 0 || (showAlertMsg.value as boolean),
);

const verifyUserAccount = (
  inputUser: string | {account: string; namespace: string},
) => {
  const userAccount =
    typeof inputUser === 'object' ? inputUser.account : inputUser;
  const matchUser = props.allUserList.find(
    (user: any) => user.account?.toLowerCase() === userAccount,
  );
  if (!matchUser) {
    return {
      account: userAccount,
      isValid: false,
      message: t('tips.account.not.exist'),
    };
  }

  const matchOriginMemberList = props.originMemberList.find(
    (member: any) => member?.account?.toLowerCase() === userAccount,
  );

  if (matchOriginMemberList) {
    return {
      ...matchOriginMemberList,
      isValid: false,
      message: t('tips.account.already.had.admin.permission'),
    };
  }

  const valid = !(
    matchUser.namespace === ISERVICE_NAMESPACE && typeSysAdmin.checked
  );
  return {
    ...matchUser,
    isValid: valid,
    message: !valid ? t('tips.account.not.for.system.admin') : '',
  };
};

const handleSubmit = async () => {
  let adminTypeConfig = 0;
  adminTypes.value.forEach((type) => {
    if (type.checked) {
      adminTypeConfig += type.permission;
    }
  });

  await props.submitCallback?.(newUserIdList.value, {
    extra: {opUserMode: adminTypeConfig},
  });
};

const handlePermissionTypeChecked = (adminType: Record<string, any>) => {
  if (adminType.permission !== ADMIN_TYPE.SYSTEM_ADMIN) return;

  displayChipList.value.forEach(
    (chip: {
      account: string;
      namespace: string;
      message?: string;
      isValid: boolean;
    }) => {
      const verifiedUser = verifyUserAccount(chip);
      chip.isValid = verifiedUser.isValid;
      chip.message = verifiedUser.message;
    },
  );
};

const handleAddAction = async () => {
  loading.value = true;
  const inputValueList = inputValue.value.split(',');

  inputValueList.forEach((inputValueStr: string) => {
    const inputValue = inputValueStr.trim().toLowerCase();
    if (!inputValue) {
      return;
    }
    const matchInputChip = displayChipList.value.find(
      (chipValue: any) => chipValue.account?.toLowerCase() === inputValue,
    );
    const displayUser = verifyUserAccount(inputValue);
    if (!matchInputChip) {
      displayChipList.value.push(displayUser);
    }
  });

  inputValue.value = '';
  loading.value = false;
};

const removeChip = (index: number) => {
  displayChipList.value.splice(index, 1);
};

watch(
  () => props.showDialog,
  (val) => {
    if (val) {
      // init value
      inputValue.value = '';
      displayChipList.value = [];
      loading.value = false;
    }
  },
);
</script>

<style scoped lang="scss">
.chip-area {
  height: 180px;
  padding: 16px;
  overflow-y: auto;
  border: 1px solid
    rgba(var(--v-theme-card-border-color), var(--v-card-border-opacity));

  :deep(.v-chip:not(.text-error)) {
    &:hover {
      color: rgb(var(--v-theme-primary)) !important;
    }

    :deep(.text-error) {
      color: rgb(var(--v-theme-error)) !important;
    }
  }
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

.title-style {
  padding-top: 10px;
}
</style>
