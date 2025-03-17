<template>
  <div>
    <v-btn
      variant="flat"
      class="ma-0 more-action-btn no-border btn-style"
      :class="customActionStyle()"
      :disabled="isDisableButton()"
      @click="handleClick(item)"
    >
      <span :class="`${isDisableButton() ? 'disabled' : ''}`">
        {{ btnText }}
      </span>
      <v-tooltip
        location="bottom"
        activator="parent"
        :disabled="btn.showTooltip ? !btn.showTooltip(item) : true"
      >
        {{ btnTips }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['itemClick']);
const props = defineProps({
  btn: {
    type: Object,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
  btnText: {
    type: String,
    required: true,
  },
  btnTips: {
    type: String,
    default: '',
  },
  checkEnableStatus: {
    type: Boolean,
    default: true,
  },
});

const handleClick = (item) => {
  emit('itemClick', item);
};

const isDisabledStatus = (status) => {
  if (!status) {
    return false;
  }
  const disabledStatus = props.btn.disabledStatus;
  if (!disabledStatus) return false;

  for (const disabledStatusItem of disabledStatus) {
    if (
      String(disabledStatusItem).toUpperCase() === String(status).toUpperCase()
    ) {
      return true;
    }
  }
  return false;
};
const isEnabledStatus = (status) => {
  if (!status) {
    return true;
  }
  const enabledStatus = props.btn.enabledStatus;
  if (!enabledStatus) {
    return false;
  }
  if (enabledStatus.length === 0) {
    return true;
  }
  return enabledStatus.some(
    (statusItem) =>
      String(statusItem).toLowerCase() === String(status).toLowerCase(),
  );
};

const isDisableButton = () => {
  // console.log(
  //   props.btnText + '(' + props.checkEnableStatus + ')',
  //   'statusChecker(' +
  //     (props.checkEnableStatus
  //       ? !isEnabledStatus(props.item?.status)
  //       : isDisabledStatus(props.item?.status)) +
  //     ')',
  //   'disabled(' + props.btn?.disabled + ')',
  //   'isDisabled(' +
  //     (props.btn.isDisabled ? props.btn.isDisabled(props.item) : false) +
  //     ')',
  // );
  return props.checkEnableStatus
    ? !isEnabledStatus(props.item?.status) ||
        props.btn?.disabled ||
        (props.btn.isDisabled ? props.btn.isDisabled(props.item) : false)
    : isDisabledStatus(props.item?.status) ||
        props.btn?.disabled ||
        (props.btn.isDisabled ? props.btn.isDisabled(props.item) : false);
};
const customActionStyle = () => {
  return props.btn.isDefaultStyle && props.btn.isDefaultStyle(props.item)
    ? ''
    : 'customActions';
};
</script>

<style lang="scss" scoped>
.btn-style {
  width: 100%;
}
</style>
