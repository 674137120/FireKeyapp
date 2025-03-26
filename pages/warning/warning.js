const app = getApp();

Page({
  data: {
    // 标签页
    activeTab: 'all',
    // 筛选条件
    timeFilter: '全部',
    levelFilter: '全部',
    statusFilter: '全部',
    searchKeyword: '',
    // 下拉菜单显示状态
    showTimeFilter: false,
    showLevelFilter: false,
    showStatusFilter: false,
    // 预警数据
    warnings: [],
    filteredWarnings: [],
    // 统计数据
    statistics: {
      all: 0,
      fire: 0,
      landslide: 0,
      animal: 0
    },
    // 分页加载
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    // 模型信息
    modelInfo: {
      name: 'YOLOv8',
      version: '1.2.3',
      confidence: 0.85,
      lastUpdated: '2023-12-15'
    },
    // 模型检测类别
    detectionClasses: [
      { id: 'fire', name: '火情', count: 28, color: '#F44336' },
      { id: 'smoke', name: '烟雾', count: 42, color: '#9E9E9E' },
      { id: 'animal', name: '动物', count: 156, color: '#4CAF50' },
      { id: 'human', name: '人员', count: 89, color: '#2196F3' },
      { id: 'vehicle', name: '车辆', count: 64, color: '#FF9800' }
    ],
    // 是否显示模型信息面板
    showModelInfo: false,
    // 模拟预警数据
    mockWarnings: [
      {
        id: 'w001',
        type: 'fire',
        title: '发现明火隐患',
        location: '青城山前山景区A区',
        coordinates: [103.5671, 30.9287],
        time: '2023-07-15 14:23:45',
        level: 'high',
        status: 'pending',
        description: '无人机巡检发现明火，火势较大，需立即处理',
        images: ['/assets/images/warning/fire1.jpg'],
        droneId: 'DJI-M300-001',
        droneName: '森林卫士-01',
        reporterId: 'system',
        typeText: '火情',
        levelText: '高',
        statusText: '未处理',
        aiConfidence: 0.92,
        area: 120, // 平方米
        weatherInfo: {
          temperature: 32,
          humidity: 15,
          windSpeed: 3.5,
          windDirection: '东北'
        }
      },
      {
        id: 'w002',
        type: 'smoke',
        title: '烟雾预警',
        location: '青城山后山景区C区',
        coordinates: [103.5492, 30.9145],
        time: '2023-07-15 10:12:33',
        level: 'medium',
        status: 'processing',
        description: '无人机发现大量烟雾，疑似火灾初期，已派人前往查看',
        images: ['/assets/images/warning/smoke1.jpg'],
        droneId: 'DJI-M300-002',
        droneName: '森林卫士-02',
        reporterId: 'system',
        typeText: '烟雾',
        levelText: '中',
        statusText: '处理中',
        aiConfidence: 0.87,
        processor: {
          id: 'u001',
          name: '张三',
          phone: '13800138000'
        },
        weatherInfo: {
          temperature: 30,
          humidity: 20,
          windSpeed: 2.1,
          windDirection: '西南'
        }
      },
      {
        id: 'w003',
        type: 'landslide',
        title: '泥石流隐患',
        location: '青城山天师洞附近',
        coordinates: [103.5583, 30.9201],
        time: '2023-07-14 16:45:22',
        level: 'high',
        status: 'completed',
        description: '暴雨后发现山体滑坡迹象，存在泥石流风险，已完成应急处理',
        images: ['/assets/images/warning/landslide1.jpg'],
        droneId: 'DJI-M300-003',
        droneName: '森林卫士-03',
        reporterId: 'u002',
        typeText: '泥石流',
        levelText: '高',
        statusText: '已处理',
        aiConfidence: 0.89,
        processor: {
          id: 'u002',
          name: '李四',
          phone: '13900139000'
        },
        completedTime: '2023-07-14 18:30:15',
        solution: '已设置警戒线并疏散附近人员，地质部门已进行加固处理',
        weatherInfo: {
          temperature: 24,
          humidity: 85,
          windSpeed: 1.2,
          windDirection: '东南',
          rainfall: 78.5 // 毫米/24小时
        }
      },
      {
        id: 'w004',
        type: 'animal',
        title: '野生动物异常活动',
        location: '青城山自然保护区D区',
        coordinates: [103.5721, 30.9356],
        time: '2023-07-14 08:12:56',
        level: 'low',
        status: 'completed',
        description: '发现大量野生动物异常迁徙，可能与近期气候变化有关',
        images: ['/assets/images/warning/animal1.jpg'],
        droneId: 'DJI-M300-004',
        droneName: '森林卫士-04',
        reporterId: 'system',
        typeText: '动物异常',
        levelText: '低',
        statusText: '已处理',
        aiConfidence: 0.83,
        animalType: '野猪',
        count: 15,
        processor: {
          id: 'u003',
          name: '王五',
          phone: '13700137000'
        },
        completedTime: '2023-07-14 15:20:33',
        solution: '已通知野生动物保护站进行跟踪观察，无异常情况',
        weatherInfo: {
          temperature: 26,
          humidity: 60,
          windSpeed: 1.8,
          windDirection: '西北'
        }
      },
      {
        id: 'w005',
        type: 'human',
        title: '可疑人为活动',
        location: '青城山五龙沟景区',
        coordinates: [103.5612, 30.9178],
        time: '2023-07-13 20:45:18',
        level: 'medium',
        status: 'ignored',
        description: '夜间发现可疑人员活动，疑似非法狩猎',
        images: ['/assets/images/warning/human1.jpg'],
        droneId: 'DJI-M300-005',
        droneName: '森林卫士-05',
        reporterId: 'system',
        typeText: '人为活动',
        levelText: '中',
        statusText: '已忽略',
        aiConfidence: 0.76,
        personCount: 2,
        processor: {
          id: 'u004',
          name: '赵六',
          phone: '13600136000'
        },
        completedTime: '2023-07-13 22:10:45',
        solution: '经核实为林业局工作人员夜间巡查，非可疑人员',
        weatherInfo: {
          temperature: 22,
          humidity: 65,
          windSpeed: 0.5,
          windDirection: '东'
        }
      },
      {
        id: 'w006',
        type: 'fire',
        title: '森林火灾',
        location: '北部林区E-02区域',
        coordinates: [130.4521, 48.3698],
        time: '2023-07-12 13:28:36',
        level: 'high',
        status: 'completed',
        description: '发现大面积森林火灾，火势蔓延迅速，需紧急处理',
        images: ['/assets/images/warning/fire2.jpg'],
        droneId: 'DJI-M300-006',
        droneName: '森林卫士-06',
        reporterId: 'system',
        typeText: '火情',
        levelText: '高',
        statusText: '已处理',
        aiConfidence: 0.98,
        area: 2500, // 平方米
        processor: {
          id: 'u005',
          name: '孙七',
          phone: '13500135000'
        },
        completedTime: '2023-07-12 18:45:20',
        solution: '调动消防直升机和地面消防队联合灭火，火情已控制',
        weatherInfo: {
          temperature: 35,
          humidity: 10,
          windSpeed: 4.2,
          windDirection: '西北'
        }
      },
      {
        id: 'w007',
        type: 'smoke',
        title: '烟雾预警-疑似野外烧烤',
        location: '东南林区F-11区域',
        coordinates: [118.7865, 32.0584],
        time: '2023-07-11 16:37:42',
        level: 'low',
        status: 'completed',
        description: '发现小面积烟雾，疑似游客野外烧烤',
        images: ['/assets/images/warning/smoke2.jpg'],
        droneId: 'DJI-M300-007',
        droneName: '森林卫士-07',
        reporterId: 'system',
        typeText: '烟雾',
        levelText: '低',
        statusText: '已处理',
        aiConfidence: 0.81,
        processor: {
          id: 'u006',
          name: '周八',
          phone: '13400134000'
        },
        completedTime: '2023-07-11 17:15:08',
        solution: '巡护人员已到达现场，对游客进行了安全教育并要求熄灭明火',
        weatherInfo: {
          temperature: 28,
          humidity: 45,
          windSpeed: 1.5,
          windDirection: '东'
        }
      },
      {
        id: 'w008',
        type: 'landslide',
        title: '山体滑坡',
        location: '西部山区G-09区域',
        coordinates: [102.7162, 25.0454],
        time: '2023-07-10 09:12:27',
        level: 'high',
        status: 'completed',
        description: '持续降雨导致山体滑坡，道路中断',
        images: ['/assets/images/warning/landslide2.jpg'],
        droneId: 'DJI-M300-008',
        droneName: '森林卫士-08',
        reporterId: 'system',
        typeText: '泥石流',
        levelText: '高',
        statusText: '已处理',
        aiConfidence: 0.94,
        processor: {
          id: 'u007',
          name: '吴九',
          phone: '13300133000'
        },
        completedTime: '2023-07-10 15:40:18',
        solution: '已封锁道路并设置警示标志，地质部门已进行应急处理',
        weatherInfo: {
          temperature: 22,
          humidity: 90,
          windSpeed: 0.8,
          windDirection: '南',
          rainfall: 125.3 // 毫米/24小时
        }
      },
      {
        id: 'w009',
        type: 'animal',
        title: '濒危物种发现',
        location: '中部保护区H-04区域',
        coordinates: [112.5428, 37.8706],
        time: '2023-07-09 11:23:51',
        level: 'medium',
        status: 'completed',
        description: '发现疑似东北虎活动踪迹，需确认并保护',
        images: ['/assets/images/warning/animal2.jpg'],
        droneId: 'DJI-M300-009',
        droneName: '森林卫士-09',
        reporterId: 'system',
        typeText: '动物异常',
        levelText: '中',
        statusText: '已处理',
        aiConfidence: 0.88,
        animalType: '东北虎',
        count: 1,
        processor: {
          id: 'u008',
          name: '郑十',
          phone: '13200132000'
        },
        completedTime: '2023-07-09 14:30:22',
        solution: '已通知野生动物保护部门，设立临时保护区域',
        weatherInfo: {
          temperature: 24,
          humidity: 55,
          windSpeed: 1.2,
          windDirection: '东北'
        }
      },
      {
        id: 'w010',
        type: 'human',
        title: '非法采伐',
        location: '南部林区I-06区域',
        coordinates: [108.9242, 34.2583],
        time: '2023-07-08 07:45:33',
        level: 'high',
        status: 'completed',
        description: '发现疑似非法采伐活动，多人携带工具进行大面积砍伐',
        images: ['/assets/images/warning/human2.jpg'],
        droneId: 'DJI-M300-010',
        droneName: '森林卫士-10',
        reporterId: 'system',
        typeText: '人为活动',
        levelText: '高',
        statusText: '已处理',
        aiConfidence: 0.91,
        personCount: 5,
        processor: {
          id: 'u009',
          name: '林十一',
          phone: '13100131000'
        },
        completedTime: '2023-07-08 09:20:15',
        solution: '已通知森林公安，成功抓获非法采伐人员',
        weatherInfo: {
          temperature: 26,
          humidity: 60,
          windSpeed: 1.5,
          windDirection: '西'
        }
      }
    ]
  },

  onLoad: function() {
    // 获取预警数据
    this.getWarnings();
    
    // 获取统计数据
    this.getStatistics();
    
    // 注册全局事件监听
    app.on('newWarning', this.onNewWarning);
    
    // 加载模拟数据
    this.loadMockData();
  },
  
  onShow: function() {
    // 更新统计数据
    this.getStatistics();
    
    // 标记所有预警为已读
    this.markAllAsRead();
  },
  
  onUnload: function() {
    // 取消全局事件监听
    app.off('newWarning', this.onNewWarning);
  },
  
  onPullDownRefresh: function() {
    // 重置分页
    this.setData({
      page: 1,
      hasMore: true,
      warnings: [],
      filteredWarnings: []
    });
    
    // 重新获取数据
    this.getWarnings().then(() => {
      wx.stopPullDownRefresh();
    });
    
    // 更新统计数据
    this.getStatistics();
  },
  
  // 获取预警数据
  getWarnings: function() {
    if (!this.data.hasMore || this.data.isLoading) {
      return Promise.resolve();
    }
    
    this.setData({
      isLoading: true
    });
    
    return new Promise((resolve) => {
      app.request({
        url: '/api/warnings',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          type: this.data.activeTab !== 'all' ? this.data.activeTab : '',
          time: this.data.timeFilter !== '全部' ? this.data.timeFilter : '',
          level: this.data.levelFilter !== '全部' ? this.data.levelFilter : '',
          status: this.data.statusFilter !== '全部' ? this.data.statusFilter : '',
          keyword: this.data.searchKeyword
        },
        success: (res) => {
          if (res.code === 0) {
            const newWarnings = res.data.list.map(item => {
              // 转换类型文本
              let typeText = '';
              switch (item.type) {
                case 'fire':
                  typeText = '火情';
                  break;
                case 'landslide':
                  typeText = '泥石流';
                  break;
                case 'animal':
                  typeText = '动物异常';
                  break;
                default:
                  typeText = '未知';
              }
              
              // 转换级别文本
              let levelText = '';
              switch (item.level) {
                case 'high':
                  levelText = '高';
                  break;
                case 'medium':
                  levelText = '中';
                  break;
                case 'low':
                  levelText = '低';
                  break;
                default:
                  levelText = '未知';
              }
              
              // 转换状态文本
              let statusText = '';
              switch (item.status) {
                case 'pending':
                  statusText = '未处理';
                  break;
                case 'processing':
                  statusText = '处理中';
                  break;
                case 'processed':
                  statusText = '已处理';
                  break;
                default:
                  statusText = '未知';
              }
              
              return {
                ...item,
                typeText,
                levelText,
                statusText
              };
            });
            
            // 更新数据
            this.setData({
              warnings: [...this.data.warnings, ...newWarnings],
              filteredWarnings: [...this.data.filteredWarnings, ...newWarnings],
              hasMore: newWarnings.length === this.data.pageSize,
              page: this.data.page + 1
            });
          }
        },
        complete: () => {
          this.setData({
            isLoading: false
          });
          resolve();
        }
      });
    });
  },
  
  // 获取统计数据
  getStatistics: function() {
    app.request({
      url: '/api/warnings/statistics',
      success: (res) => {
        if (res.code === 0) {
          this.setData({
            statistics: res.data
          });
        }
      }
    });
  },
  
  // 标记所有预警为已读
  markAllAsRead: function() {
    app.request({
      url: '/api/warnings/read',
      method: 'POST',
      success: (res) => {
        if (res.code === 0) {
          console.log('所有预警已标记为已读');
        }
      }
    });
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      warnings: [],
      filteredWarnings: []
    });
    
    // 重新获取数据
    this.getWarnings();
  },
  
  // 切换时间筛选下拉菜单
  toggleTimeFilter: function() {
    this.setData({
      showTimeFilter: !this.data.showTimeFilter,
      showLevelFilter: false,
      showStatusFilter: false
    });
  },
  
  // 切换级别筛选下拉菜单
  toggleLevelFilter: function() {
    this.setData({
      showLevelFilter: !this.data.showLevelFilter,
      showTimeFilter: false,
      showStatusFilter: false
    });
  },
  
  // 切换状态筛选下拉菜单
  toggleStatusFilter: function() {
    this.setData({
      showStatusFilter: !this.data.showStatusFilter,
      showTimeFilter: false,
      showLevelFilter: false
    });
  },
  
  // 选择时间筛选
  selectTimeFilter: function(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      timeFilter: value,
      showTimeFilter: false,
      page: 1,
      hasMore: true,
      warnings: [],
      filteredWarnings: []
    });
    
    // 重新获取数据
    this.getWarnings();
  },
  
  // 选择级别筛选
  selectLevelFilter: function(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      levelFilter: value,
      showLevelFilter: false,
      page: 1,
      hasMore: true,
      warnings: [],
      filteredWarnings: []
    });
    
    // 重新获取数据
    this.getWarnings();
  },
  
  // 选择状态筛选
  selectStatusFilter: function(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      statusFilter: value,
      showStatusFilter: false,
      page: 1,
      hasMore: true,
      warnings: [],
      filteredWarnings: []
    });
    
    // 重新获取数据
    this.getWarnings();
  },
  
  // 搜索输入
  onSearchInput: function(e) {
    const value = e.detail.value;
    
    // 防抖处理
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    this.searchTimer = setTimeout(() => {
      this.setData({
        searchKeyword: value,
        page: 1,
        hasMore: true,
        warnings: [],
        filteredWarnings: []
      });
      
      // 重新获取数据
      this.getWarnings();
    }, 500);
  },
  
  // 加载更多
  loadMore: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.getWarnings();
    }
  },
  
  // 新预警消息处理
  onNewWarning: function(data) {
    // 更新统计数据
    this.getStatistics();
    
    // 如果当前标签页是全部或与新预警类型相同，则添加到列表
    if (this.data.activeTab === 'all' || this.data.activeTab === data.type) {
      // 转换类型文本
      let typeText = '';
      switch (data.type) {
        case 'fire':
          typeText = '火情';
          break;
        case 'landslide':
          typeText = '泥石流';
          break;
        case 'animal':
          typeText = '动物异常';
          break;
        default:
          typeText = '未知';
      }
      
      // 转换级别文本
      let levelText = '';
      switch (data.level) {
        case 'high':
          levelText = '高';
          break;
        case 'medium':
          levelText = '中';
          break;
        case 'low':
          levelText = '低';
          break;
        default:
          levelText = '未知';
      }
      
      // 转换状态文本
      let statusText = '';
      switch (data.status) {
        case 'pending':
          statusText = '未处理';
          break;
        case 'processing':
          statusText = '处理中';
          break;
        case 'processed':
          statusText = '已处理';
          break;
        default:
          statusText = '未知';
      }
      
      const newWarning = {
        ...data,
        typeText,
        levelText,
        statusText
      };
      
      // 添加到列表顶部
      this.setData({
        warnings: [newWarning, ...this.data.warnings],
        filteredWarnings: [newWarning, ...this.data.filteredWarnings]
      });
    }
  },
  
  // 导航到详情页
  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/warning/detail/detail?id=${id}`
    });
  },
  
  // 在地图上查看预警
  viewWarningOnMap: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/warning/map/map?id=${id}`
    });
  },
  
  // 分享预警
  shareWarning: function(e) {
    const id = e.currentTarget.dataset.id;
    const warning = this.data.warnings.find(item => item.id === id);
    
    if (!warning) return;
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  // 切换预警状态
  toggleWarningStatus: function(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    
    // 确认对话框
    wx.showModal({
      title: '确认操作',
      content: status === 'pending' ? '是否将此预警标记为已处理？' : '是否将此预警重置为未处理？',
      success: (res) => {
        if (res.confirm) {
          // 更新预警状态
          app.request({
            url: '/api/warnings/status',
            method: 'POST',
            data: {
              id: id,
              status: status === 'pending' ? 'processed' : 'pending'
            },
            success: (res) => {
              if (res.code === 0) {
                // 更新本地数据
                const warnings = [...this.data.warnings];
                const index = warnings.findIndex(item => item.id === id);
                
                if (index !== -1) {
                  warnings[index].status = status === 'pending' ? 'processed' : 'pending';
                  warnings[index].statusText = status === 'pending' ? '已处理' : '未处理';
                  
                  this.setData({
                    warnings: warnings,
                    filteredWarnings: warnings
                  });
                  
                  wx.showToast({
                    title: '状态已更新',
                    icon: 'success'
                  });
                }
              }
            }
          });
        }
      }
    });
  },
  
  // 导航到热力图
  navigateToHeatmap: function() {
    wx.navigateTo({
      url: '/pages/warning/heatmap/heatmap'
    });
  },
  
  // 分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      const id = res.target.dataset.id;
      const warning = this.data.warnings.find(item => item.id === id);
      
      if (warning) {
        return {
          title: `【${warning.typeText}】${warning.title}`,
          path: `/pages/warning/detail/detail?id=${warning.id}`,
          imageUrl: warning.image || '/assets/images/share-default.png'
        };
      }
    }
    
    return {
      title: '森林防护无人机管理平台 - 灾害预警',
      path: '/pages/warning/warning'
    };
  },
  
  // 切换显示模型信息面板
  toggleModelInfo: function() {
    this.setData({
      showModelInfo: !this.data.showModelInfo
    });
  },
  
  // 更新模型置信度阈值
  updateConfidence: function(e) {
    const value = e.detail.value;
    
    this.setData({
      'modelInfo.confidence': value / 100
    });
    
    // 保存设置
    wx.setStorageSync('modelConfidence', value / 100);
    
    // 提示用户
    wx.showToast({
      title: `置信度已设置为 ${value}%`,
      icon: 'none'
    });
  },
  
  // 添加加载模拟数据的方法
  loadMockData: function() {
    // 设置加载状态
    this.setData({
      isLoading: true
    });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 更新数据
      this.setData({
        warnings: this.data.mockWarnings,
        filteredWarnings: this.data.mockWarnings,
        isLoading: false
      });
      
      // 更新统计数据
      this.updateStatistics();
    }, 1000);
  },
  
  // 更新统计数据
  updateStatistics: function() {
    const warnings = this.data.warnings;
    
    // 统计各类预警数量
    const statistics = {
      all: warnings.length,
      fire: warnings.filter(item => item.type === 'fire').length,
      smoke: warnings.filter(item => item.type === 'smoke').length,
      landslide: warnings.filter(item => item.type === 'landslide').length,
      animal: warnings.filter(item => item.type === 'animal').length,
      human: warnings.filter(item => item.type === 'human').length
    };
    
    this.setData({
      statistics: statistics
    });
  }
}); 