<template>
  <AbsoluteLayout>
    <DockLayout
      :height="$screen.heightDIPs"
      :width="$screen.widthDIPs"
      stretchLastChild="true"
      left="0"
      top="0"
    >
      <FlexboxLayout
        dock="bottom"
        ref="toggle"
      >
        <Label text="Accepting Orders" />
        <Switch
          @checkedChange="checkedChange"
          v-model="isAcceptingOrders"
        />
      </FlexboxLayout>

      <StackLayout
        dock="center"
      >
        <MapView
          v-if="isDoingJob"
          width="100%"
          height="100%"
        >
        </MapView>

        <StackLayout v-else>

        </StackLayout>
      </StackLayout>
    </DockLayout>

    <StackLayout
      :top="$screen.heightDIPs - ($screen.heightDIPs * .25)"
      :width="$screen.widthDIPs"
      left="0"
    >
    </StackLayout>
  </AbsoluteLayout>
</template>

<script>
export default {
  data() {
    return {
      isAcceptingOrders: false,
      isDoingJob: false,
    }
  },
  methods: {
    checkedChange(args) {
      console.warn(args)

      // Stop fetching orders
    }
  },
}
</script>