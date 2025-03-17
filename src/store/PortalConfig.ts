import {defineStore} from 'pinia';
import {COOKIE_CONFIG, DOMAIN, ENV} from '@/constants/Constants';
import axios from 'axios';

interface PortalConfigState {
  hasGottenConfigFromJson: boolean;
  portalConfig: Record<string, any>;
  portalCookie: Record<string, any>;
}

const usePortalConfigStore = defineStore('portalConfig', {
  state: (): PortalConfigState => {
    return {
      hasGottenConfigFromJson: false,
      portalConfig: {},
      portalCookie: {},
    };
  },

  getters: {
    getHasGottenConfigFromJson: (state: PortalConfigState) =>
      state.hasGottenConfigFromJson,
  },
  actions: {
    setHasGottenConfigFromJson(value: boolean): void {
      this.hasGottenConfigFromJson = value;
    },
    setPortalConfig(obj: any): void {
      this.portalConfig = JSON.parse(JSON.stringify(obj));

      if (import.meta.env.PROD) {
        Object.keys(this.portalConfig).forEach((key) => {
          ENV[key] = this.portalConfig[key];
        });
      } else {
        Object.keys(this.portalConfig).forEach((key) => {
          ENV[key] = import.meta.env[`VITE_APP_${key}`];
          this.portalConfig[key] = import.meta.env[`VITE_APP_${key}`];
        });
      }
    },
    async getPortalConfig() {
      // prettier-ignore
      const configPath = window.location.origin + `/portalConfig.json?time=` + Date.now().toString();
      await axios.get(configPath).then(async (response: any) => {
        this.setHasGottenConfigFromJson(true);
        this.setPortalConfig(response.data);
        this.setPortalCookie();
        await Promise.resolve();
      });
    },
    setPortalCookie() {
      COOKIE_CONFIG.TOKEN = {
        NAME: 'atoken',
        DOMAIN: this.portalConfig.BASE_DOMAIN
          ? /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/.test(
              this.portalConfig.BASE_DOMAIN,
            )
            ? DOMAIN.BASE
            : `.${DOMAIN.BASE}`
          : DOMAIN.LOCAL,
      };
    },
  },
});

export default usePortalConfigStore;
