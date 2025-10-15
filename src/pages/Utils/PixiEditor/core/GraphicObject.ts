/**
 * 图形对象基类
 */

import * as PIXI from 'pixi.js';
import { EventEmitter } from './EventEmitter';
import { ObjectProperties, Point, ObjectType, Transform } from '../types';
import { generateId, deepClone } from '../utils/helpers';

export abstract class GraphicObject extends EventEmitter {
  public id: string;
  public type: ObjectType;
  protected properties: ObjectProperties;
  protected displayObject: PIXI.Container;
  protected graphics: PIXI.Graphics;
  protected isDragging: boolean = false;

  constructor(type: ObjectType, properties: Partial<ObjectProperties>) {
    super();

    this.id = properties.id || generateId('obj');
    this.type = type;

    // 设置默认属性
    this.properties = {
      id: this.id,
      type,
      name: properties.name || `${type}_${this.id}`,
      transform: properties.transform || {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      visible: properties.visible !== undefined ? properties.visible : true,
      locked: properties.locked || false,
      opacity: properties.opacity !== undefined ? properties.opacity : 1,
      zIndex: properties.zIndex || 0,
      ...properties,
    };

    // 创建显示对象容器
    this.displayObject = new PIXI.Container();
    this.displayObject.eventMode = 'static';
    this.displayObject.cursor = 'pointer';

    // 创建图形绘制对象
    this.graphics = new PIXI.Graphics();
    this.displayObject.addChild(this.graphics);

    // 应用变换
    this.applyTransform();

    // 绑定交互事件
    this.setupInteraction();
  }

  /**
   * 设置交互事件
   */
  protected setupInteraction(): void {
    this.displayObject.on('pointerdown', this.onPointerDown.bind(this));
    this.displayObject.on('pointerup', this.onPointerUp.bind(this));
    this.displayObject.on('pointerupoutside', this.onPointerUp.bind(this));
    this.displayObject.on('pointermove', this.onPointerMove.bind(this));
    this.displayObject.on('pointerover', this.onPointerOver.bind(this));
    this.displayObject.on('pointerout', this.onPointerOut.bind(this));
  }

  /**
   * 指针按下
   */
  protected onPointerDown(e: PIXI.FederatedPointerEvent): void {
    if (this.properties.locked) return;

    this.isDragging = true;
    this.emit('pointerdown', { event: e, object: this });
    e.stopPropagation();
  }

  /**
   * 指针释放
   */
  protected onPointerUp(e: PIXI.FederatedPointerEvent): void {
    this.isDragging = false;
    this.emit('pointerup', { event: e, object: this });
  }

  /**
   * 指针移动
   */
  protected onPointerMove(e: PIXI.FederatedPointerEvent): void {
    this.emit('pointermove', { event: e, object: this });
  }

  /**
   * 指针悬停
   */
  protected onPointerOver(e: PIXI.FederatedPointerEvent): void {
    if (!this.properties.locked) {
      this.displayObject.cursor = 'move';
    }
    this.emit('pointerover', { event: e, object: this });
  }

  /**
   * 指针移出
   */
  protected onPointerOut(e: PIXI.FederatedPointerEvent): void {
    this.displayObject.cursor = 'pointer';
    this.emit('pointerout', { event: e, object: this });
  }

  /**
   * 应用变换
   */
  protected applyTransform(): void {
    const { transform, visible, opacity, zIndex } = this.properties;

    this.displayObject.position.set(transform.x, transform.y);
    this.displayObject.scale.set(transform.scaleX, transform.scaleY);
    this.displayObject.rotation = transform.rotation;
    this.displayObject.visible = visible;
    this.displayObject.alpha = opacity;
    this.displayObject.zIndex = zIndex;

    if (transform.skewX !== undefined) {
      this.displayObject.skew.x = transform.skewX;
    }
    if (transform.skewY !== undefined) {
      this.displayObject.skew.y = transform.skewY;
    }
  }

  /**
   * 渲染图形（抽象方法，由子类实现）
   */
  protected abstract render(): void;

  /**
   * 更新属性
   */
  public updateProperties(props: Partial<ObjectProperties>): void {
    this.properties = { ...this.properties, ...props };
    this.applyTransform();
    this.render();
    this.emit('propertiesUpdated', { properties: this.properties });
  }

  /**
   * 获取属性
   */
  public getProperties(): ObjectProperties {
    return deepClone(this.properties);
  }

  /**
   * 获取显示对象
   */
  public getDisplayObject(): PIXI.Container {
    return this.displayObject;
  }

  /**
   * 获取边界框
   */
  public getBounds(): PIXI.Rectangle {
    return this.displayObject.getBounds();
  }

  /**
   * 设置位置
   */
  public setPosition(x: number, y: number): void {
    this.updateProperties({
      ...this.properties,
      transform: { ...this.properties.transform, x, y },
    });
  }

  /**
   * 设置缩放
   */
  public setScale(scaleX: number, scaleY?: number): void {
    this.updateProperties({
      ...this.properties,
      transform: {
        ...this.properties.transform,
        scaleX,
        scaleY: scaleY !== undefined ? scaleY : scaleX,
      },
    });
  }

  /**
   * 设置旋转
   */
  public setRotation(rotation: number): void {
    this.updateProperties({
      ...this.properties,
      transform: { ...this.properties.transform, rotation },
    });
  }

  /**
   * 设置可见性
   */
  public setVisible(visible: boolean): void {
    this.updateProperties({ ...this.properties, visible });
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.displayObject.destroy({ children: true });
    this.removeAllListeners();
  }

  /**
   * 克隆
   */
  public abstract clone(): GraphicObject;

  /**
   * 序列化
   */
  public serialize(): ObjectProperties {
    return this.getProperties();
  }
}
