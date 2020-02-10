import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isConnected: false,
    tasks: [
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"started",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"paused",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"done",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"pending",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"started",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"paused",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"done",
        "date": "2020-02-09T15:41:26.282Z"
      },
      {
        "address": "An address",
        "notes": "A few notes",
        "instructions": "Some Instructions",
        "title": "New Task Title",
        "customer": "New Customer Name",
        "status":"pending",
        "date": "2020-02-09T15:41:26.282Z"
      }
    ]
  },
  mutations: {
    addTask: (state, task) => {
      console.warn("mutation", task)
      state.tasks.push(task)
    },
    setConnected: (state, status) => {
      state.isConnected = status
    }
  },
  actions: {
    addTask: ({ commit }, task) => {
      console.warn("action", task)
      commit("addTask", task)
    },
    setConneced: ({ commit }, status) => {
      commit("setConnected", status)
    }
  }
});
