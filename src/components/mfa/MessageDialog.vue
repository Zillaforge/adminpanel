<template>
  <v-dialog
    width="800"
    scrollable
    persistent
    :model-value="showDialog"
    @keydown.enter="onSubmit"
  >
    <v-card v-if="true" class="pa-3">
      <v-card-title class="headline-style">{{ dialogTitle }}</v-card-title>
      <v-card-text class="des-style">
        <v-row>
          <v-col
            v-if="type == 0"
            cols="12"
            class="des-header-style des-header-padding pl-2"
          >
            {{ $t('mfa.enabled.dialog.msg.head') }}
          </v-col>
          <v-col cols="12" class="pl-2">{{ dialogMessage }}</v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="mt-3">
        <v-spacer />
        <TextBtn
          v-show="showCancelBtn"
          :text="$t('basic.cancel')"
          @click="handleClose"
        />

        <TextBtn
          :text="submitBtnText ? submitBtnText : $t('basic.done')"
          @click="onSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import useBasics from '@/composables/useBasics';
import TextBtn from '@/components/common/button/TextBtn.vue';

const emit = defineEmits(['cancelDialog', 'onMfaMsgDlgSubmit']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  type: {
    type: Number,
    default: 0, // 0:enable, 1: disable
  },
  showCancelBtn: {
    type: Boolean,
    default: true,
  },
  submitBtnText: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
});
const {t} = useBasics();

const dialogTitle = computed(() => {
  switch (props.type) {
    case 0:
      return t('mfa.enabled.dialog.title');
    case 1:
      return t('mfa.disabled.dialog.title');
  }
  return '';
});
const dialogMessage = computed(() => {
  switch (props.type) {
    case 0:
      return t('mfa.enabled.dialog.msg');
    case 1:
      return t('mfa.disabled.dialog.description');
  }
  return '';
});

const onSubmit = () => {
  emit('onMfaMsgDlgSubmit');
};
const handleClose = () => {
  emit('cancelDialog');
};
</script>

<style lang="scss" scoped>
.des-header-padding {
  padding-bottom: 12px;
}
.des-header-style {
  font-size: 16px !important;
  font-weight: bold;
}

.des-style {
  overflow: hidden !important;
  min-height: 50px !important;
}
</style>
