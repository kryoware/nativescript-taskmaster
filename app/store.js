import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isConnected: false,
    tasks: [],
    config: {},
    dt_tasks: null
  },
  mutations: {
    addTask: (state, task) => {
      state.tasks.push(task)
    },
    setConnected: (state, status) => {
      state.isConnected = status
    },
    setConfig: (state, config) => {
      state.config = config
    },
    setTasks: (state, tasks) => {
      state.tasks = tasks
    },
    setTaskTimestamp: (state, dt_tasks) => {
      state.dt_tasks = dt_tasks
    }
  },
  actions: {
    addTask: ({ commit }, task) => {
      commit("addTask", task)
    },
    setConneced: ({ commit }, status) => {
      commit("setConnected", status)
    },
    setConfig: ({ commit }, config) => {
      commit("setConfig", config)
    },
    setTasks: ({ commit }, tasks) => {
      commit("setTasks", tasks)
    },
    setTaskTimestamp: ({ commit }, dt_tasks) => {
      commit("setTaskTimestamp", dt_tasks)
    }
  }
});
