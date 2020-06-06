<template>
  <Page>
    <ActionBar title="Register" />

    <StackLayout>
      <MDTextField
        v-model="user.username"
      />


      <Button
        text=""
        @tap="onRegisterTap"
      />
    </StackLayout>
  </Page>
</template>

<script>
import 

export default {
  methods: {
    onRegisterTap
  },
}
</script>