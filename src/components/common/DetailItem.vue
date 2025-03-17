<template>
  <v-row>
    <v-col
      sm="3"
      md="4"
      class="card_content_key"
      :class="alignCenter ? 'align-content-center' : ''"
    >
      {{ title }}
    </v-col>
    <v-col sm="9" md="8" class="card_content_value">
      <Light v-if="isStatus" :status="`${content}`" :label="`${content}`" />
      <span v-else-if="content">{{ content }}</span>
      <slot />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import Light from '@/components/common/LightComponent.vue';
defineProps({
  title: {
    type: String,
    default: '',
  },
  content: {
    type: [String, Number],
    default: '',
  },
  isStatus: {
    type: Boolean,
    required: false,
  },
  alignCenter: {
    type: Boolean,
    required: false,
  },
});
</script>

<style lang="scss" scoped>
.card_content_key {
  color: rgba(var(--v-theme-text-general), var(--v-text-general-opacity));
  padding: 3px 4px 29px 4px;
}
.card_content_value {
  color: rgba(var(--v-theme-text-content), var(--v-text-content-opacity));
  padding: 3px 4px 29px 4px;
  word-break: break-all;
}
</style>
