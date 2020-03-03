import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isRunning: false,
    isConnected: false,
    tasks: [],
    config: {},
    dt_tasks: null,
    user: {},
    processLog: '',
    errorLog: '',
    permissions: []
  },
  mutations: {
    addTask: (state, task) => {
      state.tasks.push(task)
    },
    setConnected: (state, isConnected) => {
      state.isConnected = isConnected
    },
    setConfig: (state, config) => {
      state.config = config
    },
    setTasks: (state, tasks) => {
      state.tasks = tasks
    },
    setTaskTimestamp: (state, dt_tasks) => {
      state.dt_tasks = dt_tasks
    },
    setUser: (state, user) => {
      state.user = user
    },
    updateTask: (state, task_data) => {
      console.warn(task_data)
      console.warn('--------------------------------')
      state.tasks = state.tasks.map(task => {
        let task_ = Object.assign({}, task)
        
        if (task_data.task_id.indexOf('t') === 0) {
          if (task_data.task_id === task.task_id) {
            console.warn('offline task')
            task_ = { ...task, ...task_data }
          }
        } else {
          if (parseInt(task.task_id) === parseInt(task_data.task_id)) {
            console.warn('Found task')
            console.warn(task_)
            task_ = { ...task, ...task_data }
            console.warn(task_)
          }
        }

        return task_
      })
    },
    setRunning: (state, isRunning) => {
      state.isRunning = isRunning
    },
    addLog: (state, log) => {
      state.processLog = state.processLog.concat(log, '\n')
    },
    addError: (state, error) => {
      state.errorLog = state.errorLog.concat(error, '\n')
    },
    setPermissions: (state, permissions) => {
      console.warn('--- setPermissions --- ')
      console.warn(state.permissions)
      state.permissions = permissions
      console.warn(state.permissions)
      console.warn('--- setPermissions --- ')
    },
  },
  actions: {
    addTask: ({ commit }, task) => {
      commit("addTask", task)
    },
    setConnected: ({ commit }, isConnected) => {
      commit("setConnected", isConnected)
    },
    setConfig: ({ commit }, config) => {
      commit("setConfig", config)
    },
    setTasks: ({ commit }, tasks) => {
      commit("setTasks", tasks)
    },
    setTaskTimestamp: ({ commit }, dt_tasks) => {
      commit("setTaskTimestamp", dt_tasks)
    },
    setUser: ({ commit }, user) => {
      commit("setUser", user)
    },
    updateTask: ({ commit }, task_data) => {
      commit("updateTask", task_data)
    },
    setRunning: ({ commit }, isRunning) => {
      commit("setRunning", isRunning)
    },
    addLog: ({ commit }, log, extras) => {
      let string = ''
      if (extras) {
        console.warn(log, extras)
        if (typeof extras != 'string') extras = JSON.stringify(extras, null, '\t')

        string = log.concat(' ', extras)
      } else {
        console.warn(log)

        if (typeof log != 'string') log = JSON.stringify(log, null, '\t')

        string = log
      }

      commit("addLog", string)
    },
    addError: ({ commit }, error, extras) => {
      let string = ''
      if (extras) {
        console.error(error, extras)
        if (typeof extras != 'string') extras = JSON.stringify(extras, null, '\t')

        string = error.concat(' ', extras)
      } else {
        console.error(error)

        if (typeof error != 'string') error = JSON.stringify(error, null, '\t')

        string = error
      }

      commit("addError", string)
    },
    setPermissions: ({ commit }, permissions) => {
      commit("setPermissions", permissions)
    }
  }
});
