import React from "react";
import { Medal, CirclePlus } from "lucide-react";
import Link from "next/link";

// Style position badges
const getPositionStyle = (pos) => {
  switch (pos) {
    case 1:
      return "bg-yellow-100 border-yellow-400 text-yellow-800";
    case 2:
      return "bg-gray-100 border-gray-400 text-gray-800";
    case 3:
      return "bg-orange-100 border-orange-400 text-orange-800";
    default:
      return "bg-white border-gray-200 text-gray-700";
  }
};

// Display medal for top 3
const getPositionIcon = (pos) =>
  pos <= 3 ? <Medal className="w-5 h-5" /> : null;

function RaceStandings({ race, raceResults }) {
  return (
    <tr>
      <td colSpan="7" className="px-6 py-4 bg-gray-50">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">
              Classifica - {race.name}
            </h4>
            <button
              onClick={() => {
                setSelectedRace(race); // salva la gara selezionata
                setAddResultsOpen(true); // apre il modal
              }}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
              title="Aggiungi Risultati"
            >
              <CirclePlus className="w-4 h-4" />
              <span>Aggiungi Risultati</span>
            </button>
          </div>
          {raceResults[race.raceId] ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2 text-left">Pos</th>
                    <th className="px-3 py-2 text-left">Pilota</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-left">Punti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {raceResults[race.raceId].map((result, index) => (
                    <tr
                      key={index}
                      className={`text-sm ${
                        result.positionText === "R" ? "bg-gray-200" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPositionStyle(
                            result.positionOrder
                          )}`}
                        >
                          {getPositionIcon(result.positionOrder)}
                          <span className="ml-1">{result.positionOrder}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        <Link href={`/driver/${result.driverId}`}>
                          {" "}
                          {result.driverName}{" "}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {result.constructorName}
                      </td>
                      <td className="px-3 py-2 font-semibold text-red-600">
                        {result.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Nessun risultato disponibile per questa gara.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export default RaceStandings;
