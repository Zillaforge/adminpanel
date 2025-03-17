<template>
  <v-row class="mx-0 mb-4 title-layout" no-gutters>
    <v-col class="pa-0">
      <div>
        <span class="title-text">{{ title }}</span>
        <!-- For Learn More-->
        <ExternalLink v-if="linkUrl" :link="linkData" />
        <!-- For common link -->
        <ExternalLink v-if="link" :link="link" />
        <InfoTooltip
          v-if="tooltip"
          :tooltip="tooltip"
          location="right"
          class="ml-1"
        />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {ref, type Ref, watch} from 'vue';
import type {ExternalLinkItem} from '@/interfaces/LayoutItemInterface';
import i18n from '@/i18n';
import ExternalLink from '@/components/common/ExternalLink.vue';
import InfoTooltip from '@/components/common/InfoTooltip.vue';

const {t} = i18n.global;
const linkData: Ref<ExternalLinkItem> = ref<ExternalLinkItem>({
  text: '',
  linkTo: '',
});

// Props
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  tooltip: {
    type: String,
    default: '',
  },
  link: {
    type: Object,
    default: null,
  },
  linkUrl: {
    type: String,
    default: null,
  },
});

const init = () => {
  linkData.value = {
    text: '',
    linkTo: '',
  };
  if (props.linkUrl) {
    linkData.value = {
      text: t('basic.understand'),
      linkTo: props.linkUrl,
    };
  }
};
init();

watch(
  () => i18n.global.locale,
  () => {
    init();
  },
);
</script>

<style lang="scss" scoped>
.title-layout {
  width: -webkit-fill-available;
  width: -moz-available;
  height: 50px;
}
span .v-icon {
  vertical-align: unset;
}
.title-text {
  font-size: 32px !important;
}
</style>
