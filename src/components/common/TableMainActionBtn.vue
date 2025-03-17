<template>
  <v-btn
    variant="flat"
    :disabled="btn.disabled"
    class="main-action-btn"
    @click="btn.action()"
  >
    <v-icon v-show="btn.icon" color="white">{{ btn.icon }}</v-icon>
    <span>
      {{ btn.label }}
    </span>
  </v-btn>
</template>

<script lang="ts">
import type {PropType} from 'vue';

import type {MainAction} from '@/interfaces/InfraDataTableInterface';

export default {
  name: 'TableMainActionBtn',
};
</script>

<script setup lang="ts">
defineProps({
  btn: {
    type: Object as PropType<MainAction>,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.main-action-btn {
  color: #ffffff !important;
  background-image: linear-gradient(#2a97ff, #2e71eb) !important;
  border-radius: 12px;
  height: 36px;
  .v-ripple__container {
    color: #ffffff !important;
    opacity: 0.5 !important;
  }
  &:hover {
    background-image: linear-gradient(#62e4ff, #57aaff) !important;
  }
}
</style>
