<template>
  <Page actionBarHidden="true">
    <StackLayout>
      <!-- Header & App Logo ? -->

      <StackLayout>
        <Button
          text="Login"
          @tap="toLogin"
        />
        
        <Button
          text="Register"
          @tap="toRegister"
        />
      </StackLayout>
    </StackLayout>
  </Page>
</template>

<script>
import Login from './Login'
import Register from './Register'

export default {
  methods: {
    toLogin() {
      this.$navigateTo(Login)
    },
    toRegister() {
      this.$navigateTo(Register)
    }
  },
}
</script>