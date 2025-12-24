/**
 * 工具函数
 */

import * as PIXI from 'pixi.js';
import { Point, Rect } from '../types';

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'obj'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 计算两点间距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算角度（弧度）
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 角度转弧度
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 弧度转角度
 */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * 限制值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 点是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 矩形是否相交
 */
export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * 获取矩形的边界框
 */
export function getBounds(points: Point[]): Rect {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 旋转点
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * 获取对象的世界坐标
 * 在 PixiJS v8 中不再从主包导出 DisplayObject，这里使用 Container 以保持兼容
 */
export function getWorldPosition(obj: PIXI.Container): Point {
  const worldTransform = obj.worldTransform;
  return {
    x: worldTransform.tx,
    y: worldTransform.ty,
  };
}

/**
 * 吸附到网格
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 吸附点到点
 */
export function snapToPoint(
  point: Point,
  targetPoint: Point,
  threshold: number,
): Point | null {
  const dist = distance(point, targetPoint);
  if (dist < threshold) {
    return targetPoint;
  }
  return null;
}

/**
 * 颜色转换：十六进制转RGB
 */
export function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}

/**
 * 颜色转换：RGB转十六进制
 */
export function rgbToHex(r: number, g: number, b: number): number {
  return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}

/**
 * 颜色转换：字符串转十六进制
 */
export function colorStringToHex(color: string): number {
  if (color.startsWith('#')) {
    return parseInt(color.slice(1), 16);
  }
  return parseInt(color, 16);
}

/**
 * 颜色转换：十六进制转字符串
 */
export function hexToColorString(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 计算贝塞尔曲线上的点
 * @param t 0-1之间的参数
 * @param points 控制点数组
 */
export function bezierPoint(t: number, points: Point[]): Point {
  if (points.length === 2) {
    // 线性
    return {
      x: lerp(points[0].x, points[1].x, t),
      y: lerp(points[0].y, points[1].y, t),
    };
  } else if (points.length === 3) {
    // 二次贝塞尔
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;

    return {
      x: mt2 * points[0].x + 2 * mt * t * points[1].x + t2 * points[2].x,
      y: mt2 * points[0].y + 2 * mt * t * points[1].y + t2 * points[2].y,
    };
  } else if (points.length === 4) {
    // 三次贝塞尔
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x:
        mt3 * points[0].x +
        3 * mt2 * t * points[1].x +
        3 * mt * t2 * points[2].x +
        t3 * points[3].x,
      y:
        mt3 * points[0].y +
        3 * mt2 * t * points[1].y +
        3 * mt * t2 * points[2].y +
        t3 * points[3].y,
    };
  }

  return points[0];
}

/**
 * 计算贝塞尔曲线的长度（近似）
 */
export function bezierLength(points: Point[], segments = 20): number {
  let length = 0;
  let prevPoint = bezierPoint(0, points);

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const point = bezierPoint(t, points);
    length += distance(prevPoint, point);
    prevPoint = point;
  }

  return length;
}

/**
 * 判断点是否在多边形内
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
