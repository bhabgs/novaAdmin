/**
 * 历史记录系统 - 支持撤销/重做
 */

import { EventEmitter } from './EventEmitter';
import { HistoryAction, ActionType } from '../types';
import { deepClone } from '../utils/helpers';

export class HistoryManager extends EventEmitter {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private maxHistorySize: number = 50;

  /**
   * 添加历史记录
   */
  public push(action: HistoryAction): void {
    this.undoStack.push(action);

    // 清空重做栈
    this.redoStack = [];

    // 限制栈大小
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  /**
   * 撤销
   */
  public undo(): HistoryAction | null {
    if (!this.canUndo()) return null;

    const action = this.undoStack.pop()!;
    this.redoStack.push(action);

    this.emit('undo', action);
    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });

    return action;
  }

  /**
   * 重做
   */
  public redo(): HistoryAction | null {
    if (!this.canRedo()) return null;

    const action = this.redoStack.pop()!;
    this.undoStack.push(action);

    this.emit('redo', action);
    this.emit('historyChanged', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });

    return action;
  }

  /**
   * 是否可以撤销
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * 是否可以重做
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史
   */
  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];

    this.emit('historyChanged', {
      canUndo: false,
      canRedo: false,
    });
  }

  /**
   * 获取历史记录列表
   */
  public getHistory(): HistoryAction[] {
    return deepClone(this.undoStack);
  }

  /**
   * 设置最大历史记录数
   */
  public setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;

    while (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }
}
