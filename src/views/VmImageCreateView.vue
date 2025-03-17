<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useLogin, useGlobal} from '@/store';
import useImages from '@/composables/useImages';
import useCloudStorage from '@/composables/useCloudStorage';
import AlertComponent from '@/components/common/AlertComponent.vue';
import CheckItem from '@/components/common/CheckItem.vue';
import ComboboxText from '@/components/common/ComboboxText.vue';
import SelectWithHint from '@/components/common/SelectWithHint.vue';
import Step from '@/components/common/StepComponent.vue';
import TextFieldWithHint from '@/components/common/TextFieldWithHint.vue';
import TextareaComponent from '@/components/common/TextareaComponent.vue';
import RadioButtonSwitch from '@/components/common/RadioButtonSwitch.vue';
import TitleComp from '@/components/common/TitleComponent.vue';
import UiContainer from '@/components/common/UiContainer.vue';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {ADMIN_PROJECT_ID, TRUSTED_CLOUD_NAMESPACE} from '@/constants/Constants';
import i18n from '@/i18n';
import router from '@/router';
import {updInputHints} from '@/utils/utils';

const route = useRoute();
const userStore = useLogin();
const globalStore = useGlobal();
const {
  getSiteStorageSchema,
  vmImageList,
  execFetchVirtualImageList,
  execCreateVirtualImage,
} = useImages(route.name as string);
const {s3BucketList, execFetchS3BucketList} = useCloudStorage('');

const {t} = i18n.global;
interface FormError {
  name?: string;
  operatingSystem?: string;
  version?: string;
  bucket?: string;
  filePath?: string;
}

const steps = computed(() => [
  t('label.basic.info'),
  t('image.source'),
  t('creation.step.review'),
]);

const selectedImage = ref<Record<string, any> | undefined>(undefined);
const description = ref('');
const operatingSystem = ref('');
const version = ref('');
const publicZone = ref(true);

const diskFormat = ref('');
const containerFormat = ref('bare');
const bucket = ref('');
const filePath = ref('');

const sysBucketList = computed(() => s3BucketList.value.map((i) => i.Name));
const diskFormatOptions = ref(['raw', 'qcow2']);

const validBasic = ref(false);
const validImageSource = ref(false);
const formError = ref<FormError>({});
const currentStep = ref(1);

const nameInputRef = ref<InstanceType<typeof ComboboxText> | null>(null);
const operatingSystemSelectRef = ref<InstanceType<
  typeof SelectWithHint
> | null>(null);
const versionSelectRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null,
);
const diskFormatSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(
  null,
);
const bucketSelectRef = ref<InstanceType<typeof SelectWithHint> | null>(null);
const filePathInputRef = ref<InstanceType<typeof TextFieldWithHint> | null>(
  null,
);

onMounted(async () => {
  await execFetchVirtualImageList(ADMIN_PROJECT_ID);
  await execFetchS3BucketList();
  diskFormat.value = 'raw';
  containerFormat.value = 'bare';
});

const imageOptions = computed(() =>
  vmImageList.value.map((i) => ({
    id: i.id,
    name: i.name,
    subtitle:
      i.namespace === TRUSTED_CLOUD_NAMESPACE.PUBLIC
        ? t('basic.zone.public')
        : t('basic.zone.private'),
  })),
);
const isCreatingNewImage = computed(
  () =>
    !imageOptions.value
      .map((img: {id: string}) => img.id)
      .includes(selectedImage.value?.value),
);
const selectedRepo = computed(() => {
  return vmImageList.value.find(
    (repo) => repo.id === selectedImage.value?.value,
  );
});

const errSteps = ref<any[]>([]);
watch(currentStep, () => {
  if (currentStep.value === steps.value.length) {
    errSteps.value = getErrorSteps();
  }
});

const getErrorSteps = () => {
  const errSteps: any[] = [];
  if (currentStep.value !== steps.value.length) {
    return errSteps;
  }

  // basic (step 1)
  nameInputRef.value?.validate();
  operatingSystemSelectRef.value?.validate();
  versionSelectRef.value?.validate();
  if (!validBasic.value) {
    errSteps.push(steps.value[0]);
  }
  // image source (step 2)
  bucketSelectRef.value?.validate();
  filePathInputRef.value?.validate();
  if (!validImageSource.value) {
    errSteps.push(steps.value[1]);
  }
  return errSteps;
};

const getSelectedImageTags = () => {
  return selectedRepo.value?.tags.map((tag: {name: string}) => tag.name) || [];
};

const submit = async () => {
  console.log('submit');
  const payload: Record<string, any> = {
    namespace: publicZone.value
      ? TRUSTED_CLOUD_NAMESPACE.PUBLIC
      : TRUSTED_CLOUD_NAMESPACE.PRIVATE,
    version: version.value,
    type: 'common',
    diskFormat: diskFormat.value,
    containerFormat: containerFormat.value,
    filepath: `${getSiteStorageSchema()}://${bucket.value}/${filePath.value}`,
  };
  if (isCreatingNewImage.value) {
    payload.name = selectedImage.value;

    payload.operatingSystem = operatingSystem.value;
    payload.description = description.value;
    payload.creator = userStore.getUserInfo?.userId ?? '';
    payload.projectId = ADMIN_PROJECT_ID;
  } else {
    payload.repositoryId = selectedRepo.value?.id;
  }
  await execCreateVirtualImage(payload);
};
const cancel = async () => {
  await router.push({name: PAGE_TYPES.VM_IMAGE_LIST});
};

watch(
  () => selectedImage.value,
  () => {
    versionSelectRef.value?.validate();
  },
);
</script>

<template>
  <UiContainer>
    <v-row no-gutters class="main-content contain-footer">
      <TitleComp
        :title="$t('basic.create.type', {type: $t('services.vmImageManage')})"
      />
      <v-col class="pt-4">
        <Step
          v-model="currentStep"
          :step-names="steps"
          :err-steps="errSteps"
          @submit="submit"
          @cancel="cancel"
        >
          <v-stepper-window-item :value="1">
            <v-form v-model="validBasic">
              <v-row no-gutters class="mb-6">
                <v-col cols="3" class="form-title">
                  <span class="input-required">
                    {{ $t('basic.name') }}
                  </span>
                </v-col>
                <v-col cols="6" style="padding-top: 10px">
                  <ComboboxText
                    ref="nameInputRef"
                    v-model="selectedImage"
                    :items="imageOptions"
                    item-title="name"
                    item-value="id"
                    show-item-props
                    class="form-content"
                    return-object
                    required
                    @form-error="(errMsg) => (formError.name = errMsg)"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-6">
                <RadioButtonSwitch
                  v-if="!globalStore.getIsPilotRegion"
                  :col-title-width="3"
                  :disabled="!isCreatingNewImage"
                  is-inline
                  :isRequired="true"
                  :options="[
                    {label: $t('basic.zone.public'), value: true},
                    {label: $t('basic.zone.private'), value: false},
                  ]"
                  :init-value="
                    isCreatingNewImage
                      ? publicZone
                      : selectedRepo?.namespace ===
                        TRUSTED_CLOUD_NAMESPACE.PUBLIC
                      ? true
                      : false
                  "
                  :title="$t('basic.zone')"
                  @select="(event: boolean) => {
                    publicZone = event;
                  }
                  "
                />
              </v-row>
              <v-row no-gutters class="mb-6">
                <v-col cols="3">
                  <span class="form-title">{{ $t('basic.desc') }}</span>
                </v-col>
                <v-col cols="6">
                  <TextareaComponent
                    :model-value="
                      isCreatingNewImage
                        ? description
                        : selectedRepo?.description
                    "
                    :disabled="!isCreatingNewImage"
                    :placeholder="$t('basic.desc')"
                    @update:model-value="
                      ($event: string) => (description = $event)
                    "
                  />
                </v-col>
              </v-row>
              <v-row no-gutters class="mb-6">
                <SelectWithHint
                  v-if="isCreatingNewImage"
                  ref="operatingSystemSelectRef"
                  v-model="operatingSystem"
                  :items="[
                    {name: 'Linux', value: 'linux'},
                    {name: 'Windows', value: 'windows'},
                  ]"
                  :input-title="$t('label.operatingSystem')"
                  :under-line-hint="$t('tips.vm.os.hint')"
                  is-required
                  no-gutters
                  @form-error="(errMsg: string) => (formError.operatingSystem = errMsg)"
                />
                <template v-else>
                  <v-col cols="3">
                    <span class="form-title">
                      {{ $t('label.operatingSystem') }}
                    </span>
                  </v-col>
                  <v-col cols="6" class="form-title">
                    <span>{{ selectedRepo?.operatingSystem }}</span>
                  </v-col>
                </template>
              </v-row>
              <v-row no-gutters class="mb-6">
                <TextFieldWithHint
                  ref="versionSelectRef"
                  v-model="version"
                  :column-width="6"
                  :input-title="$t('label.version')"
                  :input-rules="[
                    (val) =>
                      !getSelectedImageTags().includes(val) ||
                      $t('s3.error.nameDuplicated.type', {
                        type: $t('image.tag'),
                      }),
                  ]"
                  :input-hints="
                    !isCreatingNewImage
                      ? (val: string) =>
                          updInputHints(
                            !getSelectedImageTags().includes(val),
                            $t('tips.image.tag.unique'),
                          )
                      : undefined
                  "
                  is-required
                  no-gutters
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>
          <v-stepper-window-item :value="2">
            <v-form v-model="validImageSource">
              <v-row no-gutters class="mb-6">
                <SelectWithHint
                  ref="diskFormatSelectRef"
                  v-model="diskFormat"
                  :items="diskFormatOptions"
                  :input-title="$t('image.diskFormat')"
                  is-required
                  no-gutters
                  @form-error="(errMsg) => (formError.bucket = errMsg)"
                />
              </v-row>
              <v-row no-gutters class="mb-6">
                <SelectWithHint
                  ref="bucketSelectRef"
                  v-model="bucket"
                  :items="sysBucketList"
                  :input-title="
                    $t('s3.bucket.type', {type: $t('services.cloudStorage')})
                  "
                  :input-label="
                    $t('basic.choose.type', {type: $t('s3.bucket')})
                  "
                  is-required
                  no-gutters
                  @form-error="(errMsg: string) => (formError.bucket = errMsg)"
                />
              </v-row>
              <v-row no-gutters>
                <TextFieldWithHint
                  ref="filePathInputRef"
                  v-model="filePath"
                  :column-width="6"
                  :input-title="$t('label.filePath')"
                  is-required
                  :type="'name'"
                  no-gutters
                  @form-error="
                    (event) => {
                      formError.filePath = event[0];
                    }
                  "
                />
              </v-row>
            </v-form>
          </v-stepper-window-item>

          <v-stepper-window-item :value="3">
            <v-col v-if="errSteps.length > 0" class="pa-0" cols="12">
              <AlertComponent :message="$t('form.error.alert')" />
            </v-col>
            <CheckItem
              :key-name="$t('basic.name')"
              :error-msg="formError.name"
              :value="selectedImage?.title ?? selectedImage"
            />
            <CheckItem
              v-if="!globalStore.getIsPilotRegion"
              :key-name="$t('basic.zone')"
              :value="
                publicZone ? $t('basic.zone.public') : $t('basic.zone.private')
              "
            />
            <CheckItem
              :key-name="$t('basic.desc')"
              :value="
                isCreatingNewImage ? description : selectedRepo?.description
              "
            />
            <CheckItem
              :key-name="$t('label.operatingSystem')"
              :error-msg="formError.operatingSystem"
              :value="
                isCreatingNewImage
                  ? operatingSystem
                  : selectedRepo?.operatingSystem
              "
            />
            <CheckItem
              :key-name="$t('label.version')"
              :error-msg="formError.version"
              :value="version"
            />
            <CheckItem
              :key-name="$t('s3.bucket')"
              :value="bucket"
              :error-msg="formError.bucket ?? !bucket ? t('form.required') : ''"
            />
            <CheckItem
              :key-name="$t('label.filePath')"
              :value="filePath"
              :error-msg="
                formError.filePath ?? !filePath ? t('form.required') : ''
              "
            />
          </v-stepper-window-item>
        </Step>
      </v-col>
    </v-row>
  </UiContainer>
</template>

<style lang="scss" scoped></style>
