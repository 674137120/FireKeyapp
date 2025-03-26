const app = getApp();
const utils = require('../../utils/map/mapUtils.js');

Page({
  data: {
    // 地图相关
    mapCenter: {
      latitude: 30.5702,
      longitude: 104.0665
    },
    mapScale: 14,
    markers: [],
    polylines: [],
    polygons: [],
    // 无人机相关
    droneList: [],
    currentDrone: {},
    // 轨迹回放相关
    trackPoints: [],
    currentPointIndex: 0,
    isPlaying: false,
    playbackSpeed: 1,
    startTimeText: '--:--',
    endTimeText: '--:--',
    currentTimeText: '--:--',
    trackDistance: '0.00',
    trackDuration: '00:00:00',
    trackSpeed: '0.00',
    trackMaxAltitude: '0',
    // 日期选择相关
    showDatePicker: false,
    selectedDate: '',
    dateRange: {
      start: '2023-01-01',
      end: '2023-12-31'
    },
    trackList: [],
    selectedTrackId: '',
    // 绘制相关
    isDrawingMode: false,
    drawingType: 'polygon',
    drawingPoints: [],
    tempPolygon: null,
    // 区域标注相关
    showAreaModal: false,
    areaForm: {
      name: '',
      type: 'fire',
      level: 'high',
      remark: '',
      points: []
    }
  },

  onLoad: function() {
    // 创建地图上下文
    this.mapContext = wx.createMapContext('patrolMap');
    
    // 获取无人机列表
    this.getDroneList();
    
    // 获取日期范围
    this.getDateRange();
    
    // 获取高危区域
    this.getDangerAreas();
  },
  
  onShow: function() {
    // 如果正在播放，恢复播放
    if (this.data.isPlaying) {
      this.startPlayback();
    }
  },
  
  onHide: function() {
    // 暂停播放
    if (this.data.isPlaying) {
      this.pausePlayback();
    }
  },
  
  onUnload: function() {
    // 清除定时器
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
    }
  },
  
  // 获取无人机列表
  getDroneList: function() {
    wx.showLoading({
      title: '加载中',
    });
    
    // 模拟数据
    const mockDroneList = [
      {
        id: '1',
        name: '无人机-01',
        latitude: 30.5702,
        longitude: 104.0665,
        status: 'online',
        battery: 85
      },
      {
        id: '2',
        name: '无人机-02',
        latitude: 30.5802,
        longitude: 104.0765,
        status: 'offline',
        battery: 0
      }
    ];
    
    this.setData({
      droneList: mockDroneList
    });
    
    // 默认选择第一个无人机
    this.switchDrone({
      currentTarget: {
        dataset: {
          id: mockDroneList[0].id
        }
      }
    });
    
    wx.hideLoading();
  },
  
  // 获取日期范围
  getDateRange: function() {
    // 模拟数据
    this.setData({
      dateRange: {
        start: '2023-01-01',
        end: '2023-12-31'
      }
    });
  },
  
  // 获取高危区域
  getDangerAreas: function() {
    // 模拟数据
    const mockAreas = [
      {
        id: '1',
        type: 'fire',
        level: 'high',
        points: [
          { latitude: 30.5702, longitude: 104.0665 },
          { latitude: 30.5802, longitude: 104.0665 },
          { latitude: 30.5802, longitude: 104.0765 },
          { latitude: 30.5702, longitude: 104.0765 }
        ]
      }
    ];
    
    const polygons = mockAreas.map(area => ({
      id: area.id,
      points: area.points,
      fillColor: 'rgba(244, 67, 54, 0.4)',
      strokeColor: '#F44336',
      strokeWidth: 2,
      zIndex: 1
    }));
    
    this.setData({
      polygons: polygons
    });
  },
  
  // 切换无人机
  switchDrone: function(e) {
    const droneId = e.currentTarget.dataset.id;
    const drone = this.data.droneList.find(item => item.id === droneId);
    
    if (!drone) return;
    
    // 更新当前无人机
    this.setData({
      currentDrone: drone
    });
    
    // 更新地图中心
    this.setData({
      mapCenter: {
        latitude: drone.latitude,
        longitude: drone.longitude
      }
    });
    
    // 获取最近一次轨迹
    this.getLatestTrack(droneId);
  },
  
  // 获取最近一次轨迹
  getLatestTrack: function(droneId) {
    wx.showLoading({
      title: '加载轨迹',
    });
    
    // 模拟数据
    const mockTrack = {
      id: '1',
      startTime: '2023-01-01 10:00:00',
      endTime: '2023-01-01 11:00:00',
      points: [
        { latitude: 30.5702, longitude: 104.0665, time: '2023-01-01 10:00:00' },
        { latitude: 30.5802, longitude: 104.0665, time: '2023-01-01 10:30:00' },
        { latitude: 30.5802, longitude: 104.0765, time: '2023-01-01 11:00:00' }
      ]
    };
    
    // 更新轨迹点
    this.setData({
      trackPoints: mockTrack.points,
      startTimeText: mockTrack.startTime.split(' ')[1],
      endTimeText: mockTrack.endTime.split(' ')[1],
      currentTimeText: mockTrack.startTime.split(' ')[1],
      trackList: [mockTrack],
      selectedTrackId: mockTrack.id
    });
    
    // 绘制轨迹线
    this.drawTrackLine(mockTrack.points);
    
    wx.hideLoading();
  },
  
  // 绘制轨迹线
  drawTrackLine: function(points) {
    const polylines = [{
      points: points,
      color: '#1AAD19',
      width: 4,
      arrowLine: true
    }];
    
    this.setData({
      polylines: polylines
    });
  },
  
  // 开始播放
  startPlayback: function() {
    if (this.data.trackPoints.length === 0) return;
    
    this.setData({
      isPlaying: true
    });
    
    this.playbackTimer = setInterval(() => {
      let nextIndex = this.data.currentPointIndex + 1;
      if (nextIndex >= this.data.trackPoints.length) {
        nextIndex = 0;
      }
      
      const point = this.data.trackPoints[nextIndex];
      this.setData({
        currentPointIndex: nextIndex,
        currentTimeText: point.time.split(' ')[1],
        mapCenter: {
          latitude: point.latitude,
          longitude: point.longitude
        }
      });
    }, 1000 / this.data.playbackSpeed);
  },
  
  // 暂停播放
  pausePlayback: function() {
    this.setData({
      isPlaying: false
    });
    
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
    }
  },
  
  // 调整播放速度
  adjustSpeed: function(e) {
    const speed = e.currentTarget.dataset.speed;
    this.setData({
      playbackSpeed: speed
    });
    
    if (this.data.isPlaying) {
      this.pausePlayback();
      this.startPlayback();
    }
  },
  
  // 显示日期选择器
  showDatePicker: function() {
    this.setData({
      showDatePicker: true
    });
  },
  
  // 隐藏日期选择器
  hideDatePicker: function() {
    this.setData({
      showDatePicker: false
    });
  },
  
  // 选择日期
  selectDate: function(e) {
    const date = e.detail.value;
    this.setData({
      selectedDate: date,
      showDatePicker: false
    });
    
    // 获取选中日期的轨迹
    this.getTracksByDate(date);
  },
  
  // 获取指定日期的轨迹
  getTracksByDate: function(date) {
    // 模拟数据
    const mockTracks = [
      {
        id: '1',
        startTime: `${date} 10:00:00`,
        endTime: `${date} 11:00:00`,
        distance: '5.2',
        duration: '01:00:00',
        speed: '5.2',
        maxAltitude: '120'
      }
    ];
    
    this.setData({
      trackList: mockTracks,
      selectedTrackId: mockTracks[0].id
    });
    
    // 获取轨迹详情
    this.getTrackDetail(mockTracks[0].id);
  },
  
  // 获取轨迹详情
  getTrackDetail: function(trackId) {
    wx.showLoading({
      title: '加载轨迹',
    });
    
    // 模拟数据
    const mockTrack = {
      id: trackId,
      startTime: '2023-01-01 10:00:00',
      endTime: '2023-01-01 11:00:00',
      points: [
        { latitude: 30.5702, longitude: 104.0665, time: '2023-01-01 10:00:00' },
        { latitude: 30.5802, longitude: 104.0665, time: '2023-01-01 10:30:00' },
        { latitude: 30.5802, longitude: 104.0765, time: '2023-01-01 11:00:00' }
      ]
    };
    
    // 更新轨迹点
    this.setData({
      trackPoints: mockTrack.points,
      startTimeText: mockTrack.startTime.split(' ')[1],
      endTimeText: mockTrack.endTime.split(' ')[1],
      currentTimeText: mockTrack.startTime.split(' ')[1],
      currentPointIndex: 0
    });
    
    // 绘制轨迹线
    this.drawTrackLine(mockTrack.points);
    
    wx.hideLoading();
  },
  
  // 切换轨迹
  switchTrack: function(e) {
    const trackId = e.currentTarget.dataset.id;
    this.getTrackDetail(trackId);
  },
  
  // 进入绘制模式
  enterDrawingMode: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      isDrawingMode: true,
      drawingType: type,
      drawingPoints: []
    });
  },
  
  // 退出绘制模式
  exitDrawingMode: function() {
    this.setData({
      isDrawingMode: false,
      drawingPoints: []
    });
  },
  
  // 地图点击事件
  onMapTap: function(e) {
    if (!this.data.isDrawingMode) return;
    
    const point = e.detail;
    const drawingPoints = [...this.data.drawingPoints, point];
    
    this.setData({
      drawingPoints: drawingPoints
    });
    
    // 如果是多边形，实时更新临时多边形
    if (this.data.drawingType === 'polygon') {
      this.updateTempPolygon(drawingPoints);
    }
  },
  
  // 更新临时多边形
  updateTempPolygon: function(points) {
    if (points.length < 3) return;
    
    const tempPolygon = {
      points: points,
      fillColor: 'rgba(244, 67, 54, 0.2)',
      strokeColor: '#F44336',
      strokeWidth: 2,
      zIndex: 2
    };
    
    this.setData({
      tempPolygon: tempPolygon
    });
  },
  
  // 完成绘制
  finishDrawing: function() {
    if (this.data.drawingPoints.length < 3) {
      wx.showToast({
        title: '至少需要3个点',
        icon: 'none'
      });
      return;
    }
    
    // 显示区域标注弹窗
    this.setData({
      showAreaModal: true,
      areaForm: {
        name: '',
        type: 'fire',
        level: 'high',
        remark: '',
        points: this.data.drawingPoints
      }
    });
  },
  
  // 取消绘制
  cancelDrawing: function() {
    this.setData({
      isDrawingMode: false,
      drawingPoints: [],
      tempPolygon: null
    });
  },
  
  // 显示区域标注弹窗
  showAreaModal: function() {
    this.setData({
      showAreaModal: true
    });
  },
  
  // 隐藏区域标注弹窗
  hideAreaModal: function() {
    this.setData({
      showAreaModal: false
    });
  },
  
  // 更新区域表单
  updateAreaForm: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`areaForm.${field}`]: value
    });
  },
  
  // 保存区域
  saveArea: function() {
    const { areaForm } = this.data;
    
    if (!areaForm.name) {
      wx.showToast({
        title: '请输入区域名称',
        icon: 'none'
      });
      return;
    }
    
    // 模拟保存
    const newArea = {
      id: Date.now().toString(),
      ...areaForm
    };
    
    // 更新多边形列表
    const polygons = [...this.data.polygons, {
      id: newArea.id,
      points: newArea.points,
      fillColor: 'rgba(244, 67, 54, 0.4)',
      strokeColor: '#F44336',
      strokeWidth: 2,
      zIndex: 1
    }];
    
    this.setData({
      polygons,
      showAreaModal: false,
      isDrawingMode: false,
      drawingPoints: [],
      tempPolygon: null
    });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
}); 