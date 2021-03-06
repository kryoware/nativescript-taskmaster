<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://ic_action_back" @tap="$navigateBack" />
      <Label text="Task Details" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
      <ActionItem icon="res://ic_action_save" text="Save" ios.position="right" @tap="onSaveChangesTap" />
    </ActionBar>

    <StackLayout>
      <ScrollView height="100%">
        <StackLayout>
          <!-- Task Details -->
          <StackLayout padding="16 32 24 32">
            <Label
              :text="task_.task_title"
              color="#2e7d32"
              marginBottom="16"
              class="tx-bold"
              fontSize="20"
              textWrap="true"
              />
            <Label
              :text="task_.customer"
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
              @textChange="({ value }) => { this.task_.instructions = value }"
              :text="task_.instructions"
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
              @textChange="({ value }) => { this.task_.location = value }"
              :text="task_.location"
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
              @textChange="({ value }) => { this.task_.notes = value }"
              :text="task_.notes"
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
                  v-if="isPaused"
                  text="Resume"
                  color="white"
                  backgroundColor="#757575"
                  variant="flat"
                  padding="16 32"
                  borderRadius="48"
                  class="tx-bold"
                  flexShrink="1"
                  @tap="onResumeTap"
                  />
                <MDButton
                  v-else
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
import SelfieModal from './SelfieModal'

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
    }),
  },
  data() {
    return {
      isPaused: false,
      isCheckedIn: false,
      report: '',
      logs: [],
      images: [],
      imageLabels: [],
      task_: {},
      data: {}
    }
  },
  mounted() {
    const vueInstance = this
    vueInstance.task_ = Object.assign({}, this.task)

    new SQLite('offline_sync.db').then(db => {
      db.all('SELECT dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id FROM data_logs WHERE task_id = ?', this.task.task_id)
        .then(result => {
          if (result.length > 0) {
            const lastRow = result[result.length - 1]
            console.warn('Task Status:', lastRow[1])

            if (lastRow[1] === 'check_in') {
              this.isCheckedIn = true
            } else if (lastRow[1] === 'check_out') {

            } else {
              console.warn('NOT CHECK IN AND CHECK OUT')
            }
          }
        })
        .catch(error => {
          console.error('logs query', error)
        })

      db.all(`SELECT filename FROM files WHERE status IN ('pending','done') AND task_id = ? AND filename NOT LIKE "%_selfie_%"`, [ this.task.task_id ])
        .then(result => {
          console.warn('[SQLITE] Task Photos Query', result)

          result.forEach(file => {
            let filename = file[0]
            let extension = filename.substr(filename.lastIndexOf('.') + 1)

            switch (extension) {
              case 'txt':
                try {
                  const fileName = filename.substr(filename.lastIndexOf('/') + 1)
                  const folder = fs.knownFolders.documents()
                  const file = folder.getFile(fileName)

                  file.readText()
                    .then(text => {
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
    onSaveChangesTap(args) {
      let original = Object.values(this.task)
      let modified = Object.values(this.task_)
      let isModified = original.filter(value => !modified.includes(value)).length > 0
      let vueInstance = this

      if (isModified) {
        const values = [
          this.task_.instructions,
          this.task_.location,
          this.task_.notes,
          this.task_.task_id,
        ]

        new SQLite('offline_sync.db').then(db => {
          db.execSQL(`UPDATE tasks SET task_status = 'pending',
              instructions = ?,
              location = ?,
              notes = ?
              WHERE task_id = ?
            `, values)
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
      }
    },
    onResumeTap(args) {
      try {
        const vueInstance = this
        this.isPaused = false

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
                altitude
              } = loc

              vueInstance.task_ = {
                ...vueInstance.task_,
                dt_log: moment().format('Y-MM-DD H:mm'),
                log_type: "check_in",
                user_report: "", // FIXME: user_report
                gps_coords: `${latitude},${longitude}`,
                gps_accuracy: (horizontalAccuracy + verticalAccuracy) / 2,
                gps_time: timestamp,
                gps_source: "gps",
                gps_alt: altitude,
                task_id: vueInstance.task.task_id,
                task_status: 'resumed',
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
                vueInstance.task_.gps_alt,
              ]

              new SQLite('offline_sync.db').then(db => {
                // FIXME: Check this status
                db.execSQL(`UPDATE tasks SET task_status = 'started' WHERE task_id = ?`, vueInstance.task_.task_id)
                  .then(result => {
                    console.warn('resume task', result)
                    console.warn(vueInstance.task_)
                    vueInstance.updateTask(vueInstance.task_)
                  })
                  .catch(error => {
                    console.error('resume task', error)
                  })

                // Add task update
                db.execSQL("INSERT INTO data_logs (dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id, gps_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", values)
                  .then(result => {
                    console.warn('resume task update', result)
                  })
                  .catch(error => {
                    console.error('resume task update', error)
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
      } catch (error) {
        console.error('resume tap', error)
      }
    },
    onPauseTap(args) {
      try {
        const vueInstance = this
        this.isPaused = true

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
                altitude
              } = loc

              vueInstance.task_ = {
                ...vueInstance.task_,
                dt_log: moment().format('Y-MM-DD H:mm'),
                log_type: "check_out",
                user_report: "", // FIXME: user_report
                gps_coords: `${latitude},${longitude}`,
                gps_accuracy: (horizontalAccuracy + verticalAccuracy) / 2,
                gps_time: timestamp,
                gps_source: "gps",
                gps_alt: altitude,
                task_id: vueInstance.task.task_id,
                task_status: 'paused',
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
                vueInstance.task_.gps_alt,
              ]

              new SQLite('offline_sync.db').then(db => {
                db.execSQL(`UPDATE tasks SET task_status = 'paused' WHERE task_id = ?`, vueInstance.task_.task_id)
                  .then(result => {
                    console.warn('pause task', result)
                    console.warn(vueInstance.task_)
                    vueInstance.updateTask(vueInstance.task_)
                  })
                  .catch(error => {
                    console.error('pause task', error)
                  })

                // Add task update
                db.execSQL("INSERT INTO data_logs (dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id, gps_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", values)
                  .then(result => {
                    console.warn('pause task update', result)
                  })
                  .catch(error => {
                    console.error('pause task update', error)
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
      } catch (error) {
        console.error('onPauseTap', error)
      }

      // alert('TODO')
      // this.$showModal(SelfieModalVue, {
      //   props: {
      //     uid: ''.concat(this.user.uid),
      //     task_id: ''.concat(this.task.task_id),
      //     action: 'in',
      //   }
      // })
      // .then(result => {
      //   console.warn(result)
      // })
    },
    onViewMapTap(args) {
      try {
        console.warn(this.task)
        const { gps_coords } = this.task
        console.warn(gps_coords)

        this.$navigateTo(MapPage, {
          props: {
            gps_coords
          },
          transition: {
            name: 'slideTop'
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    onAddPhotoTap(args) {
      const vueInstance = this

      this.imageLabels = []
      this.images = []

      new SQLite('offline_sync.db').then(db => {
        db.all(`SELECT filename FROM files WHERE status IN ('pending','done') AND task_id = ? AND filename NOT LIKE "%_selfie_%"`, [ this.task.task_id ])
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

      this.$showModal(SelfieModal, {
        fullscreen: true,
        props: {
          action: 'out',
          task_id: this.task.task_id,
          uid: this.user.uid
        }
      })
      .then(result => {
        if (result) {
          const {
            gps_alt,
            gps_time,
            gps_coords,
            gps_accuracy,
            user_report,
          } = result

          vueInstance.isCheckedIn = false

          try {
            vueInstance.task_ = {
              ...vueInstance.task_,
              dt_log: moment().format('Y-MM-DD H:mm'),
              log_type: "check_out",
              user_report,
              gps_coords,
              gps_accuracy,
              gps_time,
              gps_alt,
              gps_source: "gps",
              task_id: vueInstance.task.task_id,
              task_status: 'done',
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
              vueInstance.task_.gps_alt,
            ]

            new SQLite('offline_sync.db').then(db => {
              db.execSQL(`UPDATE tasks SET
                task_end = datetime('now'),
                task_status = 'done'
                `)
                .then(result => {
                  console.warn('update task -> check out', result)
                })
                .catch(error => {
                  console.error('update task -> check out', error)
                })

              db.execSQL("INSERT INTO data_logs (dt_log, log_type, user_report, gps_coords, gps_accuracy, gps_time, gps_source, task_id, gps_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", values)
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
            console.error('check out payload', error)
          }

        } else { alert('no data') }
      })
    },
    onCheckInTap(args) {
      const vueInstance = this

      this.$showModal(SelfieModal, {
        fullscreen: true,
        props: {
          action: 'in',
          task_id: this.task.task_id,
          uid: this.user.uid
        }
      })
      .then(result => {
        if (result) {
          const {
            gps_alt,
            gps_time,
            gps_coords,
            gps_accuracy,
            user_report,
          } = result

          vueInstance.isCheckedIn = true

          try {
            vueInstance.task_ = {
              ...vueInstance.task_,
              dt_log: moment().format('Y-MM-DD H:mm'),
              log_type: "check_in",
              user_report,
              gps_coords,
              gps_accuracy,
              gps_time,
              gps_alt,
              gps_source: "gps",
              task_id: vueInstance.task.task_id,
              task_status: 'started',
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
              db.execSQL("UPDATE tasks SET task_start = datetime('now'), task_status = 'started'")
                .then(result => {
                  console.warn('update task -> check in', result)
                })
                .catch(error => {
                  console.error('update task -> check in', error)
                })

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
        } else { alert('no data') }
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