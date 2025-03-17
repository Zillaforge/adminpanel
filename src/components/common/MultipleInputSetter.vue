<script setup lang="ts">
import {ref, computed} from 'vue';

import type {ExternalLinkItem} from '@/interfaces/LayoutItemInterface';

import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import IconBtn from '@/components/common/button/IconBtn.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';

interface ColumnInfo {
  header?: string;
  headerExternalLink?: ExternalLinkItem;
  placeholder?: string;
  type: 'text-input' | 'select';
  dataType?: 'name' | 'password' | 'passwordConfirm' | 'number';
  selectItems?: any[];
  colsNumber: number;
  required?: boolean;
  returnObject?: boolean;
}

const props = defineProps({
  params: {
    type: Array<Record<string, any>>,
    required: true,
  },
  title: {
    type: String,
    default: undefined,
  },
  titleCols: {
    type: Number,
    default: 3,
  },
  required: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  },
  columnInfos: {
    type: Array<ColumnInfo>,
    required: true,
  },
  hideAddItem: {
    type: Boolean,
    default: false,
  },
  hideDeleteItem: {
    type: Boolean,
    default: false,
  },
  disableAddItem: {
    type: Boolean,
    default: false,
  },
});

const showHeader = computed(() => {
  return props.columnInfos.find((info) => info.header);
});

const isFormValid = ref(false);
const refForm = ref<any>(null);
const keyList = computed(() => Object.keys(props.params[0] || {}));

const emit = defineEmits(['addNewItem', 'deleteItem', 'formError']);
const hasErrors = computed((): boolean => !isFormValid.value);
const validate = () => {
  refForm.value?.validate().then((res: any) => {
    emit('formError', res);
  });
};
defineExpose({hasErrors, validate});
</script>

<template>
  <div v-if="params.length">
    <v-form ref="refForm" v-model="isFormValid">
      <v-row v-if="showHeader" no-gutters class="align-center">
        <v-col v-if="title !== undefined" :cols="titleCols">
          <div class="ocis-pt-2-and-half">
            <span :class="{'ocis-input-required': required}">
              {{ title }}
            </span>
            <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
          </div>
        </v-col>
        <v-col
          v-for="(columnInfo, index) in columnInfos"
          :key="index"
          :cols="columnInfo.colsNumber"
          :class="{
            'pl-2': index > 0,
            'ocis-pt-2-and-half': true,
          }"
        >
          <span>{{ columnInfo.header }}</span>
          <ExternalLink
            v-if="columnInfo.headerExternalLink"
            :link="columnInfo.headerExternalLink"
          />
        </v-col>
      </v-row>
      <v-row v-for="(param, index) in params" :key="index" no-gutters>
        <v-col v-if="title !== undefined" :cols="titleCols">
          <div v-if="!showHeader && index === 0" class="ocis-form-title">
            <span :class="{'ocis-input-required': true}">
              {{ index === 0 ? title : '' }}
            </span>
            <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
          </div>
        </v-col>
        <v-col
          v-for="(columnInfo, columnIndex) in columnInfos"
          :key="columnIndex"
          :cols="columnInfo.colsNumber"
        >
          <TextFieldWithHint
            v-if="columnInfo.type === 'text-input'"
            v-model="param[keyList[columnIndex]]"
            :input-label="columnInfo.placeholder"
            :type="columnInfo.dataType ?? undefined"
            :fillLayout="true"
            :label="columnInfo.header"
            :is-required="columnInfo.required ?? required"
            :show-hint="false"
            :input-title="''"
            hide-title
            :noGutters="true"
          />
          <SelectWithHint
            v-else-if="columnInfo.type === 'select'"
            v-model="param[keyList[columnIndex]]"
            :class="{'pl-2': columnIndex > 0}"
            :items="columnInfo.selectItems || []"
            :selection-cols="12"
            :input-label="
              columnInfo.header ? columnInfo.header : columnInfo.placeholder
            "
            :required="columnInfo.required ?? required"
            :show-hint="false"
            :return-object="columnInfo.returnObject"
          />
        </v-col>
        <v-col cols="1" class="pt-2">
          <IconBtn
            v-if="!hideDeleteItem && params.length !== 1"
            icon="mdi-delete-outline"
            :disabled="required && params.length === 1"
            @click="emit('deleteItem', index)"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
  <v-row v-if="disableAddItem" no-gutters class="mb-2">
    <v-col :cols="titleCols" />
    <v-col>
      <v-alert
        class="dialog-alert py-2 px-0"
        icon="mdi-alert-circle-outline"
        density="comfortable"
      >
        <span class="delete-alert">{{ $t('error.reach.max.add.amount') }}</span>
      </v-alert>
    </v-col>
  </v-row>
  <v-row v-if="!hideAddItem" no-gutters class="mb-4">
    <v-col v-if="title !== undefined" :cols="titleCols">
      <div v-if="!params.length" class="ocis-pt-2-and-half">
        <span :class="{'ocis-input-required': required}">
          {{ title }}
        </span>
        <InfoTooltip v-if="tooltip" :tooltip="tooltip" />
      </div>
    </v-col>
    <OutlinedBtn
      :text="$t('basic.add.type')"
      :disabled="disableAddItem"
      @click="emit('addNewItem')"
    />
  </v-row>
</template>

<style lang="scss" scoped>
.dialog-alert {
  background-color: transparent !important;
  border-width: 0;
  color: rgb(var(--v-theme-text-general)) !important;

  :deep(.v-icon) {
    color: rgb(var(--v-theme-error)) !important;
    width: 20px !important;
    height: 20px !important;
    font-size: 20px !important;
  }
}
</style>
