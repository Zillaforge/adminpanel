<template>
  <v-row class="justify-center">
    <CommonDialog
      :title="$t('basic.add.type', {type: $t('basic.association')})"
      :showDialog="showDialog"
      :disableSubmit="vmServerIdsRef?.hasErrors"
      @close="showDialog = false"
      @submit="handleSubmit"
    >
      <v-col cols="12" class="px-0">
        <MultipleInputSetter
          ref="vmServerIdsRef"
          required
          :title="$t('service.vm.name') + ' ID'"
          :params="vmServerIds"
          :column-infos="[
            {
              type: 'text-input',
              colsNumber: 8,
              placeholder: $t('service.vm.name') + ' ID',
            },
          ]"
          :disable-add-item="disableAddItem"
          @add-new-item="addServerId"
          @delete-item="removeServerId"
        />
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import CommonDialog from '@/components/common/CommonDialog.vue';

import MultipleInputSetter from '@/components/common/MultipleInputSetter.vue';

const vmServerIdsRef = ref<InstanceType<typeof MultipleInputSetter> | null>(
  null,
);
const vmServerIds = ref<{id: string}[]>([{id: ''}]);
const showDialog = defineModel<boolean>('show', {required: true});
const props = defineProps({
  submitCallback: {
    type: Function,
    default: undefined,
  },
  maxAddAmount: {
    type: Number,
    default: -1,
  },
});

const handleSubmit = async () => {
  await props.submitCallback?.(
    vmServerIds.value.map((serverId: {id: string}) => serverId.id),
  );
};

const addServerId = () => {
  vmServerIds.value.push({id: ''});
};
const removeServerId = (index: number) => {
  vmServerIds.value.splice(index, 1);
};

const disableAddItem = computed(() =>
  props.maxAddAmount < 0
    ? false
    : vmServerIds.value.length === props.maxAddAmount,
);

watch(
  () => showDialog.value,
  (newValue) => {
    if (newValue) {
      vmServerIds.value = [{id: ''}];
    }
  },
);
</script>
