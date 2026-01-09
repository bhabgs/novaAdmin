import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 24;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
};

type TetrominoType = keyof typeof TETROMINOES;
type Board = (string | null)[][];

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: TetrominoType;
  score: number;
  lines: number;
  level: number;
  isPlaying: boolean;
  isGameOver: boolean;
}

const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

const getRandomTetromino = (): TetrominoType => {
  const types = Object.keys(TETROMINOES) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)];
};

const rotatePiece = (shape: number[][]): number[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
};

const createPiece = (type: TetrominoType): Piece => {
  const tetromino = TETROMINOES[type];
  return {
    type,
    shape: tetromino.shape.map(row => [...row]),
    x: Math.floor((BOARD_WIDTH - tetromino.shape[0].length) / 2),
    y: 0,
    color: tetromino.color,
  };
};

const isValidPosition = (piece: Piece, board: Board): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const newX = piece.x + c;
        const newY = piece.y + r;
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
        if (newY >= 0 && board[newY][newX]) return false;
      }
    }
  }
  return true;
};

const mergePiece = (piece: Piece, board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          newBoard[y][x] = piece.color;
        }
      }
    }
  }
  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  return { newBoard, linesCleared };
};

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: getRandomTetromino(),
    score: 0,
    lines: 0,
    level: 1,
    isPlaying: false,
    isGameOver: false,
  }));

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetris-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const lastTickRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isGameOver || !prev.currentPiece) return prev;

      const piece = prev.currentPiece;
      const newPiece = { ...piece, y: piece.y + 1 };

      if (isValidPosition(newPiece, prev.board)) {
        return { ...prev, currentPiece: newPiece };
      }

      // 落地
      const mergedBoard = mergePiece(piece, prev.board);
      const { newBoard, linesCleared } = clearLines(mergedBoard);

      let newScore = prev.score;
      let newLines = prev.lines;
      let newLevel = prev.level;

      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * prev.level;
        newScore = prev.score + points;
        newLines = prev.lines + linesCleared;
        newLevel = Math.floor(newLines / 10) + 1;

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('tetris-high-score', String(newScore));
        }
      }

      // 生成新方块
      const nextType = prev.nextPiece;
      const newPieceObj = createPiece(nextType);

      if (!isValidPosition(newPieceObj, newBoard)) {
        return {
          ...prev,
          board: newBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          isGameOver: true,
          isPlaying: false,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: newPieceObj,
        nextPiece: getRandomTetromino(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, [highScore]);

  // 游戏循环使用 requestAnimationFrame
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;
      if (!state.isPlaying || state.isGameOver) {
        animationFrameRef.current = null;
        return;
      }

      const speed = Math.max(100, 500 - (state.level - 1) * 50);

      if (timestamp - lastTickRef.current >= speed) {
        lastTickRef.current = timestamp;
        updateGame();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.isPlaying && !gameState.isGameOver) {
      lastTickRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isGameOver, updateGame]);

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isGameOver) return prev;

      const newPiece = { ...prev.currentPiece, x: prev.currentPiece.x + dx, y: prev.currentPiece.y + dy };
      if (isValidPosition(newPiece, prev.board)) {
        return { ...prev, currentPiece: newPiece };
      }
      return prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isGameOver) return prev;

      const rotated = rotatePiece(prev.currentPiece.shape);
      const kicks = [0, -1, 1, -2, 2];

      for (const kick of kicks) {
        const newPiece = { ...prev.currentPiece, shape: rotated, x: prev.currentPiece.x + kick };
        if (isValidPosition(newPiece, prev.board)) {
          return { ...prev, currentPiece: newPiece };
        }
      }
      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isGameOver) return prev;

      let dropY = prev.currentPiece.y;
      while (isValidPosition({ ...prev.currentPiece, y: dropY + 1 }, prev.board)) {
        dropY++;
      }

      const droppedPiece = { ...prev.currentPiece, y: dropY };
      const mergedBoard = mergePiece(droppedPiece, prev.board);
      const { newBoard, linesCleared } = clearLines(mergedBoard);

      let newScore = prev.score;
      let newLines = prev.lines;
      let newLevel = prev.level;

      if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800][linesCleared] * prev.level;
        newScore = prev.score + points;
        newLines = prev.lines + linesCleared;
        newLevel = Math.floor(newLines / 10) + 1;

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('tetris-high-score', String(newScore));
        }
      }

      const nextType = prev.nextPiece;
      const newPieceObj = createPiece(nextType);

      if (!isValidPosition(newPieceObj, newBoard)) {
        return {
          ...prev,
          board: newBoard,
          currentPiece: null,
          score: newScore,
          lines: newLines,
          level: newLevel,
          isGameOver: true,
          isPlaying: false,
        };
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: newPieceObj,
        nextPiece: getRandomTetromino(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, [highScore]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: getRandomTetromino(),
      score: 0,
      lines: 0,
      level: 1,
      isPlaying: false,
      isGameOver: false,
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver) {
        return {
          board: createEmptyBoard(),
          currentPiece: createPiece(getRandomTetromino()),
          nextPiece: getRandomTetromino(),
          score: 0,
          lines: 0,
          level: 1,
          isPlaying: true,
          isGameOver: false,
        };
      }
      if (!prev.currentPiece) {
        return {
          ...prev,
          currentPiece: createPiece(prev.nextPiece),
          nextPiece: getRandomTetromino(),
          isPlaying: true,
        };
      }
      return { ...prev, isPlaying: true };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current.isPlaying) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotate, hardDrop]);

  // 渲染棋盘 - 使用 useMemo 缓存
  const displayBoard = useMemo(() => {
    const board = gameState.board.map(row => [...row]);
    const piece = gameState.currentPiece;

    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const y = piece.y + r;
            const x = piece.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              board[y][x] = piece.color;
            }
          }
        }
      }
    }

    return board;
  }, [gameState.board, gameState.currentPiece]);

  const nextPiecePreview = useMemo(() => {
    const tetromino = TETROMINOES[gameState.nextPiece];
    return (
      <div className="flex flex-col items-center gap-0.5">
        {tetromino.shape.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((cell, c) => (
              <div
                key={c}
                className="w-5 h-5 rounded-sm"
                style={{ backgroundColor: cell ? tetromino.color : 'transparent' }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }, [gameState.nextPiece]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/mini-games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧱</span>
          <h1 className="text-2xl font-bold">俄罗斯方块</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div
              className="relative bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700"
              style={{
                width: BOARD_WIDTH * CELL_SIZE,
                height: BOARD_HEIGHT * CELL_SIZE,
              }}
            >
              {displayBoard.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => (
                    <div
                      key={c}
                      className="border border-slate-800"
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: cell || '#0f172a',
                      }}
                    />
                  ))}
                </div>
              ))}

              {gameState.isGameOver && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white mb-2">游戏结束</p>
                  <p className="text-lg text-gray-300 mb-4">得分: {gameState.score}</p>
                  <Button onClick={resetGame} variant="secondary">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新开始
                  </Button>
                </div>
              )}

              {!gameState.isPlaying && !gameState.isGameOver && !gameState.currentPiece && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button onClick={startGame}>
                    <Play className="h-4 w-4 mr-2" />
                    开始游戏
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 flex-1 max-w-xs">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">下一个</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              {nextPiecePreview}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">游戏信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">得分</span>
                <Badge variant="secondary" className="text-lg px-3">{gameState.score}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">最高分</span>
                <Badge variant="default" className="text-lg px-3">{highScore}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">消除行数</span>
                <Badge variant="outline">{gameState.lines}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">等级</span>
                <Badge variant="outline">{gameState.level}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">控制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant={gameState.isPlaying ? 'secondary' : 'default'}
                  onClick={() => gameState.isPlaying ? togglePause() : startGame()}
                  disabled={gameState.isGameOver}
                >
                  {gameState.isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      开始
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">操作说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• ← → / A D：左右移动</p>
              <p>• ↓ / S：加速下落</p>
              <p>• ↑ / W：旋转方块</p>
              <p>• 空格：硬降（直接落下）</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
