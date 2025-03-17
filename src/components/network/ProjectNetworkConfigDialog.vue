<template>
  <v-row class="justify-center">
    <CommonDialog
      :title="
        $t('basic.management.type', {type: $t('project.network.external')})
      "
      :showDialog="showDialog"
      :disableSubmit="!validConfig"
      @submit="handleApplyConfig"
      @close="handleClose"
    >
      <v-col cols="12">
        <v-form ref="formEdit" v-model="validConfig">
          <TextFieldWithHint
            :model-value="item.name"
            :disabled="true"
            :fillLayout="true"
            :inputTitle="$t('basic.name')"
            :showBoarder="false"
          />
          <SelectWithHint
            v-model="zonePublicSetting"
            :inputTitle="
              globalStore.getIsPilotRegion
                ? $t('network.external')
                : $t('basic.network.type', {type: $t('basic.zone.public')})
            "
            :items="networkPublicZoneList"
            itemText="title"
            itemValue="id"
            is-required
            is-return-object
            fillLayout
          />
          <SelectWithHint
            v-if="!globalStore.getIsPilotRegion"
            v-model="zonePrivateSetting"
            :inputTitle="
              $t('basic.network.type', {type: $t('basic.zone.private')})
            "
            :items="networkPrivateZoneList"
            itemText="title"
            itemValue="id"
            is-required
            is-return-object
            fillLayout
          />
        </v-form>
      </v-col>
    </CommonDialog>
  </v-row>
</template>

<script setup lang="ts">
import {computed, ref, watch, onMounted} from 'vue';
import {useGlobal} from '@/store';
import {type NetworkItemInterface} from '@/interfaces/DataTypeInterface';
import {TRUSTED_CLOUD_NAMESPACE} from '@/constants/Constants';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import useNetworks from '@/composables/useNetworks';
const {
  networkList,
  execFetchNetworkList,
  execUpdateExtNetworkProjectAssociation,
} = useNetworks('');

const zonePublicSetting = ref({
  title: '',
  id: '',
});
const zonePrivateSetting = ref({
  title: '',
  id: '',
});
const globalStore = useGlobal();
const validConfig = ref(false);
const emit = defineEmits(['closeDialog', 'afterSubmit']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
});

const networkPublicZoneList = computed(() => {
  if (Array.isArray(networkList.value)) {
    return networkList.value
      .filter(
        (network: NetworkItemInterface) =>
          network.namespace === TRUSTED_CLOUD_NAMESPACE.PUBLIC,
      )
      .map((network) => {
        return {
          title: network.name,
          id: network.id,
        };
      });
  }
  return [];
});

const networkPrivateZoneList = computed(() => {
  if (Array.isArray(networkList.value)) {
    return networkList.value
      .filter(
        (network: NetworkItemInterface) =>
          network.namespace === TRUSTED_CLOUD_NAMESPACE.PRIVATE,
      )
      .map((network) => {
        return {
          title: network.name,
          id: network.id,
        };
      });
  }
  return [];
});

onMounted(async () => {
  await execFetchNetworkList();
});

watch(
  () => props.showDialog,
  async () => {
    zonePublicSetting.value = {
      title: props.item?.public?.name ?? '',
      id: props.item?.public?.id ?? '',
    };
    zonePrivateSetting.value = {
      title: props.item?.private?.name ?? '',
      id: props.item?.private?.id ?? '',
    };
  },
);

const handleApplyConfig = async () => {
  execUpdateExtNetworkProjectAssociation(
    zonePrivateSetting.value.id,
    props.item.projectId,
  ).then(() => {
    execUpdateExtNetworkProjectAssociation(
      zonePublicSetting.value.id,
      props.item.projectId,
    );
    emit('afterSubmit');
    handleClose();
  });
};
const handleClose = () => {
  emit('closeDialog');
};
</script>
