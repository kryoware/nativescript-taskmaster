<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://ic_action_back" @tap="$navigateBack" />
      <Label @tap="testPayload" text="Photos" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <DockLayout stretchLastChild="true">
      <FlexboxLayout dock="bottom" justifyContent="space-between" width="100%" padding="24">
        <MDButton
          text="Add"
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
          <FlexboxLayout width="100%" :justifyContent="images.length === 0 ? 'center': 'flex-start'" flexDirection="column">
            <Label v-if="images.length === 0" text="No images added yet" color="#2b2b2b" class="tx-medium" fontSize="18" textAlignment="center"/>

            <WrapLayout v-else width="100%">

              <StackLayout
                width="50%"
                v-for="(image, key) in images"
                :key="key">
                  <Label color="#2b2b2b" class="tx-regular" fontSize="12" :text="`Image ${key + 1}`" textAlingment="center"/>
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

                  <StackLayout v-if="imageLabels[key].saved">
                    <Label :text="imageLabels[key].label" textWrap="true" color="#2b2b2b" class="tx-regular"/>
                    <Button text="Edit Label (TODO)" @tap="onEditTap(key)" />
                  </StackLayout>

                  <StackLayout v-else>
                    <TextField
                      :hint="`Image ${key + 1} Label`"
                      class="tx-regular"
                      v-model="imageLabels[key].label"/>
                    <Button text="Save" @tap="onSaveTap(key)" />
                  </StackLayout>

                  <Button text="Remove" @tap="onRemoveTap(key)" />

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

const SQLite = require('nativescript-sqlite')

export default {
  props: {
    task: {
      type: Object,
      required: true
    },
    images_: {
      type: Array,
      required: true
    },
    imageLabels_: {
      type: Array,
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
    console.warn('--- ADD PHOTO ---')
    console.warn(this.images_)
    console.warn(this.imageLabels_)

    try {
      this.images = [ ...this.images, ...this.images_ ]
      this.imageLabels = [ ...this.imageLabels, ...this.imageLabels_ ]
    } catch (error) {
      console.error('merge', error)
    }
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
    onEditTap(key) {
      alert('TODO')

      // replace text of file
    },
    onRemoveTap(key) {
      try {
        let filename = this.images[key]

        const folder = fs.knownFolders.documents()

        const imgFile = folder.getFile(filename.substr(filename.lastIndexOf('/') + 1))
        imgFile.removeSync(error => console.error('delete imgFile', error))

        const txtFile = folder.getFile(filename.substr(filename.lastIndexOf('/') + 1, filename.lastIndexOf('.')).concat('.txt'))
        txtFile.removeSync(error => console.error('delete txtFile', error))

        folder.eachEntity(e => {
          if (['.jpg', '.jpeg', '.png', '.txt'].includes(e.extension)) {
            console.warn(e.path)
          }
        })

        if (this.imageLabels[key].saved) {
          console.warn('DELETE FROM STORAGE')

          const str = this.images[key]
          let files = [
            "'".concat(str.substr(0, str.lastIndexOf('.')).concat('.txt'), "'"),
            "'".concat(str, "'"),
          ].join(',')

          const vueInstance = this

          this.$showLoader()
          console.warn('UPDATE files SET status = ? WHERE filename IN ('.concat(
                files,
                ')'
              ))

          new SQLite('offline_sync.db').then(db => {
            db.execSQL('UPDATE files SET status = ? WHERE filename IN ('.concat(
                files,
                ')'
              ),
              "deleted"
            )
            .then(result => {
              vueInstance.$hideLoader()
              console.warn('REMOVE FROM QUEUE', result)
              this.images.splice(parseInt(key), 1)
              this.imageLabels.splice(parseInt(key), 1)
            })
            .catch(error => {
              vueInstance.$hideLoader()
              alert({ title: 'DB ERROR', message: error })
              console.error('REMOVE FROM QUEUE', error)
            })
          },
          error => {
            console.error("[SQLITE] CONNECT: ", error)
          })
        } else {
          this.images.splice(parseInt(key), 1)
          this.imageLabels.splice(parseInt(key), 1)
        }
      } catch (error) {
        console.error('DELETE FROM STORAGE', error)
      }
    },
    onSaveTap(key) {
      const vueInstance = this

      this.$showLoader()

      new SQLite('offline_sync.db').then(db => {
        try {
          const filename = `${this.user.uid}_${this.task.task_id}_pic_${key + 1}.txt`
          const folder = fs.knownFolders.documents()
          const file = folder.getFile(filename)

          const imageFile = vueInstance.images[key]

          console.warn(imageFile)
          // imageFile = imageFile.substr(imageFile.lastIndexOf('/') + 1)

          db.execSQL('INSERT INTO files (filename, task_id, status) VALUES (?, ?, ?)', [ imageFile, this.task.task_id, 'pending' ])
            .then(result => {
              console.warn('[SQLITE] Queue Image File', result)

              file.writeText(vueInstance.imageLabels[key].label)
                .then(() => {
                  console.warn('writeText')

                  db.execSQL('INSERT INTO files (filename, task_id, status) VALUES (?, ?, ?)', [ file.path, this.task.task_id, 'pending' ])
                    .then(result => {
                      console.warn('[SQLITE] Queue Image Label', result)

                      vueInstance.$hideLoader()
                      vueInstance.imageLabels[key].saved = true
                    })
                    .catch(error => {
                      vueInstance.$hideLoader()
                      alert({ title: 'DB ERROR', message: error })
                      console.error('[SQLITE] Queue Image Label', error)
                    })
                })
                .catch(error => console.error('writeText', error))
            })
            .catch(error => {
              vueInstance.$hideLoader()
              alert({ title: 'DB ERROR', message: error })
              console.error('[SQLITE] Queue Image File', error)
            })
        } catch (error) {
          console.error('Create image file', error)
        }
      },
      error => {
        console.error("[SQLITE] CONNECT: ", error)
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
        const quality = parseInt(this.config.jpeg_quality)

        e.options = {
          width: 800, // / this.$screen.scale,
          height: 800, // / this.$screen.scale,
          keepAspectRatio: true
        }

        try {
          ImageSource.fromAsset(e)
          .then(imageSource => {
            try {
              console.warn(Object.keys(imageSource))
              console.warn('Resize: ', { width: imageSource.width, height: imageSource.height })
              const filename = `${this.user.uid}_${this.task.task_id}_pic_${this.images.length + 1}.${format}`
              const folder = fs.knownFolders.documents().path
              const filePath = fs.path.join(folder, filename)
              const saved = imageSource.saveToFile(filePath, format, quality)

              if (saved) {
                this.images.push(filePath)
                this.imageLabels.push({
                  label: '',
                  saved: false
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