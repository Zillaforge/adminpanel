<template>
  <v-row no-gutters>
    <v-col cols="12" class="px-0 pb-3 main-action-col">
      <div v-if="mainActionList.length > 0">
        <template
          v-for="(mainAction, index) in mainActionList"
          :key="`mainAction${index}`"
        >
          <TableMainActionBtn
            :btn="getMainActionBtn(mainAction)"
            class="mr-3"
          />
        </template>
      </div>
      <div class="align-self-end">
        <slot name="message" />
      </div>
    </v-col>

    <v-col cols="12">
      <v-card class="table-card">
        <div class="table-actions">
          <div>
            <template
              v-for="(action, index) in tableActionList"
              :key="`action${index}`"
            >
              <TableActionBtn :btn="getTableActionBtn(action)" />
            </template>

            <TableActionBtn
              :btn="{
                visible: true,
                disabled: false,
                icon: 'mdi-refresh',
                tips: $t('table.icon.refresh'),
                action: () => {
                  fetchData();
                },
              }"
            />
          </div>

          <div class="table-last-updated-time">
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
        </div>

        <div class="table-container">
          <v-col class="search-wrapper">
            <slot name="customSearch" />
            <v-row v-if="showSearchWrapper" no-gutters class="py-2 px-6">
              <v-col
                :class="{
                  'v-col-8': customBtnList.length < 2,
                }"
              >
                <div>
                  <SearchTextField v-model="searchStr" />
                </div>
              </v-col>
              <!-- Project Type Toggle -->
              <v-col v-if="enableToggle" class="pl-1 v-col-1">
                <v-btn-toggle
                  v-model="projectTypeToggle"
                  class="project-toggle"
                  color="primary"
                  multiple
                >
                  <v-btn
                    size="x-small"
                    :value="ISERVICE_NAMESPACE"
                    class="border-thin"
                  >
                    <v-icon>mdi-alpha-i</v-icon>
                    <v-tooltip location="bottom" activator="parent">
                      iService{{ $t('basic.project.type') }}
                    </v-tooltip>
                  </v-btn>

                  <v-btn
                    size="x-small"
                    :value="CLOUDINFRA_NAMESPACE"
                    class="border-thin"
                  >
                    <v-icon>mdi-alpha-t</v-icon>
                    <v-tooltip location="bottom" activator="parent">
                      {{ $t('basic.testing') }}{{ $t('basic.project.type') }}
                    </v-tooltip>
                  </v-btn>
                </v-btn-toggle>
              </v-col>

              <v-col
                v-if="customBtnList.length > 0"
                class="custom-search-bar-btn text-end align-content-center"
              >
                <template
                  v-for="(customBtn, index) in customBtnList"
                  :key="`customBtn${index}`"
                >
                  <OutlinedBtn
                    class="ml-4"
                    :text="customBtn.label"
                    :disabled="customBtn.disabled"
                    @click="customBtn.action"
                  />
                </template>
              </v-col>
            </v-row>
          </v-col>

          <v-divider />
          <v-data-table
            v-model:page="pagination.page"
            v-model:items-per-page="pagination.rowsPerPage"
            v-model:sort-by="sortBy"
            :class="getTableClass"
            :items="enableToggle ? filteredProjectTypeToggle : items"
            :item-value="tableItemKey"
            :headers="stateHeaders"
            :search="searchStr"
            :filter-mode="'some'"
            :loading="loading"
            :loading-text="$t('basic.data.loading')"
            :show-select="false"
            hide-default-footer
            return-object
            select-strategy="page"
            @update:currentItems="handleCurrentItemsChanged"
          >
            <template #loader>
              <v-progress-linear height="4" color="primary" indeterminate />
            </template>
            <template #item="{item}">
              <tr
                v-bind="$attrs"
                :key="item?.[tableItemKey]"
                :class="{
                  'cursor-pointer': getHasClickRowHandler(item),
                  'cursor-default v-no-hover': !getHasClickRowHandler(item),
                  'table-row selected': isRowSelected(item),
                  'table-row': !isRowSelected(item),
                }"
                @click="onRowClick(item)"
              >
                <slot name="item" :item="item" />

                <td v-if="moreActionList.length > 0" class="text-end">
                  <v-menu transition="scale-transition" open>
                    <template #activator="{props}">
                      <v-btn
                        v-bind="props"
                        id="tableMoreBtn"
                        variant="flat"
                        icon
                        density="comfortable"
                        @click.stop
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list id="tableMoreList" class="pa-0 more-action-list">
                      <template
                        v-for="(moreAction, index) in moreActionList"
                        :key="`moreAction${index}`"
                      >
                        <TableMoreActionListItem
                          v-if="
                            moreAction.visible ? moreAction.visible(item) : true
                          "
                          :table-item="item"
                          :list-item="getMoreActionListItem(moreAction, item)"
                        />
                      </template>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </template>

            <template v-if="noDataSetting && items.length === 0" #no-data>
              <div class="text-center table-no-data">
                <component
                  :is="noDataSetting.svgIcon"
                  v-if="noDataSetting.svgIcon"
                  :colorful="false"
                  class="mb-4 no-data-component"
                />
                <img
                  v-else-if="noDataSetting.image"
                  :src="noDataSetting.image"
                  :height="120"
                  class="pb-2"
                  alt="No Data"
                />
                <v-icon v-else-if="noDataSetting.icon" size="120">
                  {{ noDataSetting.icon }}
                </v-icon>

                <p class="mb-4">
                  {{ noDataSetting.message1 }}
                  <br />
                  <span v-if="noDataSetting.link">
                    <span v-text="noDataSetting.message2" />
                    <ExternalLink :link="noDataSetting.link" />
                  </span>
                  <span v-else>
                    {{ noDataSetting.message2 }}
                  </span>
                </p>

                <ContainedBtn
                  v-if="noDataSetting.buttonTitle"
                  :text="noDataSetting.buttonTitle"
                  @click="
                    noDataSetting.action ? noDataSetting.action() : undefined
                  "
                />
              </div>
            </template>
            <template v-else #no-data>
              <div class="text-center">
                {{
                  items.length === 0
                    ? noDataText || $t('table.noData')
                    : $t('table.search.notFound')
                }}
              </div>
            </template>

            <template
              v-for="(header, index) in headersWithTooltip"
              :key="`header-tooltip-${index}`"
              #[`header.${header.key}`]="{column}"
            >
              {{ column.title }}
              <InfoTooltip :tooltip="header.tooltip" location="bottom" />
            </template>
            <template
              v-for="(header, index) in headersWithSubtitle"
              :key="`header-subtitle-${index}`"
              #[`header.${header.key}`]="{column, getSortIcon, toggleSort}"
            >
              {{ column.title }}
              <InfoTooltip
                v-if="header.tooltip"
                :tooltip="header.tooltip"
                location="bottom"
              />
              <v-icon
                v-if="column.sortable"
                class="v-data-table-header__sort-icon"
                :icon="getSortIcon(column)"
                @click="toggleSort(column)"
              />
              <div>
                {{ header.subTitle }}
              </div>
            </template>

            <template #bottom />
          </v-data-table>
          <template v-if="items.length > 0">
            <v-divider />
            <v-card-title class="pa-0">
              <v-row no-gutters class="text-center">
                <v-col cols="12">
                  <Pagination
                    v-show="items.length"
                    :pagination="pagination"
                    :item-title="`${$tc('basic.items', itemCount, {
                      number: itemCount,
                    })}`"
                    :show-fetch-more-data="showFetchMoreData"
                    @fetch-more-data="fetchMoreData"
                    @update-current-page="pagination.page = $event"
                  />
                </v-col>
              </v-row>
            </v-card-title>
          </template>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {useGlobal} from '@/store';
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  type Ref,
  type PropType,
} from 'vue';

import get from 'lodash/get';

import type {SortItem} from '@/interfaces/VuetifyInterfaces';

import Pagination from '@/components/common/PaginationComponent.vue';
import ExternalLink from '@/components/common/ExternalLink.vue';
import TableActionBtn from '@/components/common/TableActionBtn.vue';
import TableMainActionBtn from '@/components/common/TableMainActionBtn.vue';
import TableMoreActionListItem from '@/components/common/TableMoreActionListItem.vue';
import OutlinedBtn from '@/components/common/button/OutlinedBtn.vue';
import SearchTextField from '@/components/common/SearchTextField.vue';
import ContainedBtn from '@/components/common/button/ContainedBtn.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

import i18n from '@/i18n';
import {
  MainActionType,
  ActionType,
  type TableItem,
  type MainAction,
  type TableAction,
  type MoreAction,
  type ResourceInfo,
  type NoDataSetting,
  type CustomBtn,
} from '@/interfaces/InfraDataTableInterface';
import {formatDateSec} from '@/utils/utils';

import {CLOUDINFRA_NAMESPACE, ISERVICE_NAMESPACE} from '@/constants/Constants';

const globalStore = useGlobal();

const projectTypeToggle = ref([CLOUDINFRA_NAMESPACE, ISERVICE_NAMESPACE]);

const {t} = i18n.global;
const emit = defineEmits([
  'fetch-data',
  'fetch-more-data',
  'updateSearch',
  'onRowClick',
]);
const props = defineProps({
  enableToggle: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  lastUpdatedTime: {
    type: [Date, String],
    default: null,
  },
  tableHeaders: {
    type: Array<any>,
    default: [],
  },
  mainActionList: {
    type: Array<MainAction>,
    default: [],
    validator(value: MainAction[]) {
      return value.every((el) => !!el.type || !!el.label);
    },
  },
  tableActionList: {
    type: Array<TableAction>,
    default: [],
    validator(value: TableAction[]) {
      return value.every((el) => !!el.type || (!!el.icon && !!el.tips));
    },
  },
  moreActionList: {
    type: Array<MoreAction>,
    default: [],
    validator(value: MoreAction[]) {
      return value.every((el) => !!el.type || !!el.label);
    },
  },
  resourceInfo: {
    type: Array<ResourceInfo>,
    default: () => [],
  },
  items: {
    type: Array<TableItem>,
    default: () => [],
  },
  noDataSetting: {
    type: Object as PropType<NoDataSetting>,
    default: null,
  },
  noDataText: {
    type: String,
    default: '',
  },
  sortingOptions: {
    type: Object,
    default: () => ({}),
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  autoReloadStatus: {
    type: Array<string>,
    default: () => [
      'Initializing',
      'Creating',
      'Starting',
      'Stoping',
      'Deleting',
      'Stopping',
      'Build',
      'Building',
      'Updating',
      'Queueing',
      'Queuing',
      'Queued',
      'Running',
      'Saving',
      'Shelving',
      'Unshelving',
    ],
  },
  autoReloadInterval: {
    type: Number,
    default: 10000,
  },
  tableItemKey: {
    type: String,
    required: true,
    default: 'id',
  },
  showFetchMoreData: {
    type: Boolean,
    default: false,
  },
  hasClickRowHandler: {
    type: [Function, Boolean], // Function as PropType<(row: any) => boolean>)
    default: true,
  },
  customBtnList: {
    type: Array<CustomBtn>,
    default: [],
    validator(value: CustomBtn[]) {
      return value.every((el) => !!el.label);
    },
  },
  showSearchWrapper: {
    type: Boolean,
    default: true,
  },
});

const sortBy: Ref<SortItem[]> = ref([
  {
    key: props.sortingOptions?.sortBy ?? '',
    order: props.sortingOptions?.isDescending ? 'desc' : 'asc',
  },
]);

const pagination = ref({
  rowsPerPage: 10,
  totalItems: 0,
  page: 1,
});

const timer: Ref<number> = ref(0);
const searchStr = ref('');
const isFetchMoreAction = ref(false);

onBeforeUnmount(() => {
  cancelAutoReload();
});

onMounted(() => {
  init();
});

const init = () => {
  pagination.value.rowsPerPage = props.itemsPerPage;
  if (searchStr.value === '') {
    pagination.value.totalItems = props.items.length;
  }
};

const getMainActionBtn = (action: MainAction) => {
  const btn = {
    disabled: action.disabled ?? false,
    icon: action.icon ?? '',
    label: action.label ?? '',
    action: action.action ?? (() => {}),
  };

  if (action.type === MainActionType.CREATE) {
    btn.icon ||= 'mdi-plus';
    btn.label ||= t('basic.create');
  }

  return btn;
};

const getTableActionBtn = (tableAction: TableAction) => {
  const iconBtn = {
    visible: tableAction.visible ? tableAction.visible() : true,
    disabled: tableAction.disabled ? tableAction.disabled() : false,
    icon: tableAction.icon ?? '',
    tips: tableAction.tips ?? '',
    action: tableAction.action ?? (() => {}),
  };
  return iconBtn;
};

const getMoreActionListItem = (moreAction: MoreAction, item: TableItem) => {
  const listItem = {
    disabled: moreAction.disabled ? moreAction.disabled(item) : false,
    label: moreAction.label ?? '',
    action: moreAction.action ?? (() => {}),
  };

  // only for default actions: start, stop, (edit), delete
  switch (moreAction.type) {
    case ActionType.START:
      listItem.label ||= t('table.icon.start');
      listItem.action = () => openStartDialog(item, moreAction.action);
      break;
    case ActionType.STOP:
      listItem.label ||= t('table.icon.stop');
      listItem.action = () => openStopDialog(item, moreAction.action);
      break;
    case ActionType.EDIT:
      listItem.label ||= t('basic.edit');
      // listItem.action = (actionItem?: TableItem) =>
      //   openEditDialog(item, moreAction.action);
      break;
    case ActionType.DELETE:
      listItem.label ||= t('table.icon.delete');
      listItem.action = () => openDeleteDialog(item, moreAction.action);
      break;

    default:
      break;
  }
  return listItem;
};

const showConfirmDialog = (
  item: TableItem,
  title: string,
  action: (item: TableItem) => void = () => ({}),
  type: string = '',
) => {
  const resourceInfo =
    props.resourceInfo.length > 0
      ? props.resourceInfo.map((info) => ({
          title: `${info.title}:`,
          value: get(item, info.keyOfvalue),
        }))
      : [
          {
            title: t('basic.name') + ':',
            value: get(item, 'name'),
          },
        ];

  globalStore.uiShowDialog({
    title,
    type,
    message: '',
    isResourceConfirm: true,
    resourceInfo,
    callback: () => {
      action(item);
    },
  });
};

const openDeleteDialog = (
  item: TableItem,
  deleteAction: (item: TableItem) => void = () => ({}),
) => {
  const title = t('dialog.delete.title', {
    resource: t('basic.resource').toLowerCase(),
  });
  showConfirmDialog(item, title, deleteAction, 'delete');
};

const openStartDialog = (
  item: TableItem,
  startAction: (item: TableItem) => void = () => ({}),
) => {
  const title = t('dialog.start.title', {
    resource: t('basic.resource').toLowerCase(),
  });
  showConfirmDialog(item, title, startAction);
};

const openStopDialog = (
  item: TableItem,
  stopAction: (item: TableItem) => void = () => ({}),
) => {
  const title = t('dialog.stop.title', {
    resource: t('basic.resource').toLowerCase(),
  });

  showConfirmDialog(item, title, stopAction);
};

const fetchData = (showLoading = true) => {
  emit('fetch-data', showLoading);
};

const fetchMoreData = () => {
  emit('fetch-more-data');
  isFetchMoreAction.value = true;
};

const cancelAutoReload = () => {
  clearInterval(timer.value);
  timer.value = 0;
};

const isAutoReload = (item: TableItem) => {
  if (!item.status) {
    return false;
  }
  const autoReloadStatus = props.autoReloadStatus;
  if (autoReloadStatus) {
    for (const status of autoReloadStatus) {
      if (status.toUpperCase() === String(item.status).toUpperCase()) {
        return true;
      }
    }
  }
  return false;
};

const isRowSelected = (item: TableItem) => {
  return item?.selected ?? false;
};

const onRowClick = (item: TableItem) => {
  if (getHasClickRowHandler(item)) {
    emit('onRowClick', item);
  }
};

const getHasClickRowHandler = (item: TableItem) => {
  if (
    typeof props.hasClickRowHandler === 'boolean' &&
    props.hasClickRowHandler
  ) {
    return true;
  } else if (
    typeof props.hasClickRowHandler === 'function' &&
    props.hasClickRowHandler(item)
  ) {
    return true;
  }
  return false;
};

const handleCurrentItemsChanged = () => {
  const headerKeyArray = props.tableHeaders.map((header) => header.key);
  pagination.value.totalItems = props.items
    .filter((item) => {
      return projectTypeToggle.value.includes(item.namespace);
    })
    .filter((item) => {
      // only compare displayed columns
      const newItem = headerKeyArray.reduce((cur, key) => {
        return Object.assign(cur, {[key]: get(item, key)});
      }, {});
      return Object.values(newItem).some((val: any) =>
        val
          ?.toString()
          .toLocaleLowerCase()
          .includes(searchStr.value.toString().toLocaleLowerCase()),
      );
    }).length;
};

// watch
watch(
  () => props.items,
  (newVal) => {
    if (searchStr.value === '') {
      pagination.value.totalItems = props.items.length;
    }
    const hasNeededReloadItems =
      Array.isArray(newVal) &&
      newVal.some((cntr: TableItem) => {
        return props.autoReloadStatus && isAutoReload(cntr);
      });
    if (hasNeededReloadItems) {
      if (!timer.value) {
        timer.value = window.setInterval(() => {
          fetchData(false);
        }, props.autoReloadInterval);
      }
    } else {
      if (timer.value) cancelAutoReload();
    }
  },
);

watch(
  () => i18n.global.locale,
  (newVal, oldVal) => {
    if (oldVal) init();
  },
);
watch(
  () => searchStr.value,
  (newVal) => {
    if (searchStr.value.length === 0) {
      pagination.value.totalItems = props.items.length;
    }
    emit('updateSearch', newVal);
  },
);

watch(
  () => pagination.value.totalItems,
  () => {
    if (!isFetchMoreAction.value) {
      pagination.value = {...pagination.value, page: 1};
    } else {
      isFetchMoreAction.value = false;
    }
  },
);

const filteredProjectTypeToggle = computed(() => {
  return props.items.filter((item) => {
    return projectTypeToggle.value.includes(item.namespace);
  });
});

const getTableClass = computed(() => {
  let style = props.items.length > 0 ? 'table--has-data' : 'table--no-data';
  style = style + ' scrollable-table';

  return style;
});

const headersWithTooltip = computed(() => {
  return stateHeaders.value.filter((header) => !!header.tooltip);
});

const headersWithSubtitle = computed(() => {
  return stateHeaders.value.filter((header) => !!header.subTitle);
});

const stateHeaders = computed(() => {
  const headers = [...props.tableHeaders];
  if (props.moreActionList.length > 0) {
    headers.push({
      title: '',
      key: 'more-actions',
      sortable: false,
    });
  }

  return headers;
});

const itemCount = computed(() => pagination.value.totalItems);
</script>

<style lang="scss" scoped>
@use '@/styles/common/v-table';
.main-action-col {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  display: flex;
}

.table-actions {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .v-btn:hover {
    background-color: rgb(var(--v-theme-table-icon-hover-bg)) !important;
  }
}

.v-divider--vertical {
  margin-top: 0px;
  margin-bottom: 0px;
  height: 20px;
  min-height: none;
  vertical-align: middle;
  border-color: #000;
}

.v-text-field :deep(.v-field__prepend-inner) {
  margin-right: 20px;
}

.v-text-field :deep(.v-field__input) {
  padding-top: 8px;
}

.disabled {
  filter: opacity(0.3);
}

.search-wrapper {
  padding: 0px !important;
  background-color: rgb(var(--v-theme-table-inner-bg));
}

.project-toggle {
  min-height: 40px;
  height: 40px;
}

.custom-search-bar-btn {
  width: 10%;
}

.v-field.v-field--active .v-label.v-field-label--floating {
  visibility: hidden;
}

.v-select--chips .v-field__input,
.v-select--selection-slot .v-field__input {
  height: 40px;
}

.table-no-data {
  margin: auto auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (min-height: 700px) {
    height: calc(100vh - 475px);
    max-height: 470px;
    min-height: 180px;
    width: 500px;
  }
  @media (max-height: 699px) {
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  p {
    font-size: 16px !important;
    font-weight: bold;
    span {
      color: rgba(
        var(--v-theme-text-content),
        var(--v-text-content-opacity)
      ) !important;
      font-weight: normal !important;
    }
  }
}

.no-data-component {
  width: 120px;
  height: 120px;
}

// table scroll behavior
.scrollable-table {
  max-height: calc(100vh - 420px);
  overflow-y: auto;

  @media (max-height: 600px) {
    &.table--no-data {
      min-height: 164px !important;
    }
    &.table--has-data,
    &.v-data-table--loading {
      min-height: 104px !important;
    }
  }
}
</style>
