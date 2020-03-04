<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://ic_action_back" @tap="$navigateBack" />
      <Label :text="!isSaved ? 'New Task' : task.task_title" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <StackLayout>
      <ScrollView height="100%">
        <StackLayout>
          <!-- Task Details -->
          <StackLayout padding="16 32 24 32">
            <MDTextField
              ref="task_title"
              floating="false"
              hint="Task"
              :text="task.task_title"

              :error="errors.task_title"
              errorEnabled="true"

              @focus="() => { this.errors.task_title = null }"
              @textChange="({ value }) => { this.task.task_title = value }"
              strokeColor="#2e7d32"

              placeholderColor="#2e7d32"
              paddingTop="0"
              paddingLeft="0"
              paddingRight="0"
              color="#2e7d32"
              marginBottom="16"
              class="tx-bold"
              backgroundColor="transparent"
              fontSize="20"
            />

            <MDTextField
              ref="customer"
              floating="false"
              :text="task.customer"

              :error="errors.customer"
              errorEnabled="true"

              @focus="() => { this.errors.customer = null }"
              @textChange="({ value }) => { this.task.customer = value }"
              hint="Customer"
              strokeColor="#2e7d32"
              paddingTop="0"
              paddingLeft="0"
              paddingRight="0"

              placeholderColor="#2e7d32"
              color="#2e7d32"
              class="tx-regular"
              backgroundColor="transparent"
              fontSize="18"
            />
          </StackLayout>
          <!-- Task Details -->

          <StackLayout backgroundColor="white" borderRadius="32" padding="16" marginBottom="8" marginLeft="8" marginRight="8">
            <MDTextField
              hint="Instructions"
              @loaded="initMultiline"
              @textChange="({ value }) => { this.task.instructions = value }"
              
              :text="task.instructions"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <MDTextField
              hint="Address"
              @loaded="initMultiline"
              @textChange="({ value }) => { this.task.location = value }"
              
              :text="task.location"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <MDTextField
              hint="Notes"
              @loaded="initMultiline"
              @textChange="({ value }) => { this.task.notes = value }"
              
              :text="task.notes"
              errorEnabled="true"
              floating="true"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="16"
            />

            <FlexboxLayout v-if="!isCheckedIn" justifyContent="center">
              <MDButton
                v-if="isSaved"
                text="Check In"
                color="white"
                backgroundColor="#2e7d32"
                variant="flat"
                padding="16 32"
                borderRadius="48"
                width="75%"
                class="tx-bold"
                @tap="onCheckInTap"
              />
              <MDButton
                v-else
                text="Save"
                color="white"
                backgroundColor="#2e7d32"
                variant="flat"
                padding="16 32"
                borderRadius="48"
                width="75%"
                class="tx-bold"
                @tap="onSaveTap"
              />
            </FlexboxLayout>

            <StackLayout v-else>
              <FlexboxLayout justifyContent="space-between">
                <MDButton
                  text="Check Out"
                  color="white"
                  backgroundColor="#f9a825"
                  variant="flat"
                  padding="16 32"
                  borderRadius="48"
                  class="tx-bold"
                  flexShrink="1"
                  />
                <MDButton
                  text="Pause"
                  color="white"
                  backgroundColor="#757575"
                  variant="flat"
                  padding="16 32"
                  borderRadius="48"
                  class="tx-bold"
                  flexShrink="1"
                  />
              </FlexboxLayout>
            </StackLayout>
          </StackLayout>

          <FlexboxLayout v-if="isSaved" margin="0 8 16 8" flexGrow="1" justifyContent="space-between">
            <MDButton
              v-if="!isCheckedIn"
              text="View Map"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="() => {}"
            />

            <MDButton
              v-if="isCheckedIn"
              text="Add Photo"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="() => {}"
            />

            <MDButton
              v-if="isCheckedIn"
              text="Add Report"
              color="#2e7d32"
              rippleColor="#2e7d32"
              backgroundColor="white"
              variant="flat"
              padding="16 32"
              borderRadius="48"
              class="tx-bold"
              flexShrink="1"
              @tap="() => {}"
            />

          </FlexboxLayout>

        </StackLayout>
      </ScrollView>
    </StackLayout>
  </Page>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  connectionType,
  getConnectionType,
} from 'tns-core-modules/connectivity'
import {
  INSERT_TASK_QUERY
} from '../sql'
import moment from 'moment'

const SQLite = require('nativescript-sqlite')

export default {
  data() {
    return {
      temp_task_id: null,
      isSaved: false,
      isCheckedIn: false,
      task: {
        address: null,
        notes: null,
        instructions: null,
        task_title: null,
        customer: null
      },
      errors: {
        task_title: null,
        customer: null
      }
    }
  },
  mounted() {
    this.temp_task_id = moment().format('X')
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    ...mapActions([
      'addTask'
    ]),
    onSaveTap() {
      const isWifi = getConnectionType() === connectionType.wifi
      const vueInstance = this
      console.warn('onSaveTap')
      console.warn('isWifi: ', )

      /*
      "task_id": "2",
      "uid": "0",
      "task_tag": "",
      "task_title": "Deliver PC",
      "task_des": "Delivery",
      "instructions": "Deliver and install printer",
      "notes": "collect payment",
      "location": "83 Mahog St. Insullar Subdivision",
      "gps_coords": "",
      "customer": "David",
      "schedule": "2019-07-21 12:11:03",
      "task_start": "0000-00-00 00:00:09",
      "task_end": "0000-00-00 00:00:00",
      "task_status": "pending",
      "task_time_allocated": "30",
      "assigned_to": "0",
      "sched_day": "Jan 01",
      "sched_time": "08:00 AM"
      */

      if (this.task.task_title == null || this.task.task_title == '') {
        this.errors.task_title = 'Task is required'
      }

      if (this.task.customer == null || this.task.customer == '') {
        this.errors.customer = 'Customer is required'
      }

      if (this.task.instructions == null || this.task.instructions == '') {
        this.errors.instructions = 'Instructions is required'
      }

      if (this.task.address == null || this.task.address == '') {
        this.errors.address = 'Address is required'
      }

      // Failed Validation
      if (
        this.errors.instructions != null &&
        this.errors.task_title != null &&
        this.errors.customer != null &&
        this.errors.address != null
      ) return

      console.warn({ user: this.user })

      const task = {
        schedule: "",
        task_start: null,
        task_end: null,
        task_status: "pending", // FIXME: task_status
        task_time_allocated: "", // FIXME: task_time_allocated
        assigned_to: "", // FIXME: assigned_to
        customer: this.task.customer,
        task_id: "t".concat(this.temp_task_id),
        uid: this.user.uid,
        task_tag: this.temp_task_id, // FIXME: task_tag
        task_title: this.task.task_title,
        task_des: "", // FIXME: task_des
        instructions: this.task.instructions,
        notes: this.task.notes,
        location: this.task.location,
        gps_coords: "", // FIXME: gps_coords
        sched_day: "",
        sched_time: ""
      }

      const values = [
        task.schedule,
        task.task_start,
        task.task_end,
        task.task_status,
        task.task_time_allocated,
        task.assigned_to,
        task.customer,
        task.task_id,
        task.uid,
        task.task_tag,
        task.task_title,
        task.task_des,
        task.instructions,
        task.notes,
        task.location,
        task.gps_coords,
        task.sched_day,
        task.sched_time
      ]

      new SQLite('offline_sync.db').then(db => {
        console.warn("[SQLITE] CONNECTED")
        db.execSQL(INSERT_TASK_QUERY, values)
          .then(result => {
            console.warn("ADD TASK PAGE ", result)

            vueInstance.addTask(task)

            vueInstance.$navigateBack()
          })
          .catch(error => {
            console.error("ADD TASK PAGE ", error)
            alert('Failed to save task locally')
          })
      }, error => console.error("[SQLITE] CONNECT: ", error))
    },
    initMultiline(args) {
      try {
        const input = args.object.android.getEditText()

        input.setSingleLine(false)
        input.setMinLines(3)
        input.setMaxLines(10)
        input.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT)
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE)
      } catch (error) {
        console.error(error)
      }
    },
    onCheckInTap(args) {
      // update vuex
      // update sqlite
      
      const {
        address,
        notes,
        instructions,
        task_title,
        customer
      } = this.task

      this.isCheckedIn = true
      this.addTask({
        address,
        notes,
        instructions,
        task_title,
        customer,
        date: new Date()
      })
    }
  }
}
</script>
