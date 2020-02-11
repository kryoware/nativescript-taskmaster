import Vue from 'nativescript-vue'
import App from './components/App'

import store from './store'

// Setup Sentry.io
import { Sentry } from 'nativescript-sentry'

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

// Helpers

Vue.registerElement('MapView', () => require('nativescript-google-maps-sdk').MapView)

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
