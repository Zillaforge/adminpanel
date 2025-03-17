<template>
  <v-row class="justify-center" no-gutters>
    <CommonDialog
      :title="$t('basic.create.type', {type: $t('network.provider')})"
      :showDialog="showDialog"
      :disableSubmit="!isCreateValid || securityGroupsRef?.hasErrors"
      @close="closeDialog"
      @submit="handleCreate"
    >
      <v-col cols="12" class="px-0">
        <v-form v-model="isCreateValid">
          <TextFieldWithHint
            v-model="createProviderInfo.providerNetworkId"
            :inputTitle="$t('network.provider.uuid')"
            :input-tooltip="$t('tips.network.provider.uuid')"
            :isRequired="true"
            :maxLengthLimit="64"
            :noGutters="true"
            :title-field-col="4"
            :column-width="7"
          />
          <TextFieldWithHint
            v-model="createProviderInfo.name"
            :inputTitle="$t('basic.name')"
            :isRequired="true"
            :maxLengthLimit="64"
            :noGutters="true"
            :title-field-col="4"
            :column-width="7"
          />
          <TextFieldWithHint
            v-model="createProviderInfo.description"
            :inputTitle="$t('basic.desc')"
            :noGutters="true"
            :title-field-col="4"
            :column-width="7"
          />
          <MultipleInputSetter
            ref="securityGroupsRef"
            required
            :title="$t('network.security.group.id')"
            :params="createProviderInfo.securityGroupIds"
            :column-infos="[
              {
                type: 'text-input',
                colsNumber: 7,
                placeholder: $t('network.security.group.id'),
              },
            ]"
            :title-cols="4"
            @add-new-item="addSecurityGroup"
            @delete-item="removeSecurityGroup"
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
// import useBasics from '@/composables/useBasics';

import useNetworks from '@/composables/useNetworks';
import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';

// const {t, tc} = useBasics();
const securityGroupsRef = ref<InstanceType<typeof MultipleInputSetter> | null>(
  null,
);

const {execCreateProviderNetwork} = useNetworks(
  PAGE_TYPES.NETWORK_PROVIDER_LIST,
);
const emit = defineEmits(['closeDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  submitCallback: {
    type: Function,
    default: undefined,
  },
});
const isCreateValid = ref(false);
const createProviderInfo = ref<Record<string, any>>({
  providerNetworkId: '',
  name: '',
  description: '',
  securityGroupIds: [{id: ''}],
});

const handleCreate = async () => {
  await execCreateProviderNetwork({
    name: createProviderInfo.value.name,
    opsk_net_uuid: createProviderInfo.value.providerNetworkId,
    description: createProviderInfo.value.description,
    sg_ids: createProviderInfo.value.securityGroupIds.map(
      (sg: {id: string}) => sg.id,
    ),
  }).then(async () => {
    await props.submitCallback?.();
    closeDialog();
  });
};

const closeDialog = () => {
  emit('closeDialog');
};
const handleResetDialog = () => {
  Object.keys(createProviderInfo.value).forEach((key: string) => {
    if (Array.isArray(createProviderInfo.value[key])) {
      console.log('key: ', key);
    } else {
      createProviderInfo.value[key] = '';
    }
  });
};

const addSecurityGroup = () => {
  createProviderInfo.value.securityGroupIds.push({id: ''});
};
const removeSecurityGroup = (index: number) => {
  createProviderInfo.value.securityGroupIds.splice(index, 1);
};

watch(
  () => props.showDialog,
  (newVal) => {
    if (newVal) {
      handleResetDialog();
    }
  },
);
</script>
