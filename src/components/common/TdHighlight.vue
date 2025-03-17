<template>
  <td v-if="isStatus">
    <Light
      v-show="item"
      :status="item as string"
      :label="!disableStatusLabel ? handleString(item) : ''"
      :hint="statusExtraMsg"
      :is-align-center="isAlignCenter"
      :state-icon-style="stateIconStyle"
    />
  </td>
  <td v-else-if="useDateFilter">
    <span>{{ formatDate(item) }}</span>
  </td>
  <td v-else>
    <v-row v-if="isItemInstanceOfArray" class="ma-0 pa-0" :class="alignment">
      <v-icon v-if="icon" class="icon-margin td-icon">
        {{ icon }}
      </v-icon>
      <v-tooltip
        v-for="(elem, index) in item"
        :key="index"
        :disabled="disabledTooltip"
        location="bottom"
        max-width="'80vw'"
        :class="isCursorPointer ? 'cursor-pointer' : 'cursor-default'"
      >
        <template #activator="{props}">
          <v-chip
            v-if="isHighlight && !textLink"
            v-bind="props"
            class="chip-td"
            @click="($event: Event) => handleClickChip($event, elem)"
          >
            {{ handleString(elem, strSliceLength, isDescription, truncateId) }}
          </v-chip>
          <v-chip
            v-else-if="isHighlight && textLink"
            v-bind="props"
            class="chip-td"
          >
            <router-link :to="textLink">
              {{
                handleString(elem, strSliceLength, isDescription, truncateId)
              }}
            </router-link>
          </v-chip>
          <v-chip v-else v-bind="props" class="chip-td">
            {{ elem }}
          </v-chip>
        </template>
        <span>{{ elem }}</span>
      </v-tooltip>
    </v-row>
    <v-row v-else class="ma-0 pa-0" :class="alignment">
      <v-icon v-if="icon" class="icon-margin td-icon">
        {{ icon }}
      </v-icon>
      <v-tooltip
        :disabled="disabledTooltip"
        location="bottom"
        max-width="'80vw'"
        :class="isCursorPointer ? 'cursor-pointer' : 'cursor-default'"
      >
        <template #activator="{props}">
          <div
            v-if="isHighlight && !textLink"
            v-bind="props"
            :style="`margin: 4px 0; color: ${textColor};`"
            v-text="
              handleString(item, strSliceLength, isDescription, truncateId)
            "
          />
          <div v-else-if="isHighlight && textLink" v-bind="props">
            <router-link :to="textLink" style="text-decoration: underline">
              {{
                handleString(item, strSliceLength, isDescription, truncateId)
              }}
            </router-link>
          </div>
          <div v-else v-bind="props" v-text="item" />
        </template>
        <span>
          <pre>{{ item }}</pre>
        </span>
      </v-tooltip>
      <slot />
    </v-row>
  </td>
</template>
<script setup lang="ts">
import {computed} from 'vue';
import {formatDate, handleString} from '@/utils/utils';
import Light from '@/components/common/LightComponent.vue';
import {UUIDRegex} from '@/constants/Constants';
import useBasics from '@/composables/useBasics';

const {handleCopyToClipboard} = useBasics();
const props = defineProps({
  item: {
    // show items
    type: [String, Number, Array, Date],
    required: true,
    default: '',
  },
  search: {
    // search key word
    type: String,
    default: '',
  },
  isStatus: {
    type: Boolean,
    default: false,
  },
  useDateFilter: {
    type: Boolean,
    default: false,
  },
  statusExtraMsg: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: 'black',
  },
  isHighlight: {
    default: true,
    type: Boolean,
  },
  icon: {
    type: String,
    default: '',
  },
  textLink: {
    type: Object,
    default: null,
  },
  isCursorPointer: {
    type: Boolean,
    default: true,
  },
  isDescription: {
    type: Boolean,
    default: true,
  },
  isMultiline: {
    type: Boolean,
    default: false,
  },
  disableStatusLabel: {
    type: Boolean,
    default: false,
  },
  strSliceLength: {
    type: Number,
    default: 32,
  },
  isAlignCenter: {
    type: Boolean,
    default: false,
  },
  stateIconStyle: {
    type: String,
    default: '',
  },
  truncateId: {
    type: Boolean,
    default: true,
  },
});

const disabledTooltip = computed(() => {
  // if content is emty or type is not 'string', always disable tooltip
  if (
    !props.isHighlight ||
    !props.item ||
    (props.item && typeof props.item !== 'string')
  ) {
    return true;
  }
  const newStr = handleString(
    props.item,
    props.strSliceLength,
    props.isDescription,
  );
  // return !(UUIDRegex.test(props.item) || newStr.endsWith('...'));
  return !(
    UUIDRegex.test(props.item) ||
    (props.isDescription && newStr.endsWith('...'))
  );
});
const isItemInstanceOfArray = computed(() => {
  return props.item instanceof Array;
});
const alignment = computed(() => {
  if (props.isAlignCenter) {
    return {'justify-center': true};
  } else {
    return {'justify-center': false};
  }
});

const handleClickChip = ($event: Event, value: string | any) => {
  $event.stopPropagation();
  handleCopyToClipboard(value as string);
};
</script>

<style lang="scss" scoped>
.icon-margin {
  margin-right: 10px;
}
.chip-td {
  padding: 2px 4px;
  margin: 4px;
}
.td-icon {
  width: 24px;
  text-align: center;
}
.status-icon {
  height: inherit;
}

.v-row {
  margin: 0px;
}
</style>
