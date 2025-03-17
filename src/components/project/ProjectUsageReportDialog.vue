<script setup lang="ts">
import {computed, ref, onMounted, watch, type PropType} from 'vue';
import useResource from '@/composables/useResource';

import CommonDialog from '@/components/common/CommonDialog.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import SelectComponent from '@/components/common/SelectComponent.vue';

const currentDate = ref(new Date());
const selectedMonth = ref<number>(currentDate.value?.getMonth() + 1);
const selectedYear = ref<number>(currentDate.value?.getFullYear());
const selectedYearMin = ref<number>(2025);
const selectedYearMax = computed(() => currentDate.value?.getFullYear());
const showDialog = defineModel<boolean>('show', {required: true});
const props = defineProps({
  projectInfo: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
});
const {execFetchUsageReportResourceList, execDownloadProjectUsageReport} =
  useResource();

const listMonths = ref<number[]>([]);
const fetchData = () => {
  listMonths.value = generateMonthList(selectedYear.value);
};

const listYears = computed(() => {
  const listLength = selectedYearMax.value - selectedYearMin.value + 1;

  return Array.from(
    {length: listLength},
    (num, i) => i + selectedYearMin.value,
  );
});

const handleCloseDialog = () => {
  showDialog.value = false;
  selectedMonth.value = currentDate.value?.getMonth() + 1;
  selectedYear.value = currentDate.value?.getFullYear();
};

const handleDownload = async () => {
  const strDate =
    selectedYear.value + String(selectedMonth.value).padStart(2, '0');
  handleCloseDialog();
  const resourceList = await execFetchUsageReportResourceList();
  const reportBlob = await execDownloadProjectUsageReport({
    projectId: props.projectInfo?.projectId,
    month: strDate,
    resources: resourceList,
  });
  if (reportBlob && reportBlob instanceof Blob) {
    const fileName = `${
      props.projectInfo?.displayName ?? 'usage-report'
    }-${strDate}.zip`;
    const url = window.URL.createObjectURL(new Blob([reportBlob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const generateMonthList = (year: number) => {
  return year < currentDate.value?.getFullYear()
    ? Array.from({length: 12}, (num, i) => i + 1)
    : Array.from(
        {length: currentDate.value?.getMonth() + 1},
        (num, i) => i + 1,
      );
};

onMounted(() => {
  fetchData();
});

watch(
  () => selectedYear.value,
  () => {
    if (selectedYear.value === currentDate.value?.getFullYear()) {
      if (selectedMonth.value > currentDate.value?.getMonth()) {
        selectedMonth.value = 1;
      }
    }
  },
);
</script>

<template>
  <CommonDialog
    :show-dialog="showDialog"
    :submit-btn-text="$t('basic.download')"
    :title="$t('report.project.usage')"
    @submit="handleDownload"
    @close="handleCloseDialog"
  >
    <v-row no-gutters>
      <v-col cols="12">
        <TextFieldWithHint
          :model-value="projectInfo.displayName"
          :disabled="true"
          :fillLayout="true"
          :inputTitle="$t('basic.name.type', {type: $t('basic.project')})"
          :showBoarder="false"
          :no-gutters="true"
        />
      </v-col>
      <v-col cols="3" class="form-title-compact mt-2">
        <span class="input-required">
          {{ $t('report.duration') }}
        </span>
      </v-col>
      <v-col cols="9" class="pl-3">
        <v-row no-gutters>
          <v-col cols="4">
            <SelectComponent
              v-model="selectedYear"
              :items="listYears"
              :placeholder="$t('label.year')"
              @update:model-value="listMonths = generateMonthList($event)"
            />
          </v-col>
          <v-col cols="1" class="align-self-center text-center">
            {{ $t('label.year') }}
          </v-col>
          <v-col cols="1" />
          <v-col cols="4">
            <SelectComponent
              v-model="selectedMonth"
              :items="listMonths"
              :placeholder="$t('label.month')"
            />
          </v-col>
          <v-col cols="1" class="align-self-center text-center pl-1">
            {{ $t('label.month') }}
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </CommonDialog>
</template>
