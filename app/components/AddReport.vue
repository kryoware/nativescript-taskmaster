<template>
  <StackLayout padding="24">
    <MDTextField
      hint="Report"
      
      :text="report"
      
      @loaded="initMultiline"
      @textChange="({ value }) => { this.report_ = value }"
      
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

    <MDButton
      text="Save"
      @tap="onSaveTap"
      color="white"
      backgroundColor="#757575"
      variant="flat"
      padding="16 32"
      borderRadius="48"
      class="tx-bold"
      width="66%"
    />
  </StackLayout>
</template>

<script>
export default {
  props: {
    closeCallback: {
      type: Function,
      required: true
    },
    report: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      report_: ''
    }
  },
  created() {
    if (this.report) {
      this.report_ = ''.concat(this.report)
    }
  },
  methods: {
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
    onSaveTap() {
      this.closeCallback(this.report_)
      this.$closeBottomSheet(this.report_)
    }
  }
}
</script>

<style>

</style>