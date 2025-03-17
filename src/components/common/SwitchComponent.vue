<template>
  <v-row no-gutters>
    <v-col :cols="colWidth">
      <div class="form-title">
        {{ title }}
      </div>
    </v-col>
    <v-col>
      <v-switch v-model="selection" color="primary" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';

defineOptions({
  name: 'SwitchComponent',
});
const emit = defineEmits(['selectionChange']);
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  initSelection: {
    type: Boolean,
    required: true,
  },
  colWidth: {
    type: Number,
    default: 3,
  },
});
const selection = ref(false);

const init = () => {
  selection.value = props.initSelection;
};
init();
watch(
  () => props.initSelection,
  () => {
    init();
  },
);

watch(
  () => selection.value,
  () => {
    emit('selectionChange', selection.value);
  },
);
</script>
