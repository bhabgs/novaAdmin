import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';
import { 
  PixiEditorCore, 
  EditorState, 
  ShapeObject, 
  Layer, 
  ToolType, 
  EditorEvents,
  EditorData 
} from '../types';

export class PixiEngine implements PixiEditorCore {
  public app: Application;
  public state: EditorState;
  public objects: Map<string, ShapeObject>;
  private layers: Map<string, Layer>;
  private events: Partial<EditorEvents>;
  private mainContainer: Container;
  private gridContainer: Container;
  private objectContainer: Container;

  constructor(events: Partial<EditorEvents> = {}) {
    this.app = new Application();
    this.objects = new Map();
    this.layers = new Map();
    this.events = events;
    
    // 初始化状态
    this.state = {
      currentTool: ToolType.SELECT,
      selectedObjects: [],
      layers: [],
      activeLayerId: '',
      zoom: 1,
      panX: 0,
      panY: 0,
      canvasWidth: 800,
      canvasHeight: 600,
      gridVisible: true,
      snapToGrid: false,
      gridSize: 20
    };

    // 创建容器层级
    this.mainContainer = new Container();
    this.gridContainer = new Container();
    this.objectContainer = new Container();
  }

  async init(container: HTMLElement): Promise<void> {
    try {
      // 初始化 PIXI 应用
      await this.app.init({
        width: this.state.canvasWidth,
        height: this.state.canvasHeight,
        backgroundColor: 0xffffff,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      // 添加画布到容器
      container.appendChild(this.app.canvas);

      // 设置容器层级
      this.app.stage.addChild(this.mainContainer);
      this.mainContainer.addChild(this.gridContainer);
      this.mainContainer.addChild(this.objectContainer);

      // 创建默认图层
      this.createDefaultLayer();

      // 绘制网格
      this.drawGrid();

      // 设置交互
      this.setupInteraction();

      console.log('PixiJS 编辑器初始化完成');
    } catch (error) {
      console.error('PixiJS 编辑器初始化失败:', error);
      throw error;
    }
  }

  destroy(): void {
    this.app.destroy(true);
    this.objects.clear();
    this.layers.clear();
  }

  setTool(tool: ToolType): void {
    this.state.currentTool = tool;
    this.events.onToolChange?.(tool);
    this.events.onStateChange?.({ currentTool: tool });
  }

  createObject(type: ToolType, x: number, y: number): ShapeObject | null {
    const id = this.generateId();
    const activeLayer = this.layers.get(this.state.activeLayerId);
    
    if (!activeLayer) {
      console.warn('没有活动图层');
      return null;
    }

    let pixiObject: Graphics | Text | Sprite;
    const properties: ShapeObject['properties'] = {
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      alpha: 1
    };

    switch (type) {
      case ToolType.RECTANGLE:
        pixiObject = this.createRectangle(x, y);
        properties.width = 100;
        properties.height = 60;
        properties.fill = '#3b82f6';
        properties.stroke = '#1e40af';
        properties.strokeWidth = 2;
        break;

      case ToolType.CIRCLE:
        pixiObject = this.createCircle(x, y);
        properties.width = 80;
        properties.height = 80;
        properties.fill = '#ef4444';
        properties.stroke = '#dc2626';
        properties.strokeWidth = 2;
        break;

      case ToolType.LINE:
        pixiObject = this.createLine(x, y);
        properties.width = 100;
        properties.height = 0;
        properties.stroke = '#000000';
        properties.strokeWidth = 2;
        break;

      case ToolType.TEXT:
        pixiObject = this.createText(x, y);
        properties.text = '文本';
        properties.fontSize = 24;
        properties.fontFamily = 'Arial';
        properties.fill = '#000000';
        break;

      default:
        return null;
    }

    const shapeObject: ShapeObject = {
      id,
      type,
      layerId: this.state.activeLayerId,
      pixiObject,
      properties
    };

    // 添加到图层容器
    activeLayer.container.addChild(pixiObject);
    
    // 存储对象
    this.objects.set(id, shapeObject);

    // 触发事件
    this.events.onObjectCreate?.(shapeObject);

    return shapeObject;
  }

  selectObjects(objectIds: string[]): void {
    this.state.selectedObjects = objectIds;
    this.events.onObjectSelect?.(objectIds);
    this.events.onStateChange?.({ selectedObjects: objectIds });
  }

  updateObject(objectId: string, properties: Partial<ShapeObject['properties']>): void {
    const object = this.objects.get(objectId);
    if (!object) return;

    // 更新属性
    Object.assign(object.properties, properties);

    // 更新 PIXI 对象
    this.updatePixiObject(object);

    // 触发事件
    this.events.onObjectUpdate?.(objectId, properties);
  }

  deleteObjects(objectIds: string[]): void {
    objectIds.forEach(id => {
      const object = this.objects.get(id);
      if (object) {
        // 从容器中移除
        object.pixiObject.parent?.removeChild(object.pixiObject);
        // 从存储中删除
        this.objects.delete(id);
      }
    });

    // 清除选择
    this.state.selectedObjects = this.state.selectedObjects.filter(
      id => !objectIds.includes(id)
    );

    // 触发事件
    this.events.onObjectDelete?.(objectIds);
    this.events.onStateChange?.({ selectedObjects: this.state.selectedObjects });
  }

  addLayer(name: string, type: Layer['type']): Layer {
    const id = this.generateId();
    const container = new Container();
    
    const layer: Layer = {
      id,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      container,
      type
    };

    this.layers.set(id, layer);
    this.objectContainer.addChild(container);
    
    // 更新状态
    this.state.layers.push(layer);
    if (!this.state.activeLayerId) {
      this.state.activeLayerId = id;
    }

    // 触发事件
    this.events.onLayerCreate?.(layer);
    this.events.onStateChange?.({ layers: this.state.layers, activeLayerId: this.state.activeLayerId });

    return layer;
  }

  updateLayer(layerId: string, updates: Partial<Layer>): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    // 更新图层属性
    Object.assign(layer, updates);

    // 更新容器属性
    if (updates.visible !== undefined) {
      layer.container.visible = updates.visible;
    }
    if (updates.opacity !== undefined) {
      layer.container.alpha = updates.opacity;
    }

    // 更新状态数组
    const index = this.state.layers.findIndex(l => l.id === layerId);
    if (index !== -1) {
      this.state.layers[index] = layer;
    }

    // 触发事件
    this.events.onLayerUpdate?.(layerId, updates);
    this.events.onStateChange?.({ layers: this.state.layers });
  }

  deleteLayer(layerId: string): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;

    // 删除图层中的所有对象
    const objectsToDelete = Array.from(this.objects.values())
      .filter(obj => obj.layerId === layerId)
      .map(obj => obj.id);
    
    this.deleteObjects(objectsToDelete);

    // 移除容器
    this.objectContainer.removeChild(layer.container);
    
    // 从存储中删除
    this.layers.delete(layerId);
    
    // 更新状态
    this.state.layers = this.state.layers.filter(l => l.id !== layerId);
    
    // 如果删除的是活动图层，选择第一个可用图层
    if (this.state.activeLayerId === layerId) {
      this.state.activeLayerId = this.state.layers[0]?.id || '';
    }

    // 触发事件
    this.events.onLayerDelete?.(layerId);
    this.events.onStateChange?.({ 
      layers: this.state.layers, 
      activeLayerId: this.state.activeLayerId 
    });
  }

  setZoom(zoom: number): void {
    this.state.zoom = Math.max(0.1, Math.min(5, zoom));
    this.mainContainer.scale.set(this.state.zoom);
    this.events.onStateChange?.({ zoom: this.state.zoom });
  }

  setPan(x: number, y: number): void {
    this.state.panX = x;
    this.state.panY = y;
    this.mainContainer.position.set(x, y);
    this.events.onStateChange?.({ panX: x, panY: y });
  }

  exportCanvas(format: 'png' | 'jpg' | 'svg'): string {
    // 简化实现，实际项目中需要更复杂的导出逻辑
    const canvas = this.app.canvas;
    return canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`);
  }

  importData(data: EditorData): void {
    // 清除现有数据
    this.objects.clear();
    this.layers.clear();
    this.objectContainer.removeChildren();

    // 导入状态
    this.state = { ...this.state, ...data.state };

    // 导入图层
    data.layers.forEach(layerData => {
      const container = new Container();
      const layer: Layer = {
        ...layerData,
        container
      };
      this.layers.set(layer.id, layer);
      this.objectContainer.addChild(container);
    });

    // 导入对象
    data.objects.forEach(objData => {
      // 重新创建 PIXI 对象
      const pixiObject = this.recreatePixiObject(objData);
      const layer = this.layers.get(objData.layerId);
      
      if (pixiObject && layer) {
        const shapeObject: ShapeObject = {
          ...objData,
          pixiObject
        };
        
        layer.container.addChild(pixiObject);
        this.objects.set(objData.id, shapeObject);
      }
    });

    // 更新显示
    this.drawGrid();
    this.events.onStateChange?.(this.state);
  }

  exportData(): EditorData {
    return {
      version: '1.0.0',
      state: this.state,
      objects: Array.from(this.objects.values()),
      layers: this.state.layers
    };
  }

  private createDefaultLayer(): void {
    this.addLayer('图层 1', 'group');
  }

  private drawGrid(): void {
    this.gridContainer.removeChildren();
    
    if (!this.state.gridVisible) return;

    const grid = new Graphics();
    const { canvasWidth, canvasHeight, gridSize } = this.state;

    grid.stroke({ color: 0xe5e5e5, width: 1 });

    // 绘制垂直线
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      grid.moveTo(x, 0).lineTo(x, canvasHeight);
    }

    // 绘制水平线
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      grid.moveTo(0, y).lineTo(canvasWidth, y);
    }

    this.gridContainer.addChild(grid);
  }

  private setupInteraction(): void {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    
    // 设置画布可交互
    this.objectContainer.eventMode = 'static';
    this.objectContainer.hitArea = this.app.screen;
    
    // 添加对象交互事件
    this.setupObjectInteraction();
  }

  private setupObjectInteraction(): void {
    // 这里可以添加对象选择、拖拽等交互逻辑
    // 暂时留空，后续可以扩展
  }

  private createRectangle(x: number, y: number): Graphics {
    const rect = new Graphics();
    rect.rect(0, 0, 100, 60);
    rect.fill(0x3b82f6);
    rect.stroke({ color: 0x1e40af, width: 2 });
    rect.position.set(x, y);
    return rect;
  }

  private createCircle(x: number, y: number): Graphics {
    const circle = new Graphics();
    circle.circle(40, 40, 40);
    circle.fill(0xef4444);
    circle.stroke({ color: 0xdc2626, width: 2 });
    circle.position.set(x, y);
    return circle;
  }

  private createLine(x: number, y: number): Graphics {
    const line = new Graphics();
    line.moveTo(0, 0).lineTo(100, 0);
    line.stroke({ color: 0x000000, width: 2 });
    line.position.set(x, y);
    return line;
  }

  private createText(x: number, y: number): Text {
    const text = new Text({
      text: '文本',
      style: {
        fontSize: 24,
        fontFamily: 'Arial',
        fill: 0x000000
      }
    });
    text.position.set(x, y);
    return text;
  }

  private updatePixiObject(object: ShapeObject): void {
    const { pixiObject, properties } = object;
    
    // 更新通用属性
    pixiObject.position.set(properties.x, properties.y);
    pixiObject.rotation = properties.rotation;
    pixiObject.scale.set(properties.scaleX, properties.scaleY);
    pixiObject.alpha = properties.alpha;

    // 根据类型更新特定属性
    if (pixiObject instanceof Text && properties.text !== undefined) {
      pixiObject.text = properties.text;
      if (properties.fontSize) {
        pixiObject.style.fontSize = properties.fontSize;
      }
      if (properties.fontFamily) {
        pixiObject.style.fontFamily = properties.fontFamily;
      }
      if (properties.fill) {
        pixiObject.style.fill = properties.fill;
      }
    }
  }

  private recreatePixiObject(objData: ShapeObject): Graphics | Text | Sprite | null {
    const { type, properties } = objData;
    
    switch (type) {
      case ToolType.RECTANGLE:
        return this.createRectangle(properties.x, properties.y);
      case ToolType.CIRCLE:
        return this.createCircle(properties.x, properties.y);
      case ToolType.LINE:
        return this.createLine(properties.x, properties.y);
      case ToolType.TEXT:
        return this.createText(properties.x, properties.y);
      default:
        return null;
    }
  }

  private generateId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}