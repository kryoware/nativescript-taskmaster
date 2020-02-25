<template>
  <Page actionBarHidden="true" backgroundColor="#f5f5f5">
    <StackLayout>
      <StackLayout v-if="isFirstRun">
        <FlexboxLayout class="paper-bt" backgroundColor="white" justifyContent="space-between" paddingLeft="16" paddingRight="16" height="64">
          <FlexboxLayout flexDirection="column" justifyContent="center" height="48">
            <Label text="Config" fontSize="24" class="tx-bold" color="#2e7d32" @tap="logGPS" />
          </FlexboxLayout>
        </FlexboxLayout>

        <!-- <FlexboxLayout v-if="tasks" width="100%" height="100%" justifyContent="center" flexDirection="column">
          <FlexboxLayout width="100%" height="100%" justifyContent="center">
            <ActivityIndicator busy="true" />
          </FlexboxLayout>
        </FlexboxLayout> -->

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
                  <Label @tap="onTest" text="Task List" fontSize="24" class="tx-bold" color="#2e7d32" />
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

import AddPhotoPage from './AddPhotoPage'
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
      apiKey: 'dev',
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

      networkWhitelist: [
        'AndroidWifi',
        'AN5506-04-FA_99ac8'
      ],

      lastGpsLogId: null,
      gpsLogIntervalId: null,

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
    clearInterval(this.gpsLogIntervalId)
  },
  mounted() {
    console.warn({ tasks: this.tasks })
    this.isFirstRun = !this.$appSettings.hasKey('first_run') || this.$appSettings.getBoolean('first_run')

    try {
      console.warn(this.$appSettings.getString('config'))

      if (this.$appSettings.hasKey('config')) {
        const config = JSON.parse(this.$appSettings.getString('config'))

        console.warn(config)

        this.setConfig(config)
        this.initObserver()
        this.initSQL()
        this.initGpsLogging()
      }
    } catch (error) {
      console.error('mounted')
      console.error(error)
    }
  },
  methods: {
    ...mapActions([
      'setTasks',
      'setConfig',
      'setTaskTimestamp',
    ]),
    saveTasks(tasks) {
      console.warn('saveTasks')
      const vueInstance = this

      if (! vueInstance.database) {
        new SQLite('offline_sync.db').then(db => {
            console.warn("[SQLITE] CONNECTED")
            vueInstance.database = db
          },
          error => console.error("[SQLITE] CONNECT: ", error))
      }

      tasks.forEach(task => {
        console.warn('[SQLITE] ADD TASK')

        console.warn([
          'schedule: ' + task.schedule,
          'task_start: ' + task.task_start,
          'task_end: ' + task.task_end,
          'task_status: ' + task.task_status,
          'task_time_allocated: ' + task.task_time_allocated,
          'assigned_to: ' + task.assigned_to,
          'customer: ' + task.customer,
          'task_id: ' + task.task_id,
          'uid: ' + task.uid,
          'task_tag: ' + task.task_tag,
          'task_title: ' + task.task_title,
          'task_des: ' + task.task_des,
          'instructions: ' + task.instructions,
          'notes: ' + task.notes,
          'location: ' + task.location,
          'gps_coords: ' + task.gps_coords,
          'sched_day: ' + task.sched_day,
          'sched_time: ' + task.sched_time
        ])

        const values = [
          task.schedule,
          task.task_start,
          task.task_end,
          task.task_status,
          task.task_time_allocated,
          task.assigned_to,
          task.customer,
          task.task_id,
          task.uid,
          task.task_tag,
          task.task_title,
          task.task_des,
          task.instructions,
          task.notes,
          task.location,
          task.gps_coords,
          task.sched_day,
          task.sched_time
        ]

        const query = `INSERT INTO tasks ( schedule, task_start, task_end, task_status, task_time_allocated, assigned_to, customer, task_id, uid, task_tag, task_title, task_des, instructions, notes, location, gps_coords, sched_day, sched_time ) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      
        vueInstance.database.execSQL(query, values)
          .then(id => {
            console.warn('[+TASK] Local task id: '.concat(id))
          })
          .catch(error => console.error('[+TASK] ', error))
      })
    },
    attemptGpsLogUpload() {
      const vueInstance = this

      if (! vueInstance.database) {
        new SQLite('offline_sync.db').then(db => {
            console.warn("[SQLITE] CONNECTED")
            vueInstance.database = db
          },
          error => console.error("[SQLITE] CONNECT: ", error))
      }

      const query = "SELECT * FROM tasks LIMIT ".concat()

      vueInstance.database.execSQL(query)
        .then(data => {
          console.warn(data)
        })
    },
    initGpsLogging() {
      const vueInstance = this

      vueInstance.gpsLogIntervalId = setInterval(vueInstance.logGPS, config.int_gps * 1000)
    },
    initObserver() {
      // Monitor Connection -- if it switches to wifi or loses connection
      console.warn('--- START CONNECTION MONITORING ---')
      startMonitoring((conn) => {
        if (conn === connectionType.wifi) {
          let ssid = DeviceInfo.wifiSSID()
          ssid = ssid.substr(1, ssid.length - 2)

          this.connection = {
            type: 'WIFI',
            ssid,
          }

          console.warn({ ssid })

          if (this.networkWhitelist.includes(ssid)) {
            console.warn('SSID IN WHITELIST')
            this.isConnected = true

            if (this.$appSettings.hasKey('url')) {
              this.startProcessing()
              this.attemptGpsLogUpload()
            } else {
              console.warn('INVALID API URL')
            }
          } else {
            console.warn('SSID NOT IN WHITELIST')
            this.isConnected = false
          }
        } else {
          console.warn('NOT CONNECTED TO WIFI')
          this.isConnected = false

          this.stopProccessing()
        }
      })
    },
    initSQL() {
      const vueInstance = this

      console.warn("[SQLITE] Initialize")
      new SQLite('offline_sync.db').then(db => {
        console.warn("[SQLITE] CONNECTED")
        vueInstance.database = db

        db.execSQL("CREATE TABLE IF NOT EXISTS gps_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp VARCHAR(500), latitude VARCHAR(500), longitude VARCHAR(500))")
          .then(result => {
            console.warn("[SQLITE] CREATE GPS LOGS TABLE: ", result)
          },
          error => {
            console.error("[SQLITE] CREATE GPS LOGS TABLE: ", error)
          })

        db.execSQL("CREATE TABLE IF NOT EXISTS pending_uploads (id INTEGER PRIMARY KEY AUTOINCREMENT, filename VARCHAR(500))")
          .then(result => {
            console.warn("[SQLITE] CREATE UPLOADS TABLE: ", result)
          },
          error => {
            console.error("[SQLITE] CREATE UPLOADS TABLE: ", error)
          })

        db.execSQL("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, schedule DATETIME, task_start DATETIME, task_end DATETIME, task_status VARCHAR(50), task_time_allocated VARCHAR(20), assigned_to VARCHAR(20), customer VARCHAR(20), task_id VARCHAR(10), uid VARCHAR(10), task_tag VARCHAR(200), task_title VARCHAR(200), task_des VARCHAR(500), instructions VARCHAR(500), notes VARCHAR(500), location VARCHAR(200), gps_coords VARCHAR(200), sched_day VARCHAR(20), sched_time VARCHAR(20))")
          .then(result => {
            console.warn("[SQLITE] CREATE TASKS TABLE: ", result)
          },
          error => {
            console.error("[SQLITE] CREATE TASKS TABLE: ", error)
          })

        db.execSQL("CREATE [UNIQUE] INDEX unique_task_id ON tasks(task_id)")
          .then(result => {
            console.warn("[SQLITE] CREATE UNIQUE TASKS INDEX: ", result)
          },
          error => {
            console.error("[SQLITE] CREATE UNIQUE TASKS INDEX: ", error)
          })
      },
      error => {
        console.error("[SQLITE] CONNECT: ", error)
      })
    },
    onTest() {
      this.$navigateTo(AddPhotoPage)
    },
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
                try {
                  console.warn('[APP] Save Config')

                  this.$appSettings.setString('config', JSON.stringify(data.data.configs))
                  this.$appSettings.setBoolean('first_run', false)
                  this.$appSettings.setString('ac', accountCode)
                  this.$appSettings.setString('dc', deviceCode)
                  this.$appSettings.setString('ver', version.toString())
                  this.$appSettings.setString('url', apiUrl)
                  this.$appSettings.setString('ak', apiKey)

                  if (data.data.hasOwnProperty('tasks')) {
                    const tasks = Object.values(data.data.tasks)

                    console.warn({ tasks })

                    this.setTasks(tasks)
                    this.saveTasks(tasks)
                  }

                  if (data.data.hasOwnProperty('profile')) {
                    const user = Object.values(data.data.profile)

                    console.warn({ user })

                    this.setUser(user)
                    this.$appSettings.setString('user', JSON.stringify(user))
                  }

                  this.setConfig(data.data.configs)
                  this.isFirstRun = false
                  this.startProcessing()
                } catch (error) {
                  console.error('[API] INI')
                  console.error(error)
                }
              } else {
                alert(data.statMsg)
              }
            })
          }
        })
        .catch(error => {
          alert('Cannot connect to API')
          console.error(error)
        })
    },
    stopProccessing() {
      console.warn('--- STOP PROCESSING ---')

      this.intervals.forEach(intervalId => clearInterval(intervalId))
    },
    async statCheck() {
      console.warn('statcheck')
      const vueInstance = this

      try {
        let extras = []

        if (vueInstance.dt_config != null) extras.push('dt_config='.concat(encodeURI(vueInstance.dt_config)))
        if (vueInstance.dt_tasks != null) extras.push('dt_tasks='.concat(encodeURI(vueInstance.dt_tasks)))

        vueInstance.$callApi('statcheck', 'get', extras, null)
          .then(body => {
            body.json().then(res => {
              if (res.stat.toLowerCase() === "update" && res.data) {
                // update config
                if (res.data.configs) {
                  console.warn(res.data.configs)

                  vueInstance.setConfig(res.data.configs)
                  vueInstance.$appSettings.setString('config', JSON.stringify(res.data.configs))
                }

                // update tasks
                if (res.data.tasks) {
                  let tasks = Object.values(res.data.tasks)
                    .map(task => {
                      // try {
                      //   if (parseInt(task.uid) === 0 || task.status === 'pending') {
                      //     const currTask = vueInstance.tasks.filter(vTask => {
                      //       console.warn({vTask})

                      //       return vTask.task_id === task.task_id
                      //     })

                      //     console.warn('--- BEFORE ---')
                      //     console.warn({ task })
                      //     task = { ...currTask, ...task }
                      //     console.warn('--- AFTER ---')
                      //     console.warn({ task })
                      //   }
                      // } catch (error) {
                      //   console.error(error)
                      // }

                      return task
                    })

                  try {
                    vueInstance.setTaskTimestamp(res.data.dt_tasks)
                    vueInstance.setTasks(tasks)
                  } catch (error) {
                    console.error(error)
                  }
                }
              }
            })
          })
          .catch(error => console.error(error))
      } catch (error) {
        console.error(error)
      }
    },
    async startFileUpload() {

    },
    async startTaskUpload() {

    },
    async uploadLocalTasks() {
      console.warn('uploadLocalTasks')
      const vueInstance = this

      if (! vueInstance.database) {
        new SQLite('offline_sync.db').then(db => {
            console.warn("[SQLITE] CONNECTED")
            vueInstance.database = db
          },
          error => console.error("[SQLITE] CONNECT: ", error))
      }

      vueInstance.database.execSQL("SELECT * FROM pending_uploads")
        .then(data => {
          console.warn(data)
        })
    },
    async uploadLocalFiles() {
      const vueInstance = this

      if (! vueInstance.database) {
        new SQLite('offline_sync.db').then(db => {
            console.warn("[SQLITE] CONNECTED")
            vueInstance.database = db
          },
          error => console.error("[SQLITE] CONNECT: ", error))
      }

      vueInstance.database.execSQL("SELECT * FROM tasks")
        .then(data => {
          console.warn(data)
        })

    },
    async logGPS() {
      const vueInstance = this

      if (! vueInstance.database) {
        new SQLite('offline_sync.db').then(db => {
            console.warn("[SQLITE] CONNECTED")
            vueInstance.database = db
          },
          error => console.error("[SQLITE] CONNECT: ", error))
      }

      geolocation.enableLocationRequest(true, true).then(() => {
        geolocation.getCurrentLocation({
          desiredAccuracy: Accuracy.high,
          maximumAge: 5000,
        })
        .then(function (loc) {
          try {
            const {
                horizontalAccuracy,
                verticalAccuracy,
                timestamp,
                latitude,
                longitude,
              } = loc

              if (horizontalAccuracy <= parseInt(vueInstance.config.gps_min_accuracy) && 
                verticalAccuracy <= parseInt(vueInstance.config.gps_min_accuracy)) {
                vueInstance.database.execSQL(
                    'INSERT INTO gps_logs (timestamp, latitude, longitude) VALUES (?, ?, ?)',
                    [ loc.timestamp, loc.latitude, loc.longitude ]
                  )
                  .then(id => {
                    console.warn('[+GPS] Logged location id: '.concat(id))
                  })
                  .catch(error => console.error('[+GPS] ', error))
              }
          } catch (error) {
            console.error(error)
          }
        }, function (e) {
          console.error(e)
        })
      }, (e) => {
        console.error('Error: ' + (e.message || e))
      }).catch(ex => {
        console.error('Unable to Enable Location', ex)
      })
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
        config
      } = this

      const vueInstance = this

      console.warn('--- START PROCESSING ---')

      vueInstance.intervals.push(
        setInterval(vueInstance.statCheck, config.int_statcheck * 1000)
      )

      vueInstance.intervals.push(
        setInterval(vueInstance.uploadLocalTasks, config.int_upload_data * 1000)
      )

      vueInstance.intervals.push(
        setInterval(vueInstance.uploadLocalFiles, config.int_upload_files * 1000)
      )
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