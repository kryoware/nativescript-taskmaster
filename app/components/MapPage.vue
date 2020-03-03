<template>
  <Page actionBarHidden="true">
    <MapView
      width="100%"
      height="100%"
      :zoom="zoom"
      :latitude="origin.latitude"
      :longitude="origin.longitude"
      @mapReady="mapReady"
    />
  </Page>
</template>

<script>
import * as permissions from 'nativescript-permissions'

import * as geolocation from 'nativescript-geolocation'
import { Accuracy } from 'tns-core-modules/ui/enums'

export default {
  data() {
    return {
      origin: { latitude: 0, longitude: 0 },
      destination: { latitude: 0, longitude: 0 },
      journeyDetails: "Journey: Not started yet!",
      journeyStarted: false,
      mapView: null,
      zoom: 17,
    }
  },
  methods: {
    mapReady(args) {
      this.mapView = args.object;

      const that = this

      geolocation.enableLocationRequest(true, true).then(() => {
        console.warn('mapReady')
        geolocation.getCurrentLocation({
          desiredAccuracy: Accuracy.high,
          maximumAge: 5000,
          timeout: 10000
        }).then(function (loc) {
          that.origin.latitude = loc.latitude
          that.origin.longitude = loc.longitude
        }, function (e) {
          console.log("Error: " + (e.message || e));
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

<style>

</style>