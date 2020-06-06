<template>
  <Page>
    <ActionBar title="Login" />

    <StackLayout>
      <MDTextField
        v-model="user.username"
      />

      <MDTextField
        type="password"
        
        v-model="user.password"
      />

      <Button
        text="Login"
        @tap="onLoginTap"
      />
    </StackLayout>

    <StackLayout>
      <!-- Social login ? -->
    </StackLayout>
  </Page>
</template>

<script>
import { LOGIN } from '../../graphql'
import Home from './Home'

export default {
  data() {
    return {
      user: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    onLoginTap() {
      const { user } = this

      this.$showLoader()

      this.$apollo.query({
        query: LOGIN,
        variables: {
          user
        }
      })
      .then(({ data }) => {
        console.warn(data)

        let user_data = {
          id: data.id,
          username: data.username,
          email: data.email,
          contact: data.contact,
        }

        this.setUser(user_data)
        this.$appSettings.setString('token', data.token)

        this.$navigateTo(Home, {
          clearHistory: true
        })
      })
      .catch(error => {
        console.error(error)

        // Show error message
      })
      .finally(() => {
        this.$hideLoader()
      })
    }
  },
}
</script>