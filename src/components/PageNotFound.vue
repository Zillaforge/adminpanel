<template>
  <div class="background">
    <v-container grid-list-sm class="text-center">
      <v-row class="justify-center">
        <v-dialog :model-value="true" persistent width="300" scrim="false">
          <v-card style="overflow-y: hidden">
            <v-card-text
              class="headline-style text--primary text-center pt-6 pb-6"
            >
              {{ $t('system.error.page.not.found') }}
            </v-card-text>
            <v-card-text class="py-0 text--primary text-center">
              {{ $t('system.oops') }}
            </v-card-text>
            <v-card-text class="text--primary text-center">
              <v-row>
                <v-col cols="12" class="md4 offset-md4">
                  <ContainedBtn :text="$t('system.back.home')" @click="home" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// components
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';

import {toHomePage} from '@/utils/utils';
const home = () => {
  toHomePage();
};
</script>

<style lang="scss" scoped>
.background {
  height: 100vh;
  background-color: #eceff1;
  background-image: url('../assets/images/admin_bg.png');
  background-size: cover;
}
</style>
