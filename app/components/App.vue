<template>
  <Page actionBarHidden="true" backgroundColor="#f5f5f5">
    <GridLayout rows="*, auto">
      <StackLayout row="0">
        <StackLayout v-if="tabIndex === 0">
          <StackLayout v-if="isFirstRun">
            <MDTextField
              :text="url"
              hint="API URL"
              marginBottom="16"
            />

            <MDTextField
              :text="key"
              hint="API Key"
              marginBottom="16"
            />

            <MDTextField
              :text="version"
              hint="API Version"
              marginBottom="16"
            />

            <MDTextField
              :text="accountCode"
              hint="Account Code"
              marginBottom="16"
            />

            <MDTextField
              :text="deviceCode"
              hint="Device Code"
              marginBottom="16"
            />

            <MDButton
              text="Save"
            />
          </StackLayout>

          <StackLayout v-else>
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
          <StatusPage />
        </StackLayout>
      </StackLayout>

      <MDBottomNavigationBar
        class="paper-tp"
        row="1"
        activeColor="#2e7d32"
        inactiveColor="#2b2b2b"
        backgroundColor="white"
        @tabSelected="tabSelected">
        <MDBottomNavigationTab title="Tasks" icon="ic_home" />
        <MDBottomNavigationTab title="Status" icon="ic_view_list" />
      </MDBottomNavigationBar>

    </GridLayout>
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

import { mapState } from 'vuex'

import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'

import { Sentry, Level } from 'nativescript-sentry'
import { WifiInfo } from 'nativescript-wifi-info'

import TaskDetails from './TaskDetails'
import AddTaskPage from './AddTaskPage'
import StatusPage from './StatusPage'
import TaskCard from './TaskCard'

export default {
  components: {
    TaskCard,
    StatusPage
  },
  data() {
    return {
      allowExecution: false,
      isFirstRun: false,
      foregroundTracking: null,

      tabIndex: 0,
      tasks: []
    }
  },
  // computed: {
  //   ...mapState({
  //     tasks: state => state.tasks
  //   })
  // },
  destroyed() {
    if (this.foregroundTracking) {
      geolocation.clearWatch(this.foregroundTracking)
    }

    stopMonitoring()
  },
  mounted() {
    geolocation.enableLocationRequest(true, true).then(() => {
      console.warn('User Enabled Location Service')

      // Monitor Connection -- if it switches to wifi or loses connection
      startMonitoring((conn) => {
        if (conn === connectionType.wifi) {
          console.warn('Connected to WIFI')
          console.warn('---')
          console.warn('Check SSID')
          console.warn('---')

          // try {
          //   const wifiInfo = new WifiInfo();
          //   const ssid = wifiInfo.getSSID();
          //   console.warn(ssid)
          // } catch (error) {
          //   console.error(error)
          // }
        } else {
          console.warn('Stop Uploading')
        }
      })

      this.foregroundTracking = geolocation.watchLocation(
        function (loc) {
          if (loc) {
            console.warn({ loc })
          }
        },
        function (e) {
          console.error('Error: ' + (e.message || e))
        },
        {
          desiredAccuracy: Accuracy.high,
          updateDistance: 1,
          updateTime: 15 * 60000,
          minimumUpdateTime: 15 * 60000
        }
      )
    }, (e) => {
      console.error('Error: ' + (e.message || e))
    }).catch(ex => {
      console.error('Unable to Enable Location', ex)
    })

    this.isFirstRun = this.$appSettings.hasKey('first_run') && this.$appSettings.getBoolean('first_run')

    fetch('http://dev.teaconcepts.net/WorkForce/engine/api.php?ac=dev&dc=dev&ak=dev&ver=1&act=ini')
      .then(res => {
        res.json()
          .then(resJSON => {
            if (resJSON.stat === 'ok') {
              if (resJSON.data) {
                // TODO: handle config

                this.tasks = Object.values(resJSON.data.tasks)
              }
            } else {
              console.error('API Error', resJSON)
            }
          })
          .catch(err => console.error(err))
      })
      .catch(err => console.error(err))
    
    const SQLite = require('nativescript-sqlite')

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

<style lang="scss" scoped>
.paper-tp {
  border-top-left-radius: 24;
  border-top-right-radius: 24;
}
.paper-bt {
  border-bottom-left-radius: 24;
  border-bottom-right-radius: 24;
}
</style>