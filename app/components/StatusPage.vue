<template>
  <ScrollView height="100%">
    <StackLayout>
      <StackLayout padding="8" v-for="(task, key) in tasks" :key="key">
        <Label
          :text="JSON.stringify(task, null, '\t')"
          textWrap="true"
        />
      </StackLayout>

    </StackLayout>
  </ScrollView>
</template>

<script>
import { mapState } from 'vuex'
import { knownFolders } from 'file-system'

export default {
  // props: {
  //   connection: {
  //     type: Object,
  //     required: true
  //   }
  // },
  data() {
    return {
      files: [],
      refreshFolder: null
    }
  },
  destroyed() {
    clearInterval(this.refreshFolder)
  },
  mounted() {
    this.refreshFolder = setInterval(() => {
      this.files = []
      const folder = knownFolders.documents()

      folder.eachEntity(e => {
        if (['.jpg', '.jpeg', '.png', '.txt'].includes(e.extension)) {
          this.files.push(e.name)
        }
      })
    }, 10000)
  },
  computed: {
    ...mapState({
      isRunning: state => state.isRunning,
      isConnected: state => state.isConnected,
      user: state => state.user,
      config: state => state.config,
      tasks: state => state.tasks,
      dt_tasks: state => state.dt_tasks,
      dt_config: state => state.config.dt_config,
      processLog: state => state.processLog,
      errorLog: state => state.errorLog,
    }),
    userJSON() {
      return JSON.stringify(this.user, null, '\t')
    },
    configJSON() {
      return JSON.stringify(this.config, null, '\t')
    }
  }
}
</script>

<style>

</style>