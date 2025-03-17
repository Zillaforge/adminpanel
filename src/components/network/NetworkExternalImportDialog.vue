<template>
  <CommonDialog
    :disable-submit="!inputValid"
    :title="$t('basic.import.type', {type: $t('network.external')})"
    :showDialog="showDialog"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <v-row no-gutters>
      <v-col cols="12">
        <v-form v-model="inputValid">
          <SelectWithHint
            v-model="newNetworkItem.extNet"
            :inputTitle="`${$t('network.external')}`"
            :items="unusedExtNetworks"
            :isRequired="true"
            :fillLayout="true"
            :noGutters="true"
            :no-data-text="$t('network.unused.extNet.no.data')"
            show-item-props
          />
          <RadioButtonSwitch
            v-if="!globalStore.getIsPilotRegion"
            :col-title-width="3"
            is-inline
            :isRequired="true"
            :options="[
              {label: $t('basic.zone.public'), value: true},
              {label: $t('basic.zone.private'), value: false},
            ]"
            :init-value="newNetworkItem.isPublic"
            :title="$t('basic.zone')"
            @select="(event: boolean) => {
                newNetworkItem.isPublic = event;
              }
            "
          />
        </v-form>
      </v-col>

      <v-col cols="3" class="form-title pt-4">
        {{ $t('network.default') }}
      </v-col>
      <v-col cols="9" class="align-self-center pt-4 label">
        <v-checkbox
          v-model="newNetworkItem.isDefaultNetwork"
          :label="$t('network.label.set.as.default')"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobal} from '@/store';
import useNetworks from '@/composables/useNetworks';
import {TRUSTED_CLOUD_NAMESPACE} from '@/constants/Constants';
import {getDeepObj} from '@/utils/utils';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import RadioButtonSwitch from '@/components/common/RadioButtonSwitch.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';

const globalStore = useGlobal();
const inputValid = ref(true);
const unusedExtNetworks = ref<Array<Record<string, string>>>([]);
const emit = defineEmits(['afterSubmit', 'closeDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
});
const route = useRoute();

const {execFetchUnusedExtNetworkList, execImportExternalNetworkItem} =
  useNetworks(route.name as string);

const resetInput = () => {
  return {
    extNet: undefined,
    isPublic: true,
    isDefaultNetwork: false,
  };
};

const newNetworkItem = ref(resetInput());
const handleSubmit = async () => {
  await execImportExternalNetworkItem({
    is_default: newNetworkItem.value.isDefaultNetwork,
    namespace: newNetworkItem.value.isPublic
      ? TRUSTED_CLOUD_NAMESPACE.PUBLIC
      : TRUSTED_CLOUD_NAMESPACE.PRIVATE,
    opsk_extnetwork_id: getDeepObj(newNetworkItem.value, 'extNet.id'),
  });
  emit('afterSubmit');

  handleClose();
};

const handleClose = () => {
  emit('closeDialog');
};

watch(
  () => props.showDialog,
  async (newValue) => {
    if (newValue) {
      newNetworkItem.value = resetInput();
      unusedExtNetworks.value = await execFetchUnusedExtNetworkList();
    }
  },
);
</script>

<style lang="scss" scoped>
.label {
  :deep(.v-label) {
    opacity: 1 !important;
  }
}
</style>
