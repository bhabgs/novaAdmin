import * as PIXI from 'pixi.js';
import { GraphicObject, ConnectionPoint } from './GraphicObject';
import {
  ConnectionType,
  ObjectType,
} from '../types';
import type {
  RectangleProperties,
  CircleProperties,
  TextProperties,
} from '../types';

/**
 * 矩形对象
 */
export class RectangleObject extends GraphicObject {
  declare properties: RectangleProperties;

  constructor(properties: RectangleProperties) {
    super(properties);
    this.setupConnectionPoints();
    this.render();
  }

  private setupConnectionPoints(): void {
    const { size } = this.properties;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    // 添加四个边的连接点
    const points = [
      { id: `${this.id}-top`, pos: { x: 0, y: -halfHeight }, type: ConnectionType.BIDIRECTIONAL },
      { id: `${this.id}-right`, pos: { x: halfWidth, y: 0 }, type: ConnectionType.OUTPUT },
      { id: `${this.id}-bottom`, pos: { x: 0, y: halfHeight }, type: ConnectionType.BIDIRECTIONAL },
      { id: `${this.id}-left`, pos: { x: -halfWidth, y: 0 }, type: ConnectionType.INPUT },
    ];

    points.forEach(p => {
      const point = new ConnectionPoint(p.id, this, p.pos, p.type);
      this.addConnectionPoint(point);
    });
  }

  render(): void {
    this.graphics.clear();

    const { size, cornerRadius, fill, stroke } = this.properties;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    // 绘制矩形（中心点为原点）
    if (cornerRadius > 0) {
      this.graphics.roundRect(
        -halfWidth,
        -halfHeight,
        size.width,
        size.height,
        cornerRadius
      );
    } else {
      this.graphics.rect(-halfWidth, -halfHeight, size.width, size.height);
    }

    // 应用填充
    if (fill) {
      this.applyFill(this.graphics);
    }

    // 应用描边
    if (stroke) {
      this.applyStroke(this.graphics);
    }

    // 更新选中边框
    this.updateSelectionBorder();
  }

  protected updateSelectionBorder(): void {
    if (!this.selectionBorder) return;

    this.selectionBorder.clear();

    if (this.isSelected()) {
      const { size, cornerRadius } = this.properties;
      const halfWidth = size.width / 2;
      const halfHeight = size.height / 2;
      const padding = 4;

      this.selectionBorder.rect(
        -halfWidth - padding,
        -halfHeight - padding,
        size.width + padding * 2,
        size.height + padding * 2
      );
      this.selectionBorder.stroke({ color: 0x007acc, width: 2 });
      this.selectionBorder.visible = true;
    } else {
      this.selectionBorder.visible = false;
    }
  }
}

/**
 * 圆形对象
 */
export class CircleObject extends GraphicObject {
  declare properties: CircleProperties;

  constructor(properties: CircleProperties) {
    super(properties);
    this.setupConnectionPoints();
    this.render();
  }

  private setupConnectionPoints(): void {
    const { radius } = this.properties;

    // 添加四个方向的连接点
    const points = [
      { id: `${this.id}-top`, pos: { x: 0, y: -radius }, type: ConnectionType.BIDIRECTIONAL },
      { id: `${this.id}-right`, pos: { x: radius, y: 0 }, type: ConnectionType.OUTPUT },
      { id: `${this.id}-bottom`, pos: { x: 0, y: radius }, type: ConnectionType.BIDIRECTIONAL },
      { id: `${this.id}-left`, pos: { x: -radius, y: 0 }, type: ConnectionType.INPUT },
    ];

    points.forEach(p => {
      const point = new ConnectionPoint(p.id, this, p.pos, p.type);
      this.addConnectionPoint(point);
    });
  }

  render(): void {
    this.graphics.clear();

    const { radius, fill, stroke } = this.properties;

    // 绘制圆形（中心点为原点）
    this.graphics.circle(0, 0, radius);

    // 应用填充
    if (fill) {
      this.applyFill(this.graphics);
    }

    // 应用描边
    if (stroke) {
      this.applyStroke(this.graphics);
    }

    // 更新选中边框
    this.updateSelectionBorder();
  }

  protected updateSelectionBorder(): void {
    if (!this.selectionBorder) return;

    this.selectionBorder.clear();

    if (this.isSelected()) {
      const { radius } = this.properties;
      const padding = 4;

      this.selectionBorder.circle(0, 0, radius + padding);
      this.selectionBorder.stroke({ color: 0x007acc, width: 2 });
      this.selectionBorder.visible = true;
    } else {
      this.selectionBorder.visible = false;
    }
  }
}

/**
 * 文本对象
 */
export class TextObject extends GraphicObject {
  declare properties: TextProperties;
  private textObject: PIXI.Text | null = null;

  constructor(properties: TextProperties) {
    super(properties);
    this.setupConnectionPoints();
    this.render();
  }

  private setupConnectionPoints(): void {
    // 文本对象可以有简单的连接点
    const points = [
      { id: `${this.id}-left`, pos: { x: -50, y: 0 }, type: ConnectionType.INPUT },
      { id: `${this.id}-right`, pos: { x: 50, y: 0 }, type: ConnectionType.OUTPUT },
    ];

    points.forEach(p => {
      const point = new ConnectionPoint(p.id, this, p.pos, p.type);
      this.addConnectionPoint(point);
    });
  }

  render(): void {
    // 移除旧的文本对象
    if (this.textObject) {
      this.pixiObject.removeChild(this.textObject);
      this.textObject.destroy();
    }

    const { content, fontSize, fontFamily, fontWeight, textAlign, fill } = this.properties;

    // 创建文本样式
    const style = new PIXI.TextStyle({
      fontFamily: fontFamily || 'Arial',
      fontSize: fontSize || 16,
      fontWeight: fontWeight || 'normal',
      fill: fill || 0x000000,
      align: textAlign || 'left',
    });

    // 创建文本对象
    this.textObject = new PIXI.Text({
      text: content,
      style,
    });

    // 设置文本锚点为中心
    this.textObject.anchor.set(0.5);

    this.pixiObject.addChild(this.textObject);

    // 更新选中边框
    this.updateSelectionBorder();
  }

  protected updateSelectionBorder(): void {
    if (!this.selectionBorder || !this.textObject) return;

    this.selectionBorder.clear();

    if (this.isSelected()) {
      const bounds = this.textObject.getLocalBounds();
      const padding = 4;

      this.selectionBorder.rect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2
      );
      this.selectionBorder.stroke({ color: 0x007acc, width: 2 });
      this.selectionBorder.visible = true;
    } else {
      this.selectionBorder.visible = false;
    }
  }

  destroy(): void {
    if (this.textObject) {
      this.textObject.destroy();
    }
    super.destroy();
  }
}

/**
 * 线条对象
 */
export class LineObject extends GraphicObject {
  private endPoint: { x: number; y: number } = { x: 100, y: 0 };

  constructor(properties: any) {
    super(properties);
    this.render();
  }

  setEndPoint(x: number, y: number): void {
    this.endPoint = { x, y };
    this.render();
  }

  render(): void {
    this.graphics.clear();

    const { stroke } = this.properties;

    // 绘制线条
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(this.endPoint.x, this.endPoint.y);

    // 应用描边
    if (stroke) {
      this.applyStroke(this.graphics);
    } else {
      this.graphics.stroke({ color: 0x000000, width: 2 });
    }

    // 更新选中边框
    this.updateSelectionBorder();
  }

  protected updateSelectionBorder(): void {
    if (!this.selectionBorder) return;

    this.selectionBorder.clear();

    if (this.isSelected()) {
      const padding = 4;

      this.selectionBorder.moveTo(0, -padding);
      this.selectionBorder.lineTo(this.endPoint.x, this.endPoint.y - padding);
      this.selectionBorder.lineTo(this.endPoint.x, this.endPoint.y + padding);
      this.selectionBorder.lineTo(0, padding);
      this.selectionBorder.lineTo(0, -padding);

      this.selectionBorder.stroke({ color: 0x007acc, width: 2 });
      this.selectionBorder.visible = true;
    } else {
      this.selectionBorder.visible = false;
    }
  }
}

/**
 * 工厂函数：根据类型创建图形对象
 */
export function createGraphicObject(type: ObjectType, properties: any): GraphicObject {
  switch (type) {
    case 'rectangle':
      return new RectangleObject(properties);
    case 'circle':
      return new CircleObject(properties);
    case 'text':
      return new TextObject(properties);
    case 'line':
      return new LineObject(properties);
    default:
      throw new Error(`Unknown object type: ${type}`);
  }
}
