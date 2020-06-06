<template>
  <Page actionBarHidden="true">
    <StackLayout>
      <Carousel>

        <CarouselItem>
        </CarouselItem>

        <CarouselItem>
        </CarouselItem>

        <CarouselItem>
          <StackLayout>

            <Button text="I'm in!" @tap="getStarted" />
          </StackLayout>
        </CarouselItem>
      </Carousel>
    </StackLayout>
  </Page>
</template>

<script>
import * as permissions from 'nativescript-permissions'

import Start from './Start'

export default {
  methods: {
    getStarted() {
      // Request permissions
      permissions.requestPermissions([

      ])
      .then(() => {

      })
      .catch(error => {

      })

      this.$appSettings.setBoolean('show_onboarding', false)

      // Go to start page
      this.$navigateTo(Start, {
        clearHistory: true
      })
    }
  },
}
</script>