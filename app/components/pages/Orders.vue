<template>
  <Page>
    <ActionBar title="Orders" />

    <ScrollView>
      <StackLayout>
        <StackLayout v-if="$apollo.queries.orders.loading">
          Loading
        </StackLayout>

        <Ordercard
          v-else
          v-for="(order, index) in orders"
          :key="index"
        />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
import { GET_ORDERS as query } from '../../graphql'

import OrderDetails from '../pages/OrderDetails'

import OrderCard from '../ui/OrderCard'

export default {
  components: {
    OrderCard
  },
  apollo: {
    orders: {
      query,
      // fetchPolicy: 'network-first'
    }
  },
  methods: {
    onOrderCardTap(args) {
      this.$navigateTo(OrderDetails)
    }
  },
}
</script>