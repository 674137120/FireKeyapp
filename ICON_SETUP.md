# 图标设置指南

## 步骤1：准备图标文件

请准备以下图标文件，并放置在 `assets/icons` 目录中：

1. monitor.png - 实时监控图标（未选中状态）
2. monitor-active.png - 实时监控图标（选中状态）
3. warning.png - 灾害预警图标（未选中状态）
4. warning-active.png - 灾害预警图标（选中状态）
5. patrol.png - 巡护地图图标（未选中状态）
6. patrol-active.png - 巡护地图图标（选中状态）
7. mine.png - 我的图标（未选中状态）
8. mine-active.png - 我的图标（选中状态）
9. default-avatar.png - 默认头像图标

图标要求：
- 建议尺寸：81px × 81px
- 格式：PNG（透明背景）
- 风格：扁平化设计，与应用主题色调一致

## 步骤2：恢复app.json配置

添加完图标后，请修改 `app.json` 文件，恢复图标路径配置。将以下代码：

```json
"tabBar": {
  "color": "#7A7E83",
  "selectedColor": "#2E5E4E",
  "backgroundColor": "#ffffff",
  "list": [
    {
      "pagePath": "pages/monitor/monitor",
      "text": "实时监控"
    },
    {
      "pagePath": "pages/warning/warning",
      "text": "灾害预警"
    },
    {
      "pagePath": "pages/patrol/patrol",
      "text": "巡护地图"
    },
    {
      "pagePath": "pages/mine/mine",
      "text": "我的"
    }
  ]
}
```

修改为：

```json
"tabBar": {
  "color": "#7A7E83",
  "selectedColor": "#2E5E4E",
  "backgroundColor": "#ffffff",
  "list": [
    {
      "pagePath": "pages/monitor/monitor",
      "text": "实时监控",
      "iconPath": "assets/icons/monitor.png",
      "selectedIconPath": "assets/icons/monitor-active.png"
    },
    {
      "pagePath": "pages/warning/warning",
      "text": "灾害预警",
      "iconPath": "assets/icons/warning.png",
      "selectedIconPath": "assets/icons/warning-active.png"
    },
    {
      "pagePath": "pages/patrol/patrol",
      "text": "巡护地图",
      "iconPath": "assets/icons/patrol.png",
      "selectedIconPath": "assets/icons/patrol-active.png"
    },
    {
      "pagePath": "pages/mine/mine",
      "text": "我的",
      "iconPath": "assets/icons/mine.png",
      "selectedIconPath": "assets/icons/mine-active.png"
    }
  ]
}
```

## 步骤3：添加音频文件

请准备以下音频文件，并放置在 `assets/audio` 目录中：

1. warning.mp3 - 预警提示音

音频要求：
- 格式：MP3
- 时长：建议不超过5秒
- 音质：清晰，适合作为提示音 