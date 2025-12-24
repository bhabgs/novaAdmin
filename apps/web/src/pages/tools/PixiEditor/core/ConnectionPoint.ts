/**
 * 连接点系统
 */

import * as PIXI from 'pixi.js';
import { EventEmitter } from './EventEmitter';
import { GraphicObject } from './GraphicObject';
import { Point, ConnectionType, ConnectionPointConfig } from '../types';
import {
  CONNECTION_POINT_RADIUS,
  CONNECTION_POINT_COLOR,
  CONNECTION_POINT_HOVER_COLOR,
  CONNECTION_POINT_ACTIVE_COLOR,
} from '../utils/constants';
import { getWorldPosition } from '../utils/helpers';

export class ConnectionPoint extends EventEmitter {
  public id: string;
  public parentId: string;
  public type: ConnectionType;
  public position: Point; // 相对于父对象的位置
  public direction?: 'top' | 'right' | 'bottom' | 'left';

  private graphics: PIXI.Graphics;
  private parentObject: GraphicObject | null = null;
  private isHovered: boolean = false;
  private isActive: boolean = false;
  private visible: boolean = false;

  constructor(config: ConnectionPointConfig) {
    super();

    this.id = config.id;
    this.parentId = config.parentId;
    this.type = config.type;
    this.position = config.position;
    this.direction = config.direction;

    // 创建图形
    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = true;
    this.graphics.cursor = 'crosshair';

    // 绑定事件
    this.setupEvents();

    // 绘制连接点
    this.render();
  }

  /**
   * 设置事件监听
   */
  private setupEvents(): void {
    this.graphics.on('pointerover', this.onPointerOver.bind(this));
    this.graphics.on('pointerout', this.onPointerOut.bind(this));
    this.graphics.on('pointerdown', this.onPointerDown.bind(this));
  }

  /**
   * 指针悬停
   */
  private onPointerOver(e: PIXI.FederatedPointerEvent): void {
    this.isHovered = true;
    this.render();
    this.emit('hover', { point: this, event: e });
    e.stopPropagation();
  }

  /**
   * 指针移出
   */
  private onPointerOut(e: PIXI.FederatedPointerEvent): void {
    this.isHovered = false;
    this.render();
    this.emit('hoverOut', { point: this, event: e });
  }

  /**
   * 指针按下
   */
  private onPointerDown(e: PIXI.FederatedPointerEvent): void {
    this.emit('pointerdown', { point: this, event: e });
    e.stopPropagation();
  }

  /**
   * 渲染连接点
   */
  private render(): void {
    this.graphics.clear();

    if (!this.visible) return;

    let color = CONNECTION_POINT_COLOR;
    let radius = CONNECTION_POINT_RADIUS;

    if (this.isActive) {
      color = CONNECTION_POINT_ACTIVE_COLOR;
      radius = CONNECTION_POINT_RADIUS + 2;
    } else if (this.isHovered) {
      color = CONNECTION_POINT_HOVER_COLOR;
      radius = CONNECTION_POINT_RADIUS + 1;
    }

    // 绘制外圈
    this.graphics.beginFill(0xffffff);
    this.graphics.drawCircle(0, 0, radius);
    this.graphics.endFill();

    // 绘制内圈
    this.graphics.beginFill(color);
    this.graphics.drawCircle(0, 0, radius - 2);
    this.graphics.endFill();

    // 根据类型绘制不同的标记
    this.graphics.lineStyle(2, 0xffffff);
    switch (this.type) {
      case ConnectionType.Input:
        // 输入点：向内的箭头
        this.graphics.moveTo(-3, -2);
        this.graphics.lineTo(0, 0);
        this.graphics.lineTo(-3, 2);
        break;
      case ConnectionType.Output:
        // 输出点：向外的箭头
        this.graphics.moveTo(3, -2);
        this.graphics.lineTo(0, 0);
        this.graphics.lineTo(3, 2);
        break;
      case ConnectionType.BiDirectional:
        // 双向点：十字
        this.graphics.moveTo(-2, 0);
        this.graphics.lineTo(2, 0);
        this.graphics.moveTo(0, -2);
        this.graphics.lineTo(0, 2);
        break;
    }
  }

  /**
   * 设置父对象
   */
  public setParent(parent: GraphicObject): void {
    this.parentObject = parent;
    this.updatePosition();
  }

  /**
   * 更新位置
   */
  public updatePosition(): void {
    if (this.parentObject) {
      const parent = this.parentObject.getDisplayObject();
      this.graphics.position.set(this.position.x, this.position.y);

      // 将图形添加到父对象
      if (!parent.children.includes(this.graphics)) {
        parent.addChild(this.graphics);
      }
    }
  }

  /**
   * 获取世界坐标
   */
  public getWorldPosition(): Point {
    if (this.parentObject) {
      const parentPos = getWorldPosition(this.parentObject.getDisplayObject());
      const transform = this.parentObject.getDisplayObject().worldTransform;

      // 应用父对象的变换到连接点位置
      const localPos = new PIXI.Point(this.position.x, this.position.y);
      const worldPos = transform.apply(localPos);

      return { x: worldPos.x, y: worldPos.y };
    }

    return { ...this.position };
  }

  /**
   * 检查是否可以连接到另一个连接点
   */
  public canConnectTo(other: ConnectionPoint): boolean {
    // 不能连接到自己
    if (this.id === other.id) return false;

    // 不能连接到同一个父对象
    if (this.parentId === other.parentId) return false;

    // 输入点只能连接到输出点
    if (this.type === ConnectionType.Input && other.type !== ConnectionType.Output) {
      return false;
    }

    // 输出点只能连接到输入点
    if (this.type === ConnectionType.Output && other.type !== ConnectionType.Input) {
      return false;
    }

    // 双向点可以连接到任何点
    return true;
  }

  /**
   * 设置可见性
   */
  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.render();
  }

  /**
   * 设置激活状态
   */
  public setActive(active: boolean): void {
    this.isActive = active;
    this.render();
  }

  /**
   * 获取图形对象
   */
  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.graphics.destroy();
    this.removeAllListeners();
  }

  /**
   * 序列化
   */
  public serialize(): ConnectionPointConfig {
    return {
      id: this.id,
      parentId: this.parentId,
      type: this.type,
      position: { ...this.position },
      direction: this.direction,
    };
  }
}

/**
 * 连接点工厂 - 为不同图形创建默认连接点
 */
export class ConnectionPointFactory {
  /**
   * 为矩形创建连接点
   */
  public static createForRectangle(
    parentId: string,
    width: number,
    height: number,
  ): ConnectionPoint[] {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
      // 上
      new ConnectionPoint({
        id: `${parentId}_cp_top`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: 0, y: -halfHeight },
        direction: 'top',
      }),
      // 右
      new ConnectionPoint({
        id: `${parentId}_cp_right`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: halfWidth, y: 0 },
        direction: 'right',
      }),
      // 下
      new ConnectionPoint({
        id: `${parentId}_cp_bottom`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: 0, y: halfHeight },
        direction: 'bottom',
      }),
      // 左
      new ConnectionPoint({
        id: `${parentId}_cp_left`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: -halfWidth, y: 0 },
        direction: 'left',
      }),
    ];
  }

  /**
   * 为圆形创建连接点
   */
  public static createForCircle(parentId: string, radius: number): ConnectionPoint[] {
    return [
      // 上
      new ConnectionPoint({
        id: `${parentId}_cp_top`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: 0, y: -radius },
        direction: 'top',
      }),
      // 右
      new ConnectionPoint({
        id: `${parentId}_cp_right`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: radius, y: 0 },
        direction: 'right',
      }),
      // 下
      new ConnectionPoint({
        id: `${parentId}_cp_bottom`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: 0, y: radius },
        direction: 'bottom',
      }),
      // 左
      new ConnectionPoint({
        id: `${parentId}_cp_left`,
        parentId,
        type: ConnectionType.BiDirectional,
        position: { x: -radius, y: 0 },
        direction: 'left',
      }),
    ];
  }
}
