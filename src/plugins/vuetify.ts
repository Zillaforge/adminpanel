/**
 * Vuetify3 Plugin
 */
// Styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import {createVuetify} from 'vuetify';
import type {ThemeDefinition, VuetifyOptions} from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import {aliases, mdi} from 'vuetify/iconsets/mdi';
import {en, zhHant} from 'vuetify/locale';
import {APP_VERSION} from '@/constants/Constants';
// Misc
import {loadFonts} from '@/plugins/webfontloader';

void loadFonts();

let myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#2E71EB',
    icon_check_circle_color: '#2E71EB',
    icon_error_color: '#F50057',
    icon_initialize_color: '#FF9300',
    icon_running_color: '#FF9300',
    icon_default_color: '#78849E',
    icon_available_color: '#01BD7D',
    icon_review_color: '#FF9300',
    border: '#000000',
    error: '#DC1940',
    'alert-color': '#DC1940',
    'bg-main': '#F5F5F7',
    'bg-readonly-textarea': '#f5f5f5',
    'breadcrumb-bg-color': '#ffffff',
    'breadcrumb-normal-text': '#000000',
    'breadcrumb-disabled-text': '#2E71EB',
    'btn-hover-bg': '#2E71EB',
    'btn-contained-active-bg': '#2A97FF',
    'btn-contained-bg': '#2E71EB',
    'btn-contained-disabled-bg': '#000000',
    'btn-contained-disabled-text': '#000000',
    'btn-contained-text': '#ffffff',
    'btn-page-bg': '#ffffff',
    'btn-page-border': '#707070',
    'btn-page-current-bg': '#2E71EB',
    'btn-page-current-text': '#ffffff',
    'btn-texted': '#2E71EB',
    'btn-texted-active': '#2E71EB',
    'btn-texted-boarder': '#2E71EB',
    'btn-texted-disabled': '#000000',
    'btn-texted-active-bg': '#2E71EB',
    'btn-texted-active-text': '#4943d0',
    'btn-texted-border': '#2E71EB',
    'btn-texted-disabled-border': '#000000',
    'btn-texted-disabled-text': '#000000',
    'btn-texted-text': '#4943d0',
    'card-bg': '#FAFAFA',
    'card-border-color': '#000000',
    'card-creation-bg': '#ffffff',
    'card-creation-footer-bg': '#ffffff',
    'card-quota-table-border': '#E0E0E0',
    'card-quota-table-bg': '#f5f6fa',
    'card-quota-table-text': '#000000',
    'card-quota-text': '#666666',
    'default-bg': '#FFFFFF',
    'detail-table-border-color': '#c5c5c5',
    'info-icon': '#aab1c3',
    'info-icon-hover-bg': '#2E71EB',
    'input-default-border': '#000000',
    'main-color': '#2E71EB',
    'navbar-bg': '#ff2e77',
    'navbar-bg-light': '#ff2e77',
    'navbar-bg-dark': '#340968',
    'node-group-selected-bg': '#952F92',
    'node-group-selected-color': '#952e92',
    'menu-bg': '#430b6a',
    'menu-item-icon': '#ffffff',
    'menu-item-hover-bg': '#ffffff',
    'menu-item-selected-color': '#00d3ff',
    'menu-text': '#ffffff',
    'page-container-bg': '#f5f5f7',
    'tab-border': '#bcbcbc',
    'tab-hover-bg': '#2A97FF',
    'table-container-bg': '#ffffff',
    'table-icon-bg': '#000000',
    'table-icon-hover-bg': '#ecebff',
    'table-inner-bg': '#F5F7F8',
    'table-updated-text': '#4943d0',
    'table-more-action-hover-bg': '#2A97FF',
    'table-more-action-text': '000000',
    'table-row-hover-bg': '#f5f5f5',
    'table-row-selected-bg': '#e7f5f8',
    'table-search-input-bg': '#ffffff',
    'text-color': '#000000',
    'text-content': '#000000',
    'text-general': '#000000',
    'text-highlight': '#2E71EB',
    'text-disabled': '#000000',
    'tooltip-bg': '#616161',
    'tooltip-text-color': '#ffffff',
    'white-color': '#ffffff',
    'svc-icon-round': '#aab1c3',
    'svc-icon-fill': '#ffffff',
    'chip-bg': '#000000',
    'bg-dashboard-header': '#5f21A8',
    'drawer-item-selected-color': '#2a97ff',
    'ripple-color': '#2A97FF',
    'hover-bg': '#2A97FF',
    'hint-success': '#66DE98',
    'hint-error': '#FF7E7E',
    'list-bg': '#FAFAFA',
  },
  variables: {
    'app-bar-height-px': '56px',
    'footer-height-px': '60px',
    'breadcrumb-height-px': '38px',
    'menu-width': '260px',
    'content-min-width': '1280px',
    'breadcrumb-text-opacity': '0.87',
    'breadcrumb-disabled-text-opacity': '1',
    'btn-hover-bg-opacity': '0.25',
    'btn-contained-disabled-bg-opacity': '0.12',
    'btn-contained-disabled-text-opacity': '0.38',
    'btn-page-border-opacity': '0.26',
    'btn-texted-active-bg-opacity': '0.12',
    'btn-texted-disabled-border-opacity': '0.26',
    'btn-texted-disabled-text-opacity': '0.26',
    'btn-texted-disabled-opacity': '0.26',
    'card-border-opacity': 0.16,
    'card-creation-bg-opacity': '1',
    'detail-table-border-color-opacity': '1',
    'info-icon-hover-bg-opacity': '1',
    'input-default-border-opacity': '0.16',
    'menu-item-hover-bg-opacity': '0.25',
    'node-group-selected-bg-opacity': '0.12',
    'tab-hover-bg-opacity': '0.12',
    'table-search-input-bg-opacity': '1',
    'table-more-action-hover-bg-opacity': '0.12',
    'table-more-action-text-opacity': '0.87',
    'text-general-opacity': '0.87',
    'text-content-opacity': '0.60',
    'text-disabled-opacity': '0.26',
    'border-opacity': '0.12',
    'chip-opacity': '0.12',
    'chip-icon-opacity': '0.6',
    'drawer-item-hover-opacity': '0.06',
    'drawer-item-selected-opacity': '0.12',
    'drawer-item-selected-hover-opacity': '0.18',
    'border-disabled-opacity': '0.08',
    'ripple-opacity': '0.12',
    'general-bg-opacity': '0.12',
    'hover-bg-opacity': '0.12',
    'list-border-opacity': '0.38',
    'box-shadow-opacity': '0.5',
    'scrollbar-height-px': '9px',
  },
};

let myCustomDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#2E71EB',
    icon_check_circle_color: '#a39fff',
    icon_error_color: '#F50057',
    icon_initialize_color: '#FFAF19',
    icon_running_color: '#Fd9560',
    icon_default_color: '#78849E',
    border: '#ffffff',
    error: '#DC1940',
    'alert-color': '#DC1940',
    'bg-main': '#F5F5F7',
    'bg-readonly-textarea': '#f5f5f5',
    'breadcrumb-bg-color': '#0d0d0d',
    'breadcrumb-normal-text': '#FFFFFF',
    'breadcrumb-disabled-text': '#FFFFFF',
    'btn-hover-bg': '#2E71EB',
    'btn-contained-active-bg': '#2A97FF',
    'btn-contained-bg': '#a39fff',
    'btn-contained-disabled-bg': 'ffffff',
    'btn-contained-disabled-text': '#ffffff',
    'btn-contained-text': '#000000',
    'btn-page-bg': '#2e2e2e',
    'btn-page-border': '#ffffff',
    'btn-page-current-bg': '#a29fff',
    'btn-page-current-text': '#000000',
    'btn-texted': '#2E71EB',
    'btn-texted-active': '#2E71EB',
    'btn-texted-boarder': '#2E71EB',
    'btn-texted-disabled': '#000000',
    'btn-texted-active-bg': '#a39fff',
    'btn-texted-active-text': '#ffffff',
    'btn-texted-border': '#a39fff',
    'btn-texted-disabled-border': '#ffffff',
    'btn-texted-disabled-text': '#ffffff',
    'btn-texted-text': '#a39fff',
    'card-bg': '#272727',
    'card-border-color': '#ffffff',
    'card-creation-bg': '#ffffff',
    'card-creation-footer-bg': '#303030',
    'card-quota-table-border': '#656565',
    'card-quota-table-bg': '#2F2F2F',
    'card-quota-table-text': '#ffffff',
    'card-quota-text': '#ffffff',
    'default-bg': '#000000',
    'detail-table-border-color': '#ffffff',
    'info-icon': '#FFFFFF',
    'info-icon-hover-bg': '#FFFFFF',
    'input-default-border': '#ffffff',
    'main-color': '#a39fff',
    'navbar-bg': '#303134',
    'navbar-bg-light': '#303134',
    'navbar-bg-dark': '#303134',
    'node-group-selected-bg': '#A39FFF',
    'node-group-selected-color': '#a39fff',
    'menu-bg': '#073346',
    'menu-item-icon': '#ffffff',
    'menu-item-hover-bg': '#ffffff',
    'menu-item-selected-color': '#00d3ff',
    'menu-text': '#ffffff',
    'page-container-bg': '#000000',
    'tab-border': '#F5F5F7',
    'tab-hover-bg': '#2A97FF',
    'table-container-bg': '#232323',
    'table-icon-bg': '#ffffff',
    'table-icon-hover-bg': '#333333',
    'table-inner-bg': '#000000',
    'table-updated-text': '#a39fff',
    'table-more-action-hover-bg': '#2A97FF',
    'table-more-action-text': 'ffffff',
    'table-row-hover-bg': '#3a3a3a',
    'table-row-selected-bg': '#3b3947',
    'table-search-input-bg': '#ffffff',
    'text-color': '#ffffff',
    'text-content': '#ffffff',
    'text-general': '#ffffff',
    'text-highlight': '#2E71EB',
    'text-disabled': '#000000',
    'tooltip-bg': '#e8eaed',
    'tooltip-text-color': '#000000',
    'white-color': '#ffffff',
    'svc-icon-round': '#aab1c3',
    'svc-icon-fill': '#ffffff',
    'chip-bg': '#000000',
    'bg-dashboard-header': '#5f21A8',
    'drawer-item-hover-opacity': '0.06',
    'drawer-item-selected-opacity': '0.12',
    'drawer-item-selected-color': '#2a97ff',
    'ripple-color': '#2A97FF',
    'hover-bg': '#2A97FF',
    'hint-success': '#66DE98',
    'hint-error': '#FF7E7E',
    'list-bg': '#073346',
  },
  variables: {
    'app-bar-height-px': '56px',
    'footer-height-px': '60px',
    'breadcrumb-height-px': '38px',
    'menu-width': '260px',
    'content-min-width': '1280px',
    'breadcrumb-text-opacity': '0.6',
    'breadcrumb-disabled-text-opacity': '0.87',
    'btn-hover-bg-opacity': '0.25',
    'btn-contained-disabled-bg-opacity': '0.12',
    'btn-contained-disabled-text-opacity': '0.38',
    'btn-page-border-opacity': '0.3',
    'btn-texted-active-bg-opacity': '0.1',
    'btn-texted-disabled-border-opacity': '0.12',
    'btn-texted-disabled-text-opacity': '0.38',
    'btn-texted-disabled-opacity': '0.26',
    'detail-table-border-color-opacity': '0.3',
    'card-border-opacity': 0.16,
    'card-creation-bg-opacity': '0.05',
    'info-icon-hover-bg-opacity': '0.7',
    'input-default-border-opacity': '0.3',
    'menu-item-hover-bg-opacity': '0.25',
    'node-group-selected-bg-opacity': '0.25',
    'tab-hover-bg-opacity': '0.12',
    'table-search-input-bg-opacity': '0',
    'table-more-action-hover-bg-opacity': '0.12',
    'table-more-action-text-opacity': '1',
    'text-general-opacity': '0.87',
    'text-content-opacity': '0.60',
    'text-disabled-opacity': '0.26',
    'border-opacity': '0.12',
    'chip-opacity': '0.12',
    'chip-icon-opacity': '0.6',
    'drawer-item-selected-hover-opacity': '0.18',
    'border-disabled-opacity': '0.08',
    'ripple-opacity': '0.12',
    'general-bg-opacity': '0.12',
    'hover-bg-opacity': '0.12',
    'list-border-opacity': '0.38',
    'box-shadow-opacity': '0.5',
    'scrollbar-height-px': '9px',
  },
};

const customizeTheme = () => {
  if (APP_VERSION.includes('trusted-cloud-public')) {
    myCustomLightTheme = {
      ...myCustomLightTheme,
      colors: {
        ...myCustomLightTheme.colors,
        'menu-bg': '#ffffff',
        'menu-item-icon': '#000000',
        'menu-item-hover-bg': '#2A97FF',
        'menu-item-selected-color': '#2E71EB',
        'menu-text': '#000000',
        'navbar-bg-light': '#2D77EE',
        'navbar-bg-dark': '#2D77EE',
      },
      variables: {
        ...myCustomLightTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
    myCustomDarkTheme = {
      ...myCustomDarkTheme,
      colors: {
        ...myCustomDarkTheme.colors,
      },
      variables: {
        ...myCustomDarkTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
  } else if (APP_VERSION.includes('trusted-cloud-private')) {
    myCustomLightTheme = {
      ...myCustomLightTheme,
      colors: {
        ...myCustomLightTheme.colors,
        'bg-dashboard-header': '#950014',
        'menu-bg': '#ffffff',
        'menu-item-icon': '#000000',
        'menu-item-hover-bg': '#2A97FF',
        'menu-item-selected-color': '#2E71EB',
        'menu-text': '#000000',
        'navbar-bg-light': '#444D93',
        'navbar-bg-dark': '#444D93',
      },
      variables: {
        ...myCustomLightTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
    myCustomDarkTheme = {
      ...myCustomDarkTheme,
      colors: {
        ...myCustomDarkTheme.colors,
        'bg-dashboard-header': '#950014',
      },
      variables: {
        ...myCustomDarkTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
  } else if (APP_VERSION.includes('trusted-cloud-system')) {
    myCustomLightTheme = {
      ...myCustomLightTheme,
      colors: {
        ...myCustomLightTheme.colors,
        'bg-dashboard-header': '#202A38',
        'menu-bg': '#ffffff',
        'menu-item-icon': '#000000',
        'menu-item-hover-bg': '#2A97FF',
        'menu-item-selected-color': '#2E71EB',
        'menu-text': '#000000',
        'navbar-bg-light': '#3A4F54',
        'navbar-bg-dark': '#3A4F54',
      },
      variables: {
        ...myCustomLightTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
    myCustomDarkTheme = {
      ...myCustomDarkTheme,
      colors: {
        ...myCustomDarkTheme.colors,
        'bg-dashboard-header': '#202A38',
      },
      variables: {
        ...myCustomDarkTheme.variables,
        'menu-item-hover-bg-opacity': '0.10',
      },
    };
  }
};
customizeTheme();

/**
 * Vuetify Components
 *
 * @see {@link https://vuetifyjs.com/en/features/treeshaking/}
 */
const vuetifyConfig: VuetifyOptions = {
  // Global configuration
  // https://vuetifyjs.com/en/features/global-configuration/
  /*
  defaults: {
    global: {
      ripple: false,
    },
    VSheet: {
      elevation: 4,
    },
  },
  */
  // Icon Fonts
  // https://vuetifyjs.com/en/features/icon-fonts/
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  // Internationalization (i18n)
  // https://vuetifyjs.com/en/features/internationalization/#internationalization-i18n
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: {en, zhHant},
  },
  // Theme
  // https://vuetifyjs.com/en/features/theme/
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
      myCustomDarkTheme,
    },
  },
};
export default createVuetify(vuetifyConfig);

// Export for test.
export {components, directives};
