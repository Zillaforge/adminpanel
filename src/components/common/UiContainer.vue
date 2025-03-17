<template>
  <v-container fluid class="main-container">
    <slot />
  </v-container>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.main-container {
  width: auto !important;
  overflow: auto;
  padding: 0px;
  margin: 0px !important;
  background-color: rgb(var(--v-theme-page-container-bg));
}
</style>
