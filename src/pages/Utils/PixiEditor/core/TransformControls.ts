/**
 * 变换控制系统 - 用于选择和变换图形对象
 */

import * as PIXI from 'pixi.js';
import { GraphicObject } from './GraphicObject';
import { EventEmitter } from './EventEmitter';
import { Point } from '../types';
import {
  TRANSFORM_HANDLE_SIZE,
  TRANSFORM_HANDLE_COLOR,
  TRANSFORM_ROTATION_HANDLE_OFFSET,
  SELECTION_COLOR,
  SELECTION_BORDER_WIDTH,
} from '../utils/constants';

enum HandleType {
  TopLeft = 'tl',
  TopCenter = 'tc',
  TopRight = 'tr',
  MiddleLeft = 'ml',
  MiddleRight = 'mr',
  BottomLeft = 'bl',
  BottomCenter = 'bc',
  BottomRight = 'br',
  Rotation = 'rotation',
}

export class TransformControls extends EventEmitter {
  private container: PIXI.Container;
  private selectionBox: PIXI.Graphics;
  private handles: Map<HandleType, PIXI.Graphics>;
  private target: GraphicObject | null = null;

  private isDragging: boolean = false;
  private transforming: boolean = false;
  private activeHandle: HandleType | null = null;
  private startPoint: Point = { x: 0, y: 0 };
  private startBounds: PIXI.Rectangle | null = null;

  constructor() {
    super();

    this.container = new PIXI.Container();
    this.container.visible = false;

    this.selectionBox = new PIXI.Graphics();
    this.container.addChild(this.selectionBox);

    this.handles = new Map();
    this.createHandles();
  }

  /**
   * 创建控制手柄
   */
  private createHandles(): void {
    const handleTypes = [
      HandleType.TopLeft,
      HandleType.TopCenter,
      HandleType.TopRight,
      HandleType.MiddleLeft,
      HandleType.MiddleRight,
      HandleType.BottomLeft,
      HandleType.BottomCenter,
      HandleType.BottomRight,
      HandleType.Rotation,
    ];

    handleTypes.forEach((type) => {
      const handle = new PIXI.Graphics();
      handle.interactive = true;
      handle.cursor = this.getCursorForHandle(type);

      handle.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        this.onHandleDown(type, e);
      });

      this.handles.set(type, handle);
      this.container.addChild(handle);
    });
  }

  /**
   * 获取手柄的光标样式
   */
  private getCursorForHandle(type: HandleType): string {
    switch (type) {
      case HandleType.TopLeft:
      case HandleType.BottomRight:
        return 'nwse-resize';
      case HandleType.TopRight:
      case HandleType.BottomLeft:
        return 'nesw-resize';
      case HandleType.TopCenter:
      case HandleType.BottomCenter:
        return 'ns-resize';
      case HandleType.MiddleLeft:
      case HandleType.MiddleRight:
        return 'ew-resize';
      case HandleType.Rotation:
        return 'crosshair';
      default:
        return 'default';
    }
  }

  /**
   * 手柄按下
   */
  private onHandleDown(type: HandleType, e: PIXI.FederatedPointerEvent): void {
    this.transforming = true;
    this.activeHandle = type;
    this.startPoint = { x: e.global.x, y: e.global.y };

    if (this.target) {
      this.startBounds = this.target.getBounds();
      this.emit('transformStart', { target: this.target });
    }

    e.stopPropagation();
  }

  /**
   * 设置目标对象
   */
  public setTarget(object: GraphicObject | null): void {
    this.target = object;

    if (object) {
      this.container.visible = true;
      this.update();

      // 启用对象拖拽
      if (!object.getDisplayObject().eventMode) {
        object.getDisplayObject().eventMode = 'static';
      }
    } else {
      this.container.visible = false;
    }
  }

  /**
   * 更新控制框
   */
  public update(): void {
    if (!this.target) return;

    const bounds = this.target.getBounds();

    // 绘制选择框
    this.selectionBox.clear();
    this.selectionBox.lineStyle(SELECTION_BORDER_WIDTH, SELECTION_COLOR);
    this.selectionBox.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // 更新手柄位置
    this.updateHandles(bounds);
  }

  /**
   * 更新手柄位置
   */
  private updateHandles(bounds: PIXI.Rectangle): void {
    const { x, y, width, height } = bounds;
    const halfSize = TRANSFORM_HANDLE_SIZE / 2;

    // 清除并重绘所有手柄
    this.handles.forEach((handle, type) => {
      handle.clear();
      handle.beginFill(0xffffff);
      handle.lineStyle(2, TRANSFORM_HANDLE_COLOR);
      handle.drawRect(-halfSize, -halfSize, TRANSFORM_HANDLE_SIZE, TRANSFORM_HANDLE_SIZE);
      handle.endFill();

      // 设置位置
      const pos = this.getHandlePosition(type, x, y, width, height);
      handle.position.set(pos.x, pos.y);
    });

    // 旋转手柄特殊处理
    const rotationHandle = this.handles.get(HandleType.Rotation);
    if (rotationHandle) {
      rotationHandle.clear();
      rotationHandle.beginFill(TRANSFORM_HANDLE_COLOR);
      rotationHandle.drawCircle(0, 0, TRANSFORM_HANDLE_SIZE / 2);
      rotationHandle.endFill();
    }
  }

  /**
   * 获取手柄位置
   */
  private getHandlePosition(
    type: HandleType,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Point {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    switch (type) {
      case HandleType.TopLeft:
        return { x, y };
      case HandleType.TopCenter:
        return { x: centerX, y };
      case HandleType.TopRight:
        return { x: x + width, y };
      case HandleType.MiddleLeft:
        return { x, y: centerY };
      case HandleType.MiddleRight:
        return { x: x + width, y: centerY };
      case HandleType.BottomLeft:
        return { x, y: y + height };
      case HandleType.BottomCenter:
        return { x: centerX, y: y + height };
      case HandleType.BottomRight:
        return { x: x + width, y: y + height };
      case HandleType.Rotation:
        return { x: centerX, y: y - TRANSFORM_ROTATION_HANDLE_OFFSET };
      default:
        return { x: 0, y: 0 };
    }
  }

  /**
   * 处理拖拽移动
   */
  public handleMove(point: Point): void {
    if (!this.transforming || !this.target || !this.activeHandle) return;

    const dx = point.x - this.startPoint.x;
    const dy = point.y - this.startPoint.y;

    if (this.activeHandle === HandleType.Rotation) {
      this.handleRotation(point);
    } else {
      this.handleResize(dx, dy);
    }

    this.emit('transformMove', { target: this.target });
    this.update();
  }

  /**
   * 处理旋转
   */
  private handleRotation(point: Point): void {
    if (!this.target) return;

    const bounds = this.target.getBounds();
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    this.target.setRotation(angle - Math.PI / 2);
  }

  /**
   * 处理缩放
   */
  private handleResize(dx: number, dy: number): void {
    if (!this.target || !this.startBounds || !this.activeHandle) return;

    const props = this.target.getProperties();
    const bounds = this.startBounds;

    let newX = props.transform.x;
    let newY = props.transform.y;
    let newWidth = bounds.width;
    let newHeight = bounds.height;
    let newScaleX = props.transform.scaleX;
    let newScaleY = props.transform.scaleY;

    // 根据手柄类型计算新的尺寸和位置
    switch (this.activeHandle) {
      case HandleType.TopLeft:
        newWidth = bounds.width - dx;
        newHeight = bounds.height - dy;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;

      case HandleType.TopCenter:
        newHeight = bounds.height - dy;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;

      case HandleType.TopRight:
        newWidth = bounds.width + dx;
        newHeight = bounds.height - dy;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;

      case HandleType.MiddleLeft:
        newWidth = bounds.width - dx;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        break;

      case HandleType.MiddleRight:
        newWidth = bounds.width + dx;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        break;

      case HandleType.BottomLeft:
        newWidth = bounds.width - dx;
        newHeight = bounds.height + dy;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;

      case HandleType.BottomCenter:
        newHeight = bounds.height + dy;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;

      case HandleType.BottomRight:
        newWidth = bounds.width + dx;
        newHeight = bounds.height + dy;
        newX = bounds.x + bounds.width / 2 + dx / 2;
        newY = bounds.y + bounds.height / 2 + dy / 2;
        break;
    }

    // 确保最小尺寸
    const minSize = 10;
    if (Math.abs(newWidth) < minSize) newWidth = minSize * Math.sign(newWidth || 1);
    if (Math.abs(newHeight) < minSize) newHeight = minSize * Math.sign(newHeight || 1);

    // 计算缩放比例
    if (bounds.width > 0) {
      newScaleX = (newWidth / bounds.width) * props.transform.scaleX;
    }
    if (bounds.height > 0) {
      newScaleY = (newHeight / bounds.height) * props.transform.scaleY;
    }

    // 更新对象属性
    this.target.updateProperties({
      ...props,
      transform: {
        ...props.transform,
        x: newX,
        y: newY,
        scaleX: newScaleX,
        scaleY: newScaleY,
      },
    });
  }

  /**
   * 处理拖拽结束
   */
  public handleUp(): void {
    if (this.transforming) {
      this.emit('transformEnd', { target: this.target });
    }
    this.transforming = false;
    this.activeHandle = null;
    this.startBounds = null;
  }

  /**
   * 检查是否正在变换
   */
  public isTransforming(): boolean {
    return this.transforming;
  }

  /**
   * 获取容器
   */
  public getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.container.destroy({ children: true });
    this.removeAllListeners();
  }
}
