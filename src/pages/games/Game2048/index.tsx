import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, Button, Typography, Space } from "antd";
import { ReloadOutlined, TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const { Title, Text } = Typography;

// 方块数据结构
interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  prevRow?: number;
  prevCol?: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const GAP_SIZE = 12;

// 全局ID计数器
let tileIdCounter = 0;
const getNextId = () => ++tileIdCounter;

const Game2048: React.FC = () => {
  const { t } = useTranslation();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("game2048_best");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 初始化游戏
  const initGame = useCallback(() => {
    tileIdCounter = 0;
    const newTiles: Tile[] = [];

    // 随机生成2个初始方块
    const positions: [number, number][] = [];
    while (positions.length < 2) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!positions.some(([r, c]) => r === row && c === col)) {
        positions.push([row, col]);
      }
    }

    positions.forEach(([row, col]) => {
      newTiles.push({
        id: getNextId(),
        value: Math.random() < 0.9 ? 2 : 4,
        row,
        col,
        isNew: true,
      });
    });

    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
  }, []);

  // 组件挂载时初始化
  useEffect(() => {
    initGame();
  }, [initGame]);

  // 获取空位置
  const getEmptyPositions = useCallback((currentTiles: Tile[]): [number, number][] => {
    const occupied = new Set(currentTiles.map((t) => `${t.row}-${t.col}`));
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!occupied.has(`${r}-${c}`)) {
          empty.push([r, c]);
        }
      }
    }
    return empty;
  }, []);

  // 添加新方块
  const addNewTile = useCallback((currentTiles: Tile[]): Tile[] => {
    const empty = getEmptyPositions(currentTiles);
    if (empty.length === 0) return currentTiles;

    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    return [
      ...currentTiles,
      {
        id: getNextId(),
        value: Math.random() < 0.9 ? 2 : 4,
        row,
        col,
        isNew: true,
      },
    ];
  }, [getEmptyPositions]);

  // 检查游戏是否结束
  const checkGameOver = useCallback((currentTiles: Tile[]): boolean => {
    // 还有空位就没结束
    if (getEmptyPositions(currentTiles).length > 0) return false;

    // 检查是否有可合并的相邻方块
    const grid: number[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    currentTiles.forEach((t) => {
      grid[t.row][t.col] = t.value;
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = grid[r][c];
        // 检查右边
        if (c < GRID_SIZE - 1 && grid[r][c + 1] === val) return false;
        // 检查下边
        if (r < GRID_SIZE - 1 && grid[r + 1][c] === val) return false;
      }
    }

    return true;
  }, [getEmptyPositions]);

  // 移动逻辑
  const move = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (gameOver || isAnimating) return;

      setIsAnimating(true);

      // 清除之前的动画标记
      let currentTiles = tiles.map((t) => ({
        ...t,
        isNew: false,
        isMerged: false,
        prevRow: t.row,
        prevCol: t.col,
      }));

      let moved = false;
      let addedScore = 0;
      const newTiles: Tile[] = [];

      // 根据方向确定遍历顺序
      const isHorizontal = direction === "left" || direction === "right";
      const isReverse = direction === "right" || direction === "down";

      // 处理每一行或每一列
      for (let i = 0; i < GRID_SIZE; i++) {
        // 获取这一行/列的方块
        let line = currentTiles.filter((t) => (isHorizontal ? t.row === i : t.col === i));

        // 按位置排序
        line.sort((a, b) => (isHorizontal ? a.col - b.col : a.row - b.row));

        // 如果是反向，则反转数组
        if (isReverse) line.reverse();

        // 处理移动和合并
        const processed: Tile[] = [];
        let targetPos = isReverse ? GRID_SIZE - 1 : 0;
        const step = isReverse ? -1 : 1;

        for (const tile of line) {
          const lastTile = processed[processed.length - 1];

          // 检查是否可以与前一个方块合并
          if (lastTile && lastTile.value === tile.value && !lastTile.isMerged) {
            // 合并
            lastTile.value *= 2;
            lastTile.isMerged = true;
            addedScore += lastTile.value;
            moved = true;
            // 被合并的方块不加入结果
          } else {
            // 移动到目标位置
            const newTile: Tile = { ...tile };

            if (isHorizontal) {
              if (newTile.col !== targetPos) moved = true;
              newTile.col = targetPos;
            } else {
              if (newTile.row !== targetPos) moved = true;
              newTile.row = targetPos;
            }

            processed.push(newTile);
            targetPos += step;
          }
        }

        newTiles.push(...processed);
      }

      if (!moved) {
        setIsAnimating(false);
        return;
      }

      // 更新分数
      const newScore = score + addedScore;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem("game2048_best", newScore.toString());
      }

      // 先更新移动动画
      setTiles(newTiles);

      // 动画结束后添加新方块
      setTimeout(() => {
        const tilesWithNew = addNewTile(newTiles.map((t) => ({ ...t, prevRow: undefined, prevCol: undefined })));
        setTiles(tilesWithNew);

        // 检查游戏结束
        if (checkGameOver(tilesWithNew)) {
          setGameOver(true);
        }

        setIsAnimating(false);
      }, 150);
    },
    [tiles, score, bestScore, gameOver, isAnimating, addNewTile, checkGameOver]
  );

  // 键盘事件
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || isAnimating) return;

      const keyMap: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
      }
    },
    [move, gameOver, isAnimating]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 触摸事件 - 开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  // 触摸事件 - 结束
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || gameOver || isAnimating) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
          move(deltaX > 0 ? "right" : "left");
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
          move(deltaY > 0 ? "down" : "up");
        }
      }

      touchStartRef.current = null;
    },
    [move, gameOver, isAnimating]
  );

  // 获取方块颜色
  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#3c3a32";
  };

  // 获取文字颜色
  const getTextColor = (value: number): string => {
    return value <= 4 ? "#776e65" : "#f9f6f2";
  };

  // 获取字体大小
  const getFontSize = (value: number): number => {
    if (value < 100) return 36;
    if (value < 1000) return 30;
    return 24;
  };

  // 计算方块位置
  const getTileStyle = (tile: Tile): React.CSSProperties => {
    const x = tile.col * (CELL_SIZE + GAP_SIZE);
    const y = tile.row * (CELL_SIZE + GAP_SIZE);

    return {
      width: CELL_SIZE,
      height: CELL_SIZE,
      transform: `translate(${x}px, ${y}px)`,
      backgroundColor: getTileColor(tile.value),
      color: getTextColor(tile.value),
      fontSize: getFontSize(tile.value),
    };
  };

  return (
    <div className={styles.container}>
      <Card className={styles.gameCard}>
        <div className={styles.header}>
          <Title level={2} style={{ margin: 0 }}>
            2048
          </Title>
          <Space size="large">
            <div className={styles.scoreBox}>
              <Text type="secondary">{t("games.score", "Score")}</Text>
              <Text strong style={{ fontSize: 24 }}>
                {score}
              </Text>
            </div>
            <div className={styles.scoreBox}>
              <Text type="secondary">
                <TrophyOutlined /> {t("games.best", "Best")}
              </Text>
              <Text strong style={{ fontSize: 24 }}>
                {bestScore}
              </Text>
            </div>
          </Space>
        </div>

        <div className={styles.controls}>
          <Button type="primary" icon={<ReloadOutlined />} onClick={initGame}>
            {t("games.newGame", "New Game")}
          </Button>
        </div>

        <div
          ref={containerRef}
          className={styles.gridContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 背景格子 */}
          <div className={styles.grid}>
            {Array(GRID_SIZE * GRID_SIZE)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={styles.cell} />
              ))}
          </div>

          {/* 方块层 */}
          <div className={styles.tilesContainer}>
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={`${styles.tile} ${tile.isNew ? styles.tileNew : ""} ${tile.isMerged ? styles.tileMerged : ""}`}
                style={getTileStyle(tile)}
              >
                {tile.value}
              </div>
            ))}
          </div>

          {/* 游戏结束遮罩 */}
          {gameOver && (
            <div className={styles.overlay}>
              <div className={styles.gameOverText}>{t("games.gameOver", "Game Over!")}</div>
              <Text style={{ marginBottom: 16 }}>
                {t("games.finalScore", "Final Score")}: {score}
              </Text>
              <Button type="primary" size="large" onClick={initGame}>
                {t("games.playAgain", "Play Again")}
              </Button>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <Text type="secondary">
            {t("games.2048.instructions", "Use arrow keys or swipe to move tiles. Merge same numbers to reach 2048!")}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Game2048;
