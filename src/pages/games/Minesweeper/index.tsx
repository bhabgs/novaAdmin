import React, { useState, useCallback } from "react";
import { Card, Button, Typography, Space, Select, message } from "antd";
import { ReloadOutlined, FlagOutlined, TrophyOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const { Title, Text } = Typography;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const Minesweeper: React.FC = () => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>(() => initBoard("easy"));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flagCount, setFlagCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const config = DIFFICULTIES[difficulty];

  function initBoard(diff: Difficulty): Cell[][] {
    const { rows, cols, mines } = DIFFICULTIES[diff];
    const newBoard: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].adjacentMines = count;
        }
      }
    }

    return newBoard;
  }

  const startTimer = () => {
    if (startTime === null) {
      setStartTime(Date.now());
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const revealCell = useCallback(
    (row: number, col: number, currentBoard: Cell[][]): Cell[][] => {
      const { rows, cols } = DIFFICULTIES[difficulty];
      const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));

      const reveal = (r: number, c: number) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;

        newBoard[r][c].isRevealed = true;

        if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              reveal(r + dr, c + dc);
            }
          }
        }
      };

      reveal(row, col);
      return newBoard;
    },
    [difficulty]
  );

  const checkWin = (currentBoard: Cell[][]): boolean => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    let revealedCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentBoard[r][c].isRevealed) {
          revealedCount++;
        }
      }
    }

    return revealedCount === rows * cols - mines;
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || won || board[row][col].isFlagged || board[row][col].isRevealed) {
      return;
    }

    startTimer();

    if (board[row][col].isMine) {
      // Game over - reveal all mines
      const newBoard = board.map((r) =>
        r.map((c) => ({
          ...c,
          isRevealed: c.isMine ? true : c.isRevealed,
        }))
      );
      setBoard(newBoard);
      setGameOver(true);
      stopTimer();
      message.error(t("games.minesweeper.hitMine", "You hit a mine!"));
      return;
    }

    const newBoard = revealCell(row, col, board);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setWon(true);
      stopTimer();
      message.success(t("games.minesweeper.won", "Congratulations! You won!"));
    }
  };

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || won || board[row][col].isRevealed) return;

    startTimer();

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagCount((prev) => (newBoard[row][col].isFlagged ? prev + 1 : prev - 1));
  };

  const resetGame = (newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    setBoard(initBoard(diff));
    setGameOver(false);
    setWon(false);
    setFlagCount(0);
    setStartTime(null);
    setElapsedTime(0);
    stopTimer();
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return <FlagOutlined style={{ color: "#f44336" }} />;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return "💣";
    if (cell.adjacentMines === 0) return null;
    return cell.adjacentMines;
  };

  const getCellColor = (count: number): string => {
    const colors: Record<number, string> = {
      1: "#1976d2",
      2: "#388e3c",
      3: "#d32f2f",
      4: "#7b1fa2",
      5: "#ff8f00",
      6: "#00838f",
      7: "#424242",
      8: "#757575",
    };
    return colors[count] || "#000";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      <Card className={styles.gameCard}>
        <div className={styles.header}>
          <Title level={2} style={{ margin: 0 }}>
            {t("games.minesweeper.title", "Minesweeper")}
          </Title>
          <Space size="large">
            <div className={styles.infoBox}>
              <FlagOutlined />
              <Text strong>
                {flagCount} / {config.mines}
              </Text>
            </div>
            <div className={styles.infoBox}>
              <ClockCircleOutlined />
              <Text strong>{formatTime(elapsedTime)}</Text>
            </div>
          </Space>
        </div>

        <div className={styles.controls}>
          <Space>
            <Select
              value={difficulty}
              onChange={(value) => resetGame(value)}
              style={{ width: 120 }}
              options={[
                { value: "easy", label: t("games.easy", "Easy") },
                { value: "medium", label: t("games.medium", "Medium") },
                { value: "hard", label: t("games.hard", "Hard") },
              ]}
            />
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => resetGame()}>
              {t("games.newGame", "New Game")}
            </Button>
          </Space>
        </div>

        <div className={styles.boardWrapper}>
          <div
            className={styles.board}
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 28px)`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${cell.isRevealed ? styles.revealed : ""} ${
                    cell.isMine && cell.isRevealed ? styles.mine : ""
                  } ${won ? styles.won : ""}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                  disabled={gameOver || won}
                  style={{
                    color: cell.isRevealed && !cell.isMine ? getCellColor(cell.adjacentMines) : undefined,
                  }}
                >
                  {getCellContent(cell)}
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.instructions}>
          <Text type="secondary">
            {t(
              "games.minesweeper.instructions",
              "Left click to reveal, right click to flag. Find all mines without hitting them!"
            )}
          </Text>
        </div>

        {(gameOver || won) && (
          <div className={styles.resultOverlay}>
            <div className={won ? styles.wonText : styles.lostText}>
              {won ? t("games.youWon", "You Won!") : t("games.gameOver", "Game Over!")}
            </div>
            <Text style={{ marginBottom: 16 }}>
              {t("games.time", "Time")}: {formatTime(elapsedTime)}
            </Text>
            <Button type="primary" size="large" onClick={() => resetGame()}>
              {t("games.playAgain", "Play Again")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Minesweeper;
