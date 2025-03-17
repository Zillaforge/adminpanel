<template>
  <v-dialog
    v-model="showDialog"
    :max-width="uiDialog.width ?? 800"
    persistent
    scrollable
  >
    <v-card class="px-2">
      <v-card-title v-if="uiDialog.title" class="headline-style">
        {{ uiDialog.title }}
      </v-card-title>
      <v-card-text class="would_break">
        <div v-if="uiDialog.isResourceConfirm" class="resource-conform">
          <v-row
            v-for="(item, index) in uiDialog.resourceInfo"
            :key="index"
            class="mb-4"
            no-gutters
          >
            <v-col cols="4" class="col-padding">{{ item.title }}</v-col>
            <v-col cols="8" class="col-padding">
              <pre>{{ getValue(item) }}</pre>
            </v-col>
          </v-row>
        </div>
        <v-row
          v-if="
            (uiDialog.type === 'delete' || uiDialog.type === 'warning') &&
            uiDialog.message
          "
          no-gutters
        >
          <v-col cols="1">
            <v-icon size="24" class="delete-alert">mdi-alert</v-icon>
          </v-col>
          <v-col cols="11" class="delete-alert mt-1">
            {{ uiDialog.message }}
          </v-col>
        </v-row>
        <div v-else style="white-space: pre-line">{{ uiDialog.message }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <TextBtn
          v-if="
            !uiDialog.hideCancelBtn &&
            (uiDialog.type === 'asking' ||
              uiDialog.type === 'delete' ||
              uiDialog.secondaryCallback)
          "
          :text="
            uiDialog.secondaryBtnText
              ? uiDialog.secondaryBtnText
              : $t('basic.cancel')
          "
          @click="secondaryAction()"
        />
        <TextBtn
          :text="
            uiDialog.isCreateConfirm
              ? $t('basic.yes')
              : uiDialog.btnText
              ? uiDialog.btnText
              : $t('basic.yes')
          "
          @click="primaryAction"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useGlobal} from '@/store';

import {ref, watch} from 'vue';

import TextBtn from '@/components/common/button/TextBtn.vue';

const showDialog = ref(false);
const globalStore = useGlobal();
const uiDialog = ref<Record<string, any>>({});

// methods
const getValue = (item: any) => {
  if (Array.isArray(item.value)) {
    return item.value.join('\n');
  }
  return item.value;
};
const primaryAction = () => {
  if (uiDialog.value.callback) {
    uiDialog.value.callback();
  }
  globalStore.uiHideDialog();
};
const secondaryAction = () => {
  if (uiDialog.value.secondaryCallback) {
    uiDialog.value.secondaryCallback();
  }
  globalStore.uiHideDialog();
};

watch(
  () => globalStore.dialog,
  () => {
    uiDialog.value = globalStore.dialog;
    showDialog.value = globalStore.dialog.show ?? false;
  },
);
</script>

<style lang="scss" scoped>
.would_break {
  white-space: pre-line;
  overflow-wrap: break-word;
  overflow-y: auto;
  padding: 0px 16px 16px !important;
}
.resource-conform {
  padding: 16px 0px 32px;
}
.col-padding {
  padding: 0px;
}
</style>
