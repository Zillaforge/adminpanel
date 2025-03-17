<script lang="ts">
import {computed} from 'vue';
export default {
  name: 'InfoTooltip',
};
</script>

<script setup lang="ts">
const props = defineProps({
  tooltip: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'right',
  },
});

const locationValue = computed(() =>
  props.location && props.location.length > 0 ? props.location : 'right',
);
</script>

<template>
  <v-tooltip :location="locationValue">
    <template #activator="{props}">
      <v-icon v-bind="props" size="20" class="ml-1 algin-bottom">
        mdi-information
      </v-icon>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<style lang="scss" scoped>
.v-icon {
  &.mdi-information {
    color: rgb(var(--v-theme-info-icon));
    &:hover {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }
}
.v-tooltip {
  :deep(.v-overlay__content) {
    background-color: rgb(var(--v-theme-tooltip-bg)) !important;
    font-size: 12px !important;
    color: rgb(var(--v-theme-tooltip-text-color));
    max-width: 30vw !important;
  }
}
</style>
