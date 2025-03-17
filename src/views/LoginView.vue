<template>
  <v-container class="login-view d-flex justify-center align-center" fluid>
    <LoginDialog />
  </v-container>
</template>

<script lang="ts" setup>
import LoginDialog from '@/components/login/LoginDialog.vue';
</script>

<style lang="scss" scoped>
.login-view {
  height: 100%;
  background-image: url('@/assets/images/admin_bg.png');
  background-size: cover;
}
</style>
