<template>
  <v-card class="rounded-0 card-width-height-100">
    <iframe
      id="monitor-frame"
      class="frame-content"
      :src="linkTo"
      frameborder="0"
      title="Monitor frame"
      allowfullscreen
    />
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  linkTo: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.subheading-1 {
  font-size: 18px !important;
  font-weight: 400;
  vertical-align: middle;
}
._content {
  min-width: 500px;
  margin: 0px !important;
  padding: 16px 50px;
  align-content: flex-start;
  height: 100%;
}
.frame-content {
  height: 100%;
  width: 100%;
}
</style>
