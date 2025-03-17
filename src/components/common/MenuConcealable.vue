<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :temporary="smAndDown"
    mobile-breakpoint="sm"
    :width="Constants.MENU_NORMAL_WIDTH"
    :location="'left'"
    class="navigation-bg-color navigation-style"
  >
    <v-list v-model:opened="opened" class="py-0" open-strategy="single">
      <template v-for="(item, index) in content" :key="'v-list-' + index">
        <!-- single item -->
        <v-list-item
          v-show="!item.hide && !item.group"
          :title="item.title"
          :class="onColor[index] ? 'selected-list-item' : 'list-item'"
          @click="goto(item)"
        >
          <template #prepend>
            <div class="menu-prepend-icon-style">
              <v-icon v-if="item.icon" :size="getIconSize(item)">
                {{ item.icon }}
              </v-icon>
              <component
                :is="SvgMenuIcon"
                v-else-if="item.svgIcon"
                :icon-name="item.svgIcon"
                :selected="onColor[index]"
              />
            </div>
          </template>
        </v-list-item>

        <!-- group item-->
        <v-list-group v-show="!item.hide && item.group" :value="item.title">
          <template #activator="{props}">
            <v-list-item
              v-bind="props"
              :title="item.title"
              :class="'list-item'"
            >
              <template #prepend>
                <div class="menu-prepend-icon-style">
                  <v-icon
                    v-if="item.icon"
                    :icon="item.icon"
                    :color="onColor[index] ? 'selected-list-item' : 'list-item'"
                    :size="getIconSize(item)"
                  />
                  <component
                    :is="SvgMenuIcon"
                    v-else-if="item.svgIcon"
                    :icon-name="item.svgIcon"
                    :selected="onColor[index] && false"
                  />
                </div>
              </template>
            </v-list-item>
          </template>
          <v-list-item
            v-for="(subItem, i) in item.group"
            v-show="!subItem.hide && !subItem.subgroup"
            :key="'subItem-' + i"
            :class="subItem.onColor ? 'selected-list-item' : 'list-item'"
            :title="subItem.title"
            @click="goto(subItem)"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
  <v-btn
    v-if="!smAndDown"
    class="toggle-btn"
    @click.stop="showDrawer = !showDrawer"
  >
    <v-icon>
      {{ showDrawer ? 'mdi-menu-left' : 'mdi-menu-right' }}
    </v-icon>
    <v-tooltip activator="parent" location="end">
      {{
        showDrawer
          ? $t('basic.navigation.drawer.hide')
          : $t('basic.navigation.drawer.show')
      }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';

import useNavigationDrawerStore from '@/store/NavigationDrawerStore';

import {useDisplay} from 'vuetify';
import type {Ref} from 'vue';
import type MenuItem from '@/interfaces/MenuItemInterface';
import Constants from '@/constants/Constants';
import SvgMenuIcon from '@/components/common/SvgMenuIcon.vue';

const showDrawer = ref(true);
const route = useRoute();
const router = useRouter();
const {smAndDown} = useDisplay();
const navigationDrawerStore = useNavigationDrawerStore();
const onColor: Ref<Array<boolean>> = ref([]);
const opened: Ref<Array<string>> = ref([]);

const props = defineProps({
  content: {
    type: Array<any>,
    default: () => [],
  },
});

const goto = (item: MenuItem) => {
  /**
   *  samePathCallback的目的是為了解決點擊相同頁面的link時不會重新整理的問題
   *  方法是比對現在的route名稱:"this.$router.app.$route.name" 和目標route名稱:"item.routeName"
   **/
  if (item.routeName === route.name) {
    if (
      item.samePathCallback &&
      Object.prototype.hasOwnProperty.call(item, 'samePathCallback')
    ) {
      // if (item.hasOwnProperty('samePathCallback')) {
      // 只處理有設samePathCallback的連結
      item.samePathCallback();
    } else {
      router.push({name: item.routeName, params: item.routeParams});
    }
  } else if (item.routeName) {
    router.push({name: item.routeName, params: item.routeParams});
  } else if (item.linkUrl && item.linkUrl !== undefined) {
    window.open(item.linkUrl, '_blank', 'noopener, noreferrer');
  }
};

const initTitleColor = () => {
  const currentPath = router.currentRoute.value.path?.toLowerCase();
  props.content.forEach((element, idx) => {
    onColor.value[idx] = false;
    if (!element.group && element.relatedPath) {
      element.relatedPath.some((path: string) => {
        if (currentPath.includes(path.toLowerCase())) {
          onColor.value[idx] = true;
          opened.value = [element.title];
          return true;
        } else return false;
      });
    } else if (element.group) {
      element.group.forEach((subItem: MenuItem) => {
        if (subItem.relatedPath) {
          for (const path of subItem.relatedPath) {
            subItem.onColor = false;
            if (currentPath.includes(path.toLowerCase())) {
              onColor.value[idx] = true;
              subItem.onColor = true;
              opened.value = [element.title];
              break;
            }
          }
        }
      });
    }
  });
};

const init = () => {
  initTitleColor();
};

const getIconSize = (item?: MenuItem) => {
  if (!item) return '';
  else {
    return item?.iconSize ?? Constants.MENU_ICON_DEFAULT_SIZE;
  }
};

init();

watch(
  () => [router.currentRoute.value.path, props.content],
  () => initTitleColor(),
);

watch(
  () => navigationDrawerStore.showNavigationDrawer,
  (val) => (showDrawer.value = val),
);
watch(
  () => showDrawer,
  (val) => {
    if (!val && smAndDown) {
      navigationDrawerStore.toggleNavigationDrawer(false);
    }
  },
);
</script>

<style lang="scss" scoped>
.list-item {
  color: rgba(var(--v-theme-menu-text), var(--v-text-general-opacity));
  &:hover {
    background-color: rgba(
      var(--v-theme-drawer-item-selected-color),
      var(--v-drawer-item-hover-opacity)
    );
  }
}

.selected-list-item {
  color: rgb(var(--v-theme-menu-item-selected-color));
  background-color: rgba(
    var(--v-theme-drawer-item-selected-color),
    var(--v-drawer-item-selected-opacity)
  );
  box-shadow: inset 6px 0 rgb(var(--v-theme-primary));
  &:hover {
    background-color: rgba(
      var(--v-theme-drawer-item-selected-color),
      var(--v-drawer-item-selected-hover-opacity)
    );
  }
}

.navigation-style {
  height: 100%;
  min-height: calc(100vh - var(--v-app-bar-height-px)) !important;
}

.menu-prepend-icon-style {
  width: 54px;
  align-items: center;
  align-self: center;
  display: flex;
  padding-left: 7px;
}

.toggle-btn {
  min-width: auto;
  padding: 0px;
  position: absolute;
  top: calc(50% + 32px - 18px);
  z-index: 1999;
  border: 1px solid #00000042;
  box-shadow: 0px 1px 2px #00000029;
  border-radius: 0px 8px 8px 0px;
  &:hover {
    border: 2px solid rgba(var(--v-theme-primary));
  }
}
</style>
