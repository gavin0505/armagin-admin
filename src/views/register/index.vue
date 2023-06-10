<template>
  <div class="login-container">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="login-form" auto-complete="on"
             label-position="left">

      <div class="title-container">
        <h3 class="title">注册</h3>
      </div>

      <el-form-item prop="email">
        <span class="svg-container">
          <i class="el-icon-message"/>
        </span>
        <el-input
          ref="username"
          v-model="registerForm.email"
          placeholder="邮箱"
          name="email"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
        <el-input
          ref="username"
          v-model="registerForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleRegister"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
        </span>
      </el-form-item>

      <el-form-item prop="verifyCode">
        <span class="svg-container">
          <i class="el-icon-key"/>
        </span>
        <el-input
          v-model="registerForm.verifyCode"
          placeholder="验证码"
          name="verifyCode"
          type="password"
          tabindex="2"
          auto-complete="on"
        />
        <span class="show-pwd">
          <el-button type="primary"
                     @click="getVerifyCode()"
                     v-if="!sendMsgDisabled">获取验证码
          </el-button>
          <el-button @click="getVerifyCode()"
                     disabled
                     v-if="sendMsgDisabled">{{ time + '秒后获取' }}
          </el-button>
        </span>
      </el-form-item>

      <el-button :loading="loading" type="success" style="width:100%;margin-bottom:30px;"
                 @click="handleRegister()">注册
      </el-button>

      <div class="tips"></div>
      <el-button type="primary" style="width:100%;margin-bottom:30px;" @click="toLogin">登录</el-button>

    </el-form>

  </div>
</template>

<script>
import {getRegisterVerifyCode, register} from "@/api/user";

export default {
  name: 'Register',
  data() {
    const validateUsername = (rule, value, callback) => {
      // 4到16位（字母，数字，下划线，减号）
      let regex = /^[a-zA-Z0-9_-]{4,16}$/
      if (regex.test(value)) {
        callback()
      } else {
        callback(new Error('用户名长度4-16位，必须由[字母，数字，下划线，减号]组成'))
      }
    }
    const validatePassword = (rule, value, callback) => {
      let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/
      if (regex.test(value)) {
        callback()
      } else {
        callback(new Error('密码长度8-16位，必须包含大小写字母和数字的组合，可以使用特殊字符'))
      }
    }
    const validateEmail = (rule, value, callback) => {
      let regex = /^[A-Za-z0-9\-_]+[A-Za-z0-9\.\-_]*[A-Za-z0-9\-_]+@[A-Za-z0-9]+[A-Za-z0-9\.\-_]*(\.[A-Za-z0-9\.\-_]+)*[A-Za-z0-9]+\.[A-Za-z0-9]+[A-Za-z0-9\.\-_]*[A-Za-z0-9]+$/

      if (regex.test(value)) {
      } else {
        callback('邮箱格式有误')
      }
    }
    const validateVerifyCode = (rule, value, callback) => {
      let regex = /^\d{6}$/
      if (regex.test(value)) {
        callback()
      } else {
        callback(new Error('验证码应为6位数字'))
      }
    }
    return {
      registerForm: {
        email: '',
        username: '',
        password: '',
        verifyCode: '',
        type: 1
      },
      registerRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}],
        email: [{required: true, trigger: 'blur', validator: validateEmail}],
        verifyCode: [{required: true, trigger: 'blur', validator: validateVerifyCode}],

      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      time: 60, // 发送验证码倒计时
      sendMsgDisabled: false

    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleRegister() {
      register({
        email: this.registerForm.email, username: this.registerForm.username,
        password: this.registerForm.password.trim(), code: this.registerForm.verifyCode
      })
        .then(response => {
          if (response.code !== '200') {
            this.$message.error("验证码发送失败，请联系管理员")
            return;
          }
          this.$message.success("注册成功！")
          this.$router.push('/login')
        }).catch(() => {
      })
    },
    toLogin() {
      this.$router.push('/login')
    },
    getVerifyCode() {
      getRegisterVerifyCode({type: this.registerForm.type, account: this.registerForm.email})
        .then(response => {
          if (response.code !== '200') {
            this.$message.error("验证码发送失败，请联系管理员")
            return;
          }
          this.$message.success("验证码发送成功，请查收邮件！")
          this.countdown()
        }).catch(() => {
      })
    },

    countdown() {
      const that = this
      that.sendMsgDisabled = true
      const interval = window.setInterval(function () {
        if ((that.time--) <= 0) {
          that.time = 60
          that.sendMsgDisabled = false
          window.clearInterval(interval)
        }
      }, 1000)
    }

  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
