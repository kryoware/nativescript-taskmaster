<template>
  <Page>
    <ActionBar :title="title" />

    <GridLayout rows="*, auto">
      <StackLayout row="0">
        <Dashboard
          v-if="tab === 0"
        />

        <Orders
          v-if="tab === 1"
        />

        <Wallet
          v-if="tab === 2"
        />

        <Account
          v-if="tab === 3"
        />
      </StackLayout>

      <MDBottomNavigationBar
        row="1"
        activeColor="orange"
        backgroundColor="white"
        @tabSelected="tabSelected"
      >
        <MDBottomNavigationTab
          title="Home" icon="ic_home"
        />
        <MDBottomNavigationTab
          title="Orders" icon="ic_view_list"
        />
        <MDBottomNavigationTab
          title="Wallet" icon="ic_menu"
        />
        <MDBottomNavigationTab
          title="Account" icon="ic_menu"
        />
      </MDBottomNavigationBar>
    </GridLayout>
  </Page>
</template>

<script>
import OrderHistory from '../pages/OrderHistory'
import Account from '../pages/Account'
import Orders from '../pages/Orders'
import Wallet from '../pages/Wallet'
import { GET_ORDERS } from '../../graphql'

export default {
  components: {
    OrderHistory,
    Account,
    Orders,
    Wallet,
  },
  data() {
    return {
      tab: 0,
    }
  },
  /*
    Find workaround for query
    get new orders only
    without 'network-first'
    or find a way to do this
    saving data and battery
    (socket/subscriptions ?)
  */
  apollo: {
    orders: {
      query: GET_ORDERS,
      fetchPolicy: 'network-first',
      pollingInterval: 10000,
      result: ({ data }) => {
        console.warn(data)
        this.setOrders(data.orders)
      }
    },
  },
  computed: {
    title() {
      let title

      switch (this.tab) {
        case 0:
          title = "Home"
          break;
        case 1:
          title = "Orders"
          break;
        case 2:
          title = "Wallet"
          break;
        case 3:
          title = "Account"
          break;
      }

      return title
    }
  },
  methods: {
    tabSelected(args) {
      console.warn(args)
    }
  },
}
</script>