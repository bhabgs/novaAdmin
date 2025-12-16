/**
 * 工具系统 - 处理不同工具模式下的图形创建
 */

import { GraphicObject } from './GraphicObject';
import { Rectangle, Circle, Line, Text } from './shapes';
import { Point, ToolMode, ObjectType } from '../types';
import { generateId } from '../utils/helpers';

export class ToolSystem {
  /**
   * 根据工具模式创建图形
   */
  public static createShape(
    toolMode: ToolMode,
    startPos: Point,
    endPos: Point,
  ): GraphicObject | null {
    switch (toolMode) {
      case ToolMode.Rectangle:
        return this.createRectangle(startPos, endPos);

      case ToolMode.Circle:
        return this.createCircle(startPos, endPos);

      case ToolMode.Line:
        return this.createLine(startPos, endPos);

      case ToolMode.Text:
        return this.createText(startPos);

      default:
        return null;
    }
  }

  /**
   * 创建矩形
   */
  private static createRectangle(startPos: Point, endPos: Point): Rectangle {
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);
    const centerX = (startPos.x + endPos.x) / 2;
    const centerY = (startPos.y + endPos.y) / 2;

    return new Rectangle({
      id: generateId('rect'),
      name: `矩形_${Date.now()}`,
      transform: {
        x: centerX,
        y: centerY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      width: Math.max(width, 10),
      height: Math.max(height, 10),
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
    });
  }

  /**
   * 创建圆形
   */
  private static createCircle(startPos: Point, endPos: Point): Circle {
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    return new Circle({
      id: generateId('circle'),
      name: `圆形_${Date.now()}`,
      transform: {
        x: startPos.x,
        y: startPos.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      radius: Math.max(radius, 5),
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
    });
  }

  /**
   * 创建线条
   */
  private static createLine(startPos: Point, endPos: Point): Line {
    return new Line({
      id: generateId('line'),
      name: `线条_${Date.now()}`,
      transform: {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      points: [startPos, endPos],
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
    });
  }

  /**
   * 创建文本
   */
  private static createText(pos: Point): Text {
    return new Text({
      id: generateId('text'),
      name: `文本_${Date.now()}`,
      transform: {
        x: pos.x,
        y: pos.y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      text: '文本',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: {
        type: 'solid',
        color: '#000000',
        alpha: 1,
      },
    });
  }

  /**
   * 更新正在绘制的图形
   */
  public static updateDrawingShape(
    shape: GraphicObject,
    startPos: Point,
    currentPos: Point,
  ): void {
    const type = shape.type;

    switch (type) {
      case ObjectType.Rectangle:
        this.updateRectangle(shape as Rectangle, startPos, currentPos);
        break;

      case ObjectType.Circle:
        this.updateCircle(shape as Circle, startPos, currentPos);
        break;

      case ObjectType.Line:
        this.updateLine(shape as Line, startPos, currentPos);
        break;
    }
  }

  /**
   * 更新矩形
   */
  private static updateRectangle(
    rect: Rectangle,
    startPos: Point,
    currentPos: Point,
  ): void {
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    const centerX = (startPos.x + currentPos.x) / 2;
    const centerY = (startPos.y + currentPos.y) / 2;

    rect.updateProperties({
      ...rect.getProperties(),
      transform: {
        ...rect.getProperties().transform,
        x: centerX,
        y: centerY,
      },
      width: Math.max(width, 10),
      height: Math.max(height, 10),
    });
  }

  /**
   * 更新圆形
   */
  private static updateCircle(
    circle: Circle,
    startPos: Point,
    currentPos: Point,
  ): void {
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    circle.updateProperties({
      ...circle.getProperties(),
      radius: Math.max(radius, 5),
    });
  }

  /**
   * 更新线条
   */
  private static updateLine(line: Line, startPos: Point, currentPos: Point): void {
    line.updateProperties({
      ...line.getProperties(),
      points: [startPos, currentPos],
    });
  }
}
