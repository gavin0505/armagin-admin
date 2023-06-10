import {getInfo, login, logout} from '@/api/user'
import {getToken, removeToken, setToken} from '@/utils/auth'
import {resetRouter} from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  //state.role的提交
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const {username, password, type} = userInfo
    return new Promise((resolve, reject) => {
      login({username: username.trim(), password: password, type: type}).then(response => {
        const {data} = response
        commit('SET_TOKEN', data)
        setToken(data)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    // let token = getToken()
    return new Promise((resolve, reject) => {
      getInfo({token: state.token}).then(response => {
        const {code, data} = response
        if (code !== '200') {
          return reject('验证失败，请重新登录')
        }
        commit('SET_ROLES', data.role)
        commit('SET_NAME', data.username)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({commit, state}) {
    return new Promise((resolve, reject) => {
      logout({token: state.token}).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        commit('SET_ROLES', [])
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({commit}) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      commit('SET_ROLES', [])
      resolve()
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
