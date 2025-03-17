<script lang="ts" setup>
import {ref, computed, type PropType} from 'vue';
import useBasics from '@/composables/useBasics';
import {formatDate, getAllowedDatesFn} from '@/utils/utils';

type VIEW_MODE = 'year' | 'months' | 'month' | undefined;
const {i18n} = useBasics();
defineEmits(['select-date']);
const props = defineProps({
  modelValue: {
    type: Date,
    default: undefined,
  },
  disableSelect: {
    type: Function,
    default: () => false,
  },
  allowedMinDate: {
    type: String, // YYYY-MM-DD
    default: '',
  },
  allowedMaxDate: {
    type: String, // YYYY-MM-DD
    default: '',
  },
  viewMode: {
    type: String as PropType<VIEW_MODE>,
    default: 'month',
  },
});
const currentMode = ref<VIEW_MODE>(
  props.viewMode === 'month'
    ? 'month'
    : props.viewMode === 'year'
    ? 'year'
    : 'months',
);

const showDatePicker = ref(false);
const dateString = computed(() => formatDate(props.modelValue, true));
const allowedDatesFn = computed(() =>
  getAllowedDatesFn({
    allowedMinDate: props.allowedMinDate,
    allowedMaxDate: props.allowedMaxDate,
  }),
);
const getLocale = computed(() => {
  return i18n.global.locale === 'en' ? 'en' : 'zhHant';
});

const swapToDefaultViewMode = () => {
  currentMode.value = props.viewMode;
};
</script>
<template>
  <v-text-field
    :model-value="dateString"
    color="primary"
    density="compact"
    variant="solo"
    single-line
    hide-details
    :style="`{ background: #FFFFFF; }`"
    readonly
    :disabled="disableSelect(modelValue)"
    append-inner-icon="mdi-calendar"
  >
    <v-menu
      v-model="showDatePicker"
      activator="parent"
      :close-on-content-click="false"
    >
      <v-locale-provider :locale="getLocale">
        <v-date-picker
          :model-value="modelValue"
          show-adjacent-months
          :allowed-dates="allowedDatesFn"
          hide-header
          color="primary"
          :view-mode="currentMode"
          @update:model-value="($event: Date) => {
            $emit('select-date', $event);
            showDatePicker = false;
          }"
          @update:month="swapToDefaultViewMode()"
        />
      </v-locale-provider>
    </v-menu>
  </v-text-field>
</template>

<style lang="scss" scoped>
@use '@/styles/common/v-input';
</style>
