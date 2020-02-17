<template>
  <Page actionBarHidden="true" backgroundColor="#f5f5f5">
    <StackLayout>
      <StackLayout v-if="isFirstRun">
        <FlexboxLayout class="paper-bt" backgroundColor="white" justifyContent="space-between" paddingLeft="16" paddingRight="16" height="64">
          <FlexboxLayout flexDirection="column" justifyContent="center" height="48">
            <Label text="Config" fontSize="24" class="tx-bold" color="#2e7d32" />
          </FlexboxLayout>
        </FlexboxLayout>

        <ScrollView height="100%">
          <StackLayout paddingLeft="16" paddingRight="16" paddingTop="16">
            <MDTextField
              :text="apiUrl"
              :error="errors.apiUrl"
              @textChange="({ value }) => { this.apiUrl = value; this.errors.apiUrl = null; }"
              errorsEnabled="true"

              class="tx-regular"

              paddingLeft="0"
              paddingRight="0"

              backgroundColor="transparent"

              hint="API URL"
              marginBottom="16"
            />

            <MDTextField
              :text="apiKey"
              :error="errors.apiKey"
              @textChange="({ value }) => { this.apiKey = value; this.errors.apiKey = null; }"
              errorsEnabled="true"

              class="tx-regular"

              paddingLeft="0"
              paddingRight="0"

              backgroundColor="transparent"

              hint="API Key"
              marginBottom="16"
            />

            <MDTextField
              :text="accountCode"
              :error="errors.accountCode"
              @textChange="({ value }) => { this.accountCode = value; this.errors.accountCode = null; }"
              errorsEnabled="true"

              class="tx-regular"

              paddingLeft="0"
              paddingRight="0"

              backgroundColor="transparent"

              hint="Account Code"
              marginBottom="16"
            />

            <MDTextField
              :text="deviceCode"
              :error="errors.deviceCode"
              @textChange="({ value }) => { this.deviceCode = value; this.errors.deviceCode = null; }"
              errorsEnabled="true"

              class="tx-regular"

              paddingLeft="0"
              paddingRight="0"

              backgroundColor="transparent"

              hint="Device Code"
              marginBottom="16"
            />

            <MDTextField
              :text="version"
              :error="errors.version"
              @textChange="({ value }) => { this.version = value; this.errors.version = null; }"
              errorsEnabled="true"

              class="tx-regular"

              paddingLeft="0"
              paddingRight="0"

              backgroundColor="transparent"

              hint="API Version"
              marginBottom="16"
            />

            <MDButton
              text="Save"
              color="white"
              backgroundColor="#2e7d32"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              @tap="saveConfig"
            />
          </StackLayout>
        </ScrollView>
      </StackLayout>
      <GridLayout v-else rows="*, auto">
        <StackLayout row="0">
          <StackLayout v-if="tabIndex === 0">
            <StackLayout>
              <FlexboxLayout class="paper-bt" backgroundColor="white" justifyContent="space-between" paddingLeft="16" paddingRight="16" height="64">
                <FlexboxLayout flexDirection="column" justifyContent="center" height="48">
                  <Label text="Task List" fontSize="24" class="tx-bold" color="#2e7d32" />
                </FlexboxLayout>
                <FlexboxLayout flexDirection="column" justifyContent="center" height="48">
                  <MDButton
                    margin="0"
                    backgroundColor="#2e7d32"
                    text="Add Task"
                    variation="flat"
                    borderRadius="48"
                    padding="8 16"
                    @tap="addTask"
                  />
                </FlexboxLayout>
              </FlexboxLayout>

              <ScrollView height="100%" width="100%">
                <StackLayout>

                  <TaskCard
                    v-for="(task, key) in tasks"
                    :key="key"
                    :task="task"
                    marginTop="16"
                    marginLeft="16"
                    marginRight="16"
                    :marginBottom="key === tasks.length - 1 ? 16 : 0"
                    @tap.native="viewTask(task)"
                  />

                </StackLayout>
              </ScrollView>
            </StackLayout>
          </StackLayout>

          <StackLayout v-if="tabIndex === 1">
            <StatusPage :connection="connection" />
          </StackLayout>
        </StackLayout>

        <MDBottomNavigationBar
          class="paper-tp"
          row="1"
          activeColor="#2e7d32"
          inactiveColor="#2b2b2b"
          backgroundColor="white"
          @tabSelected="tabSelected">
          <MDBottomNavigationTab title="Tasks" icon="ic_task" />
          <MDBottomNavigationTab title="Debug Upload" icon="ic_info" />
        </MDBottomNavigationBar>

      </GridLayout>
    </StackLayout>
  </Page>
</template>

<script>
import * as permissions from 'nativescript-permissions'
import * as camera from 'nativescript-camera'
import * as platform from 'platform'
import { android as androidApp } from 'tns-core-modules/application'
import {
  connectionType,
  getConnectionType,
  startMonitoring,
  stopMonitoring
} from 'tns-core-modules/connectivity'

import { mapState, mapActions } from 'vuex'

import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'

import { Sentry, Level } from 'nativescript-sentry'
import { WifiInfo } from 'nativescript-wifi-info'

import TaskDetails from './TaskDetails'
import AddTaskPage from './AddTaskPage'
import StatusPage from './StatusPage'
import TaskCard from './TaskCard'
import { DeviceInfo } from 'nativescript-dna-deviceinfo'

import { getJSON, request, HttpResponse } from 'tns-core-modules/http'

const SQLite = require('nativescript-sqlite')

export default {
  components: {
    TaskCard,
    StatusPage
  },
  data() {
    return {
      allowExecution: false,
      isFirstRun: false,
      isConnected: false,
      foregroundTracking: null,

      apiUrl: 'http://dev.teaconcepts.net/WorkForce',
      accountCode: 'dev',
      deviceCode: 'dev',
      apiKey: 'key',
      version: 1,

      errors: {
        accountCode: null,
        deviceCode: null,
        apiKey: null,
        apiUrl: null,
        version: null,
      },

      fileIntervalId: null,
      dataIntervalId: null,

      homeNetwork: 'AndroidWifi',

      tabIndex: 0,
      connection: null,
      intervals: []
    }
  },
  computed: {
    ...mapState({
      tasks: state => state.tasks,
      config: state => state.config,
      dt_tasks: state => state.dt_tasks,
      dt_config: state => state.config.dt_config,
    })
  },
  destroyed() {
    if (this.foregroundTracking) {
      geolocation.clearWatch(this.foregroundTracking)
    }

    stopMonitoring()
  },
  mounted() {
    this.isFirstRun = !this.$appSettings.hasKey('first_run') || this.$appSettings.getBoolean('first_run')
    console.error('config', this.$appSettings.getString('config'))

    if (this.$appSettings.hasKey('config')) {
      try {
        const config = JSON.parse(this.$appSettings.getString('config'))

        console.warn({ config })

        this.setConfig(config)

      geolocation.enableLocationRequest(true, true).then(() => {
        console.warn('User Enabled Location Service')

        // Monitor Connection -- if it switches to wifi or loses connection
        // startMonitoring((conn) => {
        //   if (conn === connectionType.wifi) {
        //     console.warn('Connected to WIFI')
        //     console.warn('---')
        //     console.warn('Check SSID')
        //     console.warn('---')

        //     const ssid = DeviceInfo.wifiSSID()

        //     this.connection = {
        //       type: 'WIFI',
        //       ssid,
        //     }

        //     if (ssid === homeNetwork) {
        //       this.isConnected = true
              if (this.$appSettings.hasKey('url')) {
                this.startProcessing()
              }
        //     } else {
        //       // Connected to wifi but not whitelisted
        //       this.isConnected = false
        //     }
        //   } else {
        //     console.warn('Stop Uploading')
        //     this.isConnected = false
        //   }
        // })
      }, (e) => {
        console.error('Error: ' + (e.message || e))
      }).catch(ex => {
        console.error('Unable to Enable Location', ex)
      })
      } catch (error) {
        console.error(error)
      }
    }


    // fetch('http://dev.teaconcepts.net/WorkForce/engine/api.php?ac=dev&dc=dev&ak=dev&ver=1&act=ini')
    //   .then(res => {
    //     res.json()
    //       .then(resJSON => {
    //         if (resJSON.stat === 'ok') {
    //           if (resJSON.data) {
    //             if (resJSON.data.hasOwnProperty('configs')) {
    //               this.setConfig(resJSON.data.configs)
    //               this.$appSettings.setString('config', JSON.stringify(resJSON.data.configs))
    //             }

    //             if (resJSON.data.hasOwnProperty('dt_tasks')) {
    //               this.setTaskTimestamp(resJSON.data.dt_tasks)
    //             }

    //             if (resJSON.data.hasOwnProperty('tasks')) {
    //               let tasks = Object.values(resJSON.data.tasks)
    //                 .map(task => {
    //                   console.warn({ task })

    //                   if (parseInt(task.uid) === 0 || task.status === 'pending') {
    //                     const currTask = this.tasks.filter(vTask => {
    //                       console.warn({vTask})

    //                       return vTask.task_id === task.task_id
    //                     })

    //                     console.warn('--- BEFORE ---')
    //                     console.warn({ task })
    //                     task = { ...currTask, ...task }
    //                     console.warn('--- AFTER ---')
    //                     console.warn({ task })
    //                   }

    //                   return task
    //                 })

    //               // TODO: Handle duplicates / active etc.

    //               this.setTasks(tasks)
    //             }
    //           }
    //         } else {
    //           console.error('API Error', resJSON)
    //         }
    //       })
    //       .catch(err => console.error(err))
    //   })
    //   .catch(err => console.error(err))

    // new SQLite('offline_sync.db').then(db => {
    //   console.warn(db)
    //   db.execSQL("CREATE TABLE IF NOT EXISTS local_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(250), customer VARCHAR(250))")
    //   .then(id => {
    //     page.bindingContext = createViewModel(db);
    //   },
    //   error => {
    //     console.error("CREATE TABLE: ", error);
    //   })
    // },
    // error => {
    //   console.error(error)
    // })

    // if (platform.isIOS) {
    //   this.allowExecution = true;
    //   return;
    // }

    // permissions
    //   .requestPermissions([
    //     android.Manifest.permission.ACCESS_FINE_LOCATION,
    //     android.Manifest.permission.ACCESS_COARSE_LOCATION
    //   ])
    //   .then(() => this.allowExecution = true)
    //   .catch(() => this.allowExecution = false)

    // camera.requestPermissions().then({
    //   success: () => {

    //   },
    //   failure: () => {

    //   }
    // })
  },
  methods: {
    ...mapActions([
      'setTasks',
      'setConfig',
      'setTaskTimestamp',
    ]),
    saveConfig() {
      const { apiUrl, accountCode, deviceCode, apiKey, version, } = this

      if (accountCode == null || accountCode == '') {
        this.errors.accountCode = 'Account Code is required'
        return
      }

      if (deviceCode == null || deviceCode == '') {
        this.errors.deviceCode = 'Device Code is required'
        return
      }

      if (apiKey == null || apiKey == '') {
        this.errors.apiKey = 'API Key is required'
        return
      }

      if (apiUrl == null || apiUrl == '') {
        this.errors.apiUrl = 'API URL is required'
        return
      }

      if (version == null || version == '') {
        this.errors.version = 'Version is required'
        return
      }

      const params = [
        'ac='.concat(accountCode),
        'dc='.concat(deviceCode),
        'ak='.concat(apiKey),
        'ver='.concat(version),
        'act=ini'
      ].join('&')

      fetch(apiUrl.concat('/engine/api.php?' + params))
        .then(res => {
          if (res.status === 200) {
            res.json().then(data => {
              if (data.data) {
                console.warn('save config')

                this.$appSettings.setString('config', JSON.stringify(data.data.configs))
                console.warn(this.$appSettings.getString('config'))
                this.$appSettings.setBoolean('first_run', false)

                this.$appSettings.setString('ac', accountCode)
                this.$appSettings.setString('dc', deviceCode)
                this.$appSettings.setString('ver', version)
                this.$appSettings.setString('url', apiUrl)
                this.$appSettings.setString('ak', apiKey)

                this.setConfig(data.data.configs)
              } else {
                alert(data.statMsg)
              }
            })
          }
        })
        .catch(error => console.error(error))
    },
    stopProccessing() {
      this.intervals.forEach(intervalId => clearInterval(intervalId))
    },
    startProcessing() {
      const {
        apiUrl,
        accountCode,
        deviceCode,
        apiKey,
        version,
        dt_tasks,
        dt_config,
      } = this

      console.warn('--- START ---')
      console.warn({ config: this.config })

      this.intervals.push(setInterval(function () {
        // DATA
      }, this.config.int_upload_data * 1000))

      this.intervals.push(setInterval(function () {
        // GPS
        geolocation.enableLocationRequest(true, true).then(() => {
          geolocation.getCurrentLocation({
            desiredAccuracy: Accuracy.high,
            maximumAge: 5000,
          })
          .then(function (loc) {
            if (loc) {
              console.warn({ loc })
            }
          }, function (e) {
            console.error(e)
          })
        })
      }, this.config.int_gps * 1000))

      this.intervals.push(setInterval(function () {
        // FILE
      }, this.config.int_upload_files * 1000))

      this.intervals.push(setInterval(function () {
        // this.$callApi('stat_check', 'get', null)
        //   .then(res => {
        //     if (res.stat.toLowerCase() === "update" && res.data) {
        //       // update config
        //       if (res.data.configs) {
        //         console.warn(res.data.configs)

        //         this.setConfig(res.data.configs)
        //         this.$appSettings.setString('config', JSON.stringify(res.data.configs))
        //       }

        //       // update tasks
        //       if (res.data.tasks) {
        //         console.warn(res.data.tasks)
        //         let tasks = Object.values(res.data.tasks)
        //           .map(task => {
        //             console.warn({ task })

        //             if (parseInt(task.uid) === 0 || task.status === 'pending') {
        //               const currTask = this.tasks.filter(vTask => {
        //                 console.warn({vTask})

        //                 return vTask.task_id === task.task_id
        //               })

        //               console.warn('--- BEFORE ---')
        //               console.warn({ task })
        //               task = { ...currTask, ...task }
        //               console.warn('--- AFTER ---')
        //               console.warn({ task })
        //             }

        //             return task
        //           })

        //         this.setTaskTimestamp(res.data.dt_tasks)
        //         this.setTasks(tasks)
        //       }
        //     }
        //   })
        //   .catch(error => console.error(error))
      }, this.config.int_statcheck * 1000))
    },
    tabSelected({ newIndex }) {
      this.tabIndex = newIndex
    },
    viewTask(task) {
      this.$navigateTo(TaskDetails, {
        props: {
          task
        },
        transition: {
          name: 'slide'
        }
      })
    },
    addTask() {
      this.$navigateTo(AddTaskPage, {
        transition: {
          name: 'slide'
        }
      })
    }
  },
  mixins: [

  ]
}
</script>

<style lang="scss">
.paper-tp {
  border-top-left-radius: 24;
  border-top-right-radius: 24;
}
.paper-bt {
  border-bottom-left-radius: 24;
  border-bottom-right-radius: 24;
}
</style>