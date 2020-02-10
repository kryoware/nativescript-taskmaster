<template>
  <StackLayout height="180">
    <Label text="Choose Photo" class="__title __text-dark __fs-16" paddingLeft="24" paddingRight="24" paddingTop="32" paddingBottom="16" />
    <ListView for="item in items" @itemTap="onItemTap" height="100%" marginBottom="16" separatorColor="transparent">
      <v-template>
        <StackLayout style="padding: 16 24">
          <FlexboxLayout>
            <FlexboxLayout flexDirection="column" justifyContent="center" marginRight="12" marginTop="2">
              <Image :src="`res://${item.icon}`" stretch="aspectFit" height="14" />
            </FlexboxLayout>
            <Label :text="item.label" class="__text-norm __text-dark __fs-14" />
          </FlexboxLayout>
        </StackLayout>
      </v-template>
    </ListView>
  </StackLayout>
</template>

<script>
export default {
  props: ['closeCallback'],
  data() {
    return {
      items: [
        {
          label: 'Take Photo',
          icon: 'ic_share_camera'
        },
        {
          label: 'Upload from Gallery',
          icon: 'ic_chat_upload'
        },
      ]
    }
  },
  methods: {
    onItemTap({ index }) {
      this.closeCallback(index)
      this.$closeBottomSheet(index)
    }
  },
}
</script>

<style>
</style>