import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setIsGameOver(false);
    setScore(0);
    setIsPlaying(false);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;

      let newHead: Position;
      switch (currentDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // 检查碰撞墙壁
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // 检查碰撞自身
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 检查是否吃到食物
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', String(newScore));
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, highScore]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, isGameOver, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/mini-games">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐍</span>
          <h1 className="text-2xl font-bold">贪吃蛇</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <div
              className="relative bg-slate-900 rounded-lg overflow-hidden"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
              }}
            >
              {/* 网格背景 */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                }}
              />

              {/* 蛇 */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className={`absolute rounded-sm transition-all duration-75 ${
                    index === 0 ? 'bg-green-400' : 'bg-green-500'
                  }`}
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    margin: 1,
                  }}
                />
              ))}

              {/* 食物 */}
              <div
                className="absolute bg-red-500 rounded-full animate-pulse"
                style={{
                  left: food.x * CELL_SIZE,
                  top: food.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  margin: 1,
                }}
              />

              {/* 游戏结束覆盖层 */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white mb-2">游戏结束</p>
                  <p className="text-lg text-gray-300 mb-4">得分: {score}</p>
                  <Button onClick={resetGame} variant="secondary">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新开始
                  </Button>
                </div>
              )}

              {/* 开始提示 */}
              {!isPlaying && !isGameOver && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-lg text-white">按空格键开始</p>
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
                <Badge variant="default" className="text-lg px-3">{highScore}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">蛇长度</span>
                <Badge variant="outline">{snake.length}</Badge>
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
                  variant={isPlaying ? 'secondary' : 'default'}
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isGameOver}
                >
                  {isPlaying ? (
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
              <p>• 方向键 / WASD：控制方向</p>
              <p>• 空格键：开始/暂停</p>
              <p>• 吃到食物得10分</p>
              <p>• 碰到墙壁或自己游戏结束</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
