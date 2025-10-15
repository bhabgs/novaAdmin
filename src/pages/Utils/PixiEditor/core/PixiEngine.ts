import * as PIXI from 'pixi.js';
import { HistoryActionType } from '../types';
import { TransformControls } from './TransformControls';
import type {
  EngineConfig,
  IGraphicObject,
  IPipe,
  IConnectionPoint,
  Point,
  ViewState,
  HistoryItem,
  EditorEvent,
} from '../types';

/**
 * PixiJS 渲染引擎核心类
 * 负责管理 PixiJS 应用实例、图形对象、管道系统等
 */
export class PixiEngine {
  private app: PIXI.Application | null = null;
  private container: HTMLElement | null = null;
  private mainContainer: PIXI.Container | null = null;
  private objectsLayer: PIXI.Container | null = null;
  private pipesLayer: PIXI.Container | null = null;
  private overlayLayer: PIXI.Container | null = null;

  // 对象管理
  private objects: Map<string, IGraphicObject> = new Map();
  private pipes: Map<string, IPipe> = new Map();
  private connectionPoints: Map<string, IConnectionPoint> = new Map();

  // 变换控制器
  private transformControls: TransformControls | null = null;
  private selectedObjects: Set<string> = new Set();

  // 视图状态
  private viewState: ViewState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    centerX: 0,
    centerY: 0,
  };

  // 历史记录
  private history: HistoryItem[] = [];
  private historyIndex = -1;
  private maxHistorySize = 100;

  // 事件监听器
  private eventListeners: Map<string, Array<(event: EditorEvent) => void>> = new Map();

  // 初始化标志
  private initialized = false;

  /**
   * 初始化引擎
   */
  async initialize(container: HTMLElement, config: Partial<EngineConfig> = {}): Promise<void> {
    if (this.initialized) {
      console.warn('Engine already initialized');
      return;
    }

    this.container = container;

    const defaultConfig: EngineConfig = {
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      backgroundColor: 0xf0f0f0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      ...config,
    };

    // 创建 PixiJS 应用
    this.app = new PIXI.Application();
    await this.app.init({
      width: defaultConfig.width,
      height: defaultConfig.height,
      backgroundColor: defaultConfig.backgroundColor,
      antialias: defaultConfig.antialias,
      resolution: defaultConfig.resolution,
      autoDensity: defaultConfig.autoDensity,
    });

    // 将画布添加到容器
    container.appendChild(this.app.canvas);

    // 创建图层
    this.setupLayers();

    // 设置交互
    this.setupInteraction();

    // 设置窗口大小监听
    this.setupResize();

    this.initialized = true;

    this.emit({
      type: 'engine:initialized',
      timestamp: Date.now(),
    });
  }

  /**
   * 设置图层结构
   */
  private setupLayers(): void {
    if (!this.app) return;

    // 主容器（用于缩放和平移）
    this.mainContainer = new PIXI.Container();
    this.app.stage.addChild(this.mainContainer);

    // 管道图层（在底层）
    this.pipesLayer = new PIXI.Container();
    this.mainContainer.addChild(this.pipesLayer);

    // 对象图层（在中层）
    this.objectsLayer = new PIXI.Container();
    this.mainContainer.addChild(this.objectsLayer);

    // 覆盖图层（用于选择框、控制点等）
    this.overlayLayer = new PIXI.Container();
    this.mainContainer.addChild(this.overlayLayer);

    // 创建变换控制器
    this.transformControls = new TransformControls(this.overlayLayer);
  }

  /**
   * 设置交互事件
   */
  private setupInteraction(): void {
    if (!this.app || !this.mainContainer) return;

    const stage = this.app.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.app.screen;

    // 鼠标滚轮缩放
    this.app.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 添加到 ticker 用于动画更新
    this.app.ticker.add(this.update.bind(this));
  }

  /**
   * 处理滚轮缩放
   */
  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.mainContainer) return;

    const delta = -event.deltaY;
    const zoomFactor = 1.1;
    const oldZoom = this.viewState.zoom;

    // 计算新的缩放级别
    const newZoom = delta > 0
      ? Math.min(oldZoom * zoomFactor, 5) // 最大5倍
      : Math.max(oldZoom / zoomFactor, 0.1); // 最小0.1倍

    // 计算鼠标位置
    const rect = this.app!.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 计算缩放中心点
    const worldX = (mouseX - this.mainContainer.x) / oldZoom;
    const worldY = (mouseY - this.mainContainer.y) / oldZoom;

    // 更新视图状态
    this.viewState.zoom = newZoom;
    this.mainContainer.scale.set(newZoom);

    // 调整平移以保持鼠标位置不变
    this.mainContainer.x = mouseX - worldX * newZoom;
    this.mainContainer.y = mouseY - worldY * newZoom;

    this.viewState.panX = this.mainContainer.x;
    this.viewState.panY = this.mainContainer.y;

    this.emit({
      type: 'view:zoom',
      data: { zoom: newZoom },
      timestamp: Date.now(),
    });
  }

  /**
   * 设置窗口大小调整
   */
  private setupResize(): void {
    if (!this.container) return;

    const resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    resizeObserver.observe(this.container);
  }

  /**
   * 调整画布大小
   */
  resize(): void {
    if (!this.app || !this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.app.renderer.resize(width, height);

    this.emit({
      type: 'view:resize',
      data: { width, height },
      timestamp: Date.now(),
    });
  }

  /**
   * 更新循环（每帧调用）
   */
  private update(): void {
    // 更新变换控制器
    if (this.transformControls) {
      this.transformControls.update();
    }

    // 这里可以添加动画更新逻辑
    // 例如：管道流动动画、粒子效果等
  }

  /**
   * 添加图形对象
   */
  addObject(object: IGraphicObject): void {
    if (this.objects.has(object.id)) {
      console.warn(`Object with id ${object.id} already exists`);
      return;
    }

    this.objects.set(object.id, object);

    // 添加到对象图层
    if (this.objectsLayer) {
      this.objectsLayer.addChild(object.pixiObject);
    }

    // 注册连接点
    object.connectionPoints.forEach(point => {
      this.connectionPoints.set(point.id, point);
    });

    // 记录历史
    this.addHistory({
      type: HistoryActionType.CREATE,
      timestamp: Date.now(),
      objectId: object.id,
      afterState: object.properties,
      description: `Create ${object.properties.type}`,
    });

    this.emit({
      type: 'object:added',
      data: { objectId: object.id },
      timestamp: Date.now(),
    });
  }

  /**
   * 移除图形对象
   */
  removeObject(objectId: string): void {
    const object = this.objects.get(objectId);
    if (!object) return;

    // 移除相关的管道
    const relatedPipes = Array.from(this.pipes.values()).filter(
      pipe => pipe.startPointId === objectId || pipe.endPointId === objectId
    );
    relatedPipes.forEach(pipe => this.removePipe(pipe.id));

    // 移除连接点
    object.connectionPoints.forEach(point => {
      this.connectionPoints.delete(point.id);
    });

    // 从图层中移除
    if (this.objectsLayer) {
      this.objectsLayer.removeChild(object.pixiObject);
    }

    // 销毁对象
    object.destroy();

    // 从集合中移除
    this.objects.delete(objectId);

    // 记录历史
    this.addHistory({
      type: HistoryActionType.DELETE,
      timestamp: Date.now(),
      objectId,
      beforeState: object.properties,
      description: `Delete ${object.properties.type}`,
    });

    this.emit({
      type: 'object:removed',
      data: { objectId },
      timestamp: Date.now(),
    });
  }

  /**
   * 获取图形对象
   */
  getObject(objectId: string): IGraphicObject | undefined {
    return this.objects.get(objectId);
  }

  /**
   * 获取所有对象
   */
  getAllObjects(): IGraphicObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * 设置选中对象
   */
  setSelectedObjects(ids: Set<string>): void {
    this.selectedObjects = ids;

    // 更新变换控制器
    if (this.transformControls) {
      if (ids.size === 1) {
        const id = Array.from(ids)[0];
        const obj = this.objects.get(id);
        this.transformControls.setTarget(obj || null);
      } else {
        // 多选或无选中时隐藏控制器
        this.transformControls.setTarget(null);
      }
    }
  }

  /**
   * 获取变换控制器
   */
  getTransformControls(): TransformControls | null {
    return this.transformControls;
  }

  /**
   * 添加管道
   */
  addPipe(pipe: IPipe): void {
    if (this.pipes.has(pipe.id)) {
      console.warn(`Pipe with id ${pipe.id} already exists`);
      return;
    }

    this.pipes.set(pipe.id, pipe);

    // 这里需要创建管道的 Graphics 对象并添加到管道图层
    // 具体实现将在 Pipe 类中完成

    this.emit({
      type: 'pipe:added',
      data: { pipeId: pipe.id },
      timestamp: Date.now(),
    });
  }

  /**
   * 移除管道
   */
  removePipe(pipeId: string): void {
    const pipe = this.pipes.get(pipeId);
    if (!pipe) return;

    this.pipes.delete(pipeId);

    this.emit({
      type: 'pipe:removed',
      data: { pipeId },
      timestamp: Date.now(),
    });
  }

  /**
   * 获取管道
   */
  getPipe(pipeId: string): IPipe | undefined {
    return this.pipes.get(pipeId);
  }

  /**
   * 添加历史记录
   */
  private addHistory(item: HistoryItem): void {
    // 如果不在历史记录末尾，删除后面的记录
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(item);
    this.historyIndex++;

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }

    this.emit({
      type: 'history:changed',
      data: { canUndo: this.canUndo(), canRedo: this.canRedo() },
      timestamp: Date.now(),
    });
  }

  /**
   * 撤销
   */
  undo(): void {
    if (!this.canUndo()) return;

    const item = this.history[this.historyIndex];
    // TODO: 实现具体的撤销逻辑
    this.historyIndex--;

    this.emit({
      type: 'history:undo',
      data: item,
      timestamp: Date.now(),
    });
  }

  /**
   * 重做
   */
  redo(): void {
    if (!this.canRedo()) return;

    this.historyIndex++;
    const item = this.history[this.historyIndex];
    // TODO: 实现具体的重做逻辑

    this.emit({
      type: 'history:redo',
      data: item,
      timestamp: Date.now(),
    });
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * 获取视图状态
   */
  getViewState(): ViewState {
    return { ...this.viewState };
  }

  /**
   * 设置视图缩放
   */
  setZoom(zoom: number, center?: Point): void {
    if (!this.mainContainer) return;

    const clampedZoom = Math.max(0.1, Math.min(5, zoom));
    const oldZoom = this.viewState.zoom;

    if (center) {
      // 以指定点为中心缩放
      const worldX = (center.x - this.mainContainer.x) / oldZoom;
      const worldY = (center.y - this.mainContainer.y) / oldZoom;

      this.mainContainer.scale.set(clampedZoom);
      this.mainContainer.x = center.x - worldX * clampedZoom;
      this.mainContainer.y = center.y - worldY * clampedZoom;

      this.viewState.panX = this.mainContainer.x;
      this.viewState.panY = this.mainContainer.y;
    } else {
      this.mainContainer.scale.set(clampedZoom);
    }

    this.viewState.zoom = clampedZoom;

    this.emit({
      type: 'view:zoom',
      data: { zoom: clampedZoom },
      timestamp: Date.now(),
    });
  }

  /**
   * 设置视图平移
   */
  setPan(x: number, y: number): void {
    if (!this.mainContainer) return;

    this.mainContainer.x = x;
    this.mainContainer.y = y;
    this.viewState.panX = x;
    this.viewState.panY = y;

    this.emit({
      type: 'view:pan',
      data: { x, y },
      timestamp: Date.now(),
    });
  }

  /**
   * 适应窗口大小
   */
  fitToScreen(): void {
    if (!this.app || !this.mainContainer || this.objects.size === 0) return;

    // 计算所有对象的边界
    const bounds = this.objectsLayer!.getBounds();

    if (bounds.width === 0 || bounds.height === 0) return;

    const padding = 50;
    const screenWidth = this.app.screen.width - padding * 2;
    const screenHeight = this.app.screen.height - padding * 2;

    const scaleX = screenWidth / bounds.width;
    const scaleY = screenHeight / bounds.height;
    const newZoom = Math.min(scaleX, scaleY, 1);

    // 计算居中位置
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    const boundsX = bounds.x + bounds.width / 2;
    const boundsY = bounds.y + bounds.height / 2;

    this.mainContainer.scale.set(newZoom);
    this.mainContainer.x = centerX - boundsX * newZoom;
    this.mainContainer.y = centerY - boundsY * newZoom;

    this.viewState.zoom = newZoom;
    this.viewState.panX = this.mainContainer.x;
    this.viewState.panY = this.mainContainer.y;

    this.emit({
      type: 'view:fit',
      timestamp: Date.now(),
    });
  }

  /**
   * 监听事件
   */
  on(eventType: string, callback: (event: EditorEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * 移除事件监听
   */
  off(eventType: string, callback: (event: EditorEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: EditorEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // 触发通用事件监听器
    const allListeners = this.eventListeners.get('*');
    if (allListeners) {
      allListeners.forEach(callback => callback(event));
    }
  }

  /**
   * 清空画布
   */
  clear(): void {
    // 移除所有对象
    Array.from(this.objects.keys()).forEach(id => this.removeObject(id));

    // 移除所有管道
    Array.from(this.pipes.keys()).forEach(id => this.removePipe(id));

    // 清空历史记录
    this.history = [];
    this.historyIndex = -1;

    this.emit({
      type: 'editor:cleared',
      timestamp: Date.now(),
    });
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (!this.initialized) return;

    // 清空所有对象
    this.clear();

    // 销毁变换控制器
    if (this.transformControls) {
      this.transformControls.destroy();
      this.transformControls = null;
    }

    // 销毁 PixiJS 应用
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }

    // 清空引用
    this.container = null;
    this.mainContainer = null;
    this.objectsLayer = null;
    this.pipesLayer = null;
    this.overlayLayer = null;
    this.eventListeners.clear();

    this.initialized = false;

    this.emit({
      type: 'engine:destroyed',
      timestamp: Date.now(),
    });
  }

  /**
   * 获取对象图层
   */
  getObjectsLayer(): PIXI.Container | null {
    return this.objectsLayer;
  }

  /**
   * 获取管道图层
   */
  getPipesLayer(): PIXI.Container | null {
    return this.pipesLayer;
  }

  /**
   * 获取覆盖图层
   */
  getOverlayLayer(): PIXI.Container | null {
    return this.overlayLayer;
  }

  /**
   * 获取应用实例
   */
  getApp(): PIXI.Application | null {
    return this.app;
  }
}
