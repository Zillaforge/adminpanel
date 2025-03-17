<template>
  <CommonDialog
    :title="title"
    :showDialog="showDialog"
    :disableSubmit="!isValid"
    @submit="handleSubmit"
    @close="showDialog = false"
  >
    <v-form v-model="isValid">
      <v-row no-gutters class="mb-6">
        <v-col cols="3" class="form-title">
          <span class="input-required">
            {{ $t('basic.name') }}
          </span>
        </v-col>
        <v-col cols="8" class="pt-2">
          <ComboboxText
            ref="nameInputRef"
            v-model="category"
            :items="categoryOptions"
            class="form-content"
            required
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-6">
        <v-col cols="3">
          <span class="form-title">{{ $t('basic.desc') }}</span>
        </v-col>
        <v-col cols="8">
          <TextareaComponent
            :model-value="
              isCreatingNewCategory
                ? description
                : selectedCategory?.description
            "
            :disabled="!isCreatingNewCategory"
            :placeholder="$t('basic.desc')"
            @update:model-value="
            ($event: string) => (description = $event)
          "
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-6">
        <TextFieldWithHint
          ref="versionSelectRef"
          v-model="version"
          :input-title="$t('label.version')"
          :input-rules="[
            (val) =>
              !getSelectedCatetoryModules().includes(val) ||
              $t('form.error.duplicated.type', {
                type: $t('label.version'),
              }),
          ]"
          :input-hints="
          !isCreatingNewCategory
            ? (val: string) =>
              updInputHints(
                !getSelectedCatetoryModules().includes(val),
                $t('tips.module.version.unique'),
              )
            : undefined
        "
          is-required
          no-gutters
        />
      </v-row>
    </v-form>
  </CommonDialog>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';

import {useRoute} from 'vue-router';
import {useLogin} from '@/store';
import useBasics from '@/composables/useBasics';
import useAppService from '@/composables/useAppService';
import {updInputHints} from '@/utils/utils';

// components
import CommonDialog from '@/components/common/CommonDialog.vue';
import ComboboxText from '@/components/common/ComboboxText.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';

const route = useRoute();
const userStore = useLogin();
const {categoryList, execCreateApsModule, execCreateModuleCategory} =
  useAppService(route.name as string);
const category = ref<Record<string, any> | undefined>(undefined);
const description = ref('');
const version = ref('');
const moduleVersions = ref([]);
const isValid = ref(false);
const showDialog = defineModel<boolean>('show', {required: true});
const props = defineProps({
  submitCallback: {
    type: Function,
    default: undefined,
  },
  dialogTitle: {
    type: String,
    default: '',
  },
});

const {execFetchModuleList} = useAppService('');
const versionSelectRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null,
);
const {t} = useBasics();

const handleSubmit = async () => {
  showDialog.value = false;
  const moduleConfig: Record<string, any> = {
    name: version.value,
    creatorId: userStore.getUserInfo?.userId ?? '',
  };
  if (isCreatingNewCategory.value) {
    const newCategory = await execCreateModuleCategory({
      name: category.value,
      description: description.value,
      creatorId: userStore.getUserInfo?.userId ?? '',
    });
    moduleConfig.moduleCategoryId = newCategory.id;
  } else {
    moduleConfig.moduleCategoryId = selectedCategory.value?.id ?? '';
  }

  const newModule = await execCreateApsModule(moduleConfig);
  await props.submitCallback?.(newModule);
};

const title = computed(() =>
  props.dialogTitle ? props.dialogTitle : t('basic.create'),
);

const categoryOptions = computed(() => categoryList.value.map((i) => i.name));

const getSelectedCatetoryModules = () => {
  if (!Array.isArray(moduleVersions.value)) return [];
  return moduleVersions.value
    ?.filter(
      (module: {moduleCategory: Record<string, any>}) =>
        module?.moduleCategory?.id === selectedCategory.value?.id,
    )
    .map((module: {name: string}) => module.name);
};

const isCreatingNewCategory = computed(
  () => !categoryOptions.value.includes(category.value),
);

const selectedCategory = computed(() => {
  return categoryList.value.find((element) => element.name === category.value);
});

watch(
  () => category.value,
  () => {
    versionSelectRef.value?.validate();
  },
);

watch(
  () => showDialog.value,
  async () => {
    moduleVersions.value = await execFetchModuleList('');
  },
);
</script>
