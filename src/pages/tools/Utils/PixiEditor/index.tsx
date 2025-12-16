/**
 * PixiEditor 主入口组件
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { message } from "antd";
import { PixiEngine } from "./core/PixiEngine";
import { InteractionManager } from "./core/InteractionManager";
import { Rectangle, Circle, Text } from "./core/shapes";
import { HistoryManager } from "./core/HistoryManager";

import Toolbar from "./components/Toolbar";
import LayerPanel from "./components/LayerPanel";
import PropertyPanel from "./components/PropertyPanel";
import { ToolMode, LayerNode, ObjectProperties, ActionType } from "./types";
import styles from "./index.module.less";

const PixiEditor: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PixiEngine | null>(null);
  const interactionRef = useRef<InteractionManager | null>(null);
  const historyRef = useRef<HistoryManager>(new HistoryManager());

  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.Select);
  const [layers, setLayers] = useState<LayerNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<ObjectProperties[]>(
    []
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 初始化编辑器
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    let mounted = true;

    const initEngine = async () => {
      try {
        const engine = await PixiEngine.create(
          canvasRef.current!,
          canvasRef.current!.clientWidth,
          canvasRef.current!.clientHeight
        );

        if (!mounted) {
          engine.destroy();
          return;
        }

        engineRef.current = engine;

        // 创建交互管理器
        const interaction = new InteractionManager(engine);
        interactionRef.current = interaction;

        // 监听引擎事件
        engine.on("objectAdded", handleObjectAdded);
        engine.on("selectionChanged", handleSelectionChanged);

        // 监听历史记录事件
        historyRef.current.on("historyChanged", handleHistoryChanged);
        historyRef.current.on("undo", handleUndo);
        historyRef.current.on("redo", handleRedo);

        // 窗口大小变化
        const handleResize = () => {
          if (canvasRef.current && engine) {
            engine.resize(
              canvasRef.current.clientWidth,
              canvasRef.current.clientHeight
            );
          }
        };
        window.addEventListener("resize", handleResize);

        // 添加示例对象
        addSampleObjects(engine);
      } catch (error) {
        console.error("Failed to initialize PixiEditor:", error);
        message.error("编辑器初始化失败");
      }
    };

    initEngine();

    return () => {
      mounted = false;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // 添加示例对象
  const addSampleObjects = (engine: PixiEngine) => {
    // 添加矩形
    const rect = new Rectangle({
      transform: { x: 200, y: 200, scaleX: 1, scaleY: 1, rotation: 0 },
      width: 150,
      height: 100,
      fill: { type: "solid", color: "#4CAF50", alpha: 1 },
      stroke: { color: "#2E7D32", width: 2, alpha: 1 },
    });
    engine.addObject(rect);

    // 添加圆形
    const circle = new Circle({
      transform: { x: 500, y: 200, scaleX: 1, scaleY: 1, rotation: 0 },
      radius: 60,
      fill: { type: "solid", color: "#2196F3", alpha: 1 },
      stroke: { color: "#1565C0", width: 2, alpha: 1 },
    });
    engine.addObject(circle);

    // 添加文本
    const text = new Text({
      transform: { x: 350, y: 400, scaleX: 1, scaleY: 1, rotation: 0 },
      text: "PixiJS Editor",
      fontSize: 24,
      fill: { type: "solid", color: "#333333", alpha: 1 },
    });
    engine.addObject(text);
  };

  // 对象添加事件
  const handleObjectAdded = useCallback(({ object }: any) => {
    updateLayers();

    // 记录到历史
    historyRef.current.push({
      type: ActionType.Create,
      timestamp: Date.now(),
      objectId: object.id,
      afterState: object.serialize(),
    });
  }, []);

  // 选择变化事件
  const handleSelectionChanged = useCallback(({ selectedIds: ids }: any) => {
    setSelectedIds(ids);

    if (engineRef.current) {
      const objects = ids
        .map((id: string) => engineRef.current!.getObject(id))
        .filter(Boolean)
        .map((obj: any) => obj.getProperties());

      setSelectedObjects(objects);

      // 更新交互管理器中的变换控制器
      if (interactionRef.current) {
        interactionRef.current.updateSelection();
      }
    }

    updateLayers();
  }, []);

  // 历史记录变化
  const handleHistoryChanged = useCallback(
    ({ canUndo: undo, canRedo: redo }: any) => {
      setCanUndo(undo);
      setCanRedo(redo);
    },
    []
  );

  // 撤销
  const handleUndo = useCallback((action: any) => {
    // TODO: 实现撤销逻辑
    message.info("撤销操作");
  }, []);

  // 重做
  const handleRedo = useCallback((action: any) => {
    // TODO: 实现重做逻辑
    message.info("重做操作");
  }, []);

  // 更新图层列表
  const updateLayers = useCallback(() => {
    if (!engineRef.current) return;

    const objects = engineRef.current.getAllObjects();
    const layerNodes: LayerNode[] = objects.map((obj) => {
      const props = obj.getProperties();
      return {
        id: props.id,
        name: props.name,
        type: props.type,
        visible: props.visible,
        locked: props.locked,
      };
    });

    setLayers(layerNodes);
  }, []);

  // 工具变化
  const handleToolChange = useCallback((mode: ToolMode) => {
    setToolMode(mode);
    if (engineRef.current) {
      engineRef.current.setToolMode(mode);
    }
  }, []);

  // 图层选择
  const handleSelectLayer = useCallback((id: string, multi?: boolean) => {
    if (engineRef.current) {
      engineRef.current.selectObject(id, multi);
    }
  }, []);

  // 切换可见性
  const handleToggleVisible = useCallback((id: string) => {
    const obj = engineRef.current?.getObject(id);
    if (obj) {
      const props = obj.getProperties();
      obj.updateProperties({ ...props, visible: !props.visible });
      updateLayers();
    }
  }, []);

  // 切换锁定
  const handleToggleLocked = useCallback((id: string) => {
    const obj = engineRef.current?.getObject(id);
    if (obj) {
      const props = obj.getProperties();
      obj.updateProperties({ ...props, locked: !props.locked });
      updateLayers();
    }
  }, []);

  // 重命名图层
  const handleRenameLayer = useCallback((id: string, name: string) => {
    const obj = engineRef.current?.getObject(id);
    if (obj) {
      const props = obj.getProperties();
      obj.updateProperties({ ...props, name });
      updateLayers();
    }
  }, []);

  // 删除图层
  const handleDeleteLayer = useCallback((id: string) => {
    if (engineRef.current) {
      engineRef.current.removeObject(id);
      updateLayers();
    }
  }, []);

  // 更新属性
  const handleUpdateProperties = useCallback(
    (id: string, props: Partial<ObjectProperties>) => {
      const obj = engineRef.current?.getObject(id);
      if (obj) {
        obj.updateProperties({ ...obj.getProperties(), ...props });
        setSelectedObjects([obj.getProperties()]);
        updateLayers();
      }
    },
    []
  );

  // 导出
  const handleExport = useCallback(async () => {
    if (engineRef.current) {
      try {
        const base64 = await engineRef.current.exportAsImage("png");
        const a = document.createElement("a");
        a.href = base64;
        a.download = "pixi-editor-export.png";
        a.click();
        message.success("导出成功");
      } catch (error) {
        console.error("Export error:", error);
        message.error("导出失败");
      }
    }
  }, []);

  // 导入
  const handleImport = useCallback(() => {
    message.info("导入功能开发中");
  }, []);

  return (
    <div className={styles.pixiEditor}>
      <Toolbar
        toolMode={toolMode}
        onToolChange={handleToolChange}
        onUndo={() => historyRef.current.undo()}
        onRedo={() => historyRef.current.redo()}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={handleExport}
        onImport={handleImport}
      />

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <LayerPanel
            layers={layers}
            selectedIds={selectedIds}
            onSelectLayer={handleSelectLayer}
            onToggleVisible={handleToggleVisible}
            onToggleLocked={handleToggleLocked}
            onRenameLayer={handleRenameLayer}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayer={() => {}}
          />
        </div>

        <div className={styles.canvas} ref={canvasRef} />

        <div className={styles.rightPanel}>
          <PropertyPanel
            selectedObjects={selectedObjects}
            onUpdateProperties={handleUpdateProperties}
          />
        </div>
      </div>
    </div>
  );
};

export default PixiEditor;
