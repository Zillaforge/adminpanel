<script lang="ts">
export default {
  name: 'ContainedBtn',
};
</script>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['click']);
</script>

<template>
  <v-btn
    :disabled="disabled"
    class="contained-btn ma-0"
    @click="$emit('click')"
  >
    <slot />
    <v-icon v-if="icon">{{ icon }}</v-icon>
    {{ text }}
  </v-btn>
</template>

<style lang="scss" scoped>
.contained-btn {
  color: rgb(var(--v-theme-btn-contained-text)) !important;
  background-color: rgb(var(--v-theme-primary)) !important;
  border-radius: 8px;
  height: 36px;

  &:disabled {
    border: 0px !important;
    color: rgba(
      var(--v-theme-btn-contained-disabled-text),
      var(--v-btn-contained-disabled-text-opacity)
    ) !important;
    background-color: rgba(
      var(--v-theme-btn-contained-disabled-bg),
      var(--v-btn-contained-disabled-bg-opacity)
    ) !important;
  }
  &:hover,
  &:active {
    background-color: rgb(var(--v-theme-btn-contained-active-bg)) !important;
  }
}
</style>
