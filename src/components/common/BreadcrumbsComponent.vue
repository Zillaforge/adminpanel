<template>
  <v-row class="mx-0">
    <v-col cols="12" class="__breadcrumb">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" divider=">">
        <template #title="{item}">
          <span
            :class="breadcrumbsColor(item)"
            @click="item.action ? item.action() : () => {}"
          >
            {{ item.text }}
          </span>
        </template>
      </v-breadcrumbs>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
defineProps({
  breadcrumbs: {
    type: Array<any>,
    default: () => [],
  },
});
const breadcrumbsColor = (item) => {
  return item.disabled ? 'breadcrumb-disabled-text' : 'breadcrumb-normal-text';
};
</script>

<style lang="scss" scoped>
.__breadcrumb {
  padding: 8px 24px 8px 24px;
  background-color: rgb(var(--v-theme-breadcrumb-bg-color));
}
.breadcrumb-normal-text {
  cursor: pointer;
  color: rgba(
    var(--v-theme-breadcrumb-normal-text),
    var(--v-breadcrumb-text-opacity)
  );
}
.breadcrumb-disabled-text {
  cursor: default;
  color: rgba(
    var(--v-theme-breadcrumb-disabled-text),
    var(--v-breadcrumb-disabled-text-opacity)
  );
}
</style>
