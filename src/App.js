import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const generatePickup = (snake) => {
  let position = { x: -1, y: -1 };
  do {
    const tempPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snake.some((segment) => segment.x === tempPosition.x && segment.y === tempPosition.y)) {
      position = tempPosition;
    }
  } while (position.x === -1 && position.y === -1);
  return position;
};

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [pendingDirection, setPendingDirection] = useState(null);
  const [pickup, setPickup] = useState(generatePickup(INITIAL_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const isOppositeDirection = (newDirection, currentDirection) => {
    return (
      newDirection.x === -currentDirection.x &&
      newDirection.y === -currentDirection.y
    );
  };

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newDirection = pendingDirection && !isOppositeDirection(pendingDirection, direction)
        ? pendingDirection
        : direction;
      setDirection(newDirection);
      setPendingDirection(null);

      const newHead = {
        x: head.x + newDirection.x,
        y: head.y + newDirection.y,
      };

      if (
        newHead.x < 0 ||
        newHead.x >= BOARD_SIZE ||
        newHead.y < 0 ||
        newHead.y >= BOARD_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === pickup.x && newHead.y === pickup.y) {
        setPickup(generatePickup(newSnake));
        if (score < newSnake.length - 1) {
          setScore(newSnake.length - 1);
        }
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [pendingDirection, direction, pickup, score]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (DIRECTIONS[event.key]) {
        const newDirection = DIRECTIONS[event.key];
        if (!isOppositeDirection(newDirection, direction)) {
          setPendingDirection((prevPending) => prevPending || newDirection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      moveSnake();
    }, 200);

    return () => clearInterval(interval);
  }, [moveSnake, gameOver]);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.ArrowRight);
    setPendingDirection(null);
    setPickup(generatePickup(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  };

  const renderCell = (x, y) => {
    const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
    const isPickup = pickup.x === x && pickup.y === y;
    if (isSnake) {
      return <div className="cell snake" key={`${x}-${y}`} />;
    }
    if (isPickup) {
      return <div className="cell pickup" key={`${x}-${y}`} />;
    }
    return <div className="cell empty" key={`${x}-${y}`} />;
  };

  if (gameOver) {
    return (
      <div className="game-container">
        <div className="game-over">Game Over! Your Score: {score}</div>
        <button onClick={restartGame} className="restart-button">Restart Game</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="board">
        {Array.from({ length: BOARD_SIZE }, (_, y) => (
          <div className="row" key={y}>
            {Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))}
          </div>
        ))}
      </div>
      <div className="score">Score: {score}</div>
    </div>
  );
}

export default App;