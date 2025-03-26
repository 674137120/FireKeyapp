// app.js
App({
  onLaunch() {
    // 初始化云环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'forest-drone-platform-xxxxx', // 替换为实际的云环境ID
        traceUser: true
      });
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查更新
    this.checkUpdate();
    
    // 初始化用户信息
    this.initUserInfo();
    
    // 初始化事件监听器
    this._eventListeners = {};
  },
  
  onShow() {
    // 连接WebSocket服务
    this.connectWebSocket();
  },
  
  onHide() {
    // 断开WebSocket连接
    if (this.globalData.socketTask) {
      this.globalData.socketTask.close();
    }
  },
  
  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  },
  
  // 初始化用户信息
  initUserInfo() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 验证token有效性
      this.request({
        url: '/api/user/verify',
        method: 'POST',
        data: { token },
        success: (res) => {
          if (res.code === 0) {
            this.globalData.userInfo = res.data;
            this.globalData.isLogin = true;
          } else {
            wx.removeStorageSync('token');
          }
        }
      });
    }
  },
  
  // 连接WebSocket服务
  connectWebSocket() {
    const token = wx.getStorageSync('token');
    if (!token) return;
    
    const socketTask = wx.connectSocket({
      url: `${this.globalData.wsUrl}?token=${token}`,
      success: () => {
        console.log('WebSocket连接成功');
      }
    });
    
    socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      this.globalData.socketTask = socketTask;
      
      // 心跳检测
      this.globalData.heartbeatInterval = setInterval(() => {
        socketTask.send({
          data: JSON.stringify({ type: 'heartbeat' }),
        });
      }, 30000);
    });
    
    socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        
        // 处理不同类型的消息
        switch (data.type) {
          case 'droneStatus':
            this.trigger('droneStatusUpdate', data.data);
            break;
          case 'warning':
            this.trigger('newWarning', data.data);
            break;
          default:
            console.log('收到未知类型的消息', data);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败', error);
      }
    });
    
    socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
      clearInterval(this.globalData.heartbeatInterval);
      this.globalData.socketTask = null;
    });
    
    socketTask.onError((error) => {
      console.error('WebSocket连接错误', error);
    });
  },
  
  // 发送请求
  request(options) {
    const { url, method = 'GET', data, header = {}, success, fail, complete } = options;
    
    // 添加token到请求头
    const token = wx.getStorageSync('token');
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    
    wx.request({
      url: this.globalData.apiBaseUrl + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // token失效，清除本地存储并跳转到登录页
          wx.removeStorageSync('token');
          this.globalData.isLogin = false;
          this.globalData.userInfo = null;
          
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
          return;
        }
        
        if (success) {
          success(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        
        if (fail) {
          fail(err);
        }
      },
      complete
    });
  },
  
  // 事件监听相关方法
  on(event, callback) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(callback);
  },
  
  off(event, callback) {
    if (!this._eventListeners[event]) return;
    
    if (callback) {
      this._eventListeners[event] = this._eventListeners[event].filter(cb => cb !== callback);
    } else {
      this._eventListeners[event] = [];
    }
  },
  
  trigger(event, data) {
    if (!this._eventListeners[event]) return;
    
    this._eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`执行事件 ${event} 的回调函数时出错`, error);
      }
    });
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    isLogin: false,
    systemInfo: {},
    apiBaseUrl: 'https://api.forest-drone.com',
    wsUrl: 'wss://api.forest-drone.com/ws',
    socketTask: null,
    heartbeatInterval: null,
    mapKey: 'YOUR_MAP_KEY',
    modelConfig: {
      detectionClasses: ['fire', 'smoke', 'animal', 'human', 'vehicle'],
      yoloConfidenceThreshold: 0.5
    }
  }
});
