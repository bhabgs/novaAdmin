import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GameInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

const games: GameInfo[] = [
  {
    id: 'snake',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏，使用方向键控制蛇的移动，吃掉食物来增长身体',
    path: '/mini-games/snake',
    icon: '🐍',
    difficulty: 'easy',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'tetris',
    name: '俄罗斯方块',
    description: '经典方块消除游戏，旋转和移动下落的方块，填满一行即可消除',
    path: '/mini-games/tetris',
    icon: '🧱',
    difficulty: 'medium',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2048',
    name: '2048',
    description: '数字合并游戏，滑动方块使相同数字合并，目标是合成2048',
    path: '/mini-games/2048',
    icon: '🔢',
    difficulty: 'medium',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    description: '经典扫雷游戏，根据数字提示找出所有地雷的位置',
    path: '/mini-games/minesweeper',
    icon: '💣',
    difficulty: 'hard',
    color: 'from-red-500 to-rose-600',
  },
];

const difficultyConfig = {
  easy: { label: '简单', variant: 'default' as const },
  medium: { label: '中等', variant: 'secondary' as const },
  hard: { label: '困难', variant: 'destructive' as const },
};

export default function MiniGames() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gamepad2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">小游戏中心</h1>
          <p className="text-muted-foreground">休闲一下，放松心情</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <Link key={game.id} to={game.path}>
            <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} text-3xl shadow-lg`}>
                  {game.icon}
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <Badge variant={difficultyConfig[game.difficulty].variant}>
                    {difficultyConfig[game.difficulty].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2">
                  {game.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
