<template>
  <div class="background image-all">
    <v-main class="fill-height">
      <v-container fluid class="fill-height">
        <v-row class="align-center justify-center">
          <v-card width="560" height="180" class="card">
            <v-card-title class="title-style align-center">
              {{ $t('mfa.authenticator') }}
            </v-card-title>
            <v-row class="align-center image-layout-config">
              <v-col cols="6">
                <a
                  href="https://apps.apple.com/tw/app/google-authenticator/id388497605"
                >
                  <v-img
                    :width="IMG_WIDTH"
                    :height="IMG_HEIGHT"
                    :src="getImageUrl('appstore.svg')"
                  />
                </a>
              </v-col>
              <v-col cols="6">
                <a
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                >
                  <v-img
                    :width="IMG_WIDTH"
                    :height="IMG_HEIGHT"
                    :src="getImageUrl('googleplay.svg')"
                  />
                </a>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import {getImageUrl} from '@/utils/utils';
const IMG_WIDTH = 200;
const IMG_HEIGHT = 56;
</script>

<style lang="scss" scoped>
.background {
  height: 100%;
  background-image: url('@/assets/images/admin_bg.png');
  background-size: cover;
}
.card {
  max-height: 100%;
  min-height: 20%;
  padding-top: 15px;
  background-color: rgb(var(--v-theme-card-quota-table-bg)) !important;
}
.upper_banner {
  width: 520px;
}
.text {
  font-weight: 800;
}
.image-all {
  margin-top: calc(0px - var(--v-app-bar-height-px)) !important;
  height: 100vh;
}

.image-layout-config {
  padding-top: 10px;
  padding-left: 72px;
  padding-right: 72px;
}
</style>
