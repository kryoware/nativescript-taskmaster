<template>
  <FlexboxLayout flexDirection="column">
    <StackLayout margin="24" flexShrink="1">
      <Label :text="`DT_CONFIG: ${dt_config}`" />
      <Label :text="`DT_TASKS: ${dt_tasks}`" />
    </StackLayout>

    <StackLayout margin="0 24 24 24" flexShrink="1">
      <Label :text="`DT_CONFIG: ${dt_config}`" />
      <Label :text="`DT_TASKS: ${dt_tasks}`" />
    </StackLayout>
    
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

  </FlexboxLayout>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // props: {
  //   connection: {
  //     type: Object,
  //     required: true
  //   }
  // },
  computed: {
    ...mapState({
      dt_tasks: state => state.dt_tasks,
      dt_config: state => state.config.dt_config,
    })
  }
}
</script>

<style>

</style>