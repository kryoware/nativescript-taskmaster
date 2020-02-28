<template>
  <ScrollView height="100%">
    <StackLayout padding="16">
      <FlexboxLayout justifyContent="space-between">
        <Label :text="`CONNECTED: ${isConnected}`" style="text-transform: uppercase" class="tx-medium" />
        <Label :text="`RUNNING JOBS: ${isRunning}`" style="text-transform: uppercase;" class="tx-medium" />
      </FlexboxLayout>

      <Label text="USER:" class="tx-medium" marginTop="16" />
      <ScrollView height="100" backgroundColor="#dcdcdc" borderRadius="8">
        <StackLayout padding="8">
          <Label :text="userJSON" textWrap="true" />
        </StackLayout>
      </ScrollView>

      <Label :text="`CONFIG (${dt_config})`" class="tx-medium" marginTop="16" />
      <ScrollView height="100" backgroundColor="#dcdcdc" borderRadius="8">
        <StackLayout padding="8">
          <Label :text="configJSON" textWrap="true" />
        </StackLayout>
      </ScrollView>

      <Label :text="`DT_TASKS: ${dt_tasks}`" class="tx-medium" marginTop="16"/>

      <Label text="PROCESS LOG:" marginTop="16" class="tx-medium" />
      <ScrollView height="100" backgroundColor="#dcdcdc" borderRadius="8">
        <StackLayout padding="8">
          <Label :text="processLog" textWrap="true" />
        </StackLayout>
      </ScrollView>

      <Label text="ERROR LOG:" marginTop="16" class="tx-medium" />
      <ScrollView height="100" backgroundColor="#dcdcdc" borderRadius="8">
        <StackLayout padding="8">
          <Label :text="errorLog" textWrap="true" />
        </StackLayout>
      </ScrollView>

      <Label text="FILES:" marginTop="16" class="tx-medium" />
      <ScrollView height="100" backgroundColor="#dcdcdc" borderRadius="8">
        <StackLayout padding="8">
          <Label v-for="(file, key) in files" :key="key" :text="file" textWrap="true" />
        </StackLayout>
      </ScrollView>
      
      <!-- <StackLayout height="25%">
        <Label text="Current Batch" textAlignment="center" class="tx-medium" padding="8 0" fontSize="18"/>
        <StackLayout>
          <Progress marginLeft="24" marginRight="24" />
          <Label text="0 KB of - KB" class="tx-regular" textAlignment="center" />
        </StackLayout>
      </StackLayout>

      <StackLayout height="25%">
        <Label text="Next Batch" textAlignment="center" class="tx-medium" padding="8 0" fontSize="18"/>
        <StackLayout>
          <Progress marginLeft="24" marginRight="24" />
          <Label text="0 KB of - KB" class="tx-regular" textAlignment="center" />
        </StackLayout>
      </StackLayout>

      <StackLayout height="25%">
        <Label text="Pending" textAlignment="center" class="tx-medium" padding="8 0" fontSize="18"/>
        <StackLayout>
          <Progress marginLeft="24" marginRight="24" />
          <Label text="0 KB of - KB" class="tx-regular" textAlignment="center" />
        </StackLayout>
      </StackLayout> -->

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