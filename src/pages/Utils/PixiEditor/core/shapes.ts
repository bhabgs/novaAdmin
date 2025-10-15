/**
 * 具体图形类实现
 */

import * as PIXI from 'pixi.js';
import { GraphicObject } from './GraphicObject';
import { ObjectProperties, ObjectType, Point } from '../types';
import {
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
} from '../utils/constants';
import { colorStringToHex } from '../utils/helpers';

/**
 * 矩形
 */
export class Rectangle extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Rectangle, {
      width: 100,
      height: 100,
      cornerRadius: 0,
      fill: {
        type: 'solid',
        color: '#ffffff',
        alpha: 1,
      },
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { width, height, cornerRadius, fill, stroke } = this.properties;

    this.graphics.clear();

    // 绘制矩形
    if (cornerRadius && cornerRadius > 0) {
      this.graphics.roundRect(
        -(width || 100) / 2,
        -(height || 100) / 2,
        width || 100,
        height || 100,
        cornerRadius,
      );
    } else {
      this.graphics.rect(
        -(width || 100) / 2,
        -(height || 100) / 2,
        width || 100,
        height || 100,
      );
    }

    // 填充
    if (fill && fill.color) {
      const fillColor = colorStringToHex(fill.color);
      this.graphics.fill({ color: fillColor, alpha: fill.alpha || 1 });
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Rectangle {
    return new Rectangle(this.getProperties());
  }
}

/**
 * 圆形
 */
export class Circle extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Circle, {
      radius: 50,
      fill: {
        type: 'solid',
        color: '#ffffff',
        alpha: 1,
      },
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { radius, fill, stroke } = this.properties;

    this.graphics.clear();

    // 绘制圆形
    this.graphics.circle(0, 0, radius || 50);

    // 填充
    if (fill && fill.color) {
      const fillColor = colorStringToHex(fill.color);
      this.graphics.fill({ color: fillColor, alpha: fill.alpha || 1 });
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Circle {
    return new Circle(this.getProperties());
  }
}

/**
 * 椭圆
 */
export class Ellipse extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Ellipse, {
      radiusX: 80,
      radiusY: 50,
      fill: {
        type: 'solid',
        color: '#ffffff',
        alpha: 1,
      },
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { radiusX, radiusY, fill, stroke } = this.properties;

    this.graphics.clear();

    // 绘制椭圆
    this.graphics.ellipse(0, 0, radiusX || 80, radiusY || 50);

    // 填充
    if (fill && fill.color) {
      const fillColor = colorStringToHex(fill.color);
      this.graphics.fill({ color: fillColor, alpha: fill.alpha || 1 });
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Ellipse {
    return new Ellipse(this.getProperties());
  }
}

/**
 * 线条
 */
export class Line extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Line, {
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { points, stroke } = this.properties;

    this.graphics.clear();

    if (!points || points.length < 2) return;

    // 绘制线条
    const firstPoint = points[0];
    this.graphics.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Line {
    return new Line(this.getProperties());
  }
}

/**
 * 折线
 */
export class Polyline extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Polyline, {
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 0 },
      ],
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { points, stroke } = this.properties;

    this.graphics.clear();

    if (!points || points.length < 2) return;

    // 绘制折线
    const firstPoint = points[0];
    this.graphics.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Polyline {
    return new Polyline(this.getProperties());
  }
}

/**
 * 多边形
 */
export class Polygon extends GraphicObject {
  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Polygon, {
      points: [
        { x: 0, y: -50 },
        { x: 48, y: 15 },
        { x: 29, y: 48 },
        { x: -29, y: 48 },
        { x: -48, y: 15 },
      ],
      fill: {
        type: 'solid',
        color: '#ffffff',
        alpha: 1,
      },
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      ...properties,
    });

    this.render();
  }

  protected render(): void {
    const { points, fill, stroke } = this.properties;

    this.graphics.clear();

    if (!points || points.length < 3) return;

    // 绘制多边形
    const path: number[] = [];
    points.forEach((p) => {
      path.push(p.x, p.y);
    });
    this.graphics.poly(path);

    // 填充
    if (fill && fill.color) {
      const fillColor = colorStringToHex(fill.color);
      this.graphics.fill({ color: fillColor, alpha: fill.alpha || 1 });
    }

    // 描边
    if (stroke) {
      const strokeColor = colorStringToHex(stroke.color);
      this.graphics.stroke({
        color: strokeColor,
        width: stroke.width,
        alpha: stroke.alpha || 1,
      });
    }
  }

  public clone(): Polygon {
    return new Polygon(this.getProperties());
  }
}

/**
 * 文本
 */
export class Text extends GraphicObject {
  private textObject: PIXI.Text;

  constructor(properties: Partial<ObjectProperties>) {
    super(ObjectType.Text, {
      text: 'Text',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      textAlign: 'left',
      fill: {
        type: 'solid',
        color: '#000000',
        alpha: 1,
      },
      ...properties,
    });

    this.textObject = new PIXI.Text('', {
      fontSize: 16,
      fill: '#000000',
    });

    this.displayObject.addChild(this.textObject);
    this.render();
  }

  protected render(): void {
    const { text, fontSize, fontFamily, fontWeight, textAlign, fill } =
      this.properties;

    // 更新文本样式
    this.textObject.text = text || 'Text';
    this.textObject.style = new PIXI.TextStyle({
      fontSize: fontSize || 16,
      fontFamily: fontFamily || 'Arial',
      fontWeight: (fontWeight as any) || 'normal',
      align: textAlign || 'left',
      fill: fill?.color || '#000000',
    });

    // 居中文本
    this.textObject.anchor.set(0.5);
  }

  public clone(): Text {
    return new Text(this.getProperties());
  }

  public destroy(): void {
    this.textObject.destroy();
    super.destroy();
  }
}
