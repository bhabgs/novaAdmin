import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GRID_SIZE = 4;

type Grid = number[][];

const createEmptyGrid = (): Grid =>
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const getRandomEmptyCell = (grid: Grid): { row: number; col: number } | null => {
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const emptyCell = getRandomEmptyCell(newGrid);
  if (emptyCell) {
    newGrid[emptyCell.row][emptyCell.col] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

const initializeGrid = (): Grid => {
  let grid = createEmptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return grid;
};

// 经典2048配色方案
const getTileStyle = (value: number): { backgroundColor: string; color: string; fontSize: string; fontWeight: string } => {
  const styles: Record<number, { bg: string; text: string }> = {
    0: { bg: '#cdc1b4', text: 'transparent' },
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
    4096: { bg: '#3c3a32', text: '#f9f6f2' },
    8192: { bg: '#3c3a32', text: '#f9f6f2' },
  };

  const style = styles[value] || { bg: '#3c3a32', text: '#f9f6f2' };

  let fontSize = '2rem';
  if (value >= 1000) fontSize = '1.5rem';
  else if (value >= 100) fontSize = '1.75rem';

  return {
    backgroundColor: style.bg,
    color: style.text,
    fontSize,
    fontWeight: 'bold',
  };
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(initializeGrid);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const checkGameOver = useCallback((grid: Grid): boolean => {
    // 检查是否有空格
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    // 检查是否有可合并的相邻格子
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
      }
    }
    return true;
  }, []);

  const checkWin = useCallback((grid: Grid): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 2048) return true;
      }
    }
    return false;
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (isGameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let addedScore = 0;

    const slideAndMerge = (line: number[]): number[] => {
      // 移除零
      let filtered = line.filter(x => x !== 0);
      // 合并
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          addedScore += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      // 再次移除零
      filtered = filtered.filter(x => x !== 0);
      // 补零
      while (filtered.length < GRID_SIZE) {
        filtered.push(0);
      }
      return filtered;
    };

    const transpose = (grid: Grid): Grid => {
      return grid[0].map((_, i) => grid.map(row => row[i]));
    };

    const reverse = (grid: Grid): Grid => {
      return grid.map(row => [...row].reverse());
    };

    switch (direction) {
      case 'left':
        newGrid = newGrid.map(row => slideAndMerge(row));
        break;
      case 'right':
        newGrid = reverse(newGrid).map(row => slideAndMerge(row));
        newGrid = reverse(newGrid);
        break;
      case 'up':
        newGrid = transpose(newGrid);
        newGrid = newGrid.map(row => slideAndMerge(row));
        newGrid = transpose(newGrid);
        break;
      case 'down':
        newGrid = transpose(newGrid);
        newGrid = reverse(newGrid).map(row => slideAndMerge(row));
        newGrid = reverse(newGrid);
        newGrid = transpose(newGrid);
        break;
    }

    // 检查是否有变化
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] !== newGrid[r][c]) {
          moved = true;
          break;
        }
      }
      if (moved) break;
    }

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);

      const newScore = score + addedScore;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', String(newScore));
      }

      if (!hasWon && checkWin(newGrid)) {
        setHasWon(true);
      }

      if (checkGameOver(newGrid)) {
        setIsGameOver(true);
      }
    }
  }, [grid, score, bestScore, isGameOver, hasWon, checkGameOver, checkWin]);

  const resetGame = useCallback(() => {
    setGrid(initializeGrid());
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/mini-games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔢</span>
          <h1 className="text-2xl font-bold">2048</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div className="relative rounded-lg p-3" style={{ backgroundColor: '#bbada0' }}>
              <div className="grid grid-cols-4 gap-3">
                {grid.map((row, r) =>
                  row.map((value, c) => {
                    const tileStyle = getTileStyle(value);
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="w-20 h-20 rounded-lg flex items-center justify-center transition-all duration-100"
                        style={tileStyle}
                      >
                        {value > 0 ? value : ''}
                      </div>
                    );
                  })
                )}
              </div>

              {isGameOver && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white mb-2">游戏结束</p>
                  <p className="text-lg text-gray-300 mb-4">得分: {score}</p>
                  <Button onClick={resetGame} variant="secondary">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新开始
                  </Button>
                </div>
              )}

              {hasWon && !isGameOver && (
                <div className="absolute inset-0 bg-yellow-500/80 rounded-lg flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-white mb-2">🎉 恭喜！</p>
                  <p className="text-lg text-white mb-4">你达成了 2048！</p>
                  <div className="flex gap-2">
                    <Button onClick={() => setHasWon(false)} variant="secondary">
                      继续游戏
                    </Button>
                    <Button onClick={resetGame} variant="outline">
                      重新开始
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 flex-1 max-w-xs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">游戏信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">当前得分</span>
                <Badge variant="secondary" className="text-lg px-3">{score}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">最高分</span>
                <Badge variant="default" className="text-lg px-3">{bestScore}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">控制</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={resetGame}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重新开始
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">操作说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• 方向键 / WASD：滑动方块</p>
              <p>• 相同数字碰撞会合并</p>
              <p>• 目标是合成 2048</p>
              <p>• 无法移动时游戏结束</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
