<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <v-expansion-panel :value="value" class="mb-4 panel-border">
    <v-expansion-panel-title class="font-weight-bold">
      {{ title }}
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <slot />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<style lang="scss" scoped>
.panel-border {
  box-shadow: 0px 2px 6px #00000029;
  border: 1px solid #00000042;
  border-radius: 4px;
  opacity: 1;
}
.v-expansion-panel-title {
  :deep(.v-expansion-panel-title__overlay) {
    background-color: rgb(var(--v-theme-default-bg)) !important;
  }
}

.font-weight-bold {
  color: rgba(var(--v-theme-text-general), var(--v-text-general-opacity));
  font-size: 20px !important;
}
</style>
