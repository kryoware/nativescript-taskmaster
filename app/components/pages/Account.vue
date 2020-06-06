<template>
  <StackLayout>
    <ScrollView height="100%">
      <StackLayout>
        <!-- Stuff here -->
        <FlexboxLayout
          marginBottom="16"
          justifyContent="space-between"
          @tap="onSettingsTap"
        >
          <Label text="Settings" />
          <!-- Icon -->
        </FlexboxLayout>
        
        <FlexboxLayout
          justifyContent="space-between"
        >
          <Label text="Privacy Policy" />
          <!-- Icon -->
        </FlexboxLayout>

        <FlexboxLayout
          marginBottom="16"
          justifyContent="space-between"
        >
          <Label text="Help & Support" />
          <!-- Icon -->
        </FlexboxLayout>

        <Button
          text="Logout"
          @tap="onLogoutTap"
        />
      </StackLayout>
    </ScrollView>
  </StackLayout>
</template>

<script>
import Settings from './Settings'

export default {
  methods: {
    onSettingsTap() {
      this.$navigateTo(Settings)
    },
    onLogoutTap() {
      // clear vuex
      // clear appSettings
        // then
        this.$navigateTo(Start, {
          clearHistory: true
        })
    }
  },
}
</script>