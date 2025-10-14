import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PixiEngine } from './core/PixiEngine';
import { createGraphicObject } from './core/shapes';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import PropertyPanel from './components/PropertyPanel';
import type {
  ToolType,
  IGraphicObject,
  ObjectType,
  RectangleProperties,
  CircleProperties,
  TextProperties,
  ObjectProperties,
} from './types';
import styles from './index.module.less';

const PixiEditor: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PixiEngine | null>(null);

  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [objects, setObjects] = useState<IGraphicObject[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // 初始化引擎
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = new PixiEngine();
    engineRef.current = engine;

    engine.initialize(canvasRef.current, {
      backgroundColor: 0x1e1e1e,
    }).then(() => {
      console.log('PixiEngine initialized');

      // 监听事件
      engine.on('*', event => {
        console.log('Engine event:', event.type);
      });

      engine.on('history:changed', event => {
        setCanUndo(event.data.canUndo);
        setCanRedo(event.data.canRedo);
      });

      engine.on('view:zoom', event => {
        setZoom(event.data.zoom);
      });

      // 添加示例对象
      addSampleObjects(engine);
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // 添加示例对象
  const addSampleObjects = (engine: PixiEngine) => {
    // 添加矩形
    const rect: RectangleProperties = {
      id: 'rect-1',
      type: 'rectangle' as ObjectType,
      name: '矩形 1',
      position: { x: 200, y: 200 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      alpha: 1,
      visible: true,
      locked: false,
      size: { width: 120, height: 80 },
      fill: 0x4a90e2,
      stroke: { color: 0x2c5aa0, width: 2, style: 'solid' as const },
      cornerRadius: 8,
      zIndex: 1,
    };
    const rectObj = createGraphicObject('rectangle', rect);
    engine.addObject(rectObj);

    // 添加圆形
    const circle: CircleProperties = {
      id: 'circle-1',
      type: 'circle' as ObjectType,
      name: '圆形 1',
      position: { x: 400, y: 200 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      alpha: 1,
      visible: true,
      locked: false,
      size: { width: 100, height: 100 },
      fill: 0x50c878,
      stroke: { color: 0x2d8659, width: 2, style: 'solid' as const },
      radius: 50,
      zIndex: 1,
    };
    const circleObj = createGraphicObject('circle', circle);
    engine.addObject(circleObj);

    // 添加文本
    const text: TextProperties = {
      id: 'text-1',
      type: 'text' as ObjectType,
      name: '文本 1',
      position: { x: 300, y: 350 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      alpha: 1,
      visible: true,
      locked: false,
      size: { width: 200, height: 50 },
      fill: 0xffffff,
      content: 'Hello PixiJS!',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 2,
    };
    const textObj = createGraphicObject('text', text);
    engine.addObject(textObj);

    // 更新对象列表
    setObjects([rectObj, circleObj, textObj]);
  };

  // 创建新对象
  const createObject = useCallback((type: ObjectType) => {
    if (!engineRef.current) return;

    const id = `${type}-${Date.now()}`;
    const baseProps = {
      id,
      type,
      name: `${type} ${id.slice(-4)}`,
      position: { x: 300, y: 300 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      alpha: 1,
      visible: true,
      locked: false,
      zIndex: 1,
    };

    let obj: IGraphicObject;

    switch (type) {
      case 'rectangle': {
        const props: RectangleProperties = {
          ...baseProps,
          type: 'rectangle',
          size: { width: 100, height: 100 },
          fill: 0x4a90e2,
          stroke: { color: 0x2c5aa0, width: 2, style: 'solid' },
          cornerRadius: 0,
        };
        obj = createGraphicObject('rectangle', props);
        break;
      }
      case 'circle': {
        const props: CircleProperties = {
          ...baseProps,
          type: 'circle',
          size: { width: 80, height: 80 },
          fill: 0x50c878,
          stroke: { color: 0x2d8659, width: 2, style: 'solid' },
          radius: 40,
        };
        obj = createGraphicObject('circle', props);
        break;
      }
      case 'text': {
        const props: TextProperties = {
          ...baseProps,
          type: 'text',
          size: { width: 200, height: 50 },
          fill: 0xffffff,
          content: 'New Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'center',
        };
        obj = createGraphicObject('text', props);
        break;
      }
      default:
        return;
    }

    engineRef.current.addObject(obj);
    setObjects(prev => [...prev, obj]);
    setSelectedIds(new Set([id]));
  }, []);

  // 处理工具切换
  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);

    // 如果切换到绘图工具，创建对应的对象
    switch (tool) {
      case 'rectangle':
        createObject('rectangle');
        setCurrentTool('select');
        break;
      case 'circle':
        createObject('circle');
        setCurrentTool('select');
        break;
      case 'text':
        createObject('text');
        setCurrentTool('select');
        break;
    }
  }, [createObject]);

  // 选择对象
  const handleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds(prev => {
      if (multi) {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      }
      return new Set([id]);
    });
  }, []);

  // 切换可见性
  const handleToggleVisible = useCallback((id: string) => {
    if (!engineRef.current) return;
    const obj = engineRef.current.getObject(id);
    if (obj) {
      obj.updateProperties({ visible: !obj.properties.visible });
      setObjects(prev => [...prev]);
    }
  }, []);

  // 切换锁定
  const handleToggleLock = useCallback((id: string) => {
    if (!engineRef.current) return;
    const obj = engineRef.current.getObject(id);
    if (obj) {
      obj.updateProperties({ locked: !obj.properties.locked });
      setObjects(prev => [...prev]);
    }
  }, []);

  // 删除对象
  const handleDelete = useCallback((id: string) => {
    if (!engineRef.current) return;
    engineRef.current.removeObject(id);
    setObjects(prev => prev.filter(obj => obj.id !== id));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // 更新属性
  const handleUpdateProperties = useCallback(
    (id: string, props: Partial<ObjectProperties>) => {
      if (!engineRef.current) return;
      const obj = engineRef.current.getObject(id);
      if (obj) {
        obj.updateProperties(props);
        setObjects(prev => [...prev]);
      }
    },
    []
  );

  // 撤销/重做
  const handleUndo = useCallback(() => {
    engineRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    engineRef.current?.redo();
  }, []);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    if (!engineRef.current) return;
    const viewState = engineRef.current.getViewState();
    engineRef.current.setZoom(viewState.zoom * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!engineRef.current) return;
    const viewState = engineRef.current.getViewState();
    engineRef.current.setZoom(viewState.zoom / 1.2);
  }, []);

  const handleFitScreen = useCallback(() => {
    engineRef.current?.fitToScreen();
  }, []);

  // 动画控制
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 获取选中的对象
  const selectedObjects = objects.filter(obj => selectedIds.has(obj.id));

  return (
    <div className={styles['pixi-editor']}>
      {/* 工具栏 */}
      <Toolbar
        currentTool={currentTool}
        onToolChange={handleToolChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />

      {/* 内容区域 */}
      <div className={styles['pixi-editor-content']}>
        {/* 图层面板 */}
        <LayerPanel
          objects={objects}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onToggleVisible={handleToggleVisible}
          onToggleLock={handleToggleLock}
          onDelete={handleDelete}
        />

        {/* 画布 */}
        <div className={styles['pixi-editor-canvas']} ref={canvasRef} />

        {/* 属性面板 */}
        <PropertyPanel
          selectedObjects={selectedObjects}
          onUpdateProperties={handleUpdateProperties}
        />
      </div>

      {/* 状态栏 */}
      <div className={styles['pixi-editor-status']}>
        <div className={styles['pixi-editor-status-item']}>
          <span className={styles['pixi-editor-status-item-label']}>缩放:</span>
          <span className={styles['pixi-editor-status-item-value']}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <div className={styles['pixi-editor-status-item']}>
          <span className={styles['pixi-editor-status-item-label']}>对象:</span>
          <span className={styles['pixi-editor-status-item-value']}>{objects.length}</span>
        </div>
        <div className={styles['pixi-editor-status-item']}>
          <span className={styles['pixi-editor-status-item-label']}>选中:</span>
          <span className={styles['pixi-editor-status-item-value']}>{selectedIds.size}</span>
        </div>
        <div className={styles['pixi-editor-status-spacer']} />
        <div className={styles['pixi-editor-status-item']}>
          <span className={styles['pixi-editor-status-item-label']}>工具:</span>
          <span className={styles['pixi-editor-status-item-value']}>{currentTool}</span>
        </div>
      </div>
    </div>
  );
};

export default PixiEditor;
