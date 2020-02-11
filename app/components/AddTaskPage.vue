<template>
  <Page backgroundColor="#f5f5f5">
    <ActionBar title="" icon="" flat="true" backgroundColor="transparent">
      <NavigationButton text="Back" icon="res://baseline_arrow_back_24" @tap="$navigateBack" />
      <Label text="New Task" fontSize="24" class="tx-bold" color="#2e7d32" textAlignment="center" width="100%"/>
    </ActionBar>

    <StackLayout>
      <ScrollView height="100%">
        <StackLayout>
          <!-- Task Details -->
          <StackLayout padding="16 32 24 32">
            <MDTextField
              floating="false"
              hint="Task"
              :text="task.task_title"
              @textChange="({ value }) => { this.title = value }"
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
              floating="false"
              :text="task.customer"
              @textChange="({ value }) => { this.customer = value }"
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

          <StackLayout backgroundColor="white" borderRadius="32" padding="16" marginLeft="8" marginRight="8">
            <MDTextField
              hint="Instructions"
              @loaded="initMultiline"
              
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

          <FlexboxLayout margin="16 8 16 8" flexGrow="1" justifyContent="space-between">
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
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      isCheckedIn: false,
      task: {
        address: null,
        notes: null,
        instructions: null,
        task_title: null,
        customer: null
      }
    }
  },
  methods: {
    ...mapActions([
      'addTask'
    ]),
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
