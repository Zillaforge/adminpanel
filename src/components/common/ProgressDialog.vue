<template>
  <v-dialog v-model="isShow" persistent :width="400">
    <v-card>
      <v-card-text class="mt-1 mb-1 text--primary text-center would_break">
        {{ message }}
        <v-progress-linear
          height="8"
          indeterminate
          color="primary"
          class="mb-0 mt-3"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';

const {t} = useBasics();
const globalStore = useGlobal();
const duringDialog = ref(false);
const isShow = ref(false);
const message = ref('');
watch(
  () => globalStore.getProgressDlgState,
  (newVal) => {
    // uiDialog.value = globalStore.dialog;
    // showDialog.value = globalStore.dialog.show;
    // To fix the progress bar would not show on the top of the element layer
    setTimeout(() => (isShow.value = newVal.show || false), 0);
    if (newVal.show) {
      window.setTimeout((duringDialog.value = true), 300);
    } else {
      duringDialog.value = false;
    }
    if (newVal)
      message.value =
        newVal.message !== '' ? newVal.message : t('system.process');
  },
);
</script>

<style scoped>
.would_break {
  white-space: pre-line;
  /*padding-top: 0;*/
  overflow-wrap: break-word;
}
</style>
