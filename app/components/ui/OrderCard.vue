<template>
  <StackLayout margin="16" marginBottom="0">
    <Label :text="order.id" />
  </StackLayout>
</template>

<script>
export default {
  props: {
    order: {
      required: true,
      type: Object
    }
  }
}
</script>