<template>
  <v-menu
    v-model="show"
    :close-on-content-click="false"
    content-class="menu-fixed"
    transition="scale-transition"
    :class="displayCondition"
  >
    <template #activator="{props, isActive}">
      <component
        :is="chipStyle ? VChip : VBtn"
        :id="id"
        v-bind="props"
        :icon="!btnText"
        class="title-style"
        :class="{
          'header-active': isActive,
          'app-bar-chip': btnText && chipStyle,
          [displayCondition]: true,
        }"
        varian="flat"
        @click="$emit('btnClick')"
      >
        <v-icon>{{ btnIcon }}</v-icon>
        <span v-show="btnText" class="pl-2">
          {{ btnText }}
        </span>
        <v-tooltip
          location="bottom"
          activator="parent"
          z-index="100"
          :disabled="!btnTooltip"
        >
          {{ btnTooltip }}
        </v-tooltip>
      </component>
    </template>
    <v-list class="navigation-bg-color menu-list pa-0">
      <template v-for="(item, index) in menuItems" :key="index">
        <v-divider v-show="item.topDivider" class="user-menu-divider" />
        <v-list-item
          v-show="!item.hide"
          :id="item.id"
          :disabled="item.type === 'info'"
          :class="{
            'item-selected-color': item.isSelected,
            'no-action-listitem': item?.link ? false : true,
          }"
          @click="item?.link ? handleClick(item) : null"
        >
          <v-list-item-title>
            {{ item.title ? $t(item.title) : item.text }}
          </v-list-item-title>
          <template #prepend>
            <div v-show="item.icon || item.enableIcon || showMenuItemIcon">
              <v-icon
                v-if="item.icon"
                :color="'menu-item-icon-color'"
                :icon="item.icon"
                :size="getIconSize(item)"
              />
              <img
                v-else-if="item.enableIcon"
                style="width: 18px; vertical-align: middle"
                :src="item.enableIcon"
                alt="icon"
              />
              <span v-else style="margin-right: 30px" />
            </div>
          </template>
          <template #append>
            <div v-show="item.iconAppend" class="menu-item-icon-style">
              <v-icon
                :color="'menu-item-icon-color'"
                :icon="item.iconAppend"
                :size="getIconSize(item)"
              />
            </div>
          </template>
          <v-menu
            v-if="item.group"
            location="right"
            offset="-32"
            style="margin-left: 56px"
            content-class="submenuFixed"
            transition="scale-transition"
            activator="parent"
            open-on-hover
          >
            <v-list class="navigation-bg-color menu-list">
              <template
                v-for="(subItem, subIndex) in item.group"
                :key="'btn-menu-group-' + subIndex"
              >
                <v-divider
                  v-show="subItem.topDivider"
                  class="user-menu-divider"
                />
                <v-list-item
                  :class="{
                    'item-selected-color': subItem.isSelected,
                    'no-action-listitem': subItem?.link ? false : true,
                  }"
                  style="padding-right: 56px"
                  @click="subItem?.link ? handleClick(subItem) : null"
                >
                  <v-list-item-title>
                    {{ subItem.title ? $t(subItem.title) : subItem.text }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {VChip, VBtn} from 'vuetify/components';
import Constants from '@/constants/Constants';
const show = ref(false);
const emit = defineEmits(['itemClick', 'btnClick']);
defineProps({
  id: {
    type: String,
    default: 'app-bar-item',
  },
  menuItems: {
    type: Object,
    required: true,
  },
  btnText: {
    type: String,
    default: '',
  },
  btnIcon: {
    type: String,
    required: true,
  },
  btnTooltip: {
    type: String,
    default: '',
  },
  showMenuItemIcon: {
    type: Boolean,
    default: true,
  },
  displayCondition: {
    type: String,
    default: '',
  },
  chipStyle: {
    type: Boolean,
    default: false,
  },
});

const handleClick = (item: any) => {
  show.value = false;
  if (item && item?.link) {
    item.link();
  }
  emit('itemClick', item?.id);
};

const getIconSize = (item: any) => {
  if (!item) return '';
  else {
    return item?.iconSize ?? Constants.MENU_ICON_DEFAULT_SIZE;
  }
};
</script>

<style lang="scss" scoped>
.v-btn,
.app-bar-chip {
  &:not(.v-btn--icon, .v-chip) {
    height: 56px !important;
    border-radius: 0px;
    :deep(.v-btn__content) {
      span {
        font-size: 20px !important;
      }
      .v-icon {
        font-size: 18px !important;
        margin-right: 8px;
      }
    }
  }
  &.v-btn--icon {
    margin-right: 8px;
    .v-icon {
      font-size: 20px !important;
    }
  }
  &:hover {
    background-color: rgb(var(--v-theme-primary)) !important;
  }

  &.header-active {
    background-color: rgba(black, 0.5) !important;
  }
  &.v-chip {
    height: 44px;
    margin-left: 8px;
    margin-right: 16px;

    :deep(.v-chip__overlay) {
      opacity: 0 !important;
    }
    .v-icon,
    span {
      font-size: 18px !important;
      font-weight: normal;
      text-transform: none;
    }
  }
}

.v-menu {
  :deep(.v-overlay__content) {
    top: 56px !important;
  }
  :deep(.v-icon) {
    font-size: 20px !important;
    margin-right: 8px;
  }
}

.item-selected-color {
  color: rgb(var(--v-theme-menu-item-selected-color)) !important;
}

.no-action-listitem {
  background-color: transparent !important;
  cursor: default;

  :deep(.v-ripple__container) {
    display: none !important;
  }
}
</style>
