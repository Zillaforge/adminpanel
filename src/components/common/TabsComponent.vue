<template>
  <v-row no-gutters class="pb-4">
    <v-col cols="12">
      <v-tabs
        :key="tabLanguage"
        v-model="curTab"
        :color="getColorType"
        :slider-color="'primary'"
        class="tabs"
        :class="`${tabCustomClass}`"
        @update:model-value="$emit('change', $event)"
      >
        <v-tab
          v-for="(tabName, index) in tabNames"
          :key="index"
          :value="index + 1"
          :class="index === currentIndex ? ['tab--active', 'tab'] : 'tab'"
        >
          <div class="tab-title">{{ tabName }}</div>
        </v-tab>
      </v-tabs>
    </v-col>
    <v-col cols="12">
      <v-window v-model="curTab">
        <slot />
      </v-window>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {computed, ref, type Ref, watch} from 'vue';

import i18n from '@/i18n';

export default {
  name: 'TabsComponent',
};
</script>

<script setup lang="ts">
const currentIndex: Ref<number> = ref(0);
const tabLanguage: Ref<string> = ref('');
const curTab = ref(1);
defineEmits(['change']);

const props = defineProps({
  tabNames: {
    type: Array,
    default: () => [],
  },
  tabType: {
    type: String,
    default: 'detail',
  },
  tabIndex: {
    type: Number,
    default: 0,
  },
  quotaDetailPage: {
    type: Boolean,
    default: false,
  },
  tabCustomClass: {
    type: String,
    default: '',
  },
});

const init = () => {
  if (props.tabIndex > 0 && props.tabIndex < props.tabNames.length + 1) {
    curTab.value = props.tabIndex;
    currentIndex.value = curTab.value - 1;
  }
  tabLanguage.value = i18n.global.locale;
};

init();

const getColorType = computed(() => {
  if (props.tabType === 'list') {
    return 'main_bg';
  }
  return '';
});

watch(
  () => i18n.global.locale,
  () => {
    tabLanguage.value = i18n.global.locale;
  },
);

watch(
  () => curTab.value,
  () => {
    if (curTab.value) {
      currentIndex.value = curTab.value - 1;
    }
  },
);
</script>

<style lang="scss" scoped>
.tab-border {
  box-shadow: 0 2px 6px #00000029;
  background-color: white;
}

.tabs {
  height: 49px;
  border-bottom: 0.5px solid rgb(var(--v-theme-tab-border));
  :deep(.v-tabs__bar) {
    background-color: transparent !important;
  }
  :deep(.v-tab--selected .v-tab__slider) {
    height: 4px;
  }
}
.tab-title {
  padding: 14px 32px;
}

.tab {
  &.tab--active {
    opacity: 1;
    color: rgb(var(--v-theme-text-highlight)) !important;
  }
  &:hover {
    background-color: rgba(
      var(--v-theme-tab-hover-bg),
      var(--v-tab-hover-bg-opacity)
    );
  }
}

.scrollable-quota-content {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}
</style>
