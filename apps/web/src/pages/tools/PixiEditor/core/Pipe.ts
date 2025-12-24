/**
 * 管道系统 - 支持贝塞尔曲线和动画
 */

import * as PIXI from 'pixi.js';
import { EventEmitter } from './EventEmitter';
import { ConnectionPoint } from './ConnectionPoint';
import {
  Point,
  PipeType,
  PipeStyle,
  PipeAnimation,
  PipeConfig,
  BezierPoint,
  ArrowStyle,
} from '../types';
import {
  DEFAULT_PIPE_COLOR,
  DEFAULT_PIPE_WIDTH,
  PARTICLE_SIZE,
} from '../utils/constants';
import { generateId, bezierPoint, colorStringToHex, distance } from '../utils/helpers';

export class Pipe extends EventEmitter {
  public id: string;
  public startPointId: string;
  public endPointId: string;

  private startPoint: ConnectionPoint | null = null;
  private endPoint: ConnectionPoint | null = null;
  private style: PipeStyle;
  private animation?: PipeAnimation;
  private bezierPoints: BezierPoint[];

  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private animationGraphics?: PIXI.Graphics;
  private controlPointsGraphics?: PIXI.Graphics;

  // 动画状态
  private animationOffset: number = 0;
  private particles: Array<{ position: number; graphics: PIXI.Graphics }> = [];

  constructor(config: PipeConfig) {
    super();

    this.id = config.id || generateId('pipe');
    this.startPointId = config.startPointId;
    this.endPointId = config.endPointId;
    this.style = config.style;
    this.animation = config.animation;
    this.bezierPoints = config.bezierPoints || [];

    // 创建容器
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);

    // 如果有动画，创建动画图形
    if (this.animation?.enabled) {
      this.animationGraphics = new PIXI.Graphics();
      this.container.addChild(this.animationGraphics);
      this.initAnimation();
    }
  }

  /**
   * 设置连接点
   */
  public setConnectionPoints(start: ConnectionPoint, end: ConnectionPoint): void {
    this.startPoint = start;
    this.endPoint = end;
    this.updatePath();
  }

  /**
   * 更新路径
   */
  public updatePath(): void {
    if (!this.startPoint || !this.endPoint) return;

    const start = this.startPoint.getWorldPosition();
    const end = this.endPoint.getWorldPosition();

    this.graphics.clear();

    // 设置线条样式（Pixi v8 中 Graphics 的类型定义与实际实现存在差异，这里使用 any 兼容）
    const strokeColor = colorStringToHex(this.style.strokeColor);
    (this.graphics as any).lineStyle({
      width: this.style.strokeWidth,
      color: strokeColor,
      alpha: this.style.strokeAlpha || 1,
      cap: this.style.lineCap || 'round',
      join: this.style.lineJoin || 'round',
    });

    // 根据类型绘制不同的路径
    switch (this.style.type) {
      case PipeType.Straight:
        this.drawStraightLine(start, end);
        break;
      case PipeType.Polyline:
        this.drawPolyline(start, end);
        break;
      case PipeType.Bezier:
        this.drawBezierCurve(start, end);
        break;
      case PipeType.Spline:
        this.drawSpline(start, end);
        break;
      default:
        this.drawStraightLine(start, end);
    }

    // 绘制箭头
    if (this.style.endArrow) {
      this.drawArrow(end, this.getEndDirection(), this.style.endArrow);
    }

    if (this.style.startArrow) {
      this.drawArrow(start, this.getStartDirection(), this.style.startArrow);
    }
  }

  /**
   * 绘制直线
   */
  private drawStraightLine(start: Point, end: Point): void {
    this.graphics.moveTo(start.x, start.y);
    this.graphics.lineTo(end.x, end.y);
  }

  /**
   * 绘制折线（90度转角）
   */
  private drawPolyline(start: Point, end: Point): void {
    const midX = (start.x + end.x) / 2;

    this.graphics.moveTo(start.x, start.y);
    this.graphics.lineTo(midX, start.y);
    this.graphics.lineTo(midX, end.y);
    this.graphics.lineTo(end.x, end.y);
  }

  /**
   * 绘制贝塞尔曲线
   */
  private drawBezierCurve(start: Point, end: Point): void {
    if (this.bezierPoints.length > 0) {
      // 使用自定义贝塞尔控制点
      this.drawCustomBezier(start, end);
    } else {
      // 使用默认贝塞尔曲线
      this.drawDefaultBezier(start, end);
    }
  }

  /**
   * 绘制默认贝塞尔曲线
   */
  private drawDefaultBezier(start: Point, end: Point): void {
    const distance = Math.abs(end.x - start.x);
    const offset = Math.min(distance * 0.5, 100);

    const cp1 = { x: start.x + offset, y: start.y };
    const cp2 = { x: end.x - offset, y: end.y };

    this.graphics.moveTo(start.x, start.y);
    this.graphics.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
  }

  /**
   * 绘制自定义贝塞尔曲线
   */
  private drawCustomBezier(start: Point, end: Point): void {
    this.graphics.moveTo(start.x, start.y);

    for (const bp of this.bezierPoints) {
      if (bp.controlPoint1 && bp.controlPoint2) {
        // 三次贝塞尔
        this.graphics.bezierCurveTo(
          bp.controlPoint1.x,
          bp.controlPoint1.y,
          bp.controlPoint2.x,
          bp.controlPoint2.y,
          bp.point.x,
          bp.point.y,
        );
      } else if (bp.controlPoint1) {
        // 二次贝塞尔
        this.graphics.quadraticCurveTo(
          bp.controlPoint1.x,
          bp.controlPoint1.y,
          bp.point.x,
          bp.point.y,
        );
      } else {
        // 直线
        this.graphics.lineTo(bp.point.x, bp.point.y);
      }
    }

    this.graphics.lineTo(end.x, end.y);
  }

  /**
   * 绘制样条曲线
   */
  private drawSpline(start: Point, end: Point): void {
    // 简化的样条曲线实现
    this.drawDefaultBezier(start, end);
  }

  /**
   * 绘制箭头
   */
  private drawArrow(position: Point, direction: number, arrow: ArrowStyle): void {
    const size = arrow.size;

    this.graphics.lineStyle(0);

    if (arrow.filled) {
      const strokeColor = colorStringToHex(this.style.strokeColor);
      this.graphics.beginFill(strokeColor);
    }

    switch (arrow.type) {
      case 'arrow':
        this.drawArrowShape(position, direction, size);
        break;
      case 'circle':
        this.graphics.drawCircle(position.x, position.y, size / 2);
        break;
      case 'square':
        this.graphics.drawRect(
          position.x - size / 2,
          position.y - size / 2,
          size,
          size,
        );
        break;
      case 'diamond':
        this.drawDiamondShape(position, size);
        break;
    }

    if (arrow.filled) {
      this.graphics.endFill();
    }
  }

  /**
   * 绘制箭头形状
   */
  private drawArrowShape(position: Point, direction: number, size: number): void {
    const angle1 = direction + Math.PI - Math.PI / 6;
    const angle2 = direction + Math.PI + Math.PI / 6;

    const p1 = {
      x: position.x + Math.cos(angle1) * size,
      y: position.y + Math.sin(angle1) * size,
    };

    const p2 = {
      x: position.x + Math.cos(angle2) * size,
      y: position.y + Math.sin(angle2) * size,
    };

    this.graphics.moveTo(p1.x, p1.y);
    this.graphics.lineTo(position.x, position.y);
    this.graphics.lineTo(p2.x, p2.y);
  }

  /**
   * 绘制菱形
   */
  private drawDiamondShape(position: Point, size: number): void {
    const half = size / 2;
    this.graphics.moveTo(position.x, position.y - half);
    this.graphics.lineTo(position.x + half, position.y);
    this.graphics.lineTo(position.x, position.y + half);
    this.graphics.lineTo(position.x - half, position.y);
    this.graphics.closePath();
  }

  /**
   * 获取起点方向
   */
  private getStartDirection(): number {
    if (!this.startPoint || !this.endPoint) return 0;

    const start = this.startPoint.getWorldPosition();
    const end = this.endPoint.getWorldPosition();

    return Math.atan2(end.y - start.y, end.x - start.x);
  }

  /**
   * 获取终点方向
   */
  private getEndDirection(): number {
    if (!this.startPoint || !this.endPoint) return 0;

    const start = this.startPoint.getWorldPosition();
    const end = this.endPoint.getWorldPosition();

    return Math.atan2(end.y - start.y, end.x - start.x);
  }

  /**
   * 初始化动画
   */
  private initAnimation(): void {
    if (!this.animation || !this.animation.enabled) return;

    if (this.animation.type === 'particle') {
      this.initParticleAnimation();
    }
  }

  /**
   * 初始化粒子动画
   */
  private initParticleAnimation(): void {
    if (!this.animation || !this.animationGraphics) return;

    const density = this.animation.particleDensity || 5;

    for (let i = 0; i < density; i++) {
      const graphics = new PIXI.Graphics();
      const strokeColor = colorStringToHex(this.style.strokeColor);

      graphics.beginFill(strokeColor);
      graphics.drawCircle(0, 0, PARTICLE_SIZE);
      graphics.endFill();

      this.animationGraphics.addChild(graphics);

      this.particles.push({
        position: i / density,
        graphics,
      });
    }
  }

  /**
   * 更新动画
   */
  public updateAnimation(delta: number): void {
    if (!this.animation || !this.animation.enabled) return;

    switch (this.animation.type) {
      case 'particle':
        this.updateParticleAnimation(delta);
        break;
      case 'dash':
        this.updateDashAnimation(delta);
        break;
      case 'gradient':
        this.updateGradientAnimation(delta);
        break;
    }
  }

  /**
   * 更新粒子动画
   */
  private updateParticleAnimation(delta: number): void {
    if (!this.animation || !this.startPoint || !this.endPoint) return;

    const start = this.startPoint.getWorldPosition();
    const end = this.endPoint.getWorldPosition();
    const speed = this.animation.speed * 0.001 * delta;

    this.particles.forEach((particle) => {
      // 更新位置
      particle.position += speed;

      if (particle.position > 1) {
        particle.position = 0;
      }

      // 计算粒子在路径上的位置
      const pos = this.getPositionOnPath(particle.position, start, end);
      particle.graphics.position.set(pos.x, pos.y);
    });
  }

  /**
   * 更新虚线动画
   */
  private updateDashAnimation(delta: number): void {
    if (!this.animation) return;

    this.animationOffset += this.animation.speed * 0.1 * delta;
    // 重新绘制带偏移的虚线
    // TODO: 实现虚线动画
  }

  /**
   * 更新渐变动画
   */
  private updateGradientAnimation(delta: number): void {
    // TODO: 实现渐变动画
  }

  /**
   * 获取路径上的位置
   */
  private getPositionOnPath(t: number, start: Point, end: Point): Point {
    // 简化实现，根据类型计算位置
    switch (this.style.type) {
      case PipeType.Straight:
        return {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        };

      case PipeType.Bezier:
        return this.getPositionOnBezier(t, start, end);

      default:
        return {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        };
    }
  }

  /**
   * 获取贝塞尔曲线上的位置
   */
  private getPositionOnBezier(t: number, start: Point, end: Point): Point {
    const distance = Math.abs(end.x - start.x);
    const offset = Math.min(distance * 0.5, 100);

    const cp1 = { x: start.x + offset, y: start.y };
    const cp2 = { x: end.x - offset, y: end.y };

    return bezierPoint(t, [start, cp1, cp2, end]);
  }

  /**
   * 设置贝塞尔控制点
   */
  public setBezierPoints(points: BezierPoint[]): void {
    this.bezierPoints = points;
    this.updatePath();
  }

  /**
   * 显示控制点
   */
  public showControlPoints(show: boolean): void {
    if (show && !this.controlPointsGraphics) {
      this.controlPointsGraphics = new PIXI.Graphics();
      this.container.addChild(this.controlPointsGraphics);
      this.drawControlPoints();
    } else if (!show && this.controlPointsGraphics) {
      this.container.removeChild(this.controlPointsGraphics);
      this.controlPointsGraphics = undefined;
    }
  }

  /**
   * 绘制控制点
   */
  private drawControlPoints(): void {
    // TODO: 实现控制点可视化
  }

  /**
   * 检查是否有动画
   */
  public hasAnimation(): boolean {
    return this.animation?.enabled || false;
  }

  /**
   * 更新样式
   */
  public updateStyle(style: Partial<PipeStyle>): void {
    this.style = { ...this.style, ...style };
    this.updatePath();
  }

  /**
   * 获取显示对象
   */
  public getDisplayObject(): PIXI.Container {
    return this.container;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.container.destroy({ children: true });
    this.removeAllListeners();
  }

  /**
   * 序列化
   */
  public serialize(): PipeConfig {
    return {
      id: this.id,
      startPointId: this.startPointId,
      endPointId: this.endPointId,
      style: { ...this.style },
      bezierPoints: this.bezierPoints.map(bp => ({ ...bp })),
      animation: this.animation ? { ...this.animation } : undefined,
    };
  }
}
