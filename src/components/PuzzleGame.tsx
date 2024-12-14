import React, { useState, useEffect } from "react";
import { getRandomImage } from "../lib/getRandomImage";
import PreviewModal from "./PreviewModal";

const PuzzleGame: React.FC = () => {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [level, setLevel] = useState<number>(1); // Starting from level 1
  const [positions, setPositions] = useState<number[]>([]);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(600); // 10 minutes countdown in seconds
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState<boolean>(false);

  //opens preview
  const openPreviewModal = () => {
    setOpenPreview(true);
  };

  //close preview
  const closePreviewModal = () => {
    console.log("close modal triggered");
    setOpenPreview(false);
  };

  // Track correct piece placements
  const [correctPlacements, setCorrectPlacements] = useState<boolean[]>([]);

  // Fetch the image URL once on component mount
  useEffect(() => {
    const fetchedImageUrl = getRandomImage();
    setImgUrl(fetchedImageUrl);
  }, [level]); // ensures this runs   when the level changes

  // Function to calculate grid size based on the level
  const getGridSize = () => {
    return Math.min(2 + level - 1, 12); // Grid size starts at 2x2 and increases up to 12x12
  };

  // Shuffle the initial positions based on the current grid size
  useEffect(() => {
    const gridSize = getGridSize();
    const totalPieces = gridSize * gridSize;
    const shuffled = [...Array(totalPieces).keys()].sort(
      () => Math.random() - 0.5
    );
    setPositions(shuffled);
    setCorrectPlacements(new Array(totalPieces).fill(false)); // Reset correct placements
    setMoveCount(0);
    setTimer(600); // Reset timer for each new level
  }, [level]);

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

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  // Handle drop event
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (sourceIndex !== targetIndex) {
      setPositions((prevPositions) => {
        const newPositions = [...prevPositions];
        // Swap the positions
        [newPositions[sourceIndex], newPositions[targetIndex]] = [
          newPositions[targetIndex],
          newPositions[sourceIndex],
        ];
        return newPositions;
      });

      // Increment move count
      setMoveCount((prev) => prev + 1);

      // Check if the moved piece is in the correct position
      const isCorrectPlacement = positions[targetIndex] === targetIndex;

      if (!isCorrectPlacement) {
        // Deduct 10 seconds for incorrect placement
        setTimer((prev) => Math.max(0, prev - 10));
      }

      // Update correct placements
      setCorrectPlacements((prev) => {
        const newCorrectPlacements = [...prev];
        newCorrectPlacements[targetIndex] = isCorrectPlacement;
        return newCorrectPlacements;
      });
    }

    // Check if the game is won
    checkIfGameWon();
  };

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Check if the game is won (positions should be sorted)
  const checkIfGameWon = () => {
    if (positions.every((pos, index) => pos === index)) {
      setGameWon(true);
    }
  };

  // Function to format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  // Determine border color based on piece placement
  const getBorderClass = (index: number) => {
    // If the piece is in its final correct position
    if (positions[index] === index) {
      return "border-green-500 bg-green-100";
    }

    // If the piece was moved to its correct position during the game
    if (correctPlacements[index]) {
      return "border-green-300 bg-green-50";
    }

    // Default border
    return "border-gray-300";
  };

  // Level up when the game is won with maximum level of 11 for 12x12 grid
  const levelUp = () => {
    if (level < 11) {
      setLevel((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-xl font-bold mb-5">Puzzle Game - Level {level}</h1>

      {/* Reference Image button */}
      <button className="primary-btn p-2 mt-2" onClick={openPreviewModal}>
        show image preview
      </button>

      {/* Timer and Move Count */}
      <div className="mb-5">
        <p>Time: {formatTime(timer)}</p>
        <p>Moves: {moveCount}</p>
      </div>

      {/* Puzzle Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${getGridSize()}, 1fr)`,
        }}
      >
        {positions.map((pos, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
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

      {/* Game Won */}
      {gameWon && (
        <div className="mt-5 text-green-600">
          <h2 className="text-2xl font-bold">
            Congratulations! You won the game!
          </h2>
          <p>Total Moves: {moveCount}</p>
          <p>Remaining Time: {formatTime(timer)}</p>
          <button
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            onClick={levelUp}
          >
            Next Level
          </button>
        </div>
      )}

      {/* Game Lost  */}
      {gameLost && !gameWon && (
        <div className="mt-5 text-red-600">
          <h2 className="text-2xl font-bold">Time's up! You lost the game.</h2>
        </div>
      )}

      {/* preview modal */}
      {openPreview && (
        <div>
          <PreviewModal imgUrl={imgUrl} closePreviewModal={closePreviewModal} />
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
