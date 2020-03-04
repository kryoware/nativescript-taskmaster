<template>
  <Page>
    <DockLayout stretchLastChild="true" backgroundColor="#f5f5f5">
      <StackLayout dock="top">
        <StackLayout>
          <FlexboxLayout marginTop="8"
            justifyContent="center"
            :width="$screen.widthDIPs"
            top="0"
            left="0">
            <StackLayout height="116" width="116" backgroundColor="white" borderRadius="100%">
              <Image
                margin="8"
                backgroundColor="#dcdcdc"
                :src="selfie"
                height="100"
                width="100"
                stretch="aspectFill"
                borderRadius="100%"
              />
            </StackLayout>
          </FlexboxLayout>

          <StackLayout top="80" left="0" padding="16" :width="$screen.widthDIPs" backgroundColor="#fff" borderRadius="32" marginLeft="8" marginRight="8" marginTop="8">
            <TextField
              v-model="user_report"
              @loaded="initMultiline"
              hint="Report"
            />

            <MDButton
              color="white"
              backgroundColor="#757575"
              marginTop="8"
              text="Take Selfie"
              @tap="onSelfieTap"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold" />
          </StackLayout>
        </StackLayout>

        <StackLayout backgroundColor="#fff" borderRadius="32" padding="16" margin="8">
          <Label text="Coordinates:" class="tx-regular" fontSize="14"/>
          <Label :text="gps_coords" class="tx-medium tx-primary" fontSize="16" marginBottom="8" textWrap="true" />
          
          <Label text="Accuracy:" class="tx-regular" fontSize="14"/>
          <Label :text="gps_accuracy" class="tx-medium tx-primary" fontSize="16" marginBottom="8" textWrap="true" />
          
          <Label text="Timestamp:" class="tx-regular" fontSize="14"/>
          <Label :text="gps_time" class="tx-medium tx-primary" fontSize="16" marginBottom="8" textWrap="true" />

          <MDButton
            marginTop="8"
            color="white"
            backgroundColor="#757575"
            text="Log GPS"
            @tap="onGPSTap"
            variant="flat"
            padding="16 32"
            borderRadius="48"
            class="tx-bold" />
        </StackLayout>
      </StackLayout>


      <FlexboxLayout dock="bottom" justifyContent="flex-end" flexDirection="column">
        <FlexboxLayout justifyContent="center">
          <MDButton
            margin="24"
            backgroundColor="#757575"
            text="Confirm"
            @tap="onConfirmTap"
            variant="flat"
            padding="16 32"
            borderRadius="48"
            class="tx-bold" />
        </FlexboxLayout>
      </FlexboxLayout>
    </DockLayout>
  </Page>
</template>

<script>
import { ImageSource, fromFile, fromResource, fromBase64 } from 'tns-core-modules/image-source'
import * as camera from 'nativescript-camera'
import { mapState } from 'vuex'

import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'

import { knownFolders, path } from 'file-system'

const SQLite = require('nativescript-sqlite')

export default {
  props: {
    uid: {
      type: String,
      required: true
    },
    task_id: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selfie: null,
      gps_alt: '',
      gps_time: '',
      gps_coords: '',
      gps_accuracy: '',
      user_report: null,
    }
  },
  computed: {
    ...mapState({
      config: state => state.config
    }),
    // buttonText() {
    //   return this.action === 'in' ? 'Check In' : 'Check Out'
    // },
    // buttonColor() {
    //   return this.action === 'in' ? '#2e7d32' : '#f9a825'
    // }
  },
  methods: {
    initMultiline(args) {
      try {
        const input = args.object.android

        input.setSingleLine(false)
        input.setMinLines(3)
        input.setMaxLines(10)
        input.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT)
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE)
      } catch (error) {
        console.error(error)
      }
    },
    async compressImage(images) {
      const vueInstance = this

      images.forEach((e, imgIndex) => {
        let image

        if (vueInstance.$platform.isAndroid) {
          image = e.android
        } else if (vueInstance.$platform.isIOS) {

        }

        let img_max_width_px = 800

        if (this.config && this.config.hasOwnProperty('img_max_width_px')) {
          img_max_width_px = parseInt(this.config.img_max_width_px)
        }

        // Should come from config
        const format = image.substr(image.indexOf('.') + 1)
        const quality = parseInt(vueInstance.config.jpeg_quality)

        e.options = {
          width: 800, // / this.$screen.scale,
          height: 800, // / this.$screen.scale,
          keepAspectRatio: true
        }

        try {
          ImageSource.fromAsset(e)
          .then(imageSource => {
            try {
              const filename = `${vueInstance.uid}_${vueInstance.task_id}_selfie_${vueInstance.action}.${format}`
              const folder = knownFolders.documents().path
              const filePath = path.join(folder, filename)
              const saved = imageSource.saveToFile(filePath, format, quality)

              if (saved) {
                vueInstance.selfie = filePath

                new SQLite('offline_sync.db')
                  .then(db => {
                    try {
                    db.execSQL('INSERT INTO files (filename, task_id, status) VALUES (?, ?, ?)', [ filePath, vueInstance.task_id, 'pending' ])
                      .then(result => {
                        console.warn('[SQLITE] Queue Image File', result)
                      })
                      .catch(error => console.error('writeText', error))
                    } catch (error) {
                      console.error(error)
                    }
                  })
                  .catch(error => {
                    vueInstance.$hideLoader()
                    alert({ title: 'DB ERROR', message: error })
                    console.error('[SQLITE] Queue Image File', error)
                  })
              }
            } catch (error) {
              console.error('Compress Image', error)
            }
          })
          .catch(error => {
            // Sentry.captureException(error)
            console.error('ImageSource', error)
          })
        } catch (error) {
          console.error('fromAsset', error)
        }
      })
    },
    takePictureHandler(e) {
      this.compressImage([e])
    },
    onSelfieTap() {
      try {
        var takePictureHandler = this.takePictureHandler
        var scale = this.$screen.scale

        // Fallback/Default
        let img_max_width_px = 800

        if (this.config && this.config.hasOwnProperty('img_max_width_px')) {
          img_max_width_px = parseInt(this.config.img_max_width_px)
        }

        camera
        .requestPermissions()
        .then(
          function success() {
            var options = {
              width: img_max_width_px / scale,
              height: img_max_width_px / scale,
              keepAspectRatio: true,
              saveToGallery: true,
              cameraFacing: 'front'
            }

            camera.takePicture(options)
              .then(takePictureHandler)
              .catch(function (error) {
                console.error('onSelfieTap.takePicture', error)
              })
          },
          function failure() {
            // permission request rejected
            // ... tell the user ...
          })
      } catch (error) {
        console.error('onSelfieTap', error)
      }
    },
    onGPSTap() {
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
                altitude
              } = loc

              vueInstance.gps_coords = `${latitude},${longitude}`
              vueInstance.gps_accuracy = (horizontalAccuracy + verticalAccuracy) / 2
              vueInstance.gps_time = timestamp
              vueInstance.gps_alt = altitude
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
    onConfirmTap() {
      const {
        selfie,
        gps_alt,
        gps_time,
        gps_coords,
        gps_accuracy,
        user_report,
      } = this

      const {
        gps_req_check_in,
        photo_req_check_in,
      } = this.config

      if (parseInt(photo_req_check_in) === 1 && selfie === null) {
        alert('Selfie is required')
        return
      }

      if (parseInt(gps_req_check_in) === 1 && (gps_time === '' || gps_coords === '' || gps_accuracy === '' || gps_alt === '')) {
        alert('GPS is required')
        return
      }

      this.$modal.close({
        gps_coords,
        gps_time,
        gps_accuracy,
        gps_alt,
      })
    }
  }
}
</script>
