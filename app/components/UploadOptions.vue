<template>
  <StackLayout height="104" class="paper-tp">
    <ListView for="item in items" @itemTap="onItemTap" height="100%" separatorColor="transparent">
      <v-template>
        <StackLayout style="padding: 16 24">
          <FlexboxLayout>
            <FlexboxLayout flexDirection="column" justifyContent="center" marginRight="12" marginTop="2">
              <Image :src="`res://${item.icon}`" stretch="aspectFit" height="14" />
            </FlexboxLayout>
            <Label :text="item.label" class="tx-medium" fontSize="14" />
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
          icon: 'ic_camera'
        },
        {
          label: 'Upload from Gallery',
          icon: 'ic_gallery'
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
.paper-tp {
  border-top-left-radius: 24;
  border-top-right-radius: 24;
}
</style>