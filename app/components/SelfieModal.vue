<template>
  <Page>
    <DockLayout stretchLastChild="true" backgroundColor="#f5f5f5">
      <StackLayout dock="top">
        <AbsoluteLayout :width="$screen.widthDIPs">
          <StackLayout top="80" left="0" padding="88 16 16 16" :width="$screen.widthDIPs" backgroundColor="#fff" borderRadius="32" marginLeft="8" marginRight="8" marginTop="8">
            <TextField
              hint="Report"
              v-model="user_report"
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

          <FlexboxLayout 
          justifyContent="center"
          :width="$screen.widthDIPs"
            top="0"
            left="0">
            <Image
              backgroundColor="#dcdcdc"
              :src="selfie"
              height="160"
              width="160"
              stretch="aspectFill"
              borderRadius="100%"
            />
          </FlexboxLayout>
        </AbsoluteLayout>

        <StackLayout backgroundColor="#fff" borderRadius="32" padding="16" margin="8">
          <Label :text="`Coordinates:\n${gps_coords}`" class="tx-medium" fontSize="16" marginBottom="8" />
          <Label :text="`Accuracy:\n${gps_accuracy}`" class="tx-medium" fontSize="16" marginBottom="8" />
          <Label :text="`Timestamp:\n${gps_time}`" class="tx-medium" fontSize="16" marginBottom="8" />

          <MDButton
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
    })
  },
  methods: {
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
        
        console.warn(Object.keys(e))
        console.warn(e.orientation)
        // e.options = {
        //   width: img_max_width_px / this.$screen.scale,
        //   height: img_max_width_px / this.$screen.scale,
        // 
        // }

        console.warn('SelfieModal', { quality })

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

      console.warn('SelfieModal', {
        gps_req_check_in,
        photo_req_check_in,
        selfie,
        gps_coords,
        gps_time,
        gps_accuracy,
        gps_alt,
      })

      if (parseInt(photo_req_check_in) === 1 && selfie === null) {
        return
      }

      if (parseInt(gps_req_check_in) === 1 && (gps_time === '' || gps_coords === '' || gps_accuracy === '' || gps_alt === '')) {
        return
      }

      console.warn({
        selfie,
        gps_coords,
        gps_time,
        gps_accuracy,
        gps_alt,
      })
      
      // this.$modal.close({
      //   gps_coords,

      // })
    }
  }
}
</script>

<style>

</style>