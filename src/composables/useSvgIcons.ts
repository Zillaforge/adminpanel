import {defineAsyncComponent} from 'vue';

import {useTheme} from 'vuetify';

// https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/
const storageIcon = async () =>
  await import('@/components/svgIcons/IconStorage.vue');
const addFileIcon = async () =>
  await import('@/components/svgIcons/IconAddFile.vue');
const applicationIcon = async () =>
  await import('@/components/svgIcons/IconApplication.vue');
const logIcon = async () => await import('@/components/svgIcons/IconLog.vue');
const ctrImageIcon = async () =>
  await import('@/components/svgIcons/IconCtrImage.vue');
const vmImageIcon = async () =>
  await import('@/components/svgIcons/IconVmImage.vue');

const IconKeys = {
  storage: 'storage',
  add_file: 'add_file',
  application: 'application',
  log: 'log',
  ctr_image: 'ctr_image',
  vm_image: 'vm_image',
};
const ServiceIcons = {
  [IconKeys.storage]: {
    svg: defineAsyncComponent(storageIcon),
    colorful: '#0194d5',
  },
  [IconKeys.add_file]: {
    svg: defineAsyncComponent(addFileIcon),
    colorful: '#aab1c3',
  },
  [IconKeys.application]: {
    svg: defineAsyncComponent(applicationIcon),
    colorful: '#6359b2',
  },
  [IconKeys.log]: {
    svg: defineAsyncComponent(logIcon),
    colorful: '#aab1c3',
  },
  [IconKeys.ctr_image]: {
    svg: defineAsyncComponent(ctrImageIcon),
    colorful: '#2aa092',
  },
  [IconKeys.vm_image]: {
    svg: defineAsyncComponent(vmImageIcon),
    colorful: '#735fa8',
  },
};

const getColor = (isSelected: any) => {
  const theme = useTheme();
  const themeColor = theme.computedThemes.value[theme.global.name.value].colors;
  return isSelected ? themeColor['menu-item-selected-color'] : 'white';
};

const getSvgThemeColor = (isColorful: any, iconName: string | number) => {
  if (isColorful) {
    return {
      round: ServiceIcons[iconName].colorful,
      icon: 'white',
    };
  }

  const theme = useTheme();
  const themeColor = theme.computedThemes.value[theme.global.name.value].colors;
  return {
    round: themeColor['svc-icon-round'],
    icon: themeColor['svc-icon-fill'],
  };
};

const useComposable = () => {
  return {
    IconKeys,
    ServiceIcons,

    getColor,
    getSvgThemeColor,
  };
};
export default useComposable;
