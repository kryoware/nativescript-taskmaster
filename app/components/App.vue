<template>
  <Page actionBarHidden="true" background="white">
  </Page>
</template>

<script>
import Onboarding from './pages/Onboarding'
import Start from './pages/Start'

export default {
  created() {
    if(this.$appSettings.getBoolean('show_onboarding')) {
      this.navigateTo(Onboarding, {
        clearHistory: true
      })
    } else {
      this.navigateTo(Start, {
        clearHistory: true
      })
    }
  },
}
</script>