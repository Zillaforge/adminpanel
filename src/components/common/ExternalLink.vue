<template>
  <span v-if="link && link.linkTo">
    <br v-if="link.isBreakLine" />
    <span v-if="!link.isBreakLine && margin" style="margin-right: 15px" />
    <a
      class="external-link-color external-link font-weight-regular"
      :href="getLink()"
      target="_blank"
      rel="noopener"
    >
      {{ link.text }}
      <v-icon size="24" class="external-link-color mb-2">
        mdi-open-in-new
      </v-icon>
    </a>
  </span>
</template>

<script setup lang="ts">
import {getDocumentLink} from '@/constants/Document';
import i18n from '@/i18n';

const props = defineProps({
  link: {
    type: Object,
    required: true,
  },
  margin: {
    type: Boolean,
    default: true,
  },
});

const getLink = () => {
  if (
    typeof props.link.linkTo === 'string' &&
    props.link.linkTo.indexOf('#') > 0
  ) {
    return (
      props.link.linkTo.substring(0, props.link.linkTo.indexOf('#')) +
      props.link.linkTo.substring(props.link.linkTo.indexOf('#'))
    );
  } else if (typeof props.link.linkTo === 'string') {
    return props.link.linkTo;
  } else {
    return (
      props.link.linkTo[i18n.global.locale] ||
      getDocumentLink()[i18n.global.locale]
    );
  }
};
</script>
