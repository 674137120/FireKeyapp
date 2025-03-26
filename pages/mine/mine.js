const app = getApp();

Page({
  data: {
    userInfo: {},
    isLogin: false,
    unreadCount: 0,
    version: '1.0.0'
  },

  onLoad: function() {
    // 获取版本信息
    const accountInfo = wx.getAccountInfoSync();
    this.setData({
      version: accountInfo.miniProgram.version || '1.0.0'
    });
  },
  
  onShow: function() {
    // 获取用户信息
    this.getUserInfo();
    
    // 获取未读消息数量
    this.getUnreadCount();
  },
  
  // 获取用户信息
  getUserInfo: function() {
    const userInfo = app.globalData.userInfo;
    const isLogin = app.globalData.isLogin;
    
    this.setData({
      userInfo: userInfo || {},
      isLogin: isLogin
    });
  },
  
  // 获取未读消息数量
  getUnreadCount: function() {
    if (!this.data.isLogin) {
      this.setData({
        unreadCount: 0
      });
      return;
    }
    
    app.request({
      url: '/api/notifications/unread',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            unreadCount: res.data.count
          });
        }
      }
    });
  },
  
  // 选择头像
  chooseAvatar: function() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 上传头像
        wx.uploadFile({
          url: app.globalData.apiBaseUrl + '/api/user/avatar',
          filePath: tempFilePath,
          name: 'avatar',
          header: {
            'Authorization': 'Bearer ' + wx.getStorageSync('token')
          },
          success: (res) => {
            const data = JSON.parse(res.data);
            if (data.code === 0) {
              // 更新全局用户信息
              app.globalData.userInfo.avatar = data.data.avatar;
              
              // 更新页面数据
              this.setData({
                'userInfo.avatar': data.data.avatar
              });
              
              wx.showToast({
                title: '头像更新成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              });
            }
          },
          fail: () => {
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },
  
  // 登录
  login: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('token');
          app.globalData.isLogin = false;
          app.globalData.userInfo = null;
          
          // 更新页面数据
          this.setData({
            userInfo: {},
            isLogin: false,
            unreadCount: 0
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 页面导航
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    
    // 检查是否需要登录
    const needLoginPages = [
      '/pages/mine/profile/profile',
      '/pages/mine/notification/notification',
      '/pages/mine/task/task',
      '/pages/mine/report/report',
      '/pages/mine/area/area'
    ];
    
    if (needLoginPages.includes(url) && !this.data.isLogin) {
      wx.showModal({
        title: '提示',
        content: '该功能需要登录后使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    wx.navigateTo({
      url: url
    });
  }
}); 