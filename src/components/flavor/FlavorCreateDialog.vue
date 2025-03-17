<template>
  <v-row class="justify-center">
    <CommonDialog
      :key="dialogKey"
      :title="dialogTitle"
      :showDialog="showDialog"
      :disableSubmit="!isValidToCreate"
      @close="handleResetDialog"
      @submit="handleCreate"
    >
      <v-col cols="12">
        <v-form v-model="isValidToCreate">
          <TextFieldWithHint
            v-model="createFlavorInfo.name"
            :inputTitle="$t('basic.name')"
            :isRequired="true"
            :fillLayout="true"
            :maxLengthLimit="64"
          />
          <TextFieldWithHint
            v-if="checkHeaders('metadata.nodes')"
            v-model="createFlavorInfo.nodes"
            :inputTitle="$t('basic.node')"
            :hintType="'minValue'"
            :numberMin="'1'"
            :isRequired="true"
            :fillLayout="true"
            :maxLengthLimit="6"
            type="number"
          />
          <SelectWithHint
            v-if="checkHeaders('gpuType') && gpuList.length > 0"
            v-model="createFlavorInfo.gpuType"
            :inputTitle="$t('flavor.gpu.type')"
            :items="gpuList"
            itemText="title"
            itemValue="id"
            fillLayout
            is-return-object
          />
          <SelectWithHint
            v-if="azList && azList.length > 0"
            v-model="createFlavorInfo.az"
            :inputTitle="$t('flavor.availability.zone')"
            :items="azList"
            fillLayout
          />
          <TextFieldWithHint
            v-if="gpuList.length > 0"
            v-model="createFlavorInfo.gpu"
            :inputTitle="gpuInputTitle"
            :hintType="createFlavorInfo.gpuType?.vgpu ? 'vGpu' : 'minValue'"
            :input-rules="createFlavorInfo.gpuType?.vgpu ? [
              (val: string) => !rangeCheck(val, 1, 0) || $t('tips.vgpu.amount.limit'),
            ] : []"
            :input-hints=" createFlavorInfo.gpuType?.vgpu
              ? (val: string) => updInputHints(!rangeCheck(val, 1, 0), $t('tips.vgpu.amount.limit'))
              : undefined
            "
            :fillLayout="true"
            :maxLengthLimit="5"
            :numberMin="'0'"
            :numberMax="createFlavorInfo.gpuType?.vgpu ? '1' : ''"
            type="number"
          />
          <TextFieldWithHint
            v-model.number="createFlavorInfo.cpu"
            :inputTitle="cpuInputTitle"
            :hintType="'minValue'"
            :numberMin="'1'"
            :isRequired="true"
            :fillLayout="true"
            :maxLengthLimit="6"
            type="number"
          />
          <TextFieldWithHint
            v-model="createFlavorInfo.memory"
            :inputTitle="memoryInputTitle"
            :hintType="'minValue'"
            :numberMin="'1'"
            :isRequired="true"
            :fillLayout="true"
            :maxLengthLimit="6"
            type="number"
          />
          <TextFieldWithHint
            v-if="checkHeaders('disk')"
            v-model="createFlavorInfo.disk"
            :inputTitle="$t('flavor.disk') + ` (${$t('storage.disk.unit.gb')})`"
            :hintType="'minValue'"
            :numberMin="'1'"
            :isRequired="true"
            :fillLayout="true"
            :maxLengthLimit="6"
            type="number"
          />
          <SelectWithHint
            v-if="checkHeaders('metadata.partition')"
            v-model="createFlavorInfo.partition"
            :inputTitle="$t('basic.partition')"
            :items="rdsSystemScopes.allow_partitions"
            :isRequired="true"
            :fillLayout="true"
          />
          <SelectWithHint
            v-if="checkHeaders('provider')"
            v-model="createFlavorInfo.environment"
            :inputTitle="$t('flavor.environment')"
            :items="rdsSystemScopes.allow_providers"
            itemText="title"
            itemValue="id"
            :isRequired="true"
            fillLayout
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref, type PropType, onMounted, watch} from 'vue';
import useFlavors from '@/composables/useFlavors';
import useBasics from '@/composables/useBasics';
import {FLAVOR_TYPE} from '@/constants/Constants';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {rangeCheck, updInputHints} from '@/utils/utils';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import {uiShowProgress, uiHideProgress} from '@/utils/progressFunctions';

const {t, tc} = useBasics();
const emit = defineEmits(['closeDialog', 'triggerFetch']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  flavorType: {
    type: String,
    required: true,
  },
  headers: {
    type: Array as PropType<DataTableHeader[]>,
    required: true,
  },
  projectId: {
    type: String,
    default: '',
  },
});
const azList = ref<Record<string, any>[]>([]);
const isValidToCreate = ref(false);
const {
  gpuList,
  rdsSystemScopes,
  execCreateFlavor,
  execFetchGpuModelList,
  execFetchRdsSystemScopes,
  execFetchAvailabilityZones,
} = useFlavors('FlavorManagement');
const createFlavorInfo = ref<Record<string, any>>({});
const dialogKey = ref(0);

const isVmFlavor = computed(() => props.flavorType === FLAVOR_TYPE.VM);

const dialogTitle = computed(() =>
  isVmFlavor.value
    ? t('basic.create.type', {type: tc('flavor.vm', 2)})
    : t('basic.create.type', {type: tc('flavor.remote.delivery', 2)}),
);

const gpuInputTitle = computed(() =>
  isVmFlavor.value
    ? `${t('flavor.gpu')} (${t('flavor.gpu.unit')})`
    : `${t('flavor.gpu')} (${t('flavor.gpu.unit')} / ${t('basic.node')})`,
);

const cpuInputTitle = computed(() =>
  isVmFlavor.value
    ? `${t('flavor.cpu')} (${t('flavor.cpu.unit')})`
    : `${t('flavor.cpu')} (${t('flavor.cpu.unit')} / ${t('basic.task')})`,
);

const memoryInputTitle = computed(() =>
  isVmFlavor.value
    ? `${t('flavor.memory')} (${t('flavor.memory.unit.gb')})`
    : `${t('flavor.memory')} (${t('flavor.memory.unit.gb')} / CPU Core)`,
);

const handleCreate = async () => {
  uiShowProgress();
  let flavorPrefix: string = 'vps';
  if (props.flavorType === FLAVOR_TYPE.REMOTE_DELIVERY) {
    flavorPrefix = 'rds';
    const flavorBody = {
      name: createFlavorInfo.value.name || '',
      provider: createFlavorInfo.value.environment,
      metadata: {
        nodes: createFlavorInfo.value?.nodes.toString(),
        cpus_per_task: Number(createFlavorInfo.value?.cpu),
        memory_per_cpu: Number(createFlavorInfo.value.memory) * 1024,
        gpus_per_node: Number(createFlavorInfo.value?.gpu ?? 0),
        partition: createFlavorInfo.value.partition,
      },
    };
    await execCreateFlavor(flavorBody, flavorPrefix).then(() =>
      uiHideProgress(),
    );
  } else {
    // console.log('handleCreate', createFlavorInfo.value);
    const flavorBody = {
      ...createFlavorInfo.value,
      gpu:
        Number(createFlavorInfo.value?.gpu) > 0 &&
        createFlavorInfo.value?.gpuType
          ? {
              count: Number(createFlavorInfo.value?.gpu),
              is_vgpu: createFlavorInfo.value?.gpuType?.vgpu ?? false,
              model: createFlavorInfo.value?.gpuType.id ?? '',
            }
          : null,
      disk: Number(createFlavorInfo.value.disk),
      memory: Number(createFlavorInfo.value.memory) * 1024,
      project_ids: [],
      public: false,
      vcpu: createFlavorInfo.value?.cpu,
    };
    await execCreateFlavor(flavorBody, flavorPrefix).then(() =>
      uiHideProgress(),
    );
  }

  handleResetDialog();
  emit('triggerFetch');
};
const checkHeaders = (fieldName: string) => {
  return props.headers.some(
    (header: DataTableHeader) => header.key === fieldName,
  );
};
const closeDialog = () => {
  emit('closeDialog');
};
const handleResetDialog = () => {
  dialogKey.value++;
  for (const key in createFlavorInfo.value) {
    if (Object.prototype.hasOwnProperty.call(createFlavorInfo.value, key)) {
      createFlavorInfo.value[key] = '';
    }
  }
  closeDialog();
};

const fetchData = async () => {
  if (props.flavorType === FLAVOR_TYPE.REMOTE_DELIVERY) {
    await execFetchRdsSystemScopes();
  } else if (props.flavorType === FLAVOR_TYPE.VM) {
    await execFetchGpuModelList();
    azList.value = await execFetchAvailabilityZones();
  }
};

onMounted(() => {
  fetchData();
});

watch(
  () => createFlavorInfo.value.gpuType,
  () => {
    if (createFlavorInfo.value.gpuType.vgpu) {
      createFlavorInfo.value.gpu = 1;
    }
    if (azList.value && azList.value.length > 0) {
      if (azList.value.includes(createFlavorInfo.value.gpuType?.id)) {
        createFlavorInfo.value.az = createFlavorInfo.value.gpuType?.id ?? '';
      } else {
        createFlavorInfo.value.az = '';
      }
    }
  },
);
</script>
