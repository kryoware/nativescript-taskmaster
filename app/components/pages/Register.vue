<template>
  <Page>
    <ActionBar title="Register" />

    <StackLayout>
      <!-- Profile Photo -->
      <!-- Break -->

      <MDTextField
        v-model="user.first_name"
      />

      <MDTextField
        v-model="user.last_name"
      />

      <MDTextField
        v-model="user.contact"
      />
      <!-- Break -->

      <MDTextField
        v-model="user.username"
      />
      <MDTextField
        v-model="user.password"
      />
      <MDTextField
        v-model="user.email"
      />

      <Button
        text=""
        @tap="onRegisterTap"
      />
    </StackLayout>
  </Page>
</template>

<script>
export default {
  data() {
    return {
      user: {
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        contact: '',
        email: '',
        image: '',
      }
    }
  },
  methods: {
    onUploadTap() {
      // nativescript camera (selfie only)
    },
    onRegisterTap() {
      // Upload attempt
        // success
        // this.$navigateTo()

        // else
        // show error
    }
  },
}
</script>