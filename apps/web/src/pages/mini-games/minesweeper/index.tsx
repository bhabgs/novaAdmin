import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Flag, Bomb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const createBoard = (rows: number, cols: number, mines: number, firstClick?: { row: number; col: number }): Cell[][] => {
  const board: Cell[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // 放置地雷（避开第一次点击的位置及其周围）
  let placedMines = 0;
  while (placedMines < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (firstClick) {
      const isNearFirstClick = Math.abs(r - firstClick.row) <= 1 && Math.abs(c - firstClick.col) <= 1;
      if (isNearFirstClick) continue;
    }

    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placedMines++;
    }
  }

  // 计算相邻地雷数
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].adjacentMines = count;
    }
  }

  return board;
};

const getNumberColor = (num: number): string => {
  const colors: Record<number, string> = {
    1: 'text-blue-600',
    2: 'text-green-600',
    3: 'text-red-600',
    4: 'text-purple-600',
    5: 'text-orange-600',
    6: 'text-cyan-600',
    7: 'text-gray-800',
    8: 'text-gray-600',
  };
  return colors[num] || '';
};

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestTime, setBestTime] = useState<Record<Difficulty, number | null>>(() => {
    const saved = localStorage.getItem('minesweeper-best-times');
    return saved ? JSON.parse(saved) : { easy: null, medium: null, hard: null };
  });

  const config = DIFFICULTY_CONFIG[difficulty];

  const initGame = useCallback(() => {
    setBoard(createBoard(config.rows, config.cols, 0)); // 空板，等第一次点击
    setIsGameOver(false);
    setIsWin(false);
    setIsFirstClick(true);
    setFlagCount(0);
    setTime(0);
    setIsPlaying(false);
  }, [config]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && !isGameOver && !isWin) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, isGameOver, isWin]);

  const revealCell = useCallback((board: Cell[][], row: number, col: number): Cell[][] => {
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const stack: { r: number; c: number }[] = [{ r: row, c: col }];

    while (stack.length > 0) {
      const { r, c } = stack.pop()!;

      if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) continue;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              stack.push({ r: r + dr, c: c + dc });
            }
          }
        }
      }
    }

    return newBoard;
  }, [config]);

  const checkWin = useCallback((board: Cell[][]): boolean => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!board[r][c].isMine && !board[r][c].isRevealed) {
          return false;
        }
      }
    }
    return true;
  }, [config]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isGameOver || isWin) return;
    if (board[row]?.[col]?.isFlagged) return;

    let newBoard: Cell[][];

    if (isFirstClick) {
      // 第一次点击，生成真正的地雷板
      newBoard = createBoard(config.rows, config.cols, config.mines, { row, col });
      setIsFirstClick(false);
      setIsPlaying(true);
    } else {
      newBoard = board.map(r => r.map(c => ({ ...c })));
    }

    if (newBoard[row][col].isMine) {
      // 踩雷
      newBoard[row][col].isRevealed = true;
      // 显示所有地雷
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }
      setIsGameOver(true);
      setIsPlaying(false);
    } else {
      newBoard = revealCell(newBoard, row, col);
      if (checkWin(newBoard)) {
        setIsWin(true);
        setIsPlaying(false);
        // 保存最佳时间
        if (bestTime[difficulty] === null || time < bestTime[difficulty]!) {
          const newBestTime = { ...bestTime, [difficulty]: time };
          setBestTime(newBestTime);
          localStorage.setItem('minesweeper-best-times', JSON.stringify(newBestTime));
        }
      }
    }

    setBoard(newBoard);
  }, [board, isFirstClick, isGameOver, isWin, config, revealCell, checkWin, difficulty, time, bestTime]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (isGameOver || isWin || isFirstClick) return;
    if (board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);
  }, [board, isGameOver, isWin, isFirstClick]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/mini-games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💣</span>
          <h1 className="text-2xl font-bold">扫雷</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-shrink-0 overflow-auto">
          <CardContent className="p-4">
            <div
              className="inline-grid gap-0.5 bg-gray-300 dark:bg-gray-700 p-1 rounded"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    className={`
                      w-7 h-7 flex items-center justify-center text-sm font-bold
                      transition-colors rounded-sm
                      ${cell.isRevealed
                        ? cell.isMine
                          ? 'bg-red-500'
                          : 'bg-gray-100 dark:bg-gray-600'
                        : 'bg-gray-400 dark:bg-gray-500 hover:bg-gray-350 dark:hover:bg-gray-450 cursor-pointer'
                      }
                    `}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    disabled={cell.isRevealed}
                  >
                    {cell.isRevealed ? (
                      cell.isMine ? (
                        <Bomb className="w-4 h-4 text-white" />
                      ) : cell.adjacentMines > 0 ? (
                        <span className={getNumberColor(cell.adjacentMines)}>
                          {cell.adjacentMines}
                        </span>
                      ) : null
                    ) : cell.isFlagged ? (
                      <Flag className="w-4 h-4 text-red-600" />
                    ) : null}
                  </button>
                ))
              )}
            </div>

            {(isGameOver || isWin) && (
              <div className="mt-4 text-center">
                <p className={`text-xl font-bold ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                  {isWin ? '🎉 恭喜过关！' : '💥 游戏结束'}
                </p>
                <p className="text-muted-foreground mt-1">用时: {formatTime(time)}</p>
                <Button onClick={initGame} className="mt-3">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重新开始
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 flex-1 max-w-xs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">难度选择</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">简单 (9×9, 10雷)</SelectItem>
                  <SelectItem value="medium">中等 (16×16, 40雷)</SelectItem>
                  <SelectItem value="hard">困难 (16×30, 99雷)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">游戏信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">用时</span>
                <Badge variant="secondary" className="text-lg px-3 font-mono">
                  {formatTime(time)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">剩余地雷</span>
                <Badge variant="default" className="text-lg px-3">
                  {config.mines - flagCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">最佳时间</span>
                <Badge variant="outline" className="font-mono">
                  {bestTime[difficulty] !== null ? formatTime(bestTime[difficulty]!) : '--:--'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">控制</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={initGame}>
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
              <p>• 左键点击：揭开格子</p>
              <p>• 右键点击：标记/取消旗子</p>
              <p>• 数字表示周围地雷数量</p>
              <p>• 揭开所有非雷格子即获胜</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
