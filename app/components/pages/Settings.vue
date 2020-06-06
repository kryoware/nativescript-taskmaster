<template>
  <Page>
    <ActionBar title="Settings" />

    <ScrollView>
      <StackLayout>
        
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
import { SAVE_SETTINGS as mutation } from '../../graphql'

export default {
  methods: {
    saveSettings() {
      this.$showLoader()

      this.$apollo.mutate({
        mutation
      })
      .then(({ data }) => {
        console.warn(data)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        this.$hideLoader()
      })
    }
  }
}
</script>