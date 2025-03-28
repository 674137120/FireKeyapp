# “火眼金睛” -- 森林防护无人机管理平台

基于微信小程序开发的森林防护无人机管理平台，实现无人机实时监控、灾害预警和巡护轨迹管理等功能。

<div align="center">
  <img src="image\README\QQ_1743122833216.png" alt="系统架构" width="125" height="300">
  <img src="image\README\QQ_1743122809264.png" alt="系统架构" width="125" height="300">
  <img src="image\README\QQ_1743122809264.png" alt="系统架构" width="125" height="300">
  <img src="image\README\QQ_1743122809264.png" alt="系统架构" width="125" height="300">
  <br>
  <em>图1. 系统界面图</em>
</div>

## 功能特点

### 实时监控页

- 集成腾讯地图API，显示无人机实时位置及巡逻轨迹
- 使用 `<live-player>`组件播放无人机RTMP视频流（支持多画面切换）
- 叠加YOLOv12检测结果（火灾/动物框+置信度）

### 灾害预警页

- 分类展示火情/泥石流/动物异常预警
- 点击预警条目跳转3D GIS热力图（使用Three.js或WebGL）
- 支持筛选、搜索和状态管理

### 巡护地图页

- 历史轨迹回放（支持时间轴拖动）
- 管理员可标注高危区域（持久化存储至腾讯云数据库）
- 支持多种绘制工具和区域风险等级标注

### 个人中心

- 用户信息管理
- 任务和报告查看
- 系统设置和帮助

## 技术架构

### 前端

- 微信小程序原生开发
- 腾讯地图API用于地理位置显示
- TensorFlow.js WASM用于轻量化AI推理
- Three.js用于3D热力图展示

### 后端

- Node.js + Express提供RESTful API
- WebSocket实现实时数据推送
- 腾讯云数据库存储用户和轨迹数据
- 腾讯云对象存储保存视频和图像

### 安全

- SRT加密保护视频流传输安全
- JWT用于用户身份验证
- 数据传输采用HTTPS加密

## 项目结构

```
├── app.js                 # 应用入口文件
├── app.json               # 应用配置文件
├── app.wxss               # 应用全局样式
├── assets/                # 静态资源
│   ├── icons/             # 图标资源
│   └── audio/             # 音频资源
├── pages/                 # 页面文件
│   ├── monitor/           # 实时监控页
│   ├── warning/           # 灾害预警页
│   ├── patrol/            # 巡护地图页
│   └── mine/              # 个人中心页
└── utils/                 # 工具函数
    ├── api/               # API接口封装
    ├── map/               # 地图工具函数
    └── ai/                # AI模型处理
```

## 部署说明

### 开发环境配置

1. 安装微信开发者工具
2. 申请腾讯地图API密钥
3. 配置腾讯云服务（数据库、对象存储）

### 后端服务部署

1. 部署Node.js服务到云服务器
2. 配置WebSocket服务
3. 设置HTTPS证书

### 小程序发布

1. 在微信公众平台注册小程序
2. 上传代码并提交审核
3. 发布小程序

## 配置说明

主要配置项在 `app.js`的 `globalData`中：

```javascript
globalData: {
  apiBaseUrl: 'https://api.forest-drone.example.com', // API地址
  wsUrl: 'wss://ws.forest-drone.example.com',         // WebSocket地址
  mapKey: 'XXXXXX-XXXXXX-XXXXXX-XXXXXX',             // 腾讯地图API密钥
  modelConfig: {
    yoloConfidenceThreshold: 0.6,                     // AI检测置信度阈值
    detectionClasses: ['fire', 'smoke', 'animal', 'human', 'vehicle'] // 检测类别
  }
}
```

## 开发团队

- 产品设计：xsc
- 前端开发：xsc
- 后端开发：xsc
- AI算法：xsc

## 版权信息

© 2025 “火眼金睛”森林防护无人机管理平台团队，保留所有权利。
