import React from "react";
import {
  CirclePlus,
  Trash,
  ChevronDown,
  ChevronUp,
  SquarePen,
} from "lucide-react";
import RaceResultsRow from "./RaceResultRow";
import { convertDateFormat, isCurrentSeason } from "@/utils/seasonUtils";

/**
 * Race Calendar Table Component
 * Displays list of races with expandable results and management actions
 */
const RaceCalendarTable = ({
  races,
  year,
  expandedRaces,
  raceResults,
  loadingResults,
  onAddRace,
  onUpdateRace,
  onDeleteRace,
  onToggleResults,
  onAddResult,
  onDeleteResult,
  onUpdateResult,
}) => {
  const isCurrentSeasonYear = isCurrentSeason(year);

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* Table Header */}
      <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-800">
          Race Calendar
        </h2>
        {isCurrentSeasonYear && (
          <button
            onClick={onAddRace}
            title="Add Race"
            className="px-3 py-2 border rounded-lg text-gray-700 hover:text-red-700 hover:border-red-500 transition"
          >
            <CirclePlus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">Round</th>
              <th className="px-6 py-3">Grand Prix</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Winner</th>
              <th className="px-6 py-3">Team</th>
              <th className="px-6 py-3">Results</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {races.map((race) => (
              <React.Fragment key={race.raceId}>
                {/* Main Race Row */}
                <tr className="hover:bg-gray-50">
                  {/* Round Number */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-800 rounded-full font-semibold">
                      {race.round}
                    </div>
                  </td>

                  {/* Grand Prix Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{race.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {race.name}
                        </div>
                        <div className="text-sm text-gray-900">
                          {race.circuitName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Race Date */}
                  <td className="px-6 py-4 text-gray-900">
                    {convertDateFormat(race.date)}
                  </td>

                  {/* Winner */}
                  <td className="px-6 py-4 text-gray-900">
                    {race.winner || "-"}
                  </td>

                  {/* Winning Team */}
                  <td className="px-6 py-4 text-gray-900">
                    {race.team || "-"}
                  </td>

                  {/* Results Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleResults(race.raceId)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition"
                      disabled={loadingResults.has(race.raceId)}
                    >
                      {loadingResults.has(race.raceId) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      ) : expandedRaces.has(race.raceId) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {expandedRaces.has(race.raceId) ? "Hide" : "Show"}
                      </span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDeleteRace(race.raceId)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Race"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onUpdateRace(race.raceId)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete Race"
                      >
                        <SquarePen className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expandable Results Row */}
                {expandedRaces.has(race.raceId) && (
                  <RaceResultsRow
                    race={race}
                    results={raceResults[race.raceId]}
                    onAddResults={() => onAddResult(race)}
                    onDelete={onDeleteResult}
                    onUpdate={onUpdateResult}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaceCalendarTable;
