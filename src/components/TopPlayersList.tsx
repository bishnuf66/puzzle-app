import { useTopPlayers } from "../context/TopPlayersContext";

function TopPlayersList() {
  const { topPlayers } = useTopPlayers();

  return (
    <div className="bg-gray-100 rounded-lg p-6 shadow-lg max-w-md mx-auto my-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Top Players
      </h2>
      <ul className="space-y-4">
        {topPlayers.map((player, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
          >
            <span className="text-xl font-bold text-blue-600">
              {index + 1}.
            </span>
            <span className="text-gray-700">{player.email}</span>
            <span className="text-lg font-semibold text-orange-600 m-2">
              {player.totalScore}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopPlayersList;
