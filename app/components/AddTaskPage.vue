<template>
  <Page backgroundColor="#2e7d32">
    <ActionBar title="" icon="" flat="true" backgroundColor="#2e7d32">
      <NavigationButton text="Back" icon="res://baseline_arrow_back_24" @tap="$navigateBack" />
      <Label text="New Task" fontSize="24" class="tx-bold" color="white" textAlignment="center" width="100%"/>
    </ActionBar>

    <StackLayout>
      <ScrollView height="100%">
        <StackLayout>
          <!-- Task Details -->
          <StackLayout padding="16 32 24 32">
            <MDTextField
              floating="false"
              hint="Task"
              :text="title"
              @textChange="({ value }) => { this.title = value }"
              strokeColor="white"

              placeholderColor="white"
              paddingTop="0"
              paddingLeft="0"
              paddingRight="0"
              color="white"
              marginBottom="16"
              class="tx-bold"
              backgroundColor="transparent"
              fontSize="20"
            />

            <MDTextField
              floating="false"
              :text="customer"
              @textChange="({ value }) => { this.customer = value }"
              hint="Customer"
              strokeColor="white"
              paddingTop="0"
              paddingLeft="0"
              paddingRight="0"

              placeholderColor="white"
              color="white"
              class="tx-regular"
              backgroundColor="transparent"
              fontSize="18"
            />
          </StackLayout>
          <!-- Task Details -->

          <StackLayout backgroundColor="white" borderRadius="32" padding="24" marginLeft="8" marginRight="8" marginBottom="8">
            <MDTextField
              hint="Instructions"
              :text="instructions"
              @textChange="({ value }) => { this.instructions = value }"
              @loaded="initMultiline"
              
              errorEnabled="true"
              floating="false"

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
              :text="address"
              @textChange="({ value }) => { this.address = value }"
              @loaded="initMultiline"
              
              errorEnabled="true"
              floating="false"

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
              :text="notes"
              @textChange="({ value }) => { this.notes = value }"
              @loaded="initMultiline"
              
              errorEnabled="true"
              floating="false"

              placeholderColor="#808080"
              strokeColor="#2e7d32"
              floatingColor="#2e7d32"
              errorColor="#FF5460"
              backgroundColor="white"

              paddingLeft="0"
              paddingRight="0"
              class="tx-regular"
              marginBottom="24"
            />

            <FlexboxLayout justifyContent="center">
              <MDButton
                text="Check In"
                color="white"
                backgroundColor="#2e7d32"
                variant="flat"
                padding="16 32"
                borderRadius="48"
                width="75%"
                class="tx-regular"
                @tap="onCheckInTap"
              />
            </FlexboxLayout>
          </StackLayout>

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
      address: null,
      notes: null,
      instructions: null,
      title: null,
      customer: null
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
      console.warn('test')
      const {
        address,
        notes,
        instructions,
        title,
        customer
      } = this

      this.addTask({
        address,
        notes,
        instructions,
        title,
        customer,
        date: new Date()
      })
    }
  }
}
</script>
