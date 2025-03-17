# NCHC 可信賴雲平台: Admin Panel 及 System Portal

使用 [Vue 3](https://vuejs.org/guide/introduction.html) 搭配 [Vite](https://vitejs.dev/guide/) 進行專案建置，語法為 TypeScript，使用 [yarn](https://yarnpkg.com/) 管理相關套件，搭配常用套件如 vue-router、vue-i18n、pinia 等，使用 Vuetify 3 作為 UI Library。

## Vue 3 相關套件

- [Vuetify 3](https://vuetifyjs.com/en/getting-started/installation/#installation) - Vue 3 UI Library
- [vue-router](https://router.vuejs.org/) - 頁面 Routing
- [vue-i18n](https://vue-i18n.intlify.dev/) - i18n 字串管理
- [vue-cookies](https://github.com/cmp-cc/vue-cookies) - 支援 Vue 的 cookie 管理與編輯工具
- [pinia](https://pinia.vuejs.org/) - 跨元件狀態管理

## 其他第三方套件

- [aws-sdk](https://github.com/aws/aws-sdk-js-v3) - AWS 提供的 JavaScript SDK 函式，用以操作 AWS 相關服務函式庫
- [axios](https://axios-http.com/docs/intro) - 用於處理 API Request
- [dayjs](https://github.com/iamkun/dayjs) - 轉換日期格式函式庫
- [jwt-decode](https://github.com/auth0/jwt-decode) - JWT 解碼工具
- [loadsh](https://lodash.com/) - JavaScript 的 Library，提供實用簡便且高效的函式
- [qrcode.vue](https://github.com/scopewu/qrcode.vue) - 提供解讀 QRCode 的函式
- [Web Font Loader](https://github.com/typekit/webfontloader) - 動態管理與載入網路字型
- [Material Icon](https://pictogrammers.com/library/mdi/?welcome) - Google Material Design 系列的圖示

## 基本使用方式

### Windows 平臺

安裝 Node.js，官方下載頁面 [Download Node.js®](https://nodejs.org/en/download) 。
選擇 18.20.5 以上之 LTS 版本，點擊 Windows Installer (.msi) 下載並安裝。

Node.js 安裝完成後，安裝套件管理工具 [Yarn](https://yarnpkg.com/) \
`npm install --global yarn`

使用 yarn 建置，clone 專案後，於 package.json 同層目錄下指令安裝套件 \
`yarn install`

以指令安裝相關套件後，接著將網站運行起來。以下為不同環境的 serve，build 和 preview 指令介紹。

### 開發工具

專案可用多種整合開發環境工具 (Integrated Development Environment, IDE) 開啟專案，常見的 IDE 有

- [Visual Studio Code](https://code.visualstudio.com/Download)
- [IntelliJ IDEA WebStorm](https://www.jetbrains.com/webstorm/download/#section=windows)

### 環境變數

.env 文件用於應用程式的環境變數，這些環境變數包含定義功能、API 路徑…等，方便在不同環境切換配置而不用修改程式。 \
以指令 `yarn serve:trusted-cloud-public` 為例 \
`"serve:trusted-cloud-public": "vite --port 3001 --mode trusted-cloud-public --host"` 會讀取檔名為 `.env.trusted-cloud-public` 的環境變數檔案。

### serve 指令

yarn server 之目的在於讓開發者在本機端快速驗證邏輯與畫面，程式會啟動一個臨時的模擬網站於本機端。

| Command                            | Description            | 環境變數檔案               |
| ---------------------------------- | ---------------------- | -------------------------- |
| `yarn serve:trusted-cloud-public`  | serve admin panel 公區 | .env.trusted-cloud-public  |
| `yarn serve:trusted-cloud-private` | serve admin panel 私區 | .env.trusted-cloud-private |
| `yarn serve:trusted-cloud-system`  | serve system portal    | .env.trusted-cloud-system  |

serve 成功後會顯示**本機網址**為 http://localhost:300x/ ，以公區 Admin Panel 為例，會顯示 http://localhost:3001/。
修改 host port 資訊可在 `package.json` 內修改 scripts。

### build 指令

yarn build 之目的在於將網站程式碼編譯轉換為可在生產環境(production)運行的形式。

| Command                            | Description            | 環境變數檔案               |
| ---------------------------------- | ---------------------- | -------------------------- |
| `yarn build:trusted-cloud-public`  | build admin panel 公區 | .env.trusted-cloud-public  |
| `yarn build:trusted-cloud-private` | build admin panel 私區 | .env.trusted-cloud-private |
| `yarn build:trusted-cloud-system`  | build system portal    | .env.trusted-cloud-system  |

編譯結果會放置在環境變數中定義之路徑 `VITE_APP_OUTPUT_PATH`，以公區環境變數為例，會放置於 `disits-pub` 資料夾內。

### preview 指令

yarn preview 會啟動一個本地端的網頁伺服器，讓編譯好之網站程式運行在其之上，而不是模擬的方式。環境更接近最終部署，以用檢查在生產環境中網站運作是否符合預期。

:warning: 務必跑過 yarn build:[trusted-cloud-public|trusted-cloud-private|trusted-cloud-system]，才能執行 yarn preview:[public|private|system]

| Command                | Description              | 環境變數檔案               |
| ---------------------- | ------------------------ | -------------------------- |
| `yarn preview:public`  | preview admin panel 公區 | .env.trusted-cloud-public  |
| `yarn preview:private` | preview admin panel 私區 | .env.trusted-cloud-private |
| `yarn preview:system`  | preview system portal    | .env.trusted-cloud-system  |

## 資料夾與功能介紹

- `/api`：各類服務的 api 以及 api 呼叫函式，統一以 index.ts 導出
- `/assets`：靜態檔案，如 icon 檔案等
- `/components`：頁面中會用到的各種元件
- `/composables`：將各 api 依照相關服務做分類供給頁面呼叫的函式集合
- `/constants`：各類常數定義
- `/i18n`：en 與 tw 語系的設定檔
- `/interfaces`：typescript 型態宣告
- `/plugins`：第三方套件會用到的設定檔
- `/store`：pinia 套件用於跨頁面狀態共享相關檔案
- `/styles`：Css 定義，分為一般定義與覆蓋 vuetify 3 套件的宣告
- `/utils`：比較 pure 不牽扯到狀態的函式定義
- `/views`：各頁面的檔案會放在這裡，會在 router.ts 內匯入使用

## 主要功能

### Admin Panel

- `成員管理`：提供測試使用者的建立與管理，及管理員權限的管理。
- `專案管理`：提供 iService 專案及其成員的顯示、測試專案及其成員的建立與管理，以及模擬分身的產生。
- `硬體設定`：提供虛擬機器和遠端派送的硬體設定的建立與權限管理。
- `網路設定`：提供公私區外部網路的匯入與管理、設定各專案使用的外部網路，以及專屬實體網路的建置與管理。
- `額度管理`：提供虛擬平台服務、各式儲存服務，以及映像檔的額度設定。
- `審核機制`：提供介面讓管理者設定各專案資源審核機制的開啟與關閉。
- `雲平台服務設定`：提供公共虛擬映像檔、容器映像檔，以及應用服務 App 的建立、修改與權限管理設定。
- `系統儲存`：提供系統端的儲存服務。
- `系統操作紀錄`：提供整座可信賴雲的操作紀錄，包含使用者在 User Portal 各專案裡的操作紀錄，以及管理者在 Admin Panel 的操作紀錄。

### System Portal

- `Openstack Horizon`：整合 Openstack Horizon DashBoard，提供直觀的 Web 使用者介面，讓管理者能夠快速管理 Openstack 的各類資源和服務。
- `Ceph Dashboard`：整合視覺化的 Ceph Dashboard 介面，讓管理者方便對 Ceph 進行管理和監控。
- `監控`：透過 Grafana，供管理者進行資源監控與告警設定。
- `日誌`：整合 Kibana Dashboard，透過視覺化介面，管理者可檢視儲存的日誌並管理 ELK 系統。
