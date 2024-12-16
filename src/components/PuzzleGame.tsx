import React, { useState, useEffect } from "react";
import { useGameData } from "../context/GameDataContext";
import { getRandomImage } from "../lib/getRandomImage";
import PreviewModal from "./PreviewModal";

const PuzzleGame: React.FC = () => {
  const { gameData, incrementLevel, updatetotalScore, resetGameData } =
    useGameData();
  const [imgUrl, setImgUrl] = useState<string>("");
  const [positions, setPositions] = useState<number[]>([]);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(600); // 10 minutes countdown in seconds
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [correctPlacements, setCorrectPlacements] = useState<boolean[]>([]);

  // Fetch the image URL when the component mounts or level changes
  useEffect(() => {
    const fetchedImageUrl = getRandomImage();
    setImgUrl(fetchedImageUrl);
  }, [gameData.level]);

  // Function to calculate grid size based on the level
  const getGridSize = () => {
    return Math.min(2 + gameData.level - 1, 12); // Grid size starts at 2x2 and increases up to 12x12
  };

  // Shuffle the initial positions based on the current grid size
  useEffect(() => {
    const gridSize = getGridSize();
    const totalPieces = gridSize * gridSize;
    const shuffled = [...Array(totalPieces).keys()].sort(
      () => Math.random() - 0.5
    );
    setPositions(shuffled);
    setCorrectPlacements(new Array(totalPieces).fill(false));
    setMoveCount(0);
    setTimer(600); // Reset timer for each new level
    setGameWon(false); // Reset the gameWon state on level change
  }, [gameData.level]);

  // Start the countdown timer
  useEffect(() => {
    if (gameWon || gameLost) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameLost(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameWon, gameLost]);

  // Handle drag and drop events
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (sourceIndex !== targetIndex) {
      setPositions((prevPositions) => {
        const newPositions = [...prevPositions];
        [newPositions[sourceIndex], newPositions[targetIndex]] = [
          newPositions[targetIndex],
          newPositions[sourceIndex],
        ];
        return newPositions;
      });

      const isCorrectPlacement = positions[targetIndex] === targetIndex;

      if (!isCorrectPlacement) {
        setTimer((prev) => Math.max(0, prev - 10));
      }

      setCorrectPlacements((prev) => {
        const newCorrectPlacements = [...prev];
        newCorrectPlacements[targetIndex] = isCorrectPlacement;
        return newCorrectPlacements;
      });

      setMoveCount((prev) => prev + 1);
    }

    checkIfGameWon();
  };

  const checkIfGameWon = () => {
    if (positions.every((pos, index) => pos === index) && !gameWon) {
      setGameWon(true);
      updatetotalScore(gameData.totalScore + timer * 10 - moveCount * 5); // Award points
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const getBorderClass = (index: number) => {
    if (positions[index] === index) return "border-green-500 bg-green-100";
    if (correctPlacements[index]) return "border-green-300 bg-green-50";
    return "border-gray-300";
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-xl font-bold mb-5">
        Puzzle Game - Level {gameData.level}
      </h1>

      <button
        className="primary-btn p-2 mt-2"
        onClick={() => setOpenPreview(true)}
      >
        Show Image Preview
      </button>

      <div className="mb-5">
        <p>Time: {formatTime(timer)}</p>
        <p>Moves: {moveCount}</p>
        <p>Total Score: {gameData.totalScore}</p>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${getGridSize()}, 1fr)` }}
      >
        {positions.map((pos, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={(e) => e.preventDefault()}
            className={`w-24 h-24 border cursor-move ${getBorderClass(index)}`}
            style={{
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: `${getGridSize() * 100}px ${
                getGridSize() * 100
              }px`,
              backgroundPosition: `${-((pos % getGridSize()) * 100)}px ${
                -Math.floor(pos / getGridSize()) * 100
              }px`,
            }}
          />
        ))}
      </div>

      {gameWon && (
        <div className="mt-5 text-green-600">
          <h2 className="text-2xl font-bold">
            Congratulations! You won the game!
          </h2>
          <button
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => {
              incrementLevel();
              setGameWon(false);
            }}
          >
            Next Level
          </button>
        </div>
      )}

      {gameLost && (
        <div className="mt-5 text-red-600">
          <h2 className="text-2xl font-bold">Time's up! You lost the game.</h2>
        </div>
      )}

      {openPreview && (
        <PreviewModal
          imgUrl={imgUrl}
          closePreviewModal={() => setOpenPreview(false)}
        />
      )}
    </div>
  );
};

export default PuzzleGame;
