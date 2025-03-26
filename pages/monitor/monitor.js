const app = getApp();

Page({
  data: {
    // 无人机状态
    droneStatus: {
      online: false,
      battery: 0
    },
    // 天气信息
    weather: {
      temperature: '--',
      windSpeed: '--'
    },
    // 地图相关
    mapCenter: {
      latitude: 30.5702,
      longitude: 104.0665
    },
    mapScale: 14,
    markers: [],
    polylines: [],
    // 视频相关
    currentVideoUrl: '',
    currentDrone: {},
    droneList: [],
    isFullscreen: false,
    isRecording: false,
    isMuted: false,
    objectFit: 'contain',
    isAiEnabled: false,
    detections: [],
    currentTime: '',
    // 预警相关
    unreadWarnings: 0
  },

  onLoad: function() {
    // 获取无人机列表
    this.getDroneList();
    
    // 获取天气信息
    this.getWeatherInfo();
    
    // 设置时间更新定时器
    this.setTimeUpdateInterval();
    
    // 创建地图上下文
    this.mapContext = wx.createMapContext('droneMap');
  },
  
  onShow: function() {
    // 更新未读预警数量
    this.updateUnreadWarnings();
  },
  
  onUnload: function() {
    // 清除定时器
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  
  // 获取无人机列表
  getDroneList: function() {
    wx.showLoading({
      title: '加载中',
    });
    
    // 使用模拟数据
    const mockDroneList = [
      {
        id: '1',
        name: '无人机-001',
        online: true,
        battery: 85,
        thumbnail: '/assets/icons/drone.png',
        latitude: 30.5702,
        longitude: 104.0665,
        altitude: 100,
        speed: 15,
        rtmpUrl: ''
      },
      {
        id: '2',
        name: '无人机-002',
        online: false,
        battery: 0,
        thumbnail: '/assets/icons/drone.png',
        latitude: 30.5802,
        longitude: 104.0765,
        altitude: 0,
        speed: 0,
        rtmpUrl: ''
      }
    ];
    
    this.setData({
      droneList: mockDroneList
    });
    
    // 默认选择第一个在线的无人机
    const onlineDrone = mockDroneList.find(drone => drone.online) || mockDroneList[0];
    this.switchDrone({
      currentTarget: {
        dataset: {
          id: onlineDrone.id
        }
      }
    });
    
    // 更新地图标记
    this.updateMapMarkers(mockDroneList);
    
    wx.hideLoading();
  },
  
  // 获取天气信息
  getWeatherInfo: function() {
    // 使用模拟数据
    this.setData({
      weather: {
        temperature: '25',
        windSpeed: '3.5'
      }
    });
  },
  
  // 设置时间更新定时器
  setTimeUpdateInterval: function() {
    // 更新当前时间
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', {
        hour12: false
      });
      
      this.setData({
        currentTime: timeString
      });
    };
    
    updateTime();
    this.timeInterval = setInterval(updateTime, 1000);
  },
  
  // 更新未读预警数量
  updateUnreadWarnings: function() {
    // 使用模拟数据
    this.setData({
      unreadWarnings: Math.floor(Math.random() * 5)
    });
  },
  
  // 更新地图标记
  updateMapMarkers: function(droneList) {
    const markers = droneList.map(drone => ({
      id: drone.id,
      latitude: drone.latitude,
      longitude: drone.longitude,
      iconPath: drone.online ? '/assets/icons/drone-active.png' : '/assets/icons/drone-inactive.png',
      width: 32,
      height: 32,
      callout: {
        content: `${drone.name}\n电量: ${drone.battery}%`,
        color: '#ffffff',
        fontSize: 10,
        borderRadius: 4,
        bgColor: drone.online ? '#2E5E4E' : '#999999',
        padding: 4,
        display: 'BYCLICK'
      }
    }));
    
    this.setData({
      markers: markers
    });
  },
  
  // 更新无人机轨迹
  updateDroneTrack: function(droneData) {
    // 使用模拟轨迹数据
    const trackPoints = [
      {
        latitude: droneData.latitude - 0.001,
        longitude: droneData.longitude - 0.001
      },
      {
        latitude: droneData.latitude,
        longitude: droneData.longitude
      }
    ];
    
    this.setData({
      polylines: [{
        points: trackPoints,
        color: '#2E5E4E',
        width: 4,
        dottedLine: false,
        arrowLine: true
      }]
    });
  },
  
  // 切换无人机
  switchDrone: function(e) {
    const droneId = e.currentTarget.dataset.id;
    const drone = this.data.droneList.find(item => item.id === droneId);
    
    if (!drone) return;
    
    // 更新当前无人机
    this.setData({
      currentDrone: drone,
      currentVideoUrl: drone.online ? drone.rtmpUrl : '',
      droneStatus: {
        online: drone.online,
        battery: drone.battery
      }
    });
    
    // 更新地图中心
    this.setData({
      mapCenter: {
        latitude: drone.latitude,
        longitude: drone.longitude
      }
    });
    
    // 更新轨迹
    this.updateDroneTrack(drone);
    
    // 创建视频上下文
    this.videoContext = wx.createLivePlayerContext('videoPlayer');
  },
  
  // 地图缩放控制
  zoomIn: function() {
    if (this.data.mapScale < 20) {
      this.setData({
        mapScale: this.data.mapScale + 1
      });
    }
  },
  
  zoomOut: function() {
    if (this.data.mapScale > 5) {
      this.setData({
        mapScale: this.data.mapScale - 1
      });
    }
  },
  
  // 重置地图视图
  resetMapView: function() {
    if (this.data.currentDrone.id) {
      this.setData({
        mapCenter: {
          latitude: this.data.currentDrone.latitude,
          longitude: this.data.currentDrone.longitude
        },
        mapScale: 14
      });
    }
  },
  
  // 切换全屏模式
  toggleFullscreen: function() {
    this.setData({
      isFullscreen: !this.data.isFullscreen
    });
  },
  
  // 切换录制状态
  toggleRecording: function() {
    this.setData({
      isRecording: !this.data.isRecording
    });
    
    wx.showToast({
      title: this.data.isRecording ? '开始录制' : '录制完成',
      icon: 'success'
    });
  },
  
  // 切换AI检测
  toggleAiDetection: function() {
    this.setData({
      isAiEnabled: !this.data.isAiEnabled
    });
    
    wx.showToast({
      title: this.data.isAiEnabled ? 'AI检测已开启' : 'AI检测已关闭',
      icon: 'success'
    });
  },
  
  // 显示无人机详情
  showDroneDetails: function() {
    wx.showModal({
      title: '无人机详情',
      content: `ID: ${this.data.currentDrone.id}\n名称: ${this.data.currentDrone.name}\n电量: ${this.data.currentDrone.battery}%\n状态: ${this.data.currentDrone.online ? '在线' : '离线'}`,
      showCancel: false
    });
  },
  
  // 截图功能
  takeScreenshot: function() {
    wx.showToast({
      title: '截图已保存',
      icon: 'success'
    });
  },
  
  // 显示预警列表
  showWarnings: function() {
    wx.navigateTo({
      url: '/pages/warning/warning'
    });
    
    // 重置未读预警数量
    this.setData({
      unreadWarnings: 0
    });
  },
  
  // 显示设置
  showSettings: function() {
    wx.showActionSheet({
      itemList: ['画面设置', '音频设置', 'AI设置'],
      success: (res) => {
        console.log('选择了设置项：', res.tapIndex);
      }
    });
  }
}); 