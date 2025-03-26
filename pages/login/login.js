const app = getApp();

Page({
  data: {
    // 登录方式：wechat-微信登录，phone-手机验证码登录，account-账号密码登录
    loginType: 'wechat',
    
    // 手机验证码登录
    phone: '',
    verifyCode: '',
    countdown: 0,
    
    // 账号密码登录
    username: '',
    password: '',
    
    // 是否显示密码
    showPassword: false,
    
    // 是否同意用户协议
    isAgree: false,
    
    // 登录按钮状态
    loginBtnDisabled: false
  },

  onLoad: function(options) {
    // 检查是否已登录
    if (app.globalData.isLogin) {
      this.navigateBack();
    }
  },
  
  // 切换登录方式
  switchLoginType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loginType: type
    });
  },
  
  // 输入手机号
  inputPhone: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  
  // 输入验证码
  inputVerifyCode: function(e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },
  
  // 输入用户名
  inputUsername: function(e) {
    this.setData({
      username: e.detail.value
    });
  },
  
  // 输入密码
  inputPassword: function(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  // 切换显示密码
  toggleShowPassword: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },
  
  // 切换同意协议
  toggleAgree: function() {
    this.setData({
      isAgree: !this.data.isAgree
    });
  },
  
  // 发送验证码
  sendVerifyCode: function() {
    const phone = this.data.phone;
    
    // 验证手机号
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 开始倒计时
    this.startCountdown();
    
    // 发送验证码请求
    app.request({
      url: '/api/user/sendVerifyCode',
      method: 'POST',
      data: {
        phone: phone
      },
      success: (res) => {
        if (res.code === 0) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '发送失败',
            icon: 'none'
          });
          // 发送失败，停止倒计时
          this.setData({
            countdown: 0
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        // 发送失败，停止倒计时
        this.setData({
          countdown: 0
        });
      }
    });
  },
  
  // 开始倒计时
  startCountdown: function() {
    this.setData({
      countdown: 60
    });
    
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer);
        this.setData({
          countdown: 0
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },
  
  // 验证手机号
  validatePhone: function(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  // 微信一键登录
  wechatLogin: function() {
    if (!this.data.isAgree) {
      this.showAgreementToast();
      return;
    }
    
    this.setData({
      loginBtnDisabled: true
    });
    
    wx.showLoading({
      title: '登录中',
    });
    
    // 获取微信用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        
        // 获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            const code = loginRes.code;
            
            // 发送登录请求
            app.request({
              url: '/api/user/wechatLogin',
              method: 'POST',
              data: {
                code: code,
                userInfo: userInfo
              },
              success: (res) => {
                if (res.code === 0) {
                  this.loginSuccess(res.data);
                } else {
                  this.loginFail(res.message);
                }
              },
              fail: () => {
                this.loginFail('网络错误，请重试');
              }
            });
          },
          fail: () => {
            this.loginFail('获取微信登录凭证失败');
          }
        });
      },
      fail: () => {
        this.setData({
          loginBtnDisabled: false
        });
        wx.hideLoading();
      }
    });
  },
  
  // 手机验证码登录
  phoneLogin: function() {
    if (!this.data.isAgree) {
      this.showAgreementToast();
      return;
    }
    
    const phone = this.data.phone;
    const verifyCode = this.data.verifyCode;
    
    // 验证手机号
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 验证验证码
    if (!verifyCode || verifyCode.length !== 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      loginBtnDisabled: true
    });
    
    wx.showLoading({
      title: '登录中',
    });
    
    // 发送登录请求
    app.request({
      url: '/api/user/phoneLogin',
      method: 'POST',
      data: {
        phone: phone,
        verifyCode: verifyCode
      },
      success: (res) => {
        if (res.code === 0) {
          this.loginSuccess(res.data);
        } else {
          this.loginFail(res.message);
        }
      },
      fail: () => {
        this.loginFail('网络错误，请重试');
      }
    });
  },
  
  // 账号密码登录
  accountLogin: function() {
    if (!this.data.isAgree) {
      this.showAgreementToast();
      return;
    }
    
    const username = this.data.username;
    const password = this.data.password;
    
    // 验证用户名
    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    
    // 验证密码
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      loginBtnDisabled: true
    });
    
    wx.showLoading({
      title: '登录中',
    });
    
    // 发送登录请求
    app.request({
      url: '/api/user/accountLogin',
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      success: (res) => {
        if (res.code === 0) {
          this.loginSuccess(res.data);
        } else {
          this.loginFail(res.message);
        }
      },
      fail: () => {
        this.loginFail('网络错误，请重试');
      }
    });
  },
  
  // 登录成功处理
  loginSuccess: function(data) {
    // 保存token
    wx.setStorageSync('token', data.token);
    
    // 更新全局数据
    app.globalData.isLogin = true;
    app.globalData.userInfo = data.userInfo;
    
    wx.hideLoading();
    
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      }
    });
  },
  
  // 登录失败处理
  loginFail: function(message) {
    this.setData({
      loginBtnDisabled: false
    });
    
    wx.hideLoading();
    
    wx.showToast({
      title: message || '登录失败',
      icon: 'none'
    });
  },
  
  // 显示协议提示
  showAgreementToast: function() {
    wx.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none'
    });
  },
  
  // 查看用户协议
  viewUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/agreement/user'
    });
  },
  
  // 查看隐私政策
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/agreement/privacy'
    });
  },
  
  // 返回上一页
  navigateBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/monitor/monitor'
      });
    }
  },
  
  // 跳转到注册页面
  navigateToRegister: function() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },
  
  // 跳转到忘记密码页面
  navigateToForgetPassword: function() {
    wx.navigateTo({
      url: '/pages/forget/forget'
    });
  }
}); 