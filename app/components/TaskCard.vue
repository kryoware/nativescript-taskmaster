<template>
  <MDCardView borderRadius="16" :backgroundColor="color" rippleColor="white">
    <StackLayout padding="16">

      <FlexboxLayout justifyContent="space-between" marginBottom="16">
        <StackLayout padding="4 8" 
          backgroundColor="#dcdcdc"
          borderRadius="4">
        <Label :text="task.task_status" class="tx-bold task-tag" textAlignment="center" fontSize="12" 
          color="white"
          
        />
        </StackLayout>

        <FlexboxLayout justifyContent="center" flexDirection="column">
          <Label :text="`${task.sched_day} ${task.sched_time}`" class="tx-regular" textAlignment="center" fontSize="12" />
        </FlexboxLayout>
      </FlexboxLayout>

      <DockLayout stretchLastChild="true" >

        <FlexboxLayout dock="left" justifyContent="center" flexDirection="column" marginRight="16">
          <Label :text="task.task_id" class="tx-medium" fontSize="16" textAlignment="center" />
        </FlexboxLayout>

        <StackLayout dock="center">
          <Label :text="task.task_title" class="tx-bold" fontSize="18" marginBottom="16" textWrap="true" />
          <Label :text="task.customer" class="tx-regular" fontSize="16" textWrap="true" />
        </StackLayout>

      </DockLayout>

    </StackLayout>

  </MDCardView>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    date() {
      return moment(this.task.sechedule).format('MMM DD')
    },
    time() {
      return moment(this.task.sechedule).format('h:mm A')
    },
    color() {
      let background = ''

      switch (this.task.task_status) {
        case 'done':
          background = 'rgb(100, 181, 246)'
          break;
        case 'pending':
          background = ''
          break;
        case 'started':
          background = 'rgb(102, 207, 132)'
          break;
        case 'paused':
          background = 'rgb(255, 173, 148)'
          break;
      }

      return background
    }
  }
}
</script>

<style lang="scss" scoped>
Label {
  color: rgba(0,0,0, 0.6);
}

.task-tag {
  text-transform: uppercase;
}
</style>
