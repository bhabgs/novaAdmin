import React, { useRef, useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { PixiEngine } from './core/PixiEngine';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import PropertyPanel from './components/PropertyPanel';
import { ToolType, ShapeObject, EditorState } from './types';
import styles from './index.module.less';

const PixiEditor: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PixiEngine | null>(null);
  
  // 编辑器状态
  const [editorState, setEditorState] = useState<EditorState>({
    currentTool: ToolType.SELECT,
    selectedObjects: [],
    layers: [],
    activeLayerId: '',
    zoom: 1,
    panX: 0,
    panY: 0,
    canvasWidth: 800,
    canvasHeight: 600,
    gridVisible: false,
    snapToGrid: false,
    gridSize: 20
  });

  const [selectedObjects, setSelectedObjects] = useState<ShapeObject[]>([]);
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  // 初始化编辑器
  useEffect(() => {
    const initEditor = async () => {
      if (canvasRef.current && !engineRef.current) {
        try {
          const engine = new PixiEngine();
          await engine.init(canvasRef.current);
          engineRef.current = engine;

          // 创建默认图层
          const defaultLayer = engine.addLayer('图层 1', 'group');
          setEditorState(prev => ({
            ...prev,
            layers: [defaultLayer],
            activeLayerId: defaultLayer.id
          }));

          message.success('PixiJS 编辑器初始化成功');
        } catch (error) {
          console.error('编辑器初始化失败:', error);
          message.error('编辑器初始化失败');
        }
      }
    };

    initEditor();

    // 清理函数
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // 工具切换
  const handleToolChange = useCallback((tool: ToolType) => {
    if (engineRef.current) {
      engineRef.current.setTool(tool);
      setEditorState(prev => ({ ...prev, currentTool: tool }));
    }
  }, []);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    if (engineRef.current) {
      const newZoom = Math.min(editorState.zoom * 1.2, 5);
      engineRef.current.setZoom(newZoom);
      setEditorState(prev => ({ ...prev, zoom: newZoom }));
    }
  }, [editorState.zoom]);

  const handleZoomOut = useCallback(() => {
    if (engineRef.current) {
      const newZoom = Math.max(editorState.zoom / 1.2, 0.1);
      engineRef.current.setZoom(newZoom);
      setEditorState(prev => ({ ...prev, zoom: newZoom }));
    }
  }, [editorState.zoom]);

  const handleResetZoom = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setZoom(1);
      setEditorState(prev => ({ ...prev, zoom: 1 }));
    }
  }, []);

  // 图层管理
  const handleLayerAdd = useCallback(() => {
    if (engineRef.current) {
      const newLayer = engineRef.current.addLayer(`图层 ${editorState.layers.length + 1}`, 'group');
      setEditorState(prev => ({
        ...prev,
        layers: [...prev.layers, newLayer],
        activeLayerId: newLayer.id
      }));
    }
  }, [editorState.layers.length]);

  const handleLayerSelect = useCallback((layerId: string) => {
    setEditorState(prev => ({ ...prev, activeLayerId: layerId }));
  }, []);

  const handleLayerToggleVisible = useCallback((layerId: string) => {
    if (engineRef.current) {
      const layer = editorState.layers.find(l => l.id === layerId);
      if (layer) {
        const updatedLayer = { ...layer, visible: !layer.visible };
        engineRef.current.updateLayer(layerId, { visible: updatedLayer.visible });
        setEditorState(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === layerId ? updatedLayer : l)
        }));
      }
    }
  }, [editorState.layers]);

  const handleLayerToggleLocked = useCallback((layerId: string) => {
    if (engineRef.current) {
      const layer = editorState.layers.find(l => l.id === layerId);
      if (layer) {
        const updatedLayer = { ...layer, locked: !layer.locked };
        engineRef.current.updateLayer(layerId, { locked: updatedLayer.locked });
        setEditorState(prev => ({
          ...prev,
          layers: prev.layers.map(l => l.id === layerId ? updatedLayer : l)
        }));
      }
    }
  }, [editorState.layers]);

  const handleLayerDelete = useCallback((layerId: string) => {
    if (engineRef.current && editorState.layers.length > 1) {
      engineRef.current.deleteLayer(layerId);
      const remainingLayers = editorState.layers.filter(l => l.id !== layerId);
      setEditorState(prev => ({
        ...prev,
        layers: remainingLayers,
        activeLayerId: remainingLayers[0]?.id || ''
      }));
    }
  }, [editorState.layers]);

  const handleLayerMoveUp = useCallback((layerId: string) => {
    const currentIndex = editorState.layers.findIndex(l => l.id === layerId);
    if (currentIndex > 0) {
      const newLayers = [...editorState.layers];
      [newLayers[currentIndex], newLayers[currentIndex - 1]] = [newLayers[currentIndex - 1], newLayers[currentIndex]];
      setEditorState(prev => ({ ...prev, layers: newLayers }));
    }
  }, [editorState.layers]);

  const handleLayerMoveDown = useCallback((layerId: string) => {
    const currentIndex = editorState.layers.findIndex(l => l.id === layerId);
    if (currentIndex < editorState.layers.length - 1) {
      const newLayers = [...editorState.layers];
      [newLayers[currentIndex], newLayers[currentIndex + 1]] = [newLayers[currentIndex + 1], newLayers[currentIndex]];
      setEditorState(prev => ({ ...prev, layers: newLayers }));
    }
  }, [editorState.layers]);

  const handleLayerRename = useCallback((layerId: string, newName: string) => {
    if (engineRef.current) {
      engineRef.current.updateLayer(layerId, { name: newName });
      setEditorState(prev => ({
        ...prev,
        layers: prev.layers.map(l => l.id === layerId ? { ...l, name: newName } : l)
      }));
    }
  }, []);

  const getLayerObjectCount = useCallback((layerId: string) => {
    if (engineRef.current) {
      // 从引擎中获取该图层的对象数量
      const objects = Array.from(engineRef.current.objects.values());
      return objects.filter(obj => obj.layerId === layerId).length;
    }
    return 0;
  }, []);

  // 画布点击事件处理
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!engineRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 只有在绘制工具时才创建对象
    if ([ToolType.RECTANGLE, ToolType.CIRCLE, ToolType.LINE, ToolType.TEXT].includes(editorState.currentTool)) {
      const newObject = engineRef.current.createObject(editorState.currentTool, x, y);
      if (newObject) {
        message.success(`已创建${getToolName(editorState.currentTool)}`);
        // 自动切换到选择工具
        handleToolChange(ToolType.SELECT);
      }
    }
  }, [editorState.currentTool]);

  // 获取工具名称
  const getToolName = (tool: ToolType): string => {
    switch (tool) {
      case ToolType.RECTANGLE: return '矩形';
      case ToolType.CIRCLE: return '圆形';
      case ToolType.LINE: return '线条';
      case ToolType.TEXT: return '文本';
      default: return '对象';
    }
  };

  // 获取画布样式类名
  const getCanvasClassName = (): string => {
    switch (editorState.currentTool) {
      case ToolType.SELECT: return styles.selectTool;
      case ToolType.PAN: return styles.panTool;
      case ToolType.ZOOM: return styles.zoomTool;
      case ToolType.RECTANGLE:
      case ToolType.CIRCLE:
      case ToolType.LINE:
      case ToolType.TEXT:
        return styles.drawTool;
      default: return '';
    }
  };

  // 属性面板
  const handlePropertyChange = useCallback((objectId: string, property: string, value: string | number | boolean) => {
    if (engineRef.current) {
      engineRef.current.updateObject(objectId, { [property]: value });
      // 更新选中对象状态
      setSelectedObjects(prev => 
        prev.map(obj => 
          obj.id === objectId 
            ? { ...obj, properties: { ...obj.properties, [property]: value } }
            : obj
        )
      );
    }
  }, []);

  // 其他操作
  const handleCopy = useCallback(() => {
    message.info('复制功能开发中...');
  }, []);

  const handleDelete = useCallback(() => {
    if (engineRef.current && editorState.selectedObjects.length > 0) {
      engineRef.current.deleteObjects(editorState.selectedObjects);
      setEditorState(prev => ({ ...prev, selectedObjects: [] }));
      setSelectedObjects([]);
    }
  }, [editorState.selectedObjects]);

  const handleExport = useCallback(() => {
    if (engineRef.current) {
      try {
        const dataUrl = engineRef.current.exportCanvas('png');
        const link = document.createElement('a');
        link.download = 'pixi-editor-export.png';
        link.href = dataUrl;
        link.click();
        message.success('导出成功');
      } catch (error) {
        console.error('导出失败:', error);
        message.error('导出失败');
      }
    }
  }, []);

  const handleImport = useCallback(() => {
    message.info('导入功能开发中...');
  }, []);

  const handleToggleGrid = useCallback(() => {
    setEditorState(prev => ({ ...prev, gridVisible: !prev.gridVisible }));
  }, []);

  const handleUndo = useCallback(() => {
    message.info('撤销功能开发中...');
  }, []);

  const handleRedo = useCallback(() => {
    message.info('重做功能开发中...');
  }, []);

  return (
    <div className={styles.pixiEditor}>
      {/* 工具栏 */}
      <Toolbar
        currentTool={editorState.currentTool}
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onCopy={handleCopy}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        onToggleGrid={handleToggleGrid}
        gridVisible={editorState.gridVisible}
        zoom={editorState.zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 主要内容区域 */}
      <div className={styles.editorContent}>
        {/* 画布区域 */}
          <div className={styles.canvasArea}>
            <div 
              ref={canvasRef} 
              className={`${styles.canvas} ${getCanvasClassName()}`} 
              onClick={handleCanvasClick} 
            />
          </div>

        {/* 图层面板 */}
        <LayerPanel
          layers={editorState.layers}
          selectedLayerId={editorState.activeLayerId}
          onLayerSelect={handleLayerSelect}
          onLayerToggleVisible={handleLayerToggleVisible}
          onLayerToggleLocked={handleLayerToggleLocked}
          onLayerAdd={handleLayerAdd}
          onLayerDelete={handleLayerDelete}
          onLayerMoveUp={handleLayerMoveUp}
          onLayerMoveDown={handleLayerMoveDown}
          onLayerRename={handleLayerRename}
          getLayerObjectCount={getLayerObjectCount}
        />

        {/* 属性面板 */}
        <PropertyPanel
          selectedObjects={selectedObjects}
          onPropertyChange={handlePropertyChange}
        />
      </div>
    </div>
  );
};

export default PixiEditor;
