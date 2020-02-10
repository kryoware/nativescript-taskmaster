<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://baseline_arrow_back_24" @tap="$navigateBack" />
      <Label text="Photos" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <DockLayout stretchLastChild="true">
      <FlexboxLayout dock="bottom" justifyContent="space-between" width="100%" padding="24" >
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
              <Image
                width="50%"
                height="100%"
                src="res://icon-76"
                stretch="aspectFit"
              />
              <Image
                width="50%"
                height="100%"
                src="res://icon-76"
                stretch="aspectFit"
              />
              <Image
                width="50%"
                height="100%"
                src="res://icon-76"
                stretch="aspectFit"
              />
              <Image
                width="50%"
                height="100%"
                src="res://icon-76"
                stretch="aspectFit"
              />
              <Image
                width="50%"
                height="100%"
                src="res://icon-76"
                stretch="aspectFit"
              />
            </WrapLayout>
          </FlexboxLayout>
        </ScrollView>
      </StackLayout>
    </DockLayout>
  </Page>
</template>

<script>
import { ImageSource, fromFile, fromResource, fromBase64 } from 'tns-core-modules/image-source'
import { Folder, path, knownFolders } from 'tns-core-modules/file-system'
import * as camera from 'nativescript-camera'
import * as imagepicker from 'nativescript-imagepicker'
import { Image } from 'tns-core-modules/ui/image'
import UploadOptions from './UploadOptions'

export default {
  data() {
    return {
      images: [1]
    }
  },
  methods: {
    onAddPhotoTap(args) {
      const { closeCallback } = this

      this.$showBottomSheet(UploadOptions, {
        props: {
          closeCallback
        }
      })
    },
    compressImage(images) {
      images.forEach(e => {
        let image

        if (this.$platform.isAndroid) {
          image = e.android
        } else if (this.$platform.isIOS) {

        }

        const format = image.substr(image.indexOf('.') + 1)
        const quality = 75

        ImageSource.fromAsset(e)
        .then(imageSource => {
          const fileName = Array(32).fill(0).map(x => Math.random().toString(36).charAt(2)).join('').concat('.', format)
          const folder = knownFolders.documents().path
          const filePath = path.join(folder, fileName)
          const saved = imageSource.saveToFile(filePath, format, quality)

          if (saved) {
            this.user.profile_image = filePath
            this.profile_image = fileName
          }
        })
        .catch(error => {
          Sentry.captureException(error)
          console.error(error)
        })
      })
    },
    async takePictureHandler(e) {
      await this.compressImage([e])
    },
    closeCallback(args) {
      switch(parseInt(result)) {
        case 0:
          var takePictureHandler = this.takePictureHandler
          var scale = this.$screen.scale

          camera
          .requestPermissions()
          .then(
            function success() {
              var options = {
                width: 500 / scale,
                height: 500 / scale,
                keepAspectRatio: true,
                saveToGallery: true
              }

              camera
              .takePicture(options)
              .then(takePictureHandler)
              .catch(function (err) {
                Sentry.captureException(err)
                console.error(err.message)
              })
            },
            function failure() {
              // permission request rejected
              // ... tell the user ...
            })
          break
        case 1:
          const farmPhotos = imagepicker.create({ mediaType: 'Image' })

          farmPhotos
          .authorize()
          .then(() => farmPhotos.present())
          .then(selection => this.compressImage(selection))
          .catch(e => console.error(e))
          break
      }
    }
  }
}
</script>

<style>

</style>