import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, Button, Typography, Space, Select } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const { Title, Text } = Typography;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 20;

const Snake: React.FC = () => {
  const { t } = useTranslation();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("snake_best");
    return saved ? parseInt(saved, 10) : 0;
  });

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some((seg) => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem("snake_best", newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, bestScore]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, moveSnake, speed]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      const keyDirections: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };

      const newDirection = keyDirections[e.key];
      if (!newDirection) return;

      e.preventDefault();

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (opposites[newDirection] !== directionRef.current) {
        directionRef.current = newDirection;
        setDirection(newDirection);
        if (!isPlaying) {
          setIsPlaying(true);
        }
      }
    },
    [gameOver, isPlaying]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const togglePlay = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.gameCard}>
        <div className={styles.header}>
          <Title level={2} style={{ margin: 0 }}>
            {t("games.snake.title", "Snake")}
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
          <Space>
            <Button
              type="primary"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlay}
            >
              {gameOver
                ? t("games.newGame", "New Game")
                : isPlaying
                ? t("games.pause", "Pause")
                : t("games.start", "Start")}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetGame}>
              {t("games.reset", "Reset")}
            </Button>
            <Select
              value={speed}
              onChange={setSpeed}
              style={{ width: 100 }}
              options={[
                { value: 200, label: t("games.slow", "Slow") },
                { value: 150, label: t("games.normal", "Normal") },
                { value: 100, label: t("games.fast", "Fast") },
                { value: 50, label: t("games.veryFast", "Very Fast") },
              ]}
            />
          </Space>
        </div>

        <div
          className={styles.gameBoard}
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Food */}
          <div
            className={styles.food}
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`${styles.snakeSegment} ${index === 0 ? styles.snakeHead : ""}`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}

          {gameOver && (
            <div className={styles.overlay}>
              <div className={styles.gameOverText}>
                {t("games.gameOver", "Game Over!")}
              </div>
              <Text style={{ color: "#fff", marginBottom: 16 }}>
                {t("games.finalScore", "Final Score")}: {score}
              </Text>
              <Button type="primary" size="large" onClick={resetGame}>
                {t("games.playAgain", "Play Again")}
              </Button>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <Text type="secondary">
            {t("games.snake.instructions", "Use arrow keys or WASD to control the snake. Eat food to grow!")}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Snake;
