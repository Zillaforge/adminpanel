<template>
  <CommonDialog
    :title="title"
    :showDialog="showDialog"
    @submit="handleSubmit"
    @close="showDialog = false"
  >
    <v-row no-gutters>
      <v-col cols="4" class="form-title">
        <div>
          {{ $t('basic.name') }}
        </div>
      </v-col>
      <v-col cols="8" class="form-title">
        <div>
          {{ editItem.name }}
        </div>
      </v-col>
      <v-col cols="12" class="pt-4">
        <RadioButtonSwitch
          :col-title-width="4"
          is-inline
          :isRequired="true"
          :options="[
            {label: $tc('permission.private'), value: false},
            {label: $t('permission.public'), value: true},
          ]"
          :init-value="publicSelection"
          :title="$t('table.action.config.permission')"
          @select="
          (event: boolean) => {
            publicSelection = event;
          }
        "
        />
      </v-col>

      <v-col v-show="!publicSelection" cols="4" class="form-title pt-4">
        {{ $t('permission.granted.projects') }}
      </v-col>
      <v-col v-show="!publicSelection" :cols="8" class="align-self-center pt-4">
        <ComboboxMultiSelect
          v-model="selectedPublicList"
          :items="selectionList"
          allow-custom-value
          show-item-props
        />
      </v-col>
    </v-row>
  </CommonDialog>
</template>

<script setup lang="ts">
import {computed, ref, watch, onMounted} from 'vue';

import useProjects from '@/composables/useProjects';
import useBasics from '@/composables/useBasics';
import {type ProjectInfoInterface} from '@/interfaces/DataTypeInterface';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import RadioButtonSwitch from '@/components/common/RadioButtonSwitch.vue';
import ComboboxMultiSelect from '@/components/common/ComboboxMultiSelect.vue';

const publicSelection = ref(true);
const selectionList = ref<Array<Record<string, unknown>>>([]);
const selectedPublicList = ref<Array<Record<string, unknown>>>([]);
const editItem = defineModel<Record<string, any>>('item', {required: true});
const showDialog = defineModel<boolean>('show', {required: true});
const props = defineProps({
  submitCallback: {
    type: Function,
    default: undefined,
  },
  dialogTitle: {
    type: String,
    default: '',
  },
});

const {projectList, getProjects} = useProjects('');
const {t} = useBasics();

const fetchData = async () => {
  await getProjects();

  selectionList.value = projectList.value.map(
    (project: ProjectInfoInterface) => {
      return {
        title: project.extra?.iservice?.projectSysCode ?? '',
        value: project.projectId,
        subtitle: project.displayName,
      };
    },
  );
};

const handleSubmit = async () => {
  console.log('handleSubmit / Public?', publicSelection.value);
  console.log('Granted Project list', selectedPublicList.value);
  await props.submitCallback?.(
    publicSelection.value,
    selectedPublicList.value.map((proj) => proj.value),
  );
};

onMounted(() => {
  fetchData();
});

const title = computed(() =>
  props.dialogTitle ? props.dialogTitle : t('table.action.config.permission'),
);

watch(
  () => editItem.value,
  () => {
    publicSelection.value = ['active', 'permit-public'].includes(
      editItem.value.permission,
    );
    selectedPublicList.value = selectionList.value.filter(
      (select: Record<string, unknown>) =>
        editItem.value?.project_ids?.includes(select.value),
    );
  },
);
</script>
