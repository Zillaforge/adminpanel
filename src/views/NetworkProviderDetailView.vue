<template>
  <UiContainer>
    <v-row class="main-content" no-gutters>
      <v-col cols="12">
        <TitleComp
          :title="$t('basic.detail.type', {type: $t('network.provider')})"
        />
      </v-col>
      <v-col cols="12">
        <v-card>
          <Tabs :tab-names="[t('basic.overview')]">
            <v-window-item :value="1" class="__tabs_item">
              <v-card-title
                class="pa-2 d-flex justify-space-between align-center"
              >
                <div>
                  <template
                    v-for="(actionBtn, index) in tableActionBtnList"
                    :key="`action${index}`"
                  >
                    <TableActionBtn :btn="actionBtn" />
                  </template>
                </div>

                <div class="card-last-updated-time">
                  <span class="text-end">
                    {{ $t('basic.lastUpdated') }}
                    {{
                      formatDateSec(
                        typeof lastUpdatedTime === 'string'
                          ? new Date()
                          : lastUpdatedTime,
                      )
                    }}
                  </span>
                </div>
              </v-card-title>
              <v-card-text class="pa-0">
                <DetailPanelGroup v-model="expansionPanels">
                  <DetailPanel
                    :title="expansionPanels[0].title"
                    :value="expansionPanels[0].value"
                  >
                    <v-row no-gutters class="text-body-2">
                      <v-col
                        v-for="(item, index) in detailItems"
                        :key="index"
                        cols="6"
                        class="pb-4 pl-2"
                      >
                        <DetailItem
                          :title="item.text"
                          :content="getDeepObj(providerDetailItem, item.key)"
                        />
                      </v-col>
                    </v-row>
                  </DetailPanel>

                  <DetailPanel
                    :title="expansionPanels[1].title"
                    :value="expansionPanels[1].value"
                  >
                    <div
                      v-for="(
                        secGroup, index
                      ) in providerDetailItem?.security_groups"
                      :key="'secGroup-' + index"
                    >
                      <v-row no-gutters class="text-body-2">
                        <v-col
                          v-for="(item, index) in sgItems"
                          :key="'sgItems-' + index"
                          cols="6"
                          class="pb-4 pl-2"
                        >
                          <DetailItem
                            :title="item.text"
                            :content="getDeepObj(secGroup, item.key)"
                          />
                        </v-col>
                      </v-row>

                      <v-row no-gutters class="pb-12">
                        <v-col cols="2">
                          <span>
                            {{ $t('basic.rules') }}
                          </span>
                        </v-col>
                        <v-col cols="10">
                          <DetailTable
                            :items="secGroup?.rules"
                            :headers="sgRulesHeader"
                          />
                        </v-col>
                      </v-row>
                      <v-divider
                        v-if="
                          providerDetailItem?.security_groups.length > 1 &&
                          index !==
                            providerDetailItem?.security_groups.length - 1
                        "
                        class="mb-12"
                      />
                    </div>
                  </DetailPanel>

                  <DetailPanel
                    :title="expansionPanels[2].title"
                    :value="expansionPanels[2].value"
                  >
                    <v-row no-gutters class="text-body-2 pb-4">
                      <v-col cols="2" class="pt-2 card_content_key">
                        {{ $t('basic.associate.service') }}
                      </v-col>
                      <v-col>
                        <OutlinedBtn
                          :text="
                            $t('basic.add.type', {
                              type: $t('basic.association'),
                            })
                          "
                          @click="handleClickAssociation"
                        />
                      </v-col>
                      <v-col cols="6" />
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="2" />
                      <v-col cols="10">
                        <DetailTable
                          :items="projAssociatedNetworkList"
                          :headers="associatedHeader"
                          :actions="[
                              {
                                text: $t('basic.detach'),
                                action: (item: any) => {
                                  handleServerDetachment(item);
                                },
                              },
                            ]"
                        />
                      </v-col>
                    </v-row>
                  </DetailPanel>
                </DetailPanelGroup>
              </v-card-text>
            </v-window-item>
          </Tabs>
        </v-card>
      </v-col>
    </v-row>
    <ProviderNetworkAttachServerDialog
      v-model:show="showAttachDialog"
      :submit-callback="handleServerAttachment"
      :max-add-amount="maxAddAmount"
    />
  </UiContainer>
</template>

<script setup lang="ts">
import {computed, ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import useBasics from '@/composables/useBasics';
import useNetworks from '@/composables/useNetworks';
import useProjects from '@/composables/useProjects';
import {formatDateSec, getDeepObj} from '@/utils/utils';
import PAGE_TYPES from '@/constants/PAGE_TYPES';

// components
import Tabs from '@/components/common/TabsComponent.vue';
import TableActionBtn from '@/components/common/TableActionBtn.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import DetailItem from '@/components/common/DetailItem.vue';
import DetailPanel from '@/components/common/DetailPanel.vue';
import DetailPanelGroup from '@/components/common/DetailPanelGroup.vue';
import DetailTable from '@/components/common/DetailTable.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import ProviderNetworkAttachServerDialog from '@/components/network/ProviderNetworkAttachServerDialog.vue';

const showAttachDialog = ref(false);
const lastUpdatedTime = ref<Date | string>('');

const maxAddAmount = ref(-1);
const detailItems = computed(() => [
  {key: 'id', text: t('network.provider.uuid')},
  {key: 'name', text: t('basic.name')},
  {key: 'description', text: t('basic.desc')},
  {key: 'cidr', text: 'CIDR'},
]);

const sgItems = computed(() => [
  {key: 'id', text: t('network.security.group.id')},
  {
    key: 'name',
    text: t('basic.name.type', {type: t('network.security.group')}),
  },
]);

const route = useRoute();
const router = useRouter();
const {t, confirmDeleteTableItemDialog} = useBasics();
const {
  associatedHeader,
  sgRulesHeader,
  providerDetailItem,
  providerNetworkAssociatedList,
  execDeleteProviderNetwork,
  execDeleteProviderNetworkServerAttachment,
  execFetchProviderNetworkServerAttachments,
  execFetchProviderNetworkDetail,
  execFetchProviderNetworkUsage,
  execUpdateProviderNetworkServerAttachment,
} = useNetworks(route.name as string);
const {projectMap, getProjects} = useProjects('');

const projAssociatedNetworkList = computed(() => {
  return providerNetworkAssociatedList.value
    .filter((associatedItem: Record<string, any>) => associatedItem.server)
    .map((associatedItem: Record<string, any>) => {
      const projId = associatedItem.server?.project.id ?? '';
      return {
        ...projectMap.value[projId],
        id: associatedItem.id,
        vmName: associatedItem?.server?.name ?? '',
        providerIP:
          associatedItem?.addresses.length > 0
            ? associatedItem.addresses?.[0]
            : '',
      };
    });
});

const fetchData = async () => {
  await execFetchProviderNetworkDetail(route.params.id as string);
  await execFetchProviderNetworkServerAttachments(providerDetailItem.value?.id);
  await getProjects();
  lastUpdatedTime.value = new Date();
};

const tableActionBtnList = computed(() => [
  {
    visible: true,
    disabled: projAssociatedNetworkList.value.length > 0,
    icon: 'mdi-delete',
    tips: t('table.icon.delete'),
    action: () => {
      confirmDeleteTableItemDialog(
        providerDetailItem.value,
        {
          title: t('dialog.delete.title', {
            resource: t('network.provider').toLowerCase(),
          }),
          message: '',
          resourceInfo: [
            {
              title: t('basic.name'),
              keyOfvalue: 'name',
            },
          ],
        },
        async () => {
          handleDelete(providerDetailItem.value.id);
        },
      );
    },
  },
  {
    visible: true,
    disabled: false,
    icon: 'mdi-refresh',
    tips: t('table.icon.refresh'),
    action: () => {
      fetchData();
    },
  },
]);
const expansionPanels = computed(() => [
  {title: t('basic.info.type', {type: t('basic.basic')}), value: 'basicInfo'},
  {
    title: t('basic.info.type', {type: t('network.security.group')}),
    value: 'securityGroupInfo',
  },
  {
    title: t('basic.info.type', {type: t('basic.associated')}),
    value: 'associatedInfo',
  },
]);

const handleClickAssociation = async () => {
  maxAddAmount.value = await execFetchProviderNetworkUsage(
    providerDetailItem.value.id,
  );
  showAttachDialog.value = true;
};

const handleServerAttachment = async (vmServerIds: string[]) => {
  showAttachDialog.value = false;
  const promiseArray: any = [];
  vmServerIds.forEach(async (vmServerId: string) => {
    promiseArray.push(
      execUpdateProviderNetworkServerAttachment(
        providerDetailItem.value.id,
        vmServerId,
      ),
    );
  });
  await Promise.allSettled(promiseArray).then(() => fetchData());
};

const handleServerDetachment = async (item: {id: string}) => {
  await execDeleteProviderNetworkServerAttachment(
    providerDetailItem.value.id,
    item.id,
  ).then(() => fetchData());
};

const handleDelete = async (id: string) => {
  await execDeleteProviderNetwork(id).then(() => {
    router.push({name: PAGE_TYPES.NETWORK_PROVIDER_LIST});
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.card-last-updated-time {
  display: flex;
  color: rgb(var(--v-theme-text-highlight));
  align-items: center;
  font-weight: 400;
}

.__tabs_item {
  padding: 0px 20px 0px 20px;
  background-color: white;
}

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
