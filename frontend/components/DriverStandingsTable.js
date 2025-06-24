import React from "react";
import { Medal } from "lucide-react";
import Link from "next/link";

/**
 * Get position styling classes based on championship position
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
  pos <= 3 ? <Medal className="w-5 h-5" /> : null;

/**
 * Driver standings table showing championship positions
 */
const DriverStandingsTable = ({ driverStandings }) => {
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-neutral-800">
          Driver Standings
        </h2>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Position</th>
              <th className="px-6 py-3 text-left">Driver</th>
              <th className="px-6 py-3 text-left">Team</th>
              <th className="px-6 py-3 text-left">Points</th>
              <th className="px-6 py-3 text-left">Wins</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {driverStandings.map((driver, index) => {
              const position = index + 1;
            
              return (
                <tr key={position} className="hover:bg-gray-50">
                  {/* Position */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border ${getPositionStyle(
                        position
                      )}`}
                    >
                      {getPositionIcon(position)}
                      <span className="ml-1 font-semibold">{position}</span>
                    </span>
                  </td>

                  {/* Driver Name */}
                  <td className="px-6 py-4">
                    <Link href={`/driver/${driver.driverId}`}>
                      <span className="text-gray-900 font-medium hover:text-red-600 transition cursor-pointer">
                        {driver.forename} {driver.surname}
                      </span>
                    </Link>
                  </td>

                  {/* Constructor/Team */}
                  <td className="px-6 py-4 text-gray-900">
                    {driver.constructorName}
                  </td>

                  {/* Points */}
                  <td className="px-6 py-4 font-semibold text-red-600">
                    {driver.totalPoints}
                  </td>

                  {/* Wins */}
                  <td className="px-6 py-4 text-gray-900">{driver.wins}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverStandingsTable;
