// import VueDevtools from 'nativescript-vue-devtools'

import Vue from 'nativescript-vue'
import App from './components/App'

// Vue.use(VueDevtools)

import store from './store'
import { LoadingIndicator, Mode } from '@nstudio/nativescript-loading-indicator'
const indicator = new LoadingIndicator()
const options = {
  message: '',
  margin: 0,
  dimBackground: true,
  color: '#004987',
  // backgroundColor: '#ffffff',
  backgroundColor: 'transparent',
  // hideBezel: false,
  hideBezel: true,
  mode: Mode.Indeterminate,
  android: {
    cancelable: false
  },
  ios: {
    square: false
  }
}
Vue.prototype.$showLoader = extraOptions => indicator.show({ ...options, ...extraOptions })
Vue.prototype.$hideLoader = () => indicator.hide()

// Setup Sentry.io
import { Sentry, Level } from 'nativescript-sentry'

const dsn = 'https://86cc5b9a9bb645d8944b44c86a5a75a2@sentry.io/2345888'
Sentry.init(dsn)
// Setup Sentry.io

// Material Components
import FloatingActionButtonPlugin from 'nativescript-material-floatingactionbutton/vue'
import BottomNavigationBar from 'nativescript-material-bottomnavigationbar/vue'
import TextFieldPlugin from 'nativescript-material-textfield/vue'
import CardViewPlugin from 'nativescript-material-cardview/vue'
import ButtonPlugin from 'nativescript-material-button/vue'
import { install } from "nativescript-material-bottomsheet";
install();
import BottomSheetPlugin from 'nativescript-material-bottomsheet/vue';

Vue.use(BottomSheetPlugin)
Vue.use(FloatingActionButtonPlugin)
Vue.use(BottomNavigationBar)
Vue.use(TextFieldPlugin)
Vue.use(CardViewPlugin)
Vue.use(ButtonPlugin)
// Material Components

// Nativescript Core
import { connectionType, getConnectionType } from 'connectivity'
import * as appSettings from 'tns-core-modules/application-settings'
import { screen } from 'tns-core-modules/platform/platform'
import * as platform from 'tns-core-modules/platform'

Vue.prototype.$isConnected = () => getConnectionType() === connectionType.wifi
Vue.prototype.$appSettings = appSettings
// Nativescript Core

// Helpers
Vue.prototype.$screen = screen
Vue.prototype.$platform = platform
Vue.prototype.$randString = (length) => Array(length).fill(0).map(x => Math.random().toString(36).charAt(2)).join('')
Vue.prototype.$callApi = (action, method, extras, headers) => {
  let options = { method, mode: 'cors' }

  const url = appSettings.getString('url')
  const ver = appSettings.getString('ver')
  const ak = appSettings.getString('ak')
  const ac = appSettings.getString('ac')
  const dc = appSettings.getString('dc')

  let params = [
    'act='.concat(encodeURI(action)),
    'ver='.concat(encodeURI(ver)),
    'ak='.concat(encodeURI(ak)),
    'ac='.concat(encodeURI(ac)),
    'dc='.concat(encodeURI(dc)),
  ]
  params = (Array.isArray(extras) ? params.concat(extras) : params).join('&')

  if (headers != null) {
    options = { ...options, ...{ headers } }
  }

  if (method === 'post' && (extras != null)) {
    console.warn(extras)
    options = { ...options, ...{ body: JSON.stringify(extras) } }
  }

  if (action != 'statcheck') {
    Sentry.captureMessage('[API]', {
      level: Level.Debug,
      extra: {
        params
      }
    })
    console.warn('[API] ', { params })
  }

  return fetch(`${url}/engine/api.php?${params}`, options)
}
// Helpers

if (platform.isIOS)
  GMSServices.provideAPIKey("PUT_API_KEY_HERE")

Vue.registerElement('MapView', () => require('nativescript-google-maps-sdk').MapView)

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
