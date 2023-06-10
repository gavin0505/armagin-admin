import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login/doLogin',
    method: 'post',
    data
  })
}

export function getInfo(data) {
  return request({
    url: '/user/token/getUserInfoByToken',
    method: 'post',
    data
  })
}

export function logout(data) {
  return request({
    url: '/user/login/doLogout',
    method: 'post',
    data
  })
}

// 注册
export function register(data) {
  return request({
    url: '/user/register/doRegister',
    method: 'post',
    data
  })
}

export function getRegisterVerifyCode(data) {
  return request({
    url: '/user/register/getVerifyCode',
    method: 'post',
    data
  })
}

// 验证token
export function isLogin(token) {
  return request({
    url: '/user/login/ifLogin/' + token,
    method: 'get',
  })
}
