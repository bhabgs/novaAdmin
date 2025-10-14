import * as PIXI from 'pixi.js';
import type {
  IGraphicObject,
  IConnectionPoint,
  ObjectProperties,
  Point,
  ConnectionType,
} from '../types';

/**
 * 连接点实现
 */
export class ConnectionPoint implements IConnectionPoint {
  id: string;
  parentObjectId: string;
  position: Point;
  type: ConnectionType;
  connectedPipes: string[] = [];
  private parentObject: GraphicObject;

  constructor(
    id: string,
    parentObject: GraphicObject,
    position: Point,
    type: ConnectionType
  ) {
    this.id = id;
    this.parentObjectId = parentObject.id;
    this.parentObject = parentObject;
    this.position = position;
    this.type = type;
  }

  getWorldPosition(): Point {
    const objPos = this.parentObject.properties.position;
    const objRotation = this.parentObject.properties.rotation;
    const objScale = this.parentObject.properties.scale;

    // 应用缩放
    let x = this.position.x * objScale.x;
    let y = this.position.y * objScale.y;

    // 应用旋转
    if (objRotation !== 0) {
      const cos = Math.cos(objRotation);
      const sin = Math.sin(objRotation);
      const rotatedX = x * cos - y * sin;
      const rotatedY = x * sin + y * cos;
      x = rotatedX;
      y = rotatedY;
    }

    // 应用位置
    return {
      x: objPos.x + x,
      y: objPos.y + y,
    };
  }

  canConnectTo(other: IConnectionPoint): boolean {
    // 不能连接到自己
    if (this.id === other.id) return false;

    // 不能连接到同一个父对象
    if (this.parentObjectId === other.parentObjectId) return false;

    // 输入只能连接到输出，输出只能连接到输入
    if (this.type === ConnectionType.INPUT && other.type === ConnectionType.OUTPUT) {
      return true;
    }
    if (this.type === ConnectionType.OUTPUT && other.type === ConnectionType.INPUT) {
      return true;
    }

    // 双向点可以连接到任何类型
    if (this.type === ConnectionType.BIDIRECTIONAL || other.type === ConnectionType.BIDIRECTIONAL) {
      return true;
    }

    return false;
  }
}

/**
 * 图形对象基类
 */
export abstract class GraphicObject implements IGraphicObject {
  id: string;
  properties: ObjectProperties;
  pixiObject: PIXI.Container;
  connectionPoints: IConnectionPoint[] = [];

  protected graphics: PIXI.Graphics;

  constructor(properties: ObjectProperties) {
    this.id = properties.id;
    this.properties = properties;

    // 创建容器
    this.pixiObject = new PIXI.Container();
    this.pixiObject.x = properties.position.x;
    this.pixiObject.y = properties.position.y;
    this.pixiObject.rotation = properties.rotation;
    this.pixiObject.scale.set(properties.scale.x, properties.scale.y);
    this.pixiObject.alpha = properties.alpha;
    this.pixiObject.visible = properties.visible;

    // 创建图形对象
    this.graphics = new PIXI.Graphics();
    this.pixiObject.addChild(this.graphics);

    // 设置交互
    this.pixiObject.eventMode = 'static';
    this.pixiObject.cursor = 'pointer';
  }

  updateProperties(props: Partial<ObjectProperties>): void {
    this.properties = { ...this.properties, ...props };

    // 更新 PIXI 对象属性
    if (props.position) {
      this.pixiObject.x = props.position.x;
      this.pixiObject.y = props.position.y;
    }
    if (props.rotation !== undefined) {
      this.pixiObject.rotation = props.rotation;
    }
    if (props.scale) {
      this.pixiObject.scale.set(props.scale.x, props.scale.y);
    }
    if (props.alpha !== undefined) {
      this.pixiObject.alpha = props.alpha;
    }
    if (props.visible !== undefined) {
      this.pixiObject.visible = props.visible;
    }

    // 重新渲染
    this.render();
  }

  abstract render(): void;

  addConnectionPoint(point: IConnectionPoint): void {
    this.connectionPoints.push(point);
  }

  removeConnectionPoint(pointId: string): void {
    const index = this.connectionPoints.findIndex(p => p.id === pointId);
    if (index > -1) {
      this.connectionPoints.splice(index, 1);
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.pixiObject.destroy({ children: true });
  }

  /**
   * 应用填充样式
   */
  protected applyFill(graphics: PIXI.Graphics): void {
    const { fill } = this.properties;
    if (!fill) return;

    if (typeof fill === 'string' || typeof fill === 'number') {
      // 纯色填充
      graphics.fill(fill);
    } else if ('type' in fill) {
      // 渐变填充
      // TODO: 实现渐变填充
      graphics.fill(0xcccccc);
    }
  }

  /**
   * 应用描边样式
   */
  protected applyStroke(graphics: PIXI.Graphics): void {
    const { stroke } = this.properties;
    if (!stroke) return;

    graphics.stroke({
      color: stroke.color,
      width: stroke.width,
    });
  }
}
