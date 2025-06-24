import React from "react";
import { CirclePlus, Medal, Trash } from "lucide-react";
import Link from "next/link";

/**
 * Get position styling classes based on race position
 */
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

/**
 * Get medal icon for top 3 positions
 */
const getPositionIcon = (pos) =>
  pos <= 3 ? <Medal className="w-4 h-4" /> : null;

/**
 * Expandable row component showing race results
 */
const RaceResultsRow = ({ race, results, onAddResults, onDelete }) => {
  console.log(results);

  return (
    <tr>
      <td colSpan="7" className="px-6 py-4 bg-gray-50">
        <div className="rounded-lg border bg-white p-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">
              Race Results - {race.name}
            </h4>
            <button
              onClick={onAddResults}
              className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800 transition"
              title="Add Results"
            >
              <CirclePlus className="w-4 h-4" />
              <span>Add Results</span>
            </button>
          </div>

          {/* Results Table */}
          {results && results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2 text-left">Position</th>
                    <th className="px-3 py-2 text-left">Driver</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-left">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr
                      key={`${result.driverId}-${index}`}
                      className={`text-sm ${
                        result.positionText === "R" ? "bg-gray-200" : ""
                      }`}
                    >
                      {/* Position */}
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

                      {/* Driver Name */}
                      <td className="px-3 py-2 font-medium text-gray-900">
                        <Link href={`/driver/${result.driverId}`}>
                          <span className="hover:text-red-600 transition cursor-pointer">
                            {result.driverName}
                          </span>
                        </Link>
                      </td>

                      {/* Constructor/Team */}
                      <td className="px-3 py-2 text-gray-700">
                        {result.constructorName}
                      </td>

                      {/* Points */}
                      <td className="px-3 py-2 font-semibold text-red-600">
                        {result.points}
                      </td>

                      <td className="px-3 py-2 font-semibold text-red-600">
                        <button
                          onClick={() => onDelete(result.resultId, race.raceId)}
                        >
                          <Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No results available for this race.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
};

export default RaceResultsRow;
