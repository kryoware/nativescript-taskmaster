<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://baseline_arrow_back_24" @tap="$navigateBack" />
      <Label @tap="testPayload" text="Photos" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <DockLayout stretchLastChild="true">
      <FlexboxLayout dock="bottom" justifyContent="space-between" width="100%" padding="24">
        <MDButton
          text="Add Photo"
          color="#2e7d32"
          rippleColor="#2e7d32"
          backgroundColor="white"
          variant="flat"
          padding="16 32"
          borderRadius="48"
          fontWeight="bold"
          class="tx-bold"
          @tap="onAddPhotoTap"

          marginRight="12"
          flexGrow="1"
        />

        <MDButton
          text="Back"
          color="#2e7d32"
          rippleColor="#2e7d32"
          backgroundColor="white"
          variant="flat"
          padding="16 32"
          borderRadius="48"
          fontWeight="bold"
          class="tx-bold"
          @tap="$navigateBack"

          marginLeft="12"
          flexGrow="1"
        />
      </FlexboxLayout>

      <StackLayout dock="center">
        <ScrollView height="100%">
          <FlexboxLayout width="100%" justifyContent="center" flexDirection="column">
            <Label v-if="images.length === 0" text="No images added yet" color="#2b2b2b" class="tx-medium" fontSize="18" textAlignment="center"/>

            <WrapLayout v-else backgroundColor="red" width="100%">

              <StackLayout
                width="50%" 
                v-for="(image, key) in images"
                :key="key">
                  <StackLayout 
                    width="200"
                    height="200"
                    margin="8">
                    <Image
                      :src="image"
                      width="100%"
                      height="100%"
                      stretch="aspectFill"
                    />
                  </StackLayout>

                <TextField
                  :placeholder="`Image ${key + 1} Label`"
                  v-model="imageLabels[key]"/>
              </StackLayout>

            </WrapLayout>
          </FlexboxLayout>
        </ScrollView>
      </StackLayout>
    </DockLayout>
  </Page>
</template>

<script>
import { ImageSource, fromFile, fromResource, fromBase64 } from 'tns-core-modules/image-source'
import * as camera from 'nativescript-camera'
import * as imagepicker from 'nativescript-imagepicker'
import { Image } from 'tns-core-modules/ui/image'
import UploadOptions from './UploadOptions'
import { mapState } from 'vuex'

import * as fs from 'file-system'

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      images: [],
      imageLabels: [],
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      config: state => state.config
    })
  },
  mounted() {
    console.warn(this.user)
    console.warn(this.config)
    console.warn(this.task)
  },
  methods: {
    testPayload() {
      const {
        images,
        imageLabels
      } = this

      console.warn({
        images,
        imageLabels
      })
    },
    onAddPhotoTap(args) {
      const { closeCallback } = this

      this.$showBottomSheet(UploadOptions, {
        props: {
          closeCallback
        }
      })
    },
    async compressImage(images) {
      images.forEach((e, imgIndex) => {
        let image

        if (this.$platform.isAndroid) {
          image = e.android
        } else if (this.$platform.isIOS) {

        }

        // Should come from config
        const format = image.substr(image.indexOf('.') + 1)
        const quality = 80

        try {
          ImageSource.fromAsset(e)
          .then(imageSource => {
            try {
              const fileName = `${this.user.uid}_${this.task.task_id}_pic_${imgIndex + 1}.${format}`
              
              console.warn({ fileName })

              const path = android.os.Environment.getExternalStorageDirectory().toString()
              const folder = fs.Folder.fromPath(fs.path.join(path, '.WorkForce', fileName))
              const saved = imageSource.saveToFile(folder, format, quality)

              console.warn({
                saved: saved.path
              })

              // if (saved) {
              //   console.warn({ fileName })
              //   console.warn({ filePath })

              //   this.images.push(filePath)
              // }
            } catch (error) {
              console.error('Compress Image')
              console.error(error)
            }
          })
          .catch(error => {
            // Sentry.captureException(error)
            console.error('ImageSource')
            console.error(error)
          })
        } catch (error) {
          console.error('ImageSource')
          console.error(error)
        }
      })
    },
    takePictureHandler(e) {
      this.compressImage([e])
    },
    closeCallback(result) {
      switch(parseInt(result)) {
        case 0:
          var takePictureHandler = this.takePictureHandler
          var scale = this.$screen.scale

          camera
          .requestPermissions()
          .then(
            function success() {
              var options = {
                width: 800 / scale,
                height: 800 / scale,
                keepAspectRatio: true,
                saveToGallery: true
              }

              camera.takePicture(options)
                .then(takePictureHandler)
                .catch(function (err) {
                  // Sentry.captureException(err)
                  console.error('takePicture')
                  console.error(err)
                  console.error(err.message)
                })
            },
            function failure() {
              // permission request rejected
              // ... tell the user ...
            })
          break
        case 1:
          const picker = imagepicker.create({ mediaType: 'Image' })

          picker
            .authorize()
            .then(() => picker.present())
            .then(selection => this.compressImage(selection))
            .catch(e => {
              console.error(e)
            })
          break
      }
    }
  }
}
</script>

<style>

</style>