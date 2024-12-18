import React, { useEffect, useState } from "react";

interface GameWonProps {
  onNextLevel: () => void;
  timer: number;
  moveCount: number;
  initialTime: number;
  incorrectMoves: number;
}

const GameWon: React.FC<GameWonProps> = ({
  onNextLevel,
  timer,
  moveCount,
  initialTime,
  incorrectMoves,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [rating, setRating] = useState<string>("");

  // Timer countdown and automatic level advancement
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onNextLevel();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onNextLevel]);

  // Calculate rating based on time left and incorrect moves
  useEffect(() => {
    const timePercentage = (timer / initialTime) * 100;

    let calculatedRating = "Please Try Again";

    if (timePercentage >= 70 && incorrectMoves === 0) {
      calculatedRating = "Excellent";
    } else if (timePercentage >= 50 && incorrectMoves <= 3) {
      calculatedRating = "Good Job";
    } else if (timePercentage >= 30 && incorrectMoves <= 6) {
      calculatedRating = "You Can Do Better";
    }

    // Debug logging to help understand rating calculation
    console.log("Time Percentage:", timePercentage);
    console.log("Incorrect Moves:", incorrectMoves);
    console.log("Calculated Rating:", calculatedRating);

    setRating(calculatedRating);
  }, [timer, incorrectMoves, initialTime]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Congratulations! You Won!
        </h2>

        <div className="space-y-2 mb-6">
          <p className="text-lg">
            <span className="font-semibold">Time Left:</span> {secondsLeft}{" "}
            seconds
          </p>
          <p className="text-lg">
            <span className="font-semibold">Moves Taken:</span> {moveCount}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Time Remaining:</span>{" "}
            {formatTime(timer)}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Rating:</span>
            <span
              className={`
                font-bold ml-2 
                ${
                  rating === "Excellent"
                    ? "text-green-600"
                    : rating === "Good Job"
                    ? "text-blue-600"
                    : rating === "You Can Do Better"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              `}
            >
              {rating}
            </span>
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            onClick={onNextLevel}
          >
            Next Level
          </button>
        </div>
      </div>
    </div>
  );
};

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes < 10 ? "0" : ""}${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

export default GameWon;
