<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://baseline_arrow_back_24" @tap="$navigateBack" />
      <Label text="Task Details" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <StackLayout>
      <ScrollView height="100%">
        <StackLayout>
          <!-- Task Details -->
          <StackLayout padding="16 32 24 32">
            <Label
              :text="task.task_title"
              color="#2e7d32"
              marginBottom="16"
              class="tx-bold"
              fontSize="20"
              textWrap="true"
              />
            <Label
              :text="task.customer"
              color="#2e7d32"
              class="tx-regular"
              fontSize="18"
              textWrap="true"
              />
          </StackLayout>
          <!-- Task Details -->

          <StackLayout backgroundColor="white" borderRadius="32" padding="16" marginLeft="8" marginRight="8">
            <MDTextField
              hint="Instructions"
              @loaded="initMultiline"

              :text="task.instructions"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <MDTextField
              hint="Address"
              @loaded="initMultiline"

              :text="task.location"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <MDTextField
              hint="Notes"
              @loaded="initMultiline"

              :text="task.notes"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <FlexboxLayout v-if="!isCheckedIn" justifyContent="center">
              <MDButton
                text="Check In"
                color="white"
                backgroundColor="#2e7d32"
                variant="flat"
                padding="16 32"
                borderRadius="48"
                width="75%"
                class="tx-bold"
                @tap="onCheckInTap"
              />
            </FlexboxLayout>

            <StackLayout v-else>
              <FlexboxLayout justifyContent="space-between">
                <MDButton
                  text="Check Out"
                  color="white"
                  backgroundColor="#f9a825"
                  variant="flat"
                  padding="16 32"
                  borderRadius="48"
                  class="tx-bold"
                  flexShrink="1"
                  @tap="onCheckOutTap"
                  />
                <MDButton
                  text="Pause"
                  color="white"
                  backgroundColor="#757575"
                  variant="flat"
                  padding="16 32"
                  borderRadius="48"
                  class="tx-bold"
                  flexShrink="1"
                  @tap="onPauseTap"
                  />
              </FlexboxLayout>
            </StackLayout>
          </StackLayout>

          <FlexboxLayout margin="16 8 16 8" flexGrow="1" justifyContent="space-between">
            <MDButton
              v-if="!isCheckedIn"
              text="View Map"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="onViewMapTap"
            />

            <MDButton
              v-if="isCheckedIn"
              text="Add Photos"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="onAddPhotoTap"
            />

            <MDButton
              v-if="isCheckedIn"
              text="Add Report"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="onAddReportTap"
            />

          </FlexboxLayout>
        </StackLayout>
      </ScrollView>
    </StackLayout>
  </Page>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import moment from 'moment'

import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'

import MapPage from './MapPage'
import AddPhotoPage from './AddPhotoPage'
import AddReport from './AddReport'

import * as fs from 'file-system'
import { ImageSource } from 'tns-core-modules/image-source/image-source'
import SelfieModalVue from './SelfieModal.vue'

const SQLite = require('nativescript-sqlite')

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  data() {
    return {
      isCheckedIn: false,
      report: '',
      logs: [],
      images: [],
      imageLabels: [],
      task_: {},
    }
  },
  mounted() {
    const vueInstance = this

    new SQLite('offline_sync.db').then(db => {
      db.all('SELECT dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id FROM data_logs WHERE task_id = ?', this.task.task_id)
        .then(result => {
          if (result.length > 0) {
            const lastRow = result[result.length - 1]

            if (lastRow[1] === 'check_in') {
              this.isCheckedIn = true
            } else if (lastRow[1] === 'check_out') {

            } else {
              console.warn('NOT CHECK IN AND CHECK OUT')
            }

            result.forEach(row => {
              console.warn('data_log')
              vueInstance.logs.push(`dt_log: ${row[0]}\nlog_type: ${row[1]}\nuser_report: ${row[2]}\ngps_coords: ${row[3]}\ngps_accuracy: ${row[4]}\ngps_time: ${row[5]}\ngps_source: ${row[6]}\ntask_id: ${row[7]}\n--- `)
            })
          }
        })
        .catch(error => {
          console.error('logs query', error)
        })

      db.all(`SELECT filename FROM files WHERE status IN ('pending','done') AND task_id = ?`, [ this.task.task_id ])
        .then(result => {
          console.warn('[SQLITE] Task Photos', result)
          // [
          //   [2, /data/user/0/org.nativescript.application/files/1_11_pic_1.png, 11],
          //   [3, /data/user/0/org.nativescript.application/files/1_11_pic_1.txt, 11]
          // ]

          result.forEach(file => {
            let filename = file[0]
            let extension = filename.substr(filename.lastIndexOf('.') + 1)

            console.warn({
              filename,
              extension
            })

            switch (extension) {
              case 'txt':
                // get file content
                try {
                  const fileName = filename.substr(filename.lastIndexOf('/') + 1)
                  console.warn({ fileName })
                  const folder = fs.knownFolders.documents()
                  const file = folder.getFile(fileName)

                  file.readText()
                    .then(text => {
                      console.warn('readText', text)

                      this.imageLabels.push({
                        label: text,
                        saved: true
                      })
                    })
                    .catch(error => {
                      console.error('readText', error)
                    })
                } catch (error) {
                  console.error('read label file', error)
                }
                break
              default:
                this.images.push(filename)
                break
            }
          })
        })
        .catch(error => {
          console.error('[SQLITE] Task Photos', error)
        })
    },
    error => {
      console.error("[SQLITE] CONNECT: ", error)
    })
  },
  methods: {
    ...mapActions(['setTaskStatus', 'updateTask']),
    onPauseTap(args) {
      // alert('TODO')
      this.$showModal(SelfieModalVue, {
        props: {
          uid: ''.concat(this.user.uid),
          task_id: ''.concat(this.task.task_id),
          action: 'in',
        }
      })
      .then(result => {
        console.warn(result)
      })
    },
    onViewMapTap(args) {
      this.$navigateTo(MapPage, {
        transition: {
          name: 'slideTop'
        }
      })
    },
    onAddPhotoTap(args) {
      const vueInstance = this

      this.imageLabels = []
      this.images = []

      new SQLite('offline_sync.db').then(db => {
        db.all(`SELECT filename FROM files WHERE status IN ('pending','done') AND task_id = ?`, [ this.task.task_id ])
          .then(result => {
            result.forEach(file => {
              let filename = file[0]
              let extension = filename.substr(filename.lastIndexOf('.') + 1)

              switch (extension) {
                case 'txt':
                  // get file content
                  try {
                    const fileName = filename.substr(filename.lastIndexOf('/') + 1)
                    const folder = fs.knownFolders.documents()
                    const file = folder.getFile(fileName)

                    const label = file.readTextSync(error => {
                      console.error('readText', error)
                    })

                    vueInstance.imageLabels.push({
                      label,
                      saved: true,
                    })
                  } catch (error) {
                    console.error('read label file', error)
                  }
                  break
                default:
                  vueInstance.images.push(filename)
                  // ImageSource.fromFile(filename)
                  //   .then(image => {
                  //     console.warn('create image', image.android)

                  //     this.images.push(image.android)
                  //   })
                  //   .catch(error => {
                  //     console.error('create image', error)
                  //   })
                  break
              }
            })

            vueInstance.$navigateTo(AddPhotoPage, {
              props: {
                task: vueInstance.task,
                images_: vueInstance.images,
                imageLabels_: vueInstance.imageLabels
              },
              transition: {
                name: 'slideTop'
              }
            })
          })
          .catch(error => {
            console.error('[SQLITE] Task Photos', error)
          })
      },
      error => {
        console.error("[SQLITE] CONNECT: ", error)
      })
    },
    closeCallback(report) {
      console.warn({ report })
    },
    onAddReportTap(args) {
      const { closeCallback, report } = this

      this.$showBottomSheet(AddReport, {
        props: {
          closeCallback,
          report
        }
      })
    },
    initMultiline(args) {
      try {
        const input = args.object.android.getEditText()

        input.setSingleLine(false)
        input.setMinLines(3)
        input.setMaxLines(10)
        input.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT)
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE)
      } catch (error) {
        console.error(error)
      }
    },
    onCheckOutTap(args) {
      const vueInstance = this
      this.isCheckedIn = false

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

            vueInstance.task_ = {
              dt_log: moment().format('Y-MM-DD H:mm'),
              log_type: "check_out",
              user_report: "", // FIXME: user_report
              gps_coords: `${latitude},${longitude}`,
              gps_accuracy: (horizontalAccuracy + verticalAccuracy) / 2,
              gps_time: moment().format('Y-MM-DD H:mm'),
              gps_source: "gps",
              task_id: vueInstance.task.task_id,
              task_status: 'done'
            }

            const values = [
              vueInstance.task_.dt_log,
              vueInstance.task_.log_type,
              vueInstance.task_.user_report,
              vueInstance.task_.gps_coords,
              vueInstance.task_.gps_accuracy,
              vueInstance.task_.gps_time,
              vueInstance.task_.gps_source,
              vueInstance.task_.task_id,
            ]

            new SQLite('offline_sync.db').then(db => {
              db.execSQL("INSERT INTO data_logs (dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", values)
                .then(result => {
                  console.warn('data_log', result)
                  console.warn(vueInstance.task_)
                  vueInstance.updateTask(vueInstance.task_)
                })
                .catch(error => {
                  console.error('Check In SQL INSERT', error)
                })
            },
            error => {
              console.error("[SQLITE] CONNECT: ", error)
            })
          } catch (error) {
            console.error('check in payload', error)
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
    onCheckInTap(args) {
      // Change UI
      this.isCheckedIn = true
      const vueInstance = this

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

            vueInstance.task_ = {
              dt_log: moment().format('Y-MM-DD H:mm'),
              log_type: "check_in",
              user_report: "", // FIXME: user_report
              gps_coords: `${latitude},${longitude}`,
              gps_accuracy: (horizontalAccuracy + verticalAccuracy) / 2,
              gps_time: moment().format('Y-MM-DD H:mm'),
              gps_source: "gps",
              task_id: vueInstance.task.task_id,
              task_status: 'started'
            }

            const values = [
              vueInstance.task_.dt_log,
              vueInstance.task_.log_type,
              vueInstance.task_.user_report,
              vueInstance.task_.gps_coords,
              vueInstance.task_.gps_accuracy,
              vueInstance.task_.gps_time,
              vueInstance.task_.gps_source,
              vueInstance.task_.task_id,
            ]

            new SQLite('offline_sync.db').then(db => {
              db.execSQL("INSERT INTO data_logs (dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", values)
                .then(result => {
                  console.warn('data_log', result)
                  console.warn(vueInstance.task_)
                  vueInstance.updateTask(vueInstance.task_)
                })
                .catch(error => {
                  console.error('Check In SQL INSERT', error)
                })
            },
            error => {
              console.error("[SQLITE] CONNECT: ", error)
            })
          } catch (error) {
            console.error('check in payload', error)
          }
        }, function (e) {
          console.error(e)
        })
      }, (e) => {
        console.error('Error: ' + (e.message || e))
      }).catch(ex => {
        console.error('Unable to Enable Location', ex)
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.paper {
  border-top-left-radius: 48;
  border-top-right-radius: 48;
}
</style>