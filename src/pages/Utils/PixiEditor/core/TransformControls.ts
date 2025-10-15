import * as PIXI from 'pixi.js';
import type { IGraphicObject, Point } from '../types';

/**
 * 变换控制器
 * 提供拖拽移动、缩放、旋转等交互功能
 */
export class TransformControls {
  private container: PIXI.Container;
  private target: IGraphicObject | null = null;

  // 控制点
  private corners: PIXI.Graphics[] = [];
  private rotateHandle: PIXI.Graphics | null = null;
  private boundingBox: PIXI.Graphics;

  // 拖拽状态
  private isDragging = false;
  private isResizing = false;
  private isRotating = false;
  private dragStart: Point = { x: 0, y: 0 };
  private objectStartPos: Point = { x: 0, y: 0 };
  private resizeCorner: number = -1; // 0-3 表示四个角

  // 控制点大小
  private readonly CORNER_SIZE = 8;
  private readonly CORNER_COLOR = 0xffffff;
  private readonly CORNER_BORDER_COLOR = 0x007acc;

  constructor(container: PIXI.Container) {
    this.container = container;

    // 创建边界框
    this.boundingBox = new PIXI.Graphics();
    this.boundingBox.visible = false;
    this.container.addChild(this.boundingBox);

    // 创建4个角的控制点
    for (let i = 0; i < 4; i++) {
      const corner = new PIXI.Graphics();
      corner.eventMode = 'static';
      corner.cursor = this.getCornerCursor(i);
      corner.visible = false;

      // 绑定事件
      corner.on('pointerdown', (event) => this.onCornerDown(event, i));

      this.corners.push(corner);
      this.container.addChild(corner);
    }

    // 创建旋转手柄
    this.rotateHandle = new PIXI.Graphics();
    this.rotateHandle.eventMode = 'static';
    this.rotateHandle.cursor = 'crosshair';
    this.rotateHandle.visible = false;
    this.container.addChild(this.rotateHandle);
  }

  /**
   * 设置目标对象
   */
  setTarget(target: IGraphicObject | null): void {
    // 移除旧目标的拖拽事件
    if (this.target) {
      this.target.pixiObject.off('pointerdown', this.onObjectDown);
    }

    this.target = target;

    if (target) {
      // 添加拖拽事件
      target.pixiObject.on('pointerdown', this.onObjectDown.bind(this));

      // 显示控制器
      this.show();
      this.update();
    } else {
      this.hide();
    }
  }

  /**
   * 对象按下事件
   */
  private onObjectDown = (event: PIXI.FederatedPointerEvent): void => {
    if (!this.target || this.target.properties.locked) return;

    this.isDragging = true;
    const position = event.global;
    this.dragStart = { x: position.x, y: position.y };
    this.objectStartPos = { ...this.target.properties.position };

    // 添加移动和释放事件
    const stage = event.currentTarget.parent;
    stage.on('pointermove', this.onDrag);
    stage.on('pointerup', this.onDragEnd);
    stage.on('pointerupoutside', this.onDragEnd);
  };

  /**
   * 拖拽移动
   */
  private onDrag = (event: PIXI.FederatedPointerEvent): void => {
    if (!this.target) return;

    if (this.isDragging) {
      const position = event.global;

      // 计算父容器的变换
      const parent = this.target.pixiObject.parent;
      const scale = parent?.scale.x || 1;

      const dx = (position.x - this.dragStart.x) / scale;
      const dy = (position.y - this.dragStart.y) / scale;

      this.target.updateProperties({
        position: {
          x: this.objectStartPos.x + dx,
          y: this.objectStartPos.y + dy,
        },
      });

      this.update();
    } else if (this.isResizing) {
      this.onResize(event);
    }
  };

  /**
   * 拖拽结束
   */
  private onDragEnd = (event: PIXI.FederatedPointerEvent): void => {
    this.isDragging = false;
    this.isResizing = false;

    const stage = event.currentTarget;
    stage.off('pointermove', this.onDrag);
    stage.off('pointerup', this.onDragEnd);
    stage.off('pointerupoutside', this.onDragEnd);
  };

  /**
   * 控制点按下
   */
  private onCornerDown(event: PIXI.FederatedPointerEvent, corner: number): void {
    if (!this.target || this.target.properties.locked) return;

    event.stopPropagation();
    this.isResizing = true;
    this.resizeCorner = corner;

    const position = event.global;
    this.dragStart = { x: position.x, y: position.y };
    this.objectStartPos = { ...this.target.properties.position };

    const stage = event.currentTarget.parent;
    stage.on('pointermove', this.onDrag);
    stage.on('pointerup', this.onDragEnd);
    stage.on('pointerupoutside', this.onDragEnd);
  }

  /**
   * 缩放处理
   */
  private onResize(event: PIXI.FederatedPointerEvent): void {
    if (!this.target || !this.target.properties.size) return;

    const position = event.global;
    const parent = this.target.pixiObject.parent;
    const scale = parent?.scale.x || 1;

    const dx = (position.x - this.dragStart.x) / scale;
    const dy = (position.y - this.dragStart.y) / scale;

    const { size } = this.target.properties;
    let newWidth = size.width;
    let newHeight = size.height;
    let newX = this.objectStartPos.x;
    let newY = this.objectStartPos.y;

    // 根据拖拽的角计算新尺寸
    switch (this.resizeCorner) {
      case 0: // 左上角
        newWidth = size.width - dx;
        newHeight = size.height - dy;
        newX = this.objectStartPos.x + dx / 2;
        newY = this.objectStartPos.y + dy / 2;
        break;
      case 1: // 右上角
        newWidth = size.width + dx;
        newHeight = size.height - dy;
        newX = this.objectStartPos.x + dx / 2;
        newY = this.objectStartPos.y + dy / 2;
        break;
      case 2: // 右下角
        newWidth = size.width + dx;
        newHeight = size.height + dy;
        newX = this.objectStartPos.x + dx / 2;
        newY = this.objectStartPos.y + dy / 2;
        break;
      case 3: // 左下角
        newWidth = size.width - dx;
        newHeight = size.height + dy;
        newX = this.objectStartPos.x + dx / 2;
        newY = this.objectStartPos.y + dy / 2;
        break;
    }

    // 限制最小尺寸
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);

    // 更新对象
    this.target.updateProperties({
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY },
    });

    // 特殊处理圆形
    if (this.target.properties.type === 'circle') {
      const avgSize = (newWidth + newHeight) / 2;
      this.target.updateProperties({
        size: { width: avgSize, height: avgSize },
      });
      // @ts-ignore
      if (this.target.properties.radius !== undefined) {
        this.target.updateProperties({
          // @ts-ignore
          radius: avgSize / 2,
        });
      }
    }

    this.update();
  }

  /**
   * 显示控制器
   */
  show(): void {
    this.boundingBox.visible = true;
    this.corners.forEach(corner => corner.visible = true);
    if (this.rotateHandle) this.rotateHandle.visible = false; // 暂时隐藏旋转手柄
  }

  /**
   * 隐藏控制器
   */
  hide(): void {
    this.boundingBox.visible = false;
    this.corners.forEach(corner => corner.visible = false);
    if (this.rotateHandle) this.rotateHandle.visible = false;
  }

  /**
   * 更新控制器位置和大小
   */
  update(): void {
    if (!this.target || !this.target.pixiObject.visible) {
      this.hide();
      return;
    }

    const bounds = this.target.pixiObject.getBounds();
    const padding = 2;

    // 绘制边界框
    this.boundingBox.clear();
    this.boundingBox.rect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2
    );
    this.boundingBox.stroke({ color: 0x007acc, width: 1.5 });

    // 更新四个角的控制点
    const positions = [
      { x: bounds.x - padding, y: bounds.y - padding }, // 左上
      { x: bounds.x + bounds.width + padding, y: bounds.y - padding }, // 右上
      { x: bounds.x + bounds.width + padding, y: bounds.y + bounds.height + padding }, // 右下
      { x: bounds.x - padding, y: bounds.y + bounds.height + padding }, // 左下
    ];

    this.corners.forEach((corner, i) => {
      corner.clear();
      const pos = positions[i];

      // 绘制控制点
      corner.rect(
        pos.x - this.CORNER_SIZE / 2,
        pos.y - this.CORNER_SIZE / 2,
        this.CORNER_SIZE,
        this.CORNER_SIZE
      );
      corner.fill(this.CORNER_COLOR);
      corner.stroke({ color: this.CORNER_BORDER_COLOR, width: 1.5 });
    });
  }

  /**
   * 获取角控制点的鼠标样式
   */
  private getCornerCursor(corner: number): string {
    const cursors = ['nwse-resize', 'nesw-resize', 'nwse-resize', 'nesw-resize'];
    return cursors[corner];
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.boundingBox.destroy();
    this.corners.forEach(corner => corner.destroy());
    if (this.rotateHandle) this.rotateHandle.destroy();
  }
}
