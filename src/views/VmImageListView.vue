<template>
  <UiContainer>
    <v-row class="main-content">
      <v-col cols="12">
        <TitleComp
          :title="
            $t('basic.management.type', {
              type: $t('image.virtual.machine'),
            })
          "
        />
        <v-row no-gutters>
          <v-col cols="12" class="pa-0 pb-6 main-action-col">
            <TableMainActionBtn
              :btn="{
                label: t('basic.create'),
                action: toCreatePage,
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
            <VmImageListTable
              :zone-type="'public'"
              :vm-image-list="vmImageList"
              :exec-fetch-data-callback="fetchData"
              :exec-create-callback="toCreatePage"
              :launch-edit-dialog-callback="launchEditDialog"
            />
          </v-window-item>
          <v-window-item :value="2">
            <VmImageListTable
              :zone-type="'private'"
              :vm-image-list="vmImageList"
              :exec-fetch-data-callback="fetchData"
              :exec-create-callback="toCreatePage"
              :launch-edit-dialog-callback="launchEditDialog"
            />
          </v-window-item>
        </Tabs>
        <VmImageListTable
          v-else
          :zone-type="'public'"
          :vm-image-list="vmImageList"
          :exec-fetch-data-callback="fetchData"
          :exec-create-callback="toCreatePage"
          :launch-edit-dialog-callback="launchEditDialog"
        />
      </v-col>
    </v-row>
    <EditDescriptionDialog
      v-model:item="editItem"
      v-model:show="showEditDialog"
      :submit-callback="handleEdit"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useGlobal} from '@/store';
import {useRoute, useRouter} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useImages from '@/composables/useImages';
import {ADMIN_PROJECT_ID} from '@/constants/Constants';
import {type TableItem} from '@/interfaces/InfraDataTableInterface';

// components
import UiContainer from '@/components/common/UiContainer.vue';
import Tabs from '@/components/common/TabsComponent.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import VmImageListTable from '@/components/image/VmImageListTable.vue';
import EditDescriptionDialog from '@/components/common/EditDescriptionDialog.vue';
import TableMainActionBtn from '@/components/common/TableMainActionBtn.vue';

import PAGE_TYPES from '@/constants/PAGE_TYPES';
const route = useRoute();
const router = useRouter();
const {t} = useBasics();
const {vmImageList, execFetchVirtualImageList, execUpdateVirtualImageDetail} =
  useImages(route.name as string);
const tabNames = computed(() => [
  t('basic.zone.public'),
  t('basic.zone.private'),
]);

const globalStore = useGlobal();
const isLoading = ref(false);
const showEditDialog = ref(false);
const tabIndex = ref<number>(1);
const lastUpdatedTime = ref<Date | string>('');
const editItem: TableItem = ref({
  id: '',
  description: undefined,
});

const fetchData = async () => {
  isLoading.value = true;

  await execFetchVirtualImageList(ADMIN_PROJECT_ID);
  lastUpdatedTime.value = new Date();
  isLoading.value = false;
};

const toCreatePage = async () => {
  await router.push({name: PAGE_TYPES.VM_IMAGE_CREATE});
};

const onTabChange = (event: number) => {
  tabIndex.value = event;
};

const handleEdit = async () => {
  showEditDialog.value = false;

  await execUpdateVirtualImageDetail({
    imageId: editItem.value.id,
    data: {
      description: editItem.value.description,
    },
  });
  await fetchData();
};

const launchEditDialog = async (item: TableItem) => {
  editItem.value = Object.assign({}, item);
  showEditDialog.value = true;
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped></style>
