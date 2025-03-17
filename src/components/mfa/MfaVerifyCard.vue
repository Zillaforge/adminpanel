<template>
  <v-card v-show="show" class="card-style" width="600">
    <v-card-title class="title-style title-padding">
      {{ $t('mfa.input.code') }}
    </v-card-title>
    <br />
    <v-row class="px-3 ml-1">
      <span>{{ $t('mfa.input.info') }}</span>
    </v-row>
    <v-row class="pt-2 px-3 ml-1 mr-1">
      <v-text-field
        v-model="verifyCode"
        color="primary"
        variant="solo"
        density="compact"
        autofocus
        :maxlength="6"
        :placeholder="$t('mfa.verifyCode')"
        :error-messages="getError"
        @keypress.enter="
          () => {
            if (!disableMfaBtn) mfaVerify();
          }
        "
      />
    </v-row>
    <br />
    <v-card-actions>
      <v-row class="align-center justify-end ml-2 mr-2">
        <TextBtn
          :disabled="disableMfaBtn"
          :text="$t('basic.ok')"
          @click="mfaVerify"
        />
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import useBasics from '@/composables/useBasics';
import TextBtn from '@/components/common/button/TextBtn.vue';

const emit = defineEmits(['mfa-code-verify']);
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  showError: {
    type: Boolean,
    default: false,
  },
});
const {t} = useBasics();

const disableMfaBtn = ref(true);
const verifyCode = ref('');
const showErrorMsg = ref(false);

const getError = computed(() => {
  return showErrorMsg.value ? [t('mfa.verify.failed')] : [];
});
const mfaVerify = () => {
  emit('mfa-code-verify', verifyCode.value);
};
watch(
  () => verifyCode.value,
  () => {
    disableMfaBtn.value = !(verifyCode.value.length === 6);
    showErrorMsg.value = false;
  },
);
watch(
  () => props.showError,
  () => {
    showErrorMsg.value = props.showError;
  },
);
</script>
<style lang="scss" scoped>
.title-padding {
  padding-top: 25px;
}

.v-text-field :deep(.v-field__field input) {
  color: rgb(var(--v-theme-text-highlight)) !important;
  font-size: 18px !important;
}
</style>
