/**
 * PixiJS 渲染引擎核心类
 */

import * as PIXI from 'pixi.js';
import { GraphicObject } from './GraphicObject';
import { Pipe } from './Pipe';
import { ConnectionPoint } from './ConnectionPoint';
import { EventEmitter } from './EventEmitter';
import {
  Point,
  EditorState,
  ToolMode,
  ObjectProperties,
  PipeConfig,
  ConnectionPointConfig,
} from '../types';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_BACKGROUND_COLOR,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_GRID_SIZE,
  GRID_COLOR,
  GRID_ALPHA,
} from '../utils/constants';
import { clamp, generateId } from '../utils/helpers';

export class PixiEngine extends EventEmitter {
  private app: PIXI.Application;
  private container: HTMLElement;

  // 图层容器
  private backgroundLayer: PIXI.Container;
  private gridLayer: PIXI.Graphics;
  private objectLayer: PIXI.Container;
  private pipeLayer: PIXI.Container;
  private controlLayer: PIXI.Container;
  private uiLayer: PIXI.Container;

  // 数据管理
  private objects: Map<string, GraphicObject>;
  private pipes: Map<string, Pipe>;
  private connectionPoints: Map<string, ConnectionPoint>;

  // 编辑器状态
  private state: EditorState;

  // 视图变换
  private viewport: PIXI.Container;
  private isDragging: boolean = false;
  private lastMousePos: Point = { x: 0, y: 0 };

  private constructor(container: HTMLElement, width?: number, height?: number) {
    super();

    this.container = container;
    this.objects = new Map();
    this.pipes = new Map();
    this.connectionPoints = new Map();

    // 初始化状态
    this.state = {
      toolMode: ToolMode.Select,
      selectedIds: [],
      hoveredId: null,
      clipboardData: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      gridEnabled: true,
      gridSize: DEFAULT_GRID_SIZE,
      snapEnabled: true,
      snapThreshold: 10,
    };

    // 初始化图层（在 init 中创建应用后使用）
    this.viewport = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.gridLayer = new PIXI.Graphics();
    this.objectLayer = new PIXI.Container();
    this.pipeLayer = new PIXI.Container();
    this.controlLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();

    // app 会在 init 方法中初始化
    this.app = null as any;
  }

  /**
   * 静态异步工厂方法
   */
  public static async create(
    container: HTMLElement,
    width?: number,
    height?: number,
  ): Promise<PixiEngine> {
    const engine = new PixiEngine(container, width, height);
    await engine.init(width, height);
    return engine;
  }

  /**
   * 异步初始化 PixiJS 应用
   */
  private async init(width?: number, height?: number): Promise<void> {
    // 创建 PixiJS 应用（v7+ 需要异步初始化）
    this.app = new PIXI.Application();

    await this.app.init({
      width: width || DEFAULT_CANVAS_WIDTH,
      height: height || DEFAULT_CANVAS_HEIGHT,
      background: DEFAULT_BACKGROUND_COLOR,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // 挂载到容器
    this.container.appendChild(this.app.canvas);

    // 设置图层层级
    this.viewport.addChild(this.backgroundLayer);
    this.viewport.addChild(this.gridLayer);
    this.viewport.addChild(this.pipeLayer);
    this.viewport.addChild(this.objectLayer);
    this.viewport.addChild(this.controlLayer);

    this.app.stage.addChild(this.viewport);
    this.app.stage.addChild(this.uiLayer);

    // 启用交互
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.app.screen.width,
      this.app.screen.height,
    );

    // 初始化网格
    this.drawGrid();

    // 绑定事件
    this.setupEvents();

    // 启动渲染循环
    this.app.ticker.add(this.update.bind(this));
  }

  /**
   * 设置事件监听
   */
  private setupEvents(): void {
    // 鼠标滚轮缩放
    this.app.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 鼠标事件
    this.app.stage.on('pointerdown', this.handlePointerDown.bind(this));
    this.app.stage.on('pointermove', this.handlePointerMove.bind(this));
    this.app.stage.on('pointerup', this.handlePointerUp.bind(this));
  }

  /**
   * 渲染循环更新
   */
  private update(delta: number): void {
    // 更新所有管道的动画
    this.pipes.forEach((pipe) => {
      if (pipe.hasAnimation()) {
        pipe.updateAnimation(delta);
      }
    });

    // 触发更新事件
    this.emit('update', { delta });
  }

  /**
   * 绘制网格
   */
  private drawGrid(): void {
    if (!this.state.gridEnabled) {
      this.gridLayer.clear();
      return;
    }

    const { width, height } = this.app.screen;
    const gridSize = this.state.gridSize;

    this.gridLayer.clear();
    this.gridLayer.lineStyle(1, GRID_COLOR, GRID_ALPHA);

    // 绘制垂直线
    for (let x = 0; x <= width; x += gridSize) {
      this.gridLayer.moveTo(x, 0);
      this.gridLayer.lineTo(x, height);
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += gridSize) {
      this.gridLayer.moveTo(0, y);
      this.gridLayer.lineTo(width, y);
    }
  }

  /**
   * 鼠标滚轮事件处理
   */
  private handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = clamp(this.state.zoom + delta, MIN_ZOOM, MAX_ZOOM);

    // 以鼠标位置为中心缩放
    const mousePos = this.getMousePosition(e);
    this.zoomAt(mousePos, newZoom);
  }

  /**
   * 指针按下事件
   */
  private handlePointerDown(e: PIXI.FederatedPointerEvent): void {
    const point = { x: e.global.x, y: e.global.y };
    this.lastMousePos = point;

    // 空格键按下时使用平移工具
    if (this.state.toolMode === ToolMode.Hand) {
      this.isDragging = true;
      this.app.canvas.style.cursor = 'grabbing';
      return;
    }

    this.emit('pointerdown', { point, originalEvent: e });
  }

  /**
   * 指针移动事件
   */
  private handlePointerMove(e: PIXI.FederatedPointerEvent): void {
    const point = { x: e.global.x, y: e.global.y };

    // 画布平移
    if (this.isDragging) {
      const dx = point.x - this.lastMousePos.x;
      const dy = point.y - this.lastMousePos.y;

      this.viewport.x += dx;
      this.viewport.y += dy;

      this.state.pan = {
        x: this.viewport.x,
        y: this.viewport.y,
      };
    }

    this.lastMousePos = point;
    this.emit('pointermove', { point, originalEvent: e });
  }

  /**
   * 指针释放事件
   */
  private handlePointerUp(e: PIXI.FederatedPointerEvent): void {
    const point = { x: e.global.x, y: e.global.y };

    if (this.isDragging) {
      this.isDragging = false;
      this.app.canvas.style.cursor = 'grab';
    }

    this.emit('pointerup', { point, originalEvent: e });
  }

  /**
   * 获取鼠标位置
   */
  private getMousePosition(e: MouseEvent | WheelEvent): Point {
    const rect = this.app.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  /**
   * 在指定位置缩放
   */
  private zoomAt(point: Point, zoom: number): void {
    const oldZoom = this.state.zoom;
    this.state.zoom = zoom;

    // 计算缩放中心
    const worldPos = this.screenToWorld(point);

    this.viewport.scale.set(zoom);

    // 调整平移以保持缩放中心不变
    const newScreenPos = this.worldToScreen(worldPos);
    this.viewport.x += point.x - newScreenPos.x;
    this.viewport.y += point.y - newScreenPos.y;

    this.state.pan = {
      x: this.viewport.x,
      y: this.viewport.y,
    };

    this.emit('zoom', { zoom, oldZoom });
  }

  /**
   * 屏幕坐标转世界坐标
   */
  public screenToWorld(point: Point): Point {
    return {
      x: (point.x - this.viewport.x) / this.state.zoom,
      y: (point.y - this.viewport.y) / this.state.zoom,
    };
  }

  /**
   * 世界坐标转屏幕坐标
   */
  public worldToScreen(point: Point): Point {
    return {
      x: point.x * this.state.zoom + this.viewport.x,
      y: point.y * this.state.zoom + this.viewport.y,
    };
  }

  // ============= 公共API =============

  /**
   * 添加图形对象
   */
  public addObject(object: GraphicObject): void {
    this.objects.set(object.id, object);
    this.objectLayer.addChild(object.getDisplayObject());

    this.emit('objectAdded', { object });
  }

  /**
   * 移除图形对象
   */
  public removeObject(id: string): void {
    const object = this.objects.get(id);
    if (object) {
      this.objectLayer.removeChild(object.getDisplayObject());
      this.objects.delete(id);

      // 移除相关的连接点
      const points = this.getObjectConnectionPoints(id);
      points.forEach(point => this.connectionPoints.delete(point.id));

      this.emit('objectRemoved', { id, object });
    }
  }

  /**
   * 获取对象
   */
  public getObject(id: string): GraphicObject | undefined {
    return this.objects.get(id);
  }

  /**
   * 获取所有对象
   */
  public getAllObjects(): GraphicObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * 添加管道
   */
  public addPipe(pipe: Pipe): void {
    this.pipes.set(pipe.id, pipe);
    this.pipeLayer.addChild(pipe.getDisplayObject());

    this.emit('pipeAdded', { pipe });
  }

  /**
   * 移除管道
   */
  public removePipe(id: string): void {
    const pipe = this.pipes.get(id);
    if (pipe) {
      this.pipeLayer.removeChild(pipe.getDisplayObject());
      this.pipes.delete(id);

      this.emit('pipeRemoved', { id, pipe });
    }
  }

  /**
   * 获取管道
   */
  public getPipe(id: string): Pipe | undefined {
    return this.pipes.get(id);
  }

  /**
   * 添加连接点
   */
  public addConnectionPoint(point: ConnectionPoint): void {
    this.connectionPoints.set(point.id, point);
    this.emit('connectionPointAdded', { point });
  }

  /**
   * 获取对象的所有连接点
   */
  public getObjectConnectionPoints(objectId: string): ConnectionPoint[] {
    return Array.from(this.connectionPoints.values()).filter(
      p => p.parentId === objectId
    );
  }

  /**
   * 设置工具模式
   */
  public setToolMode(mode: ToolMode): void {
    this.state.toolMode = mode;

    // 更新光标
    if (mode === ToolMode.Hand) {
      this.app.canvas.style.cursor = 'grab';
    } else {
      this.app.canvas.style.cursor = 'default';
    }

    this.emit('toolModeChanged', { mode });
  }

  /**
   * 获取编辑器状态
   */
  public getState(): EditorState {
    return { ...this.state };
  }

  /**
   * 选择对象
   */
  public selectObject(id: string, multi: boolean = false): void {
    if (multi) {
      if (this.state.selectedIds.includes(id)) {
        this.state.selectedIds = this.state.selectedIds.filter(i => i !== id);
      } else {
        this.state.selectedIds.push(id);
      }
    } else {
      this.state.selectedIds = [id];
    }

    this.emit('selectionChanged', { selectedIds: this.state.selectedIds });
  }

  /**
   * 清除选择
   */
  public clearSelection(): void {
    this.state.selectedIds = [];
    this.emit('selectionChanged', { selectedIds: [] });
  }

  /**
   * 设置缩放
   */
  public setZoom(zoom: number): void {
    const center = {
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2,
    };
    this.zoomAt(center, clamp(zoom, MIN_ZOOM, MAX_ZOOM));
  }

  /**
   * 适应视图
   */
  public fitView(): void {
    // TODO: 实现适应视图逻辑
  }

  /**
   * 导出为图片
   */
  public async exportAsImage(format: 'png' | 'jpg' = 'png'): Promise<string> {
    try {
      const base64 = await this.app.renderer.extract.base64(this.app.stage);
      return base64;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * 清空画布
   */
  public clear(): void {
    this.objects.forEach(obj => this.removeObject(obj.id));
    this.pipes.forEach(pipe => this.removePipe(pipe.id));
    this.connectionPoints.clear();
    this.clearSelection();
  }

  /**
   * 销毁引擎
   */
  public destroy(): void {
    this.clear();
    this.app.destroy(true, { children: true });
    this.removeAllListeners();
  }

  /**
   * 调整大小
   */
  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);
    this.drawGrid();
    this.emit('resize', { width, height });
  }

  /**
   * 获取 PIXI 应用实例
   */
  public getApp(): PIXI.Application {
    return this.app;
  }

  /**
   * 获取对象图层
   */
  public getObjectLayer(): PIXI.Container {
    return this.objectLayer;
  }

  /**
   * 获取管道图层
   */
  public getPipeLayer(): PIXI.Container {
    return this.pipeLayer;
  }

  /**
   * 获取控制图层
   */
  public getControlLayer(): PIXI.Container {
    return this.controlLayer;
  }
}
