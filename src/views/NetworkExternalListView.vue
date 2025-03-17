<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="$t('basic.management.type', {type: $t('network.external')})"
        />

        <v-row no-gutters>
          <v-col cols="12" class="pa-0 pb-6 main-action-col">
            <TableMainActionBtn
              :btn="{
                label: t('basic.import'),
                action: routeToImport,
              }"
              class="mr-3"
            />
          </v-col>
        </v-row>

        <Tabs
          v-if="!globalStore.getIsPilotRegion"
          :tab-names="tabNames"
          :tab-index="tabIndex"
          :tab-custom-class="'mb-6'"
          @change="onTabChange($event)"
        >
          <v-window-item :value="1">
            <NetworkListTable
              :zone-type="'public'"
              :networkList="networkList"
              :execFetchDataCallback="fetchData"
              :execImportCallback="routeToImport"
            />
          </v-window-item>
          <v-window-item :value="2">
            <NetworkListTable
              :zone-type="'private'"
              :networkList="networkList"
              :execFetchDataCallback="fetchData"
              :execImportCallback="routeToImport"
            />
          </v-window-item>
        </Tabs>
        <NetworkListTable
          v-else
          :zone-type="'public'"
          :networkList="networkList"
          :execFetchDataCallback="fetchData"
          :execImportCallback="routeToImport"
        />
      </v-col>
    </v-row>
    <NetworkExternalImportDialog
      :show-dialog="showImportDialog"
      @after-submit="fetchData"
      @close-dialog="showImportDialog = false"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobal} from '@/store';
import useBasics from '@/composables/useBasics';
import useNetworks from '@/composables/useNetworks';

// components
import Tabs from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import NetworkListTable from '@/components/network/NetworkListTable.vue';
import NetworkExternalImportDialog from '@/components/network/NetworkExternalImportDialog.vue';
import TableMainActionBtn from '@/components/common/TableMainActionBtn.vue';

const route = useRoute();
const showImportDialog = ref(false);
const {t} = useBasics();
const {execFetchNetworkList, networkList} = useNetworks(route.name as string);

const tabNames = computed(() => [
  t('basic.zone.public'),
  t('basic.zone.private'),
]);
const tabIndex = ref<number>(1);
const globalStore = useGlobal();
const fetchData = async () => {
  await execFetchNetworkList();
};

const routeToImport = () => {
  showImportDialog.value = true;
};

const onTabChange = (event: number) => {
  tabIndex.value = event;
};
</script>

<style lang="scss" scoped>
span .v-icon {
  vertical-align: unset;
}
td.text-xs-left {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
