<template>
  <CommonDialog
    :title="title"
    :showDialog="showDialog"
    :width="500"
    @submit="handleEdit"
    @close="closeDialog"
  >
    <v-row v-for="(resource, index) in resourceList" :key="index" no-gutters>
      <v-col cols="5">
        <div class="form-title">
          <span>{{ resource.title }}</span>
        </div>
      </v-col>
      <v-col cols="7" style="padding: 12px 6px">
        <v-checkbox
          v-model="configValues[resource.key]"
          class="mt-0 resource-checkbox"
          :label="$t('resource.review.label')"
          density="compact"
          hide-details
          color="rgb(var(--v-theme-text-highlight))"
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import useProjects from '@/composables/useProjects';
// components
import CommonDialog from '@/components/common/CommonDialog.vue';

const {t} = useBasics();
const emit = defineEmits(['closeDialog', 'successCallback', 'afterSubmit']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  resourceList: {
    type: Array<Record<string, any>>,
    default: () => [],
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});
const {execUpdateProjectInfo} = useProjects();

const configValues: Record<string, any> = ref({});

const title = computed(() => {
  return t('basic.management.type', {
    type: t('resource.review.mechanism'),
  });
});
watch(
  () => props.item,
  () => {
    configValues.value = {...props.item.extra?.resourceReview};
    props.resourceList.forEach((resource: Record<string, any>) => {
      configValues.value = {
        ...configValues.value,
        [resource.key]: props.item[resource.key] === 'enabled',
      };
    });
  },
  {deep: true},
);

const handleEdit = async () => {
  const newExtra = {
    ...props.item.extra,
    resourceReview: configValues.value,
  };

  await execUpdateProjectInfo(props.item.projectId, {extra: newExtra});
  closeDialog();
  emit('afterSubmit');
};
const closeDialog = () => {
  emit('closeDialog');
};
</script>

<style lang="scss" scoped>
.quota-padding {
  padding-left: 10px;
}

.resource-checkbox {
  :deep(.v-checkbox-btn label) {
    margin-left: 16px;
    .v-ripple__container {
      color: rgb(var(--v-theme-ripple-color)) !important;
    }
  }
}

.resource-checkbox {
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
