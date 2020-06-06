import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: [],
    orders: [],
  },
  mutations: {
    setUser: (state, user) => {
      state.user = user
    },
    init: (state) => {
      const user = Vue.$appSettings.getString('user')

      state = {
        ...state,
        ...{
          ...user,
          ...settings
        }
      }
    },
    setOrders: (state, orders) => {
      console.warn('--- setOrders ---')
      console.warn(state.orders.length)

      state.orders = [
        ...state.orders,
        ...orders
      ]

      console.warn(state.orders.length)
      console.warn('--- setOrders ---')
    }
  },
  actions: {
    setUser: ({ commit }, user) => {
      commit("setUser", user)
    },
    setOrders: ({ commit }, orders) => {
      commit("setOrders", orders)
    },
    init: ({ commit }) => commit("init"),
  }
});
