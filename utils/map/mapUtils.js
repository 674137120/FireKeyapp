/**
 * 计算两点之间的距离（单位：公里）
 * @param {number} lat1 - 第一个点的纬度
 * @param {number} lng1 - 第一个点的经度
 * @param {number} lat2 - 第二个点的纬度
 * @param {number} lng2 - 第二个点的经度
 * @returns {number} - 两点之间的距离（公里）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径（公里）
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * 将角度转换为弧度
 * @param {number} deg - 角度
 * @returns {number} - 弧度
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 计算轨迹的边界
 * @param {Array} points - 轨迹点数组
 * @returns {Object} - 边界对象，包含最小和最大的经纬度
 */
function calculateBounds(points) {
  if (!points || points.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0
    };
  }
  
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  }
  
  return {
    minLat,
    maxLat,
    minLng,
    maxLng
  };
}

/**
 * 生成圆形的点
 * @param {number} centerLat - 圆心纬度
 * @param {number} centerLng - 圆心经度
 * @param {number} radius - 半径（公里）
 * @param {number} numPoints - 点的数量
 * @returns {Array} - 圆形的点数组
 */
function generateCirclePoints(centerLat, centerLng, radius, numPoints) {
  const points = [];
  const angularDistance = radius / 6371; // 地球半径为6371公里
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const lat = Math.asin(
      Math.sin(deg2rad(centerLat)) * Math.cos(angularDistance) +
      Math.cos(deg2rad(centerLat)) * Math.sin(angularDistance) * Math.cos(angle)
    );
    const lng = deg2rad(centerLng) + Math.atan2(
      Math.sin(angle) * Math.sin(angularDistance) * Math.cos(deg2rad(centerLat)),
      Math.cos(angularDistance) - Math.sin(deg2rad(centerLat)) * Math.sin(lat)
    );
    
    points.push({
      latitude: rad2deg(lat),
      longitude: rad2deg(lng)
    });
  }
  
  return points;
}

/**
 * 将弧度转换为角度
 * @param {number} rad - 弧度
 * @returns {number} - 角度
 */
function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

/**
 * 计算轨迹的总距离
 * @param {Array} points - 轨迹点数组
 * @returns {number} - 总距离（公里）
 */
function calculateTotalDistance(points) {
  if (!points || points.length < 2) {
    return 0;
  }
  
  let totalDistance = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    
    const distance = calculateDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      currPoint.latitude,
      currPoint.longitude
    );
    
    totalDistance += distance;
  }
  
  return totalDistance;
}

/**
 * 格式化距离
 * @param {number} distance - 距离（公里）
 * @returns {string} - 格式化后的距离
 */
function formatDistance(distance) {
  if (distance < 1) {
    return (distance * 1000).toFixed(0) + ' m';
  } else {
    return distance.toFixed(2) + ' km';
  }
}

/**
 * 格式化时间
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间（HH:MM:SS）
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

/**
 * 计算两个时间点之间的秒数
 * @param {string} startTime - 开始时间（格式：HH:MM:SS）
 * @param {string} endTime - 结束时间（格式：HH:MM:SS）
 * @returns {number} - 秒数
 */
function calculateDuration(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}Z`);
  const end = new Date(`1970-01-01T${endTime}Z`);
  
  return (end - start) / 1000;
}

/**
 * 计算轨迹的平均速度
 * @param {number} distance - 距离（公里）
 * @param {number} duration - 时间（秒）
 * @returns {number} - 平均速度（公里/小时）
 */
function calculateSpeed(distance, duration) {
  if (duration === 0) {
    return 0;
  }
  
  return (distance / duration) * 3600;
}

module.exports = {
  calculateDistance,
  calculateBounds,
  generateCirclePoints,
  calculateTotalDistance,
  formatDistance,
  formatDuration,
  calculateDuration,
  calculateSpeed
}; 