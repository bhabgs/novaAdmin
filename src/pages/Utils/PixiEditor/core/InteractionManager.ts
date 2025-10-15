/**
 * 交互管理器 - 统一处理对象选择、拖拽、变换等交互
 */

import * as PIXI from 'pixi.js';
import { PixiEngine } from './PixiEngine';
import { GraphicObject } from './GraphicObject';
import { TransformControls } from './TransformControls';
import { ToolSystem } from './ToolSystem';
import { Point, ToolMode } from '../types';

export class InteractionManager {
  private engine: PixiEngine;
  private transformControls: TransformControls;

  // 拖拽状态
  private isDragging: boolean = false;
  private dragStartPos: Point = { x: 0, y: 0 };
  private dragObjectStartPos: Point = { x: 0, y: 0 };

  // 绘制状态
  private isDrawing: boolean = false;
  private drawStartPos: Point = { x: 0, y: 0 };
  private drawingObject: GraphicObject | null = null;

  // 变换状态
  private transformStartState: Map<string, any> = new Map();

  // 框选状态
  private isBoxSelecting: boolean = false;
  private boxSelectStart: Point = { x: 0, y: 0 };
  private selectionBox: PIXI.Graphics;

  constructor(engine: PixiEngine) {
    this.engine = engine;
    this.transformControls = new TransformControls();

    // 添加变换控制器到控制层
    engine.getControlLayer().addChild(this.transformControls.getContainer());

    // 创建框选图形
    this.selectionBox = new PIXI.Graphics();
    engine.getControlLayer().addChild(this.selectionBox);

    // 绑定引擎事件
    this.setupEngineEvents();

    // 监听变换控制器事件
    this.setupTransformEvents();
  }

  /**
   * 设置引擎事件监听
   */
  private setupEngineEvents(): void {
    this.engine.on('pointerdown', this.handlePointerDown.bind(this));
    this.engine.on('pointermove', this.handlePointerMove.bind(this));
    this.engine.on('pointerup', this.handlePointerUp.bind(this));

    // 监听全局的 pointermove 和 pointerup 以支持变换控制器
    const app = this.engine.getApp();
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
  }

  /**
   * 设置变换控制器事件
   */
  private setupTransformEvents(): void {
    this.transformControls.on('transformStart', this.handleTransformStart.bind(this));
    this.transformControls.on('transformMove', this.handleTransformMove.bind(this));
    this.transformControls.on('transformEnd', this.handleTransformEnd.bind(this));
  }

  /**
   * 指针按下事件
   */
  private handlePointerDown(data: any): void {
    const { point, originalEvent } = data;
    const worldPos = this.engine.screenToWorld(point);
    const state = this.engine.getState();

    // 检查是否点击了对象
    const hitObject = this.hitTestObjects(worldPos);

    if (state.toolMode === ToolMode.Select) {
      if (hitObject) {
        // 选中对象
        const multi = originalEvent.ctrlKey || originalEvent.metaKey;
        this.engine.selectObject(hitObject.id, multi);

        // 如果对象未锁定，准备拖拽
        if (!hitObject.getProperties().locked) {
          this.isDragging = true;
          this.dragStartPos = point;
          const props = hitObject.getProperties();
          this.dragObjectStartPos = { x: props.transform.x, y: props.transform.y };
        }
      } else {
        // 点击空白处，开始框选
        this.isBoxSelecting = true;
        this.boxSelectStart = point;
        this.engine.clearSelection();
      }
    } else if (state.toolMode === ToolMode.Hand) {
      // 平移模式已在引擎中处理
    } else {
      // 其他工具模式，开始绘制
      this.startDrawing(worldPos, state.toolMode);
    }
  }

  /**
   * 指针移动事件
   */
  private handlePointerMove(data: any): void {
    const { point } = data;
    const state = this.engine.getState();

    // 首先检查变换控制器是否正在变换
    if (this.transformControls.isTransforming()) {
      this.transformControls.handleMove(point);
      return;
    }

    if (state.toolMode === ToolMode.Select) {
      if (this.isDragging) {
        // 拖拽移动对象
        this.handleDragMove(point);
      } else if (this.isBoxSelecting) {
        // 更新框选矩形
        this.updateSelectionBox(point);
      }
    } else if (state.toolMode !== ToolMode.Hand && this.isDrawing) {
      // 更新正在绘制的图形
      this.updateDrawing(this.engine.screenToWorld(point));
    }
  }

  /**
   * 指针释放事件
   */
  private handlePointerUp(data: any): void {
    const { point } = data;
    const state = this.engine.getState();

    // 处理变换控制器
    if (this.transformControls.isTransforming()) {
      this.transformControls.handleUp();
      return;
    }

    if (this.isDragging) {
      this.isDragging = false;
    }

    if (this.isBoxSelecting) {
      this.finishBoxSelection(point);
      this.isBoxSelecting = false;
    }

    if (this.isDrawing) {
      this.finishDrawing(this.engine.screenToWorld(point));
      this.isDrawing = false;
    }
  }

  /**
   * 碰撞检测 - 查找点击的对象
   */
  private hitTestObjects(worldPos: Point): GraphicObject | null {
    const objects = this.engine.getAllObjects();

    // 从后往前遍历（后添加的在上层）
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (!obj.getProperties().visible) continue;

      const displayObject = obj.getDisplayObject();
      const localPos = displayObject.toLocal(new PIXI.Point(worldPos.x, worldPos.y));

      // 检查是否在对象的边界内
      const bounds = displayObject.getLocalBounds();
      if (
        localPos.x >= bounds.x &&
        localPos.x <= bounds.x + bounds.width &&
        localPos.y >= bounds.y &&
        localPos.y <= bounds.y + bounds.height
      ) {
        return obj;
      }
    }

    return null;
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove(point: Point): void {
    const selectedIds = this.engine.getState().selectedIds;
    if (selectedIds.length === 0) return;

    const dx = point.x - this.dragStartPos.x;
    const dy = point.y - this.dragStartPos.y;

    selectedIds.forEach(id => {
      const obj = this.engine.getObject(id);
      if (obj && !obj.getProperties().locked) {
        const newX = this.dragObjectStartPos.x + dx;
        const newY = this.dragObjectStartPos.y + dy;
        obj.setPosition(newX, newY);
      }
    });

    // 更新变换控制器
    this.transformControls.update();
  }

  /**
   * 更新框选矩形
   */
  private updateSelectionBox(point: Point): void {
    const x1 = Math.min(this.boxSelectStart.x, point.x);
    const y1 = Math.min(this.boxSelectStart.y, point.y);
    const x2 = Math.max(this.boxSelectStart.x, point.x);
    const y2 = Math.max(this.boxSelectStart.y, point.y);

    this.selectionBox.clear();
    this.selectionBox.lineStyle(2, 0x1890ff, 1);
    this.selectionBox.beginFill(0x1890ff, 0.1);
    this.selectionBox.drawRect(x1, y1, x2 - x1, y2 - y1);
    this.selectionBox.endFill();
  }

  /**
   * 完成框选
   */
  private finishBoxSelection(point: Point): void {
    const x1 = Math.min(this.boxSelectStart.x, point.x);
    const y1 = Math.min(this.boxSelectStart.y, point.y);
    const x2 = Math.max(this.boxSelectStart.x, point.x);
    const y2 = Math.max(this.boxSelectStart.y, point.y);

    const worldStart = this.engine.screenToWorld({ x: x1, y: y1 });
    const worldEnd = this.engine.screenToWorld({ x: x2, y: y2 });

    // 找出在框选区域内的所有对象
    const selectedIds: string[] = [];
    this.engine.getAllObjects().forEach(obj => {
      if (!obj.getProperties().visible) return;

      const bounds = obj.getBounds();
      if (
        bounds.x >= worldStart.x &&
        bounds.y >= worldStart.y &&
        bounds.x + bounds.width <= worldEnd.x &&
        bounds.y + bounds.height <= worldEnd.y
      ) {
        selectedIds.push(obj.id);
      }
    });

    // 选中这些对象
    if (selectedIds.length > 0) {
      this.engine.getState().selectedIds = selectedIds;
      this.engine.emit('selectionChanged', { selectedIds });
    }

    // 清除框选矩形
    this.selectionBox.clear();
  }

  /**
   * 开始绘制
   */
  private startDrawing(worldPos: Point, toolMode: ToolMode): void {
    this.isDrawing = true;
    this.drawStartPos = worldPos;

    // 根据工具模式创建对应的图形
    this.drawingObject = ToolSystem.createShape(toolMode, worldPos, worldPos);

    // 如果创建成功，临时添加到画布
    if (this.drawingObject) {
      this.engine.addObject(this.drawingObject);
    }
  }

  /**
   * 更新绘制
   */
  private updateDrawing(worldPos: Point): void {
    if (!this.drawingObject) return;

    // 使用工具系统更新图形
    ToolSystem.updateDrawingShape(this.drawingObject, this.drawStartPos, worldPos);
  }

  /**
   * 完成绘制
   */
  private finishDrawing(worldPos: Point): void {
    if (!this.drawingObject) return;

    // 最后一次更新
    ToolSystem.updateDrawingShape(this.drawingObject, this.drawStartPos, worldPos);

    // 选中新创建的对象
    this.engine.selectObject(this.drawingObject.id, false);

    this.drawingObject = null;
  }

  /**
   * 变换开始
   */
  private handleTransformStart(data: any): void {
    const { target } = data;
    if (target) {
      // 保存变换前的状态
      this.transformStartState.set(target.id, target.serialize());
    }
  }

  /**
   * 变换移动
   */
  private handleTransformMove(data: any): void {
    // 实时更新中，不需要特殊处理
  }

  /**
   * 变换结束
   */
  private handleTransformEnd(data: any): void {
    const { target } = data;
    if (target && this.transformStartState.has(target.id)) {
      // 发出变换完成事件，供历史记录使用
      this.engine.emit('objectTransformed', {
        objectId: target.id,
        beforeState: this.transformStartState.get(target.id),
        afterState: target.serialize(),
      });

      this.transformStartState.delete(target.id);
    }
  }

  /**
   * 更新选择
   */
  public updateSelection(): void {
    const selectedIds = this.engine.getState().selectedIds;

    if (selectedIds.length === 1) {
      const obj = this.engine.getObject(selectedIds[0]);
      this.transformControls.setTarget(obj || null);
    } else if (selectedIds.length > 1) {
      // TODO: 多选时显示组合边界框
      this.transformControls.setTarget(null);
    } else {
      this.transformControls.setTarget(null);
    }
  }

  /**
   * 获取变换控制器
   */
  public getTransformControls(): TransformControls {
    return this.transformControls;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.selectionBox.destroy();
    this.transformControls.destroy();
  }
}
